const mongoose = require('mongoose'); 

/* ===================== PAYMENT SCHEMA ===================== */
const paymentSchema = new mongoose.Schema({
  proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  amount: { type: Number, required: true }, // INR only
  status: { 
    type: String, 
    enum: ['initiated', 'in_escrow', 'released', 'refunded', 'failed'], 
    default: 'initiated' 
  },

  method: { 
    type: String,
    default: 'razorpay' 
  },

  transactionId: { type: String }, 
  createdAt: { type: Date, default: Date.now },
  releasedAt: { type: Date }
});

module.exports = mongoose.model('Payment', paymentSchema);