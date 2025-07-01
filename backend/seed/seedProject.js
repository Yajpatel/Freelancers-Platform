const Project = require('../models/Project');

const projectSeedData = async (users) => {
  const projects = await Project.insertMany([
    {
      title: 'Build a Portfolio Website',
      description: 'Create a modern personal portfolio site.',
      category: 'Web Development',
      budget: 500,
      deadline: new Date('2025-07-10'),
      client: users[0]._id,
      assignedFreelancer: users[1]._id,
      status: 'in-progress'
    },
    {
      title: 'Design Social Media Graphics',
      description: '10 custom social media templates.',
      category: 'Design',
      budget: 300,
      deadline: new Date('2025-07-05'),
      client: users[1]._id,
      assignedFreelancer: users[2]._id,
      status: 'completed'
    }
  ]);

  console.log('✅ Projects seeded');
  return projects;
};

module.exports = projectSeedData;
