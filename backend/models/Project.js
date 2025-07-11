const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  budget: { type: Number, default: 0 },
  deadline: { type: Date },

  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed'],
    default: 'open'
  },

  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },           // User acting as Client
  assignedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // User acting as Freelancer

  proposals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' }],   // lowercase for collection naming consistency

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
