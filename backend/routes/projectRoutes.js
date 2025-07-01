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
module.exports = router;