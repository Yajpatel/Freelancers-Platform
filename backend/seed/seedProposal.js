const mongoose = require('mongoose');
const Application = require('../models/Application');

const applicationSeedData = async (users, projects) => {
  return Application.insertMany([
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
  ])
    .then(res => {
      console.log('✅ Applications seeded');
      return res;
    })
    .catch(err => {
      console.error('❌ Error seeding applications:', err);
      return [];
    });
};

module.exports = applicationSeedData;
