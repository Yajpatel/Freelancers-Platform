const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // Refers to User acting as Freelancer
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  coverLetter: { type: String, default: '' },
  proposedRate: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Proposal', proposalSchema);
