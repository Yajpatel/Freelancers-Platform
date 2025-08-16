const express = require('express');
const router = express.Router();
// const mongoose = require('mongoose');
// const User = require('../models/User');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const User = require('../models/User');


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

router.post('/saveproposal',async (req,res) => { 
    console.log("bodyyy.. ",req.body);
    try {
        //here i have passed firebase so i am playing with firebase ids
        const { freelancer, project, coverLetter, biddingAmount, deliveryTime } = req.body;

        // fetching user via firebase
        const freelancerid = await User.findOne({ firebaseUID: freelancer });
        console.log("full data freelancer", freelancerid);
        // ..
        if (!freelancerid) {
            return res.status(404).json({ error: 'User not found' });
        }


        const newproposal = new Proposal(
            {
                freelancer: freelancerid._id,
                    project: project,
                    coverLetter: coverLetter,
                    biddingAmount: biddingAmount,
                    deliveryTime: deliveryTime
            }
        )
    
        const data = await newproposal.save();
        console.log("proposal", data);
        // add the proposal in databse
        const projectpushed = await Project.findByIdAndUpdate(project, { $push: { proposals: newproposal._id } })
        console.log(projectpushed);
    
        // reached till here and submitted 
        console.log('proposal submitted...... and pushed');
        // oon success
        res.status(201).json({ 
                message: "Proposal submitted successfully", 
                proposal: data 
        });
        

    } catch (error) {
        console.error("Error saving proposal:", error);
        res.status(500).json({ message: "Error submitting proposal" });
    }    
})


router.get('/proposals/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    // Find projects where the client’s firebaseUID matches
    const clientUser = await User.findOne({ firebaseUID: clientId });
    if (!clientUser) return res.json([]);

    // 1. Find all projects posted by this client
    const projects = await Project.find({ client: clientUser._id     }).select('_id');

    if (projects.length === 0) {
      return res.json([]); // No projects means no proposals
    }

    const projectIds = projects.map(p => p._id);

    // 2. Find all proposals for those projects
    const proposals = await Proposal.find({ project: { $in: projectIds } })
      .populate('freelancer', 'name email skills rating')
      .populate('project', 'title budget category')
      .sort({ createdAt: -1 }); // Latest first

    res.json(proposals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;