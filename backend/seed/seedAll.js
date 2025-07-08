const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker'); // For generating realistic-looking data

dotenv.config(); // Load environment variables from .env file

// --- 1. Import Mongoose Models ---
// Assuming your models are in a '../models' directory
// If your models are defined directly in this file, you can remove these imports
// and keep the schema definitions as in my previous responses.
const User = require('../models/User'); // Adjust path as needed, e.g., '../models/User'
const Project = require('../models/Project'); // Adjust path as needed
const Proposal = require('../models/Proposal'); // Adjust path as needed
const Review = require('../models/Review'); // Adjust path as needed
const Message = require('../models/Message'); // Adjust path as needed

// --- 2. Database Connection ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/freelance_platform_db'; // Default if not in .env

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // Clear previous data
        console.log('🗑️ Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Project.deleteMany({}),
            Proposal.deleteMany({}),
            Review.deleteMany({}),
            Message.deleteMany({})
        ]);
        console.log('🗑️ Cleared existing data.');

        // --- Data Definitions ---
        const commonSkills = [
            'React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript', 'Python', 'Django', 'Flask',
            'Java', 'Spring Boot', 'C++', 'PHP', 'Laravel', 'Vue.js', 'Angular', 'AWS', 'Azure',
            'GCP', 'Docker', 'Kubernetes', 'UI/UX Design', 'Graphic Design', 'Content Writing',
            'SEO', 'Digital Marketing', 'Mobile App Development', 'Data Science', 'Machine Learning',
            'TypeScript', 'HTML', 'CSS', 'SQL', 'NoSQL', 'RESTful APIs', 'GraphQL', 'Redux', 'Vuex'
        ];
        const projectCategories = [
            'Web Development', 'Mobile App Development', 'UI/UX Design', 'Graphic Design',
            'Content Writing', 'Digital Marketing', 'Data Science', 'Game Development',
            'Video Editing', 'Backend Development', 'Frontend Development'
        ];

        // --- 3. Seed Users (15-20 users) ---
        const usersToInsert = [];
        const numberOfUsers = faker.number.int({ min: 15, max: 20 });

        for (let i = 0; i < numberOfUsers; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            usersToInsert.push({
                name: `${firstName} ${lastName}`,
                email: faker.internet.email({ firstName, lastName }).toLowerCase(),
                firebaseUID: faker.string.uuid(),
                bio: faker.person.bio(),
                skills: faker.helpers.arrayElements(commonSkills, { min: 3, max: 7 }), // Varied skills
                rating: faker.number.float({ min: 3, max: 5, precision: 0.1 }), // Rating between 3.0 and 5.0
                createdAt: faker.date.past({ years: 2 })
            });
        }
        const insertedUsers = await User.insertMany(usersToInsert);
        console.log(`✅ ${insertedUsers.length} Users seeded.`);

        // Separate clients and freelancers (for more controlled linking)
        const clients = insertedUsers.filter((_user, index) => index % 3 === 0 || index % 3 === 1); // Roughly 2/3 can be clients
        const freelancers = insertedUsers.filter((_user, index) => index % 3 === 0 || index % 3 === 2); // Roughly 2/3 can be freelancers
        // Note: Some users can be both client and freelancer.

        // --- 4. Seed Projects (varied number) ---
        const projectsToInsert = [];
        for (const client of clients) {
            const numProjectsForThisClient = faker.number.int({ min: 0, max: 4 }); // Each client posts 0 to 4 projects
            if (numProjectsForThisClient === 0 && faker.datatype.boolean(0.6)) continue; // 60% chance to skip if 0 projects

            for (let i = 0; i < numProjectsForThisClient; i++) {
                const status = faker.helpers.arrayElement(['open', 'in-progress', 'completed']);
                let assignedFreelancer = null;

                if (status !== 'open') {
                    // Try to assign a freelancer who is not the client
                    const eligibleFreelancers = freelancers.filter(f => f._id.toString() !== client._id.toString());
                    if (eligibleFreelancers.length > 0) {
                        assignedFreelancer = faker.helpers.arrayElement(eligibleFreelancers);
                    }
                }

                projectsToInsert.push({
                    title: faker.lorem.words({ min: 4, max: 9 }),
                    description: faker.lorem.paragraph({ min: 3, max: 7 }),
                    category: faker.helpers.arrayElement(projectCategories),
                    budget: faker.number.int({ min: 500, max: 15000 }),
                    deadline: faker.date.soon({ days: 90 }),
                    status: status,
                    client: client._id,
                    assignedFreelancer: assignedFreelancer ? assignedFreelancer._id : null,
                    createdAt: faker.date.past({ years: 1 })
                });
            }
        }
        const insertedProjects = await Project.insertMany(projectsToInsert);
        console.log(`✅ ${insertedProjects.length} Projects seeded.`);

        // --- Update User's postedProjects and takenProjects ---
        console.log('🔄 Updating user project lists...');
        for (const project of insertedProjects) {
            await User.findByIdAndUpdate(project.client, { $push: { postedProjects: project._id } });
            if (project.assignedFreelancer) {
                await User.findByIdAndUpdate(project.assignedFreelancer, { $push: { takenProjects: project._id } });
            }
        }
        console.log('✅ Updated user project lists.');

        // --- 5. Seed Proposals ---
        const proposalsToInsert = [];
        const maxProposalsPerProject = 5;

        for (const project of insertedProjects) {
            const numProposalsForThisProject = faker.number.int({ min: 0, max: maxProposalsPerProject });
            const potentialProposers = freelancers.filter(f => f._id.toString() !== project.client.toString()); // Freelancer can't propose on their own project

            const selectedProposers = faker.helpers.arrayElements(potentialProposers, { count: numProposalsForThisProject });

            for (const proposer of selectedProposers) {
                // Avoid duplicate proposals from the same freelancer on the same project
                const existingProposal = proposalsToInsert.find(p => p.freelancer.equals(proposer._id) && p.project.equals(project._id));
                if (existingProposal) continue;

                proposalsToInsert.push({
                    freelancer: proposer._id,
                    project: project._id,
                    coverLetter: faker.lorem.paragraph({ min: 2, max: 4 }),
                    proposedRate: faker.number.int({ min: project.budget * 0.4, max: project.budget * 1.1 }),
                    status: faker.helpers.arrayElement(['pending', 'accepted', 'rejected']),
                    createdAt: faker.date.recent({ days: 30 })
                });
            }
        }
        const insertedProposals = await Proposal.insertMany(proposalsToInsert);
        console.log(`✅ ${insertedProposals.length} Proposals seeded.`);

        // --- Update Project's proposals list ---
        console.log('🔄 Updating project proposal lists...');
        for (const proposal of insertedProposals) {
            await Project.findByIdAndUpdate(proposal.project, { $push: { proposals: proposal._id } });
        }
        console.log('✅ Updated project proposal lists.');

        // --- 6. Seed Reviews ---
        const reviewsToInsert = [];
        // Focus reviews on completed projects with assigned freelancers
        const completedProjectsWithFreelancers = insertedProjects.filter(p => p.status === 'completed' && p.assignedFreelancer);

        for (const project of completedProjectsWithFreelancers) {
            if (project.client && project.assignedFreelancer) {
                // Client reviews freelancer
                reviewsToInsert.push({
                    reviewer: project.client._id,
                    reviewee: project.assignedFreelancer._id,
                    rating: faker.number.int({ min: 4, max: 5 }), // High rating for completed work
                    comment: faker.lorem.sentence({ min: 8, max: 15 }),
                    project: project._id,
                    createdAt: faker.date.recent({ days: 60 })
                });

                // Freelancer reviews client (optional, but good for a complete system)
                reviewsToInsert.push({
                    reviewer: project.assignedFreelancer._id,
                    reviewee: project.client._id,
                    rating: faker.number.int({ min: 3, max: 5 }),
                    comment: faker.lorem.sentence({ min: 8, max: 15 }),
                    project: project._id,
                    createdAt: faker.date.recent({ days: 60 })
                });
            }
        }
        const insertedReviews = await Review.insertMany(reviewsToInsert);
        console.log(`✅ ${insertedReviews.length} Reviews seeded.`);

        // --- Update User's reviews list ---
        console.log('🔄 Updating user review lists...');
        for (const review of insertedReviews) {
            await User.findByIdAndUpdate(review.reviewee, { $push: { reviews: review._id } });
        }
        console.log('✅ Updated user review lists.');

        // --- 7. Seed Messages ---
        const messagesToInsert = [];
        const numberOfMessages = faker.number.int({ min: 20, max: 50 });

        for (let i = 0; i < numberOfMessages; i++) {
            const sender = faker.helpers.arrayElement(insertedUsers);
            const receiver = faker.helpers.arrayElement(insertedUsers.filter(u => u._id.toString() !== sender._id.toString()));

            messagesToInsert.push({
                sender: sender._id,
                receiver: receiver._id,
                content: faker.lorem.sentence({ min: 5, max: 20 }),
                timestamp: faker.date.recent({ days: 90 }),
                seen: faker.datatype.boolean(0.7) // 70% chance of being seen
            });
        }
        const insertedMessages = await Message.insertMany(messagesToInsert);
        console.log(`✅ ${insertedMessages.length} Messages seeded.`);


        console.log('\n🌱 All data seeded successfully!');
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('❌ Error seeding data:', err);
        mongoose.disconnect();
    });