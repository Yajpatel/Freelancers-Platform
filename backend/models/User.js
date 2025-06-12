const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  firebaseUID: { type: String, unique: true, required: true },
  //password: String, // optional if using Firebase
  bio: String,
  skills: [String],
  rating: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  postedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  takenProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

module.exports = User;