const mongoose = require('mongoose');

/* ===================== PROPOSAL SCHEMA ===================== */
const proposalSchema = new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },

  coverLetter: { type: String, default: '' },
  totalBidAmount: { type: Number, required: true },   // freelancer's bid
  deliveryTime: { type: Number, required: true },     // in days

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Proposal', proposalSchema);