const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, default: "" },
  skills: { type: [String], default: [] }, // <-- ADD THIS LINE
  budget: { type: Number, default: 0 },
  deadline: { type: Date },

  status: {
    type: String,
    enum: ["open", "in-progress", "pending-review", "completed", "cancelled"],
    default: "open",
  },

  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  proposals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Proposal" }],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", projectSchema);
