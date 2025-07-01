require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const userSeedData = require('./seedUser');
const projectSeedData = require('./seedProject');
const proposalSeedData = require('./seedProposal');
const reviewSeedData = require('./seedReview');



console.log('✅ MONGO_URI from env:', process.env.MONGO_URI);

const seed = async () => {
  try {
    await connectDB();

    // Optional: clear old data
    await mongoose.connection.db.dropDatabase();

    const users = await userSeedData();
    const projects = await projectSeedData(users);
    const proposals = await proposalSeedData(projects, users);
    const reviews = await reviewSeedData(users, projects);

    console.log('✅ All data seeded');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
};

seed();
