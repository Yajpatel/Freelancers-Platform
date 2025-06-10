const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  budget: Number,
  deadline: Date,

  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed'],
    default: 'open'
  },

  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
