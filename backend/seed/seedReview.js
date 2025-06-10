const mongoose = require('mongoose');
const Review = require('../models/Review');

const reviewSeedData = async (users, projects) => {
  return Review.insertMany([
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
  ])
    .then(res => {
      console.log('✅ Reviews seeded');
      return res;
    })
    .catch(err => {
      console.error('❌ Error seeding reviews:', err);
      return [];
    });
};

module.exports = reviewSeedData;
