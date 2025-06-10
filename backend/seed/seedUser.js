const mongoose = require('mongoose');
const User = require('../models/User');

const userSeedData = User.insertMany([
  {
    name: 'Client User',
    email: 'client@example.com',
    password: 'client123',
    bio: 'Client looking for freelancers',
    skills: ['Management', 'Communication'],
    rating: 4.2
  },
  {
    name: 'Freelancer User',
    email: 'freelancer@example.com',
    password: 'freelancer123',
    bio: 'Freelancer who works hard',
    skills: ['Node.js', 'React', 'MongoDB'],
    rating: 4.8
  }
])
  .then(res => {
    console.log('✅ Users seeded');
    return res;
  })
  .catch(err => {
    console.error('❌ Error seeding users:', err);
    return [];
  });

module.exports = userSeedData;
