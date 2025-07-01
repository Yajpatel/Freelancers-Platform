const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// POST /api/users/sync
router.post('/saveUser', async (req, res) => {
    console.log("Incoming user:", req.body);
  try {
    const { email, name ,firebaseUID} = req.body;

    if (!email || !firebaseUID) {
      return res.status(400).json({ message: 'Email i   s required' });
    }

    // Check if user already exists
    let user = await User.findOne({ firebaseUID  });

    if (!user) {
      user = new User({ email, name, firebaseUID });
      await user.save();
      console.log('✅ Successfully registered new user');
    } else {
      console.log('✅ Successfully logged in existing user');
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('Error in /sync:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/getuser/:id',async (req,res)=>{
  let { id } = req.params;
  try {
    // Find by firebaseUID, not id (id would look inside MongoDB _id)
    const curruser = await User.findOne({ firebaseUID: id });

      if (curruser) {
        console.log('✅ user found');
        return res.json(curruser);
      } else {
        console.log('❌ user not found');
        return res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;