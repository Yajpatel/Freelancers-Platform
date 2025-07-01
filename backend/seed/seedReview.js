const Review = require('../models/Review');

const reviewSeedData = async (users, projects) => {
  const reviews = await Review.insertMany([
    {
      reviewer: users[0]._id,
      reviewee: users[1]._id,
      rating: 5,
      comment: 'Great work on the portfolio site!',
      project: projects[0]._id
    },
    {
      reviewer: users[1]._id,
      reviewee: users[2]._id,
      rating: 4,
      comment: 'Good designs, but slightly delayed.',
      project: projects[1]._id
    }
  ]);

  console.log('✅ Reviews seeded');
  return reviews;
};

module.exports = reviewSeedData;
