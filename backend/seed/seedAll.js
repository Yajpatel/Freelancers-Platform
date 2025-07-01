const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker'); // For generating realistic-looking data

dotenv.config();

const User = require('../models/User'); // Assuming your models are in a 'models' directory
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const Review = require('../models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/freelancers-platform';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Clear previous data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Proposal.deleteMany({});
    await Review.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // --- 1. Seed Users ---
    const users = [];
    const skillsList = ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C++', 'PHP', 'Laravel', 'Vue.js', 'Angular', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'UI/UX Design', 'Graphic Design', 'Content Writing', 'SEO', 'Digital Marketing', 'Mobile App Development', 'Data Science', 'Machine Learning'];

    for (let i = 0; i < 20; i++) { // Generate more users to have enough clients and freelancers
      const userType = i % 2 === 0 ? 'client' : 'freelancer';
      const userSkills = faker.helpers.arrayElements(skillsList, { min: 2, max: 5 });

      users.push({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        firebaseUID: faker.string.uuid(), // Unique Firebase UID
        bio: faker.person.bio(),
        skills: userSkills,
        rating: parseFloat(faker.finance.amount(3, 5, 1)), // Rating between 3.0 and 5.0
      });
    }
    const insertedUsers = await User.insertMany(users);
    console.log(`✅ ${insertedUsers.length} Users seeded`);

    // Separate clients and freelancers
    const clients = insertedUsers.filter((_user, index) => index % 2 === 0);
    const freelancers = insertedUsers.filter((_user, index) => index % 2 !== 0);

    // --- 2. Seed Projects ---
    const projects = [];
    const projectCategories = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design', 'Content Writing', 'Digital Marketing', 'Data Science', 'Game Development', 'Video Editing'];

    for (let i = 0; i < 15; i++) {
      const randomClient = faker.helpers.arrayElement(clients);
      const status = faker.helpers.arrayElement(['open', 'in-progress', 'completed']);
      let assignedFreelancer = null;
      if (status !== 'open') {
        assignedFreelancer = faker.helpers.arrayElement(freelancers);
      }

      projects.push({
        title: faker.lorem.sentence(5),
        description: faker.lorem.paragraph(3),
        category: faker.helpers.arrayElement(projectCategories),
        budget: faker.finance.amount(1000, 20000, 0), // Budget between 1000 and 20000
        deadline: faker.date.future({ years: 1 }),
        status: status,
        client: randomClient._id,
        assignedFreelancer: assignedFreelancer ? assignedFreelancer._id : null,
        skills: faker.helpers.arrayElements(skillsList, { min: 1, max: 3 }) // Skills required for the project
      });
    }
    const insertedProjects = await Project.insertMany(projects);
    console.log(`✅ ${insertedProjects.length} Projects seeded`);

    // Update postedProjects for clients and takenProjects for freelancers
    for (const project of insertedProjects) {
      await User.findByIdAndUpdate(project.client, { $push: { postedProjects: project._id } });
      if (project.assignedFreelancer) {
        await User.findByIdAndUpdate(project.assignedFreelancer, { $push: { takenProjects: project._id } });
      }
    }
    console.log('✅ Updated user project lists');

    // --- 3. Seed Proposals ---
    const proposals = [];
    for (let i = 0; i < 25; i++) { // More proposals than projects
      const randomFreelancer = faker.helpers.arrayElement(freelancers);
      const randomProject = faker.helpers.arrayElement(insertedProjects);

      // Ensure the freelancer isn't already assigned if the project is in-progress/completed
      if (randomProject.status !== 'open' && randomProject.assignedFreelancer && randomProject.assignedFreelancer.toString() === randomFreelancer._id.toString()) {
        continue; // Skip if freelancer is already assigned
      }
      
      const status = faker.helpers.arrayElement(['pending', 'accepted', 'rejected']);

      proposals.push({
        freelancer: randomFreelancer._id,
        project: randomProject._id,
        coverLetter: faker.lorem.paragraph(2),
        proposedRate: faker.finance.amount(randomProject.budget * 0.7, randomProject.budget * 1.1, 0), // Rate close to project budget
        status: status,
      });
    }
    const insertedProposals = await Proposal.insertMany(proposals);
    console.log(`✅ ${insertedProposals.length} Proposals seeded`);

    // Update proposals in projects
    for (const proposal of insertedProposals) {
      await Project.findByIdAndUpdate(proposal.project, { $push: { Proposal: proposal._id } });
    }
    console.log('✅ Updated project proposal lists');


    // --- 4. Seed Reviews ---
    const reviews = [];
    // Generate reviews for completed projects
    const completedProjects = insertedProjects.filter(p => p.status === 'completed' && p.assignedFreelancer);
    
    for (const project of completedProjects) {
      if (project.client && project.assignedFreelancer) {
        // Client reviews freelancer
        reviews.push({
          reviewer: project.client._id,
          reviewee: project.assignedFreelancer._id,
          rating: parseFloat(faker.finance.amount(4, 5, 1)), // High rating for completed work
          comment: faker.lorem.sentence(10),
          project: project._id,
        });

        // Freelancer reviews client (optional, but good for a complete system)
        reviews.push({
          reviewer: project.assignedFreelancer._id,
          reviewee: project.client._id,
          rating: parseFloat(faker.finance.amount(3, 5, 1)),
          comment: faker.lorem.sentence(10),
          project: project._id,
        });
      }
    }
    const insertedReviews = await Review.insertMany(reviews);
    console.log(`✅ ${insertedReviews.length} Reviews seeded`);

    // Update reviews for users
    for (const review of insertedReviews) {
      await User.findByIdAndUpdate(review.reviewee, { $push: { reviews: review._id } });
    }
    console.log('✅ Updated user review lists');


    console.log('\n🌱 All data seeded successfully!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error seeding data:', err);
    mongoose.disconnect();
  });