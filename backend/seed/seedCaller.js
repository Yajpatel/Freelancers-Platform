require('dotenv').config()
const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust path to your User model

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("🚀 MongoDB Connected");
  return seedUsers();
})
.catch((err) => console.error("MongoDB connection error:", err));

async function seedUsers() {
  try {
    const users = [
      {
        name: 'Providenci Larson-Bogan',
        email: 'providenci_larson-bogan@yahoo.com',
        firebaseUID: 'Z9p7NhHdkqVxD0WJ1mrD8xp4w1G2',
        bio: 'student',
        profileImage: 'https://avatars.githubusercontent.com/u/45820220',
        skills: ['TypeScript', 'Kubernetes', 'RESTful APIs'],
        rating: 4.03594839424324,
        postedProjects: [
          new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa27'),
          new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa28')
        ],
        roles: ['client'],
        currentRole: 'client'
      },
      {
        name: 'Delphine Franecki',
        email: 'delphine.franecki@yahoo.com',
        firebaseUID: 'KuFBUh05CURHSFC2QZwJT1Xjm562',
        bio: 'founder, inventor, patriot',
        profileImage: 'https://avatars.githubusercontent.com/u/35939650',
        skills: ['C++', 'TypeScript', 'Vue.js', 'React', 'AWS', 'Angular'],
        rating: 3.809407901804721,
        postedProjects: [
          new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa33'),
          new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa34')
        ],
        takenProjects: [
          new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa2a'),
          new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa36')
        ],
        reviews: [
          new mongoose.Types.ObjectId('686a37d7a15d97b9014eac5e'),
          new mongoose.Types.ObjectId('686a37d7a15d97b9014eac61')
        ],
        roles: ['client', 'freelancer'],
        currentRole: 'freelancer'
      },
      {
        name: 'Hubert Runolfsdottir',
        email: 'hubert_runolfsdottir@yahoo.com',
        firebaseUID: 'p1DmUvA3teUqIFuX6CaKL82fqvj2',
        bio: 'depot lover s',
        profileImage: 'https://avatars.githubusercontent.com/u/78293305',
        skills: ['Digital Marketing', 'SEO', 'TypeScript', 'Vuex'],
        rating: 3.342842107802791,
        roles: ['freelancer'],
        currentRole: 'freelancer'
      }
    ];

    // await User.deleteMany(); // Optional: Clear existing users
    await User.insertMany(users);
    console.log("✅ Users seeded successfully.");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  } finally {
    mongoose.disconnect();
  }
}


// require('dotenv').config();
// // const mongoose = require('mongoose');
// // const connectDB = require('../config/db');

// // const userSeedData = require('./seedUser');
// // const projectSeedData = require('./seedProject');
// // const proposalSeedData = require('./seedProposal');
// // const reviewSeedData = require('./seedReview');



// // console.log('✅ MONGO_URI from env:', process.env.MONGO_URI);

// // const seed = async () => {
// //   try {
// //     await connectDB();

// //     // Optional: clear old data
// //     await mongoose.connection.db.dropDatabase();

// //     const users = await userSeedData();
// //     const projects = await projectSeedData(users);
// //     const proposals = await proposalSeedData(projects, users);
// //     const reviews = await reviewSeedData(users, projects);

// //     console.log('✅ All data seeded');
// //     process.exit();
// //   } catch (err) {
// //     console.error('❌ Error seeding data:', err);
// //     process.exit(1);
// //   }
// // };

// // seed();




// const mongoose = require('mongoose');
// const { faker } = require('@faker-js/faker');


// // --- User Schema and Model ---
// // Including the schema definition for standalone execution.
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, unique: true, required: true },
//   firebaseUID: { type: String, unique: true, required: true },

//   bio: { type: String, default: '' },
//   profileImage: { type: String, default: '' },

//   skills: { type: [String], default: [] },
//   rating: { type: Number, default: 0 },

//   postedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
//   takenProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],

//   reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

//   roles: {
//     type: [String],
//     enum: ['Client', 'Freelancer'],
//     default: []
//   },

//   currentRole: {
//     type: String,
//     enum: ['Client', 'Freelancer'],
//     default: null
//   },

//   createdAt: { type: Date, default: Date.now }
// });

// const User = mongoose.model('User', userSchema);

// // --- Database Connection ---
// const MONGO_URI = process.env.MONGO_URI;
// console.log(MONGO_URI);
// mongoose.connect(MONGO_URI)
//   .then(async () => {
//     console.log('✅ Connected to MongoDB');

//     // Optional: Clear existing users if you want to ensure these specific users are the only ones
//     // and avoid potential _id conflicts if they were inserted previously.
//     // If you're running this after a full 'seed.js' script that clears everything, this might be redundant.
//     // await User.deleteMany({});
//     // console.log('🗑️ Cleared existing users for fresh insert.');

//     const commonSkills = [
//       'React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript', 'Python', 'Django', 'Flask',
//       'UI/UX Design', 'Graphic Design', 'Content Writing', 'Digital Marketing',
//       'TypeScript', 'HTML', 'CSS', 'SEO', 'Vuex', 'Kubernetes', 'RESTful APIs', 'C++', 'AWS', 'Angular'
//     ];

//     const usersToInsert = [
//       {
//         // User 1: Hubert Runolfsdottir
//         _id: new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa19'),
//         name: 'Hubert Runolfsdottir',
//         email: 'hubert_runolfsdottir@yahoo.com',
//         firebaseUID: 'p1DmUvA3teUqIFuX6CaKL82fqvj2',
//         bio: 'depot lover s', // From image
//         profileImage: faker.image.avatar(),
//         skills: ['Digital Marketing', 'SEO', 'TypeScript', 'Vuex'], // From image
//         rating: 3.342842107802791, // From image
//         reviews: [],
//         postedProjects: [],
//         takenProjects: [],
//         roles: ['Freelancer'], // Assuming from skills/context
//         currentRole: 'Freelancer',
//         createdAt: new Date('2024-04-14T22:31:27.779Z') // From image
//       },
//       {
//         // User 2: Providenci Larson-Bogan
//         _id: new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa15'),
//         name: 'Providenci Larson-Bogan',
//         email: 'providenci_larson-bogan@yahoo.com',
//         firebaseUID: 'Z9p7NhhdkqVxD0wJ1mrD8xp4w1G2',
//         bio: 'student', // From image
//         profileImage: faker.image.avatar(),
//         skills: ['TypeScript', 'Kubernetes', 'RESTful APIs'], // From image
//         rating: 4.03594839424324, // From image
//         reviews: [],
//         // These project IDs will refer to projects that don't exist yet unless seeded separately
//         postedProjects: [
//           new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa27'),
//           new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa28')
//         ],
//         takenProjects: [],
//         roles: ['Client'], // Assuming from postedProjects/context
//         currentRole: 'Client',
//         createdAt: new Date('2024-09-12T03:35:30.180Z') // From image
//       },
//       {
//         // User 3: Delphine Franecki
//         _id: new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa1e'), // Note: 'l' instead of '1' in ID (potential typo in screenshot, MongoDB will treat as literal)
//         name: 'Delphine Franecki',
//         email: 'delphine.franecki@yahoo.com',
//         firebaseUID: 'KuFBUh05CURHSFC2QZwJT1Xjm562',
//         bio: 'founder, inventor, patriot', // From image
//         profileImage: faker.image.avatar(),
//         skills: ['C++', 'TypeScript', 'Vue.js', 'React', 'AWS', 'Angular'], // From image
//         rating: 3.809407901804721, // From image
//         // These IDs will refer to documents that don't exist yet unless seeded separately
//         reviews: [
//           new mongoose.Types.ObjectId('686a37d7a15d97b9014eac5e'),
//           new mongoose.Types.ObjectId('686a37d7a15d97b9014eac61')
//         ],
//         postedProjects: [
//           new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa33'),
//           new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa34')
//         ],
//         takenProjects: [
//           new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa2a'),
//           new mongoose.Types.ObjectId('686a37cfa15d97b9014eaa36')
//         ],
//         // Assuming roles based on their activities (postedProjects & takenProjects)
//         roles: ['Client', 'Freelancer'],
//         currentRole: faker.helpers.arrayElement(['Client', 'Freelancer']), // Randomly pick one of their roles
//         createdAt: new Date('2023-03-14T18:02:24.339Z') // From image (corrected year to 2023 as per date in screenshot)
//       }
//     ];

//     console.log('➕ Attempting to insert 3 users with specific data from images...');
//     try {
//       // Use insertMany for multiple documents
//       const insertedUsers = await User.insertMany(usersToInsert);
//       console.log(`✅ Successfully added ${insertedUsers.length} new users:`);
//       insertedUsers.forEach(user => {
//         console.log(`  - ID: ${user._id}, Name: ${user.name}, Email: ${user.email}, FirebaseUID: ${user.firebaseUID}`);
//       });
//     } catch (error) {
//       console.error('❌ Error inserting new users:', error.message);
//       if (error.code === 11000) { // MongoDB duplicate key error
//         console.error('  This error indicates a duplicate key. Ensure the _id, email, and firebaseUID are unique. If you previously ran the seed script, these IDs might already exist.');
//       }
//     } finally {
//       mongoose.disconnect();
//     }
//   })
//   .catch(err => {
//     console.error('❌ Error connecting to MongoDB:', err);
//     mongoose.disconnect();
//   });