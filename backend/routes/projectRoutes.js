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
      .populate("freelancer", "name email profileImage skills rating")
      .populate("project", "title category budget status assignedFreelancer")
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


// --- NEW ROUTE TO UPDATE PROJECT STATUS ---
router.put('/:projectId/status', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status } = req.body;

        // Validation to ensure only allowed statuses can be set
        const allowedStatuses = ['open', 'in-progress', 'pending-review', 'completed', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { status: status },
            { new: true } // This option returns the modified document
        );

        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        res.status(200).json({ message: `Project status successfully updated to ${status}.`, project: updatedProject });

    } catch (error) {
        console.error('Error updating project status:', error);
        res.status(500).json({ message: 'An error occurred on the server.' });
    }
});



// // GET completed projects for a client
// router.get('/completed-projects/:clientId', async (req, res) => {
//   try {
//     const { clientId } = req.params;

//     // Find the client user by their Firebase UID
//     const clientUser = await User.findOne({ firebaseUID: clientId });
//     if (!clientUser) {
//       return res.status(404).json({ message: 'Client not found' });
//     }

//     // Find all completed projects for this client
//     const completedProjects = await Project.find({
//       client: clientUser._id,
//       status: 'completed'
//     }).populate('assignedFreelancer', 'name rating'); // Populate the freelancer's name and rating

//     res.json(completedProjects);
//   } catch (error) {
//     console.error('Error fetching completed projects:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// NEW: GET all recently completed projects (platform-wide)
router.get('/completed/all', async (req, res) => {
    try {
        // Find the 5 most recently completed projects on the platform
        const recentProjects = await Project.find({ status: 'completed' })
            .sort({ updatedAt: -1 }) // Sort by when they were last updated (likely completion time)
            .limit(5) // Limit to 5 recent projects
            .populate('client', 'name') // Optionally, get the client's name
            .populate('assignedFreelancer', 'name'); // Get the freelancer's name

        res.json(recentProjects);
    } catch (error) {
        console.error('Error fetching all completed projects:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// backend/routes/projectRoutes.js

// ... (existing code)
// GET all projects for a specific client
router.get('/clientprojectpage/:firebaseUID', async (req, res) => {
    try {
        const { firebaseUID } = req.params;

        // Find the client user by their Firebase UID
        const client = await User.findOne({ firebaseUID });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Fetch all projects posted by this client, and populate the freelancer's details
        const projects = await Project.find({ client: client._id })
            .populate('assignedFreelancer', 'name email') // Populate freelancer's name and email
            .sort({ createdAt: -1 }); // Show the newest projects first

        res.json(projects);
    } catch (error) {
        console.error('Error fetching client projects:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET projects and proposals for a specific freelancer
router.get('/freelancer/:firebaseUID', async (req, res) => {
    try {
        const { firebaseUID } = req.params;

        // 1. Find the freelancer by their Firebase UID to get their MongoDB _id
        const freelancer = await User.findOne({ firebaseUID });
        if (!freelancer) {
            return res.status(404).json({ message: 'Freelancer not found' });
        }

        // 2. Fetch active projects assigned to this freelancer
        const activeProjects = await Project.find({
            assignedFreelancer: freelancer._id,
            status: 'in-progress' // Or whatever status you use for active work
        }).populate('client', 'name'); // Populate client's name

        // 3. Fetch completed projects assigned to this freelancer
        const completedProjects = await Project.find({
            assignedFreelancer: freelancer._id,
            status: 'completed'
        }).populate('client', 'name');

        // 4. Fetch all proposals submitted by this freelancer
        const proposals = await Proposal.find({
            freelancer: freelancer._id
        }).populate('project', 'title'); // Populate the project title for each proposal

        // 5. Send all the data back in one structured object
        res.json({ activeProjects, completedProjects, proposals });

    } catch (error) {
        console.error('Error fetching freelancer projects:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});



// --- NEW ROUTE TO CREATE A PROJECT ---
router.post("/create", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skills,
      budget,
      deadline,
      clientUID,
    } = req.body;

    // 1. Basic validation to ensure all required fields are present
    if (
      !title ||
      !description ||
      !category ||
      !skills ||
      !budget ||
      !clientUID
    ) {
      return res
        .status(400)
        .json({ message: "Please fill out all required fields." });
    }

    // 2. Find the client's MongoDB _id using the Firebase UID from the request
    const client = await User.findOne({ firebaseUID: clientUID });
    if (!client) {
      return res.status(404).json({ message: "Client user not found." });
    }

    // 3. Create a new project instance with the data from the form
    const newProject = new Project({
      title,
      description,
      category,
      skills, // This is the array of skills
      budget: Number(budget), // Ensure budget is stored as a number
      deadline,
      client: client._id, // Use the found MongoDB _id for the reference
      status: "open", // New projects always start as 'open'
    });

    // 4. Save the new project to the database
    await newProject.save();

    // 5. Send a success response back to the frontend
    res
      .status(201)
      .json({ message: "Project created successfully!", project: newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;