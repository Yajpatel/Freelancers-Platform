const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Project = require('../models/Project');
const Application = require('../models/Proposal');
const Review = require('../models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/freelancers-platform';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Clear previous data (optional)
    await User.deleteMany({});
    await Project.deleteMany({});
    await Application.deleteMany({});
    await Review.deleteMany({});

    // 1. Seed Users
    const users = await User.insertMany([
      {
        name: 'User1',
        email: 'client@example.com',
        
        // password: 'client123',
        bio: 'Client looking for freelancers',
        skills: ['Management', 'Communication'],
        rating: 4.2
      },
      {
        name: 'User2',
        email: 'freelancer@example.com',
        // password: 'freelancer123',
        bio: 'Freelancer who works hard',
        skills: ['Node.js', 'React', 'MongoDB'],
        rating: 4.8
      }
    ]);
    console.log('✅ Users seeded');

    // 2. Seed Projects
    const projects = await Project.insertMany([
      {
        title: 'Build an E-commerce Website',
        description: 'Develop a fully-functional e-commerce site.',
        category: 'Web Development',
        budget: 1200,
        deadline: new Date('2025-07-01'),
        client: users[0]._id,
        assignedFreelancer: users[1]._id,
        status: 'in-progress'
      },
      {
        title: 'Create a Logo for a Startup',
        description: 'Design a professional logo.',
        category: 'Design',
        budget: 300,
        deadline: new Date('2025-07-10'),
        client: users[0]._id,
        assignedFreelancer: users[1]._id,
        status: 'completed'
      }
    ]);
    console.log('✅ Projects seeded');

    // 3. Seed Applications
    const applications = await Application.insertMany([
      {
        freelancer: users[1]._id,
        project: projects[0]._id,
        coverLetter: 'I am confident I can deliver this project effectively.',
        proposedRate: 1100,
        status: 'accepted'
      },
      {
        freelancer: users[1]._id,
        project: projects[1]._id,
        coverLetter: 'I have great experience with branding and logos.',
        proposedRate: 280,
        status: 'accepted'
      }
    ]);
    console.log('✅ Applications seeded');

    // 4. Seed Reviews
    const reviews = await Review.insertMany([
      {
        reviewer: users[0]._id,
        reviewee: users[1]._id,
        rating: 5,
        comment: 'Outstanding work on the e-commerce site!',
        project: projects[0]._id
      },
      {
        reviewer: users[0]._id,
        reviewee: users[1]._id,
        rating: 4.5,
        comment: 'Loved the logo design!',
        project: projects[1]._id
      }
    ]);
    console.log('✅ Reviews seeded');

    // Done
    console.log('\n🌱 All data seeded successfully!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error seeding data:', err);
    mongoose.disconnect();
  });
