const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');

// Load environment variables
dotenv.config();

// --- 1. Import Mongoose Models ---
// Make sure the paths to your models are correct
const User = require('../models/User');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Message = require('../models/Message');

// --- 2. Database Connection ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freelance_db_dummy';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // --- Optional: Clear previous data ---
    console.log('🗑️ Clearing existing data...');
    await Promise.all([
      User.deleteMany({}), Project.deleteMany({}), Proposal.deleteMany({}),
      Payment.deleteMany({}), Review.deleteMany({}), Message.deleteMany({})
    ]);
    console.log('🗑️ Data cleared successfully.');

    // --- Data Definitions ---
    const commonSkills = ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Python', 'Django', 'Vue.js', 'Angular', 'AWS', 'Docker', 'UI/UX Design', 'Figma', 'Graphic Design', 'Content Writing', 'SEO', 'Digital Marketing', 'Mobile App Development', 'TypeScript', 'HTML/CSS', 'SQL', 'GraphQL'];
    const projectCategories = ['Web Development', 'Mobile App Development', 'UI/UX Design', 'Graphic Design', 'Content Writing', 'Digital Marketing', 'Data Science', 'Backend Development'];

    // --- 3. Seed Users ---
    console.log('🌱 Seeding Users...');
    const usersToInsert = [];
    const numberOfUsers = 25; // Create a decent number of users
    for (let i = 0; i < numberOfUsers; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      // Ensure every user can be both a client and a freelancer for maximum flexibility
      const userRoles = ['client', 'freelancer'];
      usersToInsert.push({
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        firebaseUID: `firebase_uid_${faker.string.uuid()}`,
        bio: faker.person.bio(),
        profileImage: faker.image.avatar(),
        skills: faker.helpers.arrayElements(commonSkills, { min: 3, max: 8 }),
        roles: userRoles,
        currentRole: faker.helpers.arrayElement(userRoles),
        verification: { // Add some verification data
            emailVerified: true,
            phoneVerified: faker.datatype.boolean(0.8),
            idVerified: faker.datatype.boolean(0.6)
        }
      });
    }
    const insertedUsers = await User.insertMany(usersToInsert);
    console.log(`✅ ${insertedUsers.length} Users seeded.`);
    
    // All users can be clients or freelancers
    const clients = insertedUsers;
    const freelancers = insertedUsers;

    // --- 4. Seed Projects ---
    console.log('🌱 Seeding Projects...');
    const projectsToInsert = [];
    for (const client of clients) {
      const numProjects = faker.number.int({ min: 1, max: 3 });
      for (let i = 0; i < numProjects; i++) {
        projectsToInsert.push({
          title: faker.commerce.productName() + " Project",
          description: faker.lorem.paragraphs({ min: 2, max: 4 }),
          category: faker.helpers.arrayElement(projectCategories),
          budget: faker.number.int({ min: 5000, max: 50000 }),
          deadline: faker.date.soon({ days: 90 }),
          status: 'open',
          client: client._id,
        });
      }
    }
    const insertedProjects = await Project.insertMany(projectsToInsert);
    console.log(`✅ ${insertedProjects.length} Projects seeded.`);

    // --- 5. Seed Proposals ---
    console.log('🌱 Seeding Proposals...');
    const proposalsToInsert = [];
    for (const project of insertedProjects) {
      const numProposals = faker.number.int({ min: 2, max: 6 });
      // Ensure a freelancer doesn't bid on their own project
      const potentialProposers = freelancers.filter(f => !f._id.equals(project.client));
      if (potentialProposers.length === 0) continue;
      
      const proposers = faker.helpers.arrayElements(potentialProposers, { min: 1, max: Math.min(numProposals, potentialProposers.length) });

      for (const proposer of proposers) {
        proposalsToInsert.push({
          freelancer: proposer._id,
          client: project.client,      // <-- FIX: Added the required client ID
          project: project._id,
          coverLetter: faker.lorem.paragraph({ min: 2, max: 4 }),
          totalBidAmount: faker.number.int({ min: project.budget * 0.85, max: project.budget * 1.25 }),
          deliveryTime: faker.number.int({ min: 7, max: 60 }),
          status: 'pending',
          // <-- FIX: Removed non-existent paymentMilestones
        });
      }
    }
    const insertedProposals = await Proposal.insertMany(proposalsToInsert);
    console.log(`✅ ${insertedProposals.length} Proposals seeded.`);

    // --- 6. Process Proposals and Update Projects ---
    console.log('🔄 Processing proposals and updating projects...');
    const acceptedProposals = [];
    for (const project of insertedProjects) {
      const projectProposals = insertedProposals.filter(p => p.project.equals(project._id));
      if (projectProposals.length === 0) continue;
      
      // 80% chance to move a project forward
      if (faker.datatype.boolean(0.8)) { 
        const proposalToAccept = faker.helpers.arrayElement(projectProposals);
        
        // Update proposal status
        proposalToAccept.status = faker.helpers.arrayElement(['accepted', 'in-progress', 'submitted', 'completed']); // More varied statuses
        await Proposal.findByIdAndUpdate(proposalToAccept._id, { status: proposalToAccept.status });
        acceptedProposals.push(proposalToAccept);

        // Update other proposals to 'rejected'
        const otherProposals = projectProposals.filter(p => !p._id.equals(proposalToAccept._id));
        await Proposal.updateMany({ _id: { $in: otherProposals.map(p => p._id) }}, { status: 'rejected' });
        
        // Update project status and assign freelancer
        let projectStatus = 'in-progress';
        if (['submitted', 'completed'].includes(proposalToAccept.status)) {
            projectStatus = 'completed';
        }
        project.assignedFreelancer = proposalToAccept.freelancer;
        project.status = projectStatus;
        await project.save();
      }
    }
    console.log(`✅ ${acceptedProposals.length} proposals processed and projects updated.`);

    // --- 7. Seed Payments ---
    console.log('🌱 Seeding Payments...');
    const paymentsToInsert = [];
    for (const proposal of acceptedProposals) {
        // Find the updated project document
        const project = await Project.findById(proposal.project);
        if (!project || project.status === 'open') continue;

        let status = 'initiated';
        let releasedAt = null;

        if (project.status === 'completed') {
            status = 'released';
            releasedAt = faker.date.past({ years: 1, refDate: project.deadline });
        } else if (project.status === 'in-progress') {
            status = 'in_escrow';
        }

        paymentsToInsert.push({
            proposal: proposal._id,
            project: project._id,
            client: proposal.client,
            freelancer: proposal.freelancer,
            amount: proposal.totalBidAmount,
            status: status,
            method: faker.helpers.arrayElement(['razorpay', 'stripe', 'wallet']),
            transactionId: `txn_${faker.string.alphanumeric(16)}`,
            releasedAt: releasedAt
        });
    }
    const insertedPayments = await Payment.insertMany(paymentsToInsert);
    console.log(`✅ ${insertedPayments.length} Payments seeded.`);

    // --- 8. Seed Reviews ---
    console.log('🌱 Seeding Reviews...');
    const reviewsToInsert = [];
    const completedProjects = await Project.find({ status: 'completed', assignedFreelancer: { $ne: null } });
    for (const project of completedProjects) {
        // Client reviews Freelancer
        reviewsToInsert.push({ reviewer: project.client, reviewee: project.assignedFreelancer, rating: faker.number.int({ min: 4, max: 5 }), comment: faker.lorem.sentence(), project: project._id });
        // Freelancer reviews Client
        reviewsToInsert.push({ reviewer: project.assignedFreelancer, reviewee: project.client, rating: faker.number.int({ min: 4, max: 5 }), comment: faker.lorem.sentence(), project: project._id });
    }
    const insertedReviews = await Review.insertMany(reviewsToInsert);
    console.log(`✅ ${insertedReviews.length} Reviews seeded.`);

    // --- 9. Seed Messages ---
    console.log('🌱 Seeding Messages...');
    const messagesToInsert = [];
    const activeProjects = await Project.find({ status: { $in: ['in-progress', 'completed'] }, assignedFreelancer: { $ne: null }});
    for (const project of activeProjects) {
        const roomId = [project.client.toString(), project.assignedFreelancer.toString()].sort().join('_');
        for (let i = 0; i < faker.number.int({ min: 5, max: 15 }); i++) {
            const [sender, receiver] = faker.helpers.arrayElement([[project.client, project.assignedFreelancer], [project.assignedFreelancer, project.client]]);
            messagesToInsert.push({ roomid: roomId, sender, receiver, content: faker.lorem.sentence(), seen: faker.datatype.boolean(0.9) });
        }
    }
    const insertedMessages = await Message.insertMany(messagesToInsert);
    console.log(`✅ ${insertedMessages.length} Messages seeded.`);
    
    // --- 10. Final Update of User/Project Arrays ---
    console.log('🔄 Finalizing relationships...');
    // A more efficient way to gather all IDs
    const allProjectsFromDB = await Project.find().lean();
    const allProposalsFromDB = await Proposal.find().lean();
    const allReviewsFromDB = await Review.find().lean();

    for (const user of insertedUsers) {
        const postedProjects = allProjectsFromDB.filter(p => p.client.equals(user._id)).map(p => p._id);
        const takenProjects = allProjectsFromDB.filter(p => p.assignedFreelancer && p.assignedFreelancer.equals(user._id)).map(p => p._id);
        const reviews = allReviewsFromDB.filter(r => r.reviewee.equals(user._id)).map(r => r._id);
        
        await User.findByIdAndUpdate(user._id, { postedProjects, takenProjects, reviews });
    }

    for (const project of insertedProjects) {
        const proposals = allProposalsFromDB.filter(p => p.project.equals(project._id)).map(p => p._id);
        await Project.findByIdAndUpdate(project._id, { proposals });
    }
    console.log('✅ Relationships finalized.');
    console.log('\n✨ Database seeding completed successfully! ✨');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

seedDatabase();