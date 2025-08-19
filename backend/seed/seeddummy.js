const mongoose = require('mongoose');

// Adjust the path to your model files if necessary

const User = require('../models/User'); // e.g., './models/User' or '../models/User'
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const Review = require('../models/Review');
const Message = require('../models/Message');
const Payment = require('../models/Payment');

// --- DATABASE CONNECTION ---
const MONGO_URI = 'mongodb+srv://yajpatel3594:Yajmongoatlas@yajcluster.9danbck.mongodb.net/freelancers-platform?retryWrites=true&w=majority&appName=YajCluster'; // Replace with your DB connection string

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully. 🌱');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

// --- MAIN SEAEDING FUNCTION ---
const generateDummyData = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Cleaning up old data... 🧹');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Proposal.deleteMany({}),
      Payment.deleteMany({}),
      Review.deleteMany({}),
      Message.deleteMany({}),
    ]);
    console.log('Old data cleared.');

    // --- 1. Create Users (Clients & Freelancers) ---
    console.log('Creating users...');
    const users = await User.create([
      // Client 1
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        firebaseUID: 'firebase_uid_alice',
        bio: 'I run a small e-commerce business looking for talented developers.',
        roles: ['client'],
        currentRole: 'client',
      },
      // Client 2
      {
        name: 'Bob Williams',
        email: 'bob@example.com',
        firebaseUID: 'firebase_uid_bob',
        bio: 'Marketing manager seeking graphic designers.',
        roles: ['client'],
        currentRole: 'client',
      },
      // Freelancer 1
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        firebaseUID: 'firebase_uid_charlie',
        bio: 'Full-stack MERN developer with 5 years of experience.',
        skills: ['React', 'Node.js', 'MongoDB', 'Express'],
        rating: 4.8,
        roles: ['freelancer'],
        currentRole: 'freelancer',
      },
      // Freelancer 2
      {
        name: 'Diana Prince',
        email: 'diana@example.com',
        firebaseUID: 'firebase_uid_diana',
        bio: 'Expert UI/UX designer with a passion for clean interfaces.',
        skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
        rating: 4.9,
        roles: ['freelancer'],
        currentRole: 'freelancer',
      },
    ]);

    const [clientAlice, clientBob, freelancerCharlie, freelancerDiana] = users;
    console.log(`${users.length} users created. ✅`);

    // --- 2. Create Projects ---
    console.log('Creating projects...');
    const projects = await Project.create([
      // Project 1 (will become in-progress)
      {
        title: 'Build a MERN stack E-commerce Website',
        description: 'Need a fully functional e-commerce site with user auth, product catalog, and Stripe integration.',
        category: 'Web Development',
        budget: 5000,
        deadline: new Date('2025-12-01'),
        client: clientAlice._id,
      },
      // Project 2 (will stay open for now)
      {
        title: 'Design a Mobile App UI/UX',
        description: 'Looking for a complete UI/UX design for a new fitness tracking app. Deliverables in Figma.',
        category: 'Design',
        budget: 2500,
        deadline: new Date('2025-11-15'),
        client: clientBob._id,
      },
       // Project 3 (will be completed for reviews)
       {
        title: 'Company Logo Redesign',
        description: 'We need to refresh our existing company logo to look more modern.',
        category: 'Graphic Design',
        budget: 500,
        deadline: new Date('2025-08-10'),
        client: clientAlice._id,
      },
    ]);
    const [projectMERN, projectUIUX, projectLogo] = projects;
    console.log(`${projects.length} projects created. ✅`);
    await User.findByIdAndUpdate(clientAlice._id, { $push: { postedProjects: [projectMERN._id, projectLogo._id] } });
    await User.findByIdAndUpdate(clientBob._id, { $push: { postedProjects: projectUIUX._id } });


    // --- 3. Create Proposals ---
    console.log('Freelancers are submitting proposals...');
    // Proposals for MERN Project
    const proposalCharlieForMERN = await Proposal.create({
      freelancer: freelancerCharlie._id,
      project: projectMERN._id,
      coverLetter: "I'm a perfect fit for this MERN project. I have extensive experience with Stripe and e-commerce platforms.",
      totalBidAmount: 4800,
      paymentMilestones: { part1: 1600, part2: 1600, part3: 1600 },
      deliveryTime: 45, // days
      status: 'accepted', // Alice accepts this one
    });

    const proposalDianaForMERN = await Proposal.create({
      freelancer: freelancerDiana._id, // A designer applying for dev work (less likely to be accepted)
      project: projectMERN._id,
      coverLetter: "While I am a designer, I can oversee the front-end development with a partner.",
      totalBidAmount: 5200,
      paymentMilestones: { part1: 1800, part2: 1800, part3: 1600 },
      deliveryTime: 60,
      status: 'rejected', // Alice rejects this one
    });

    // Proposal for Logo Project
    const proposalDianaForLogo = await Proposal.create({
        freelancer: freelancerDiana._id,
        project: projectLogo._id,
        coverLetter: "As a UI/UX expert, branding and logo design is one of my core strengths. I can deliver 3 modern concepts within a week.",
        totalBidAmount: 500,
        paymentMilestones: { part1: 150, part2: 200, part3: 150 },
        deliveryTime: 7,
        status: 'accepted',
      });
    console.log('Proposals submitted. ✅');

    // --- 4. Update Project & Users based on Accepted Proposal ---
    console.log('Client is accepting proposals and assigning freelancers...');
    // Update MERN Project
    await Project.findByIdAndUpdate(projectMERN._id, {
      status: 'in-progress',
      assignedFreelancer: freelancerCharlie._id,
      proposals: [proposalCharlieForMERN._id, proposalDianaForMERN._id],
    });
    await User.findByIdAndUpdate(freelancerCharlie._id, { $push: { takenProjects: projectMERN._id } });

    // Update Logo Project to be completed
    await Project.findByIdAndUpdate(projectLogo._id, {
        status: 'completed',
        assignedFreelancer: freelancerDiana._id,
        proposals: [proposalDianaForLogo._id],
    });
    await User.findByIdAndUpdate(freelancerDiana._id, { $push: { takenProjects: projectLogo._id } });
    console.log('Projects updated with assignments. ✅');

    // --- 5. Create Payments for In-Progress Project ---
    console.log('Creating payment records for the MERN project...');
    const payments = await Payment.create([
      {
        proposal: proposalCharlieForMERN._id,
        project: projectMERN._id,
        milestone: 'part1',
        amount: proposalCharlieForMERN.paymentMilestones.part1,
        payer: clientAlice._id,
        payee: freelancerCharlie._id,
        status: 'released', // Assume first milestone is paid
        transactionId: 'stripe_txn_1',
        releasedAt: new Date(),
      },
      {
        proposal: proposalCharlieForMERN._id,
        project: projectMERN._id,
        milestone: 'part2',
        amount: proposalCharlieForMERN.paymentMilestones.part2,
        payer: clientAlice._id,
        payee: freelancerCharlie._id,
        status: 'escrow', // Second part is funded and held
        transactionId: 'stripe_txn_2',
      },
      {
        proposal: proposalCharlieForMERN._id,
        project: projectMERN._id,
        milestone: 'part3',
        amount: proposalCharlieForMERN.paymentMilestones.part3,
        payer: clientAlice._id,
        payee: freelancerCharlie._id,
        status: 'pending', // Final part is not yet funded
      },
    ]);
    console.log(`${payments.length} payment records created. ✅`);

    // --- 6. Create Reviews for Completed Project ---
    console.log('Creating reviews for the completed Logo project...');
    const reviews = await Review.create([
        // Alice (client) reviews Diana (freelancer)
        {
            reviewer: clientAlice._id,
            reviewee: freelancerDiana._id,
            rating: 5,
            comment: "Diana was amazing! She delivered excellent logo concepts ahead of schedule. Highly recommended!",
            project: projectLogo._id
        },
        // Diana (freelancer) reviews Alice (client)
        {
            reviewer: freelancerDiana._id,
            reviewee: clientAlice._id,
            rating: 5,
            comment: "Alice was a pleasure to work with. Clear communication and prompt payments. A+ client!",
            project: projectLogo._id
        }
    ]);

    // Push review IDs to the respective users
    await User.findByIdAndUpdate(clientAlice._id, { $push: { reviews: reviews[1]._id } });
    await User.findByIdAndUpdate(freelancerDiana._id, { $push: { reviews: reviews[0]._id } });
    console.log(`${reviews.length} reviews created and linked. ✅`);


    // --- 7. Create Messages between Client & Freelancer ---
    console.log('Creating a message thread for the MERN project...');
    const roomId = `${projectMERN._id}_${clientAlice._id}_${freelancerCharlie._id}`;
    const messages = await Message.create([
      {
        roomid: roomId,
        sender: clientAlice._id,
        receiver: freelancerCharlie._id,
        content: "Hi Charlie, excited to have you on board! When can you start?",
      },
      {
        roomid: roomId,
        sender: freelancerCharlie._id,
        receiver: clientAlice._id,
        content: "Hi Alice! Thank you, I'm thrilled to work on this. I can start setting up the project environment tomorrow morning.",
        seen: true,
      },
      {
        roomid: roomId,
        sender: clientAlice._id,
        receiver: freelancerCharlie._id,
        content: "That sounds perfect. Let me know if you need anything from my end.",
      },
    ]);
    console.log(`${messages.length} messages created. ✅`);


    console.log('\n--- ✨ Dummy Data Seeding Complete! ---');

  } catch (error) {
    console.error('An error occurred during seeding:', error);
  } finally {
    // --- Disconnect from DB ---
    await mongoose.disconnect();
    console.log('MongoDB disconnected. 👋');
  }
};

generateDummyData();