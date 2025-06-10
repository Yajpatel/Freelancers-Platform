const mongoose = require('mongoose');
const Project = require('../models/Project');

const projectSeedData = async (users) => {
  return Project.insertMany([
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
  ])
    .then(res => {
      console.log('✅ Projects seeded');
      return res;
    })
    .catch(err => {
      console.error('❌ Error seeding projects:', err);
      return [];
    });
};

module.exports = projectSeedData;
