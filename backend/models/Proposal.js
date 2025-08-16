const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // Refers to User acting as Freelancer
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  coverLetter: { type: String, default: '' },

  // in how much money user will do work even though user have given the amount
  biddingAmount: { type: Number, required: true },
  deliveryTime: { type: Number, required: true }, // in days

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Proposal', proposalSchema);
