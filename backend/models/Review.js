const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // Who gives the review
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // Who receives the review
  rating: { type: Number, required: true },
  comment: { type: String, default: '' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);