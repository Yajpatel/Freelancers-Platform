const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  firebaseUID: { type: String, unique: true, required: true },

  bio: { type: String, default: '' },
  profileImage: { type: String, default: '' },  // Optional profile pic

  skills: { type: [String], default: [] },      // Relevant when acting as Freelancer
  rating: { type: Number, default: 0 },

  postedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],  // As Client
  takenProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],   // As Freelancer

  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

  roles: {
    type: [String],
    enum: ['Client', 'Freelancer'],
    default: []    // 👉 No default role until user chooses
  },

  currentRole: {
    type: String,
    enum: ['Client', 'Freelancer'],
    default: null  // 👉 No active role until explicitly chosen
  },

  // isAdmin: { type: Boolean, default: false },   // Optional: For future admin features

  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
