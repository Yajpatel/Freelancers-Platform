const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic info
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  firebaseUID: { type: String, unique: true, required: true },

  profileImage: {
    type: String,
    default:
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
  
  bio: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },
  location: { type: String, default: "" },

  // Skills
  skills: { type: [String], default: [] },
  rating: { type: Number, default: 0 },

  // Professional info
  experience: [
    {
      company: String,
      role: String,
      startDate: Date,
      endDate: Date,
      description: String,
    },
  ],
  education: [
    {
      school: String,
      degree: String,
      startYear: Number,
      endYear: Number,
    },
  ],
  certifications: [
    {
      name: String,
      organization: String,
      year: Number,
    },
  ],

  // Payment info (for freelancer payouts)
  paymentInfo: {
    bankAccount: {
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },
    paypalEmail: String,
    upiId: String,
    preferredMethod: {
      type: String,
      enum: ["bank", "paypal", "upi"],
      default: "upi",
    },
  },

  // Verification status
  verification: {
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
  },

  // Reviews (linked to Review schema)
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

  // Projects
  postedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  takenProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],

  // Role system
  roles: {
    type: [String],
    enum: ["client", "freelancer"],
    default: [],
  },
  currentRole: {
    type: String,
    enum: ["client", "freelancer"],
    default: null,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
