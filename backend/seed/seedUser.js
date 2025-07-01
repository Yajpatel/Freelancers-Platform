const User = require('../models/User');

const userSeedData = async () => {
  const users = await User.insertMany([
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      firebaseUID: 'uid-alice',
      bio: 'Full-stack developer with 5 years of experience.',
      skills: ['JavaScript', 'Node.js', 'React'],
      rating: 4.5
    },
    {
      name: 'Bob Smith',
      email: 'bob@example.com',
      firebaseUID: 'uid-bob',
      bio: 'Graphic designer and branding expert.',
      skills: ['Photoshop', 'Illustrator', 'Logo Design'],
      rating: 4.8
    },
    {
      name: 'Charlie Adams',
      email: 'charlie@example.com',
      firebaseUID: 'uid-charlie',
      bio: 'Backend engineer specialized in APIs and MongoDB.',
      skills: ['Node.js', 'Express', 'MongoDB'],
      rating: 4.6
    }
  ]);

  console.log('✅ Users seeded');
  return users;
};

module.exports = userSeedData;
