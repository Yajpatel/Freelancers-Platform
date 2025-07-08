const express = require('express');
const router = express.Router();
// const mongoose = require('mongoose');
// const User = require('../models/User');
const Project = require('../models/Project');

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
module.exports = router;