const express = require('express');
const router = express.Router();
// const mongoose = require('mongoose');
// const User = require('../models/User');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const Message = require('../models/Message')

router.get('/SearchProjects',async (req,res)=>{
    const pendingprojects = await Project.find({
        status : 'open',
        assignedFreelancer : null,
    });
    console.log(pendingprojects);
    res.json(pendingprojects);
});

router.get('/projectdetails/:id',async (req,res)=>{
    try {
        const project = await Project.findById(req.params.id).populate('client');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        
        const client = project.client;  // Populated client

        res.json({ project, client });
    } catch (error) {
        res.status(500).json({message : "server error"});
    }
});

// Save new proposal
// Save new proposal
// Save new proposal
router.post("/saveproposal", async (req, res) => {
  try {
    const { freelancer, project, coverLetter, totalBidAmount, deliveryTime } = req.body;

    // ✅ Basic validation
    if (!freelancer || !project || !totalBidAmount || !deliveryTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Find freelancer by Firebase UID
    const freelancerUser = await User.findOne({ firebaseUID: freelancer });
    if (!freelancerUser) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    // ✅ Check if project exists
    const existingProject = await Project.findById(project).populate("client");
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!existingProject.client) {
      return res.status(400).json({ message: "Project has no client assigned" });
    }

    // ✅ Prevent duplicate proposals by same freelancer
    const alreadyExists = await Proposal.findOne({ 
      freelancer: freelancerUser._id, 
      project 
    });
    if (alreadyExists) {
      return res
        .status(400)
        .json({ message: "You already submitted a proposal for this project" });
    }

    // ✅ Create proposal
    const proposal = new Proposal({
      freelancer: freelancerUser._id,
      project,
      client: existingProject.client._id,
      coverLetter,
      totalBidAmount,
      deliveryTime,
    });

    await proposal.save();

    res.status(201).json({
      message: "Proposal submitted successfully",
      proposal,
    });
  } catch (error) {
    console.error("Error saving proposal:", error.message, error.stack);
    res.status(500).json({ message: error.message });
  }
});




router.get('/proposals/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    // Find client
    const clientUser = await User.findOne({ firebaseUID: clientId });
    if (!clientUser) return res.json([]);

    // Get projects created by client
    const projects = await Project.find({ client: clientUser._id }).select('_id');
    if (projects.length === 0) return res.json([]);

    const projectIds = projects.map(p => p._id);

    // Get proposals for these projects
    const proposals = await Proposal.find({ project: { $in: projectIds } })
      .populate('freelancer', 'name email profileImage skills rating')
      .populate('project', 'title category budget')
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/proposals/:proposalId/status', async (req, res) => {
  const { proposalId } = req.params;
  const { status } = req.body;

  if (!['accepted', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const proposal = await Proposal.findByIdAndUpdate(
      proposalId,
      { status },
      { new: true }
    ).populate("freelancer project");

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // ✅ Find client and freelancer users
    const client = await User.findById(proposal.project.client);
    const freelancer = proposal.freelancer;

    if (client && freelancer) {
      let contentMsg = "";
      if (status === "accepted") {
        contentMsg = "Congratulations! Your proposal has been accepted.";
      } else if (status === "rejected") {
        contentMsg = "Sorry, I can't accept your proposal.";
      }

      if (contentMsg) {
        await Message.create({
          roomid: [client.firebaseUID, freelancer.firebaseUID].sort().join("-"),
          sender: client._id,
          receiver: freelancer._id,
          content: contentMsg,
          timestamp: new Date()
        });
      }
    }

    res.json({ message: `Proposal ${status}`, proposal });
  } catch (err) {
    console.error("Error updating proposal status:", err.message);
    res.status(500).json({ message: "Server error while updating status", error: err.message });
  }
});


module.exports = router;