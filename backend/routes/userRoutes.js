const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

module.exports = router;