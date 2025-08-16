const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// POST 
router.post('/saveUser', async (req, res) => {
    console.log("Incoming user:", req.body);
  try {
    const { email, name ,firebaseUID, role} = req.body;

    if (!email || !firebaseUID) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    let user = await User.findOne({ firebaseUID  });

    if (!user) {
      user = new User({ email,
        name,
        firebaseUID ,
        roles : [role.toLowerCase()],
        currentRole : role
      });
      await user.save();
      console.log('✅ Successfully registered new user');
    } else {
      console.log('user already exists');
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('Error in /sync:', err);
    res.status(500).json({ message: 'this has Internal server error' });
  }
});

// PUT /freelancer/users/updaterole/:firebaseUID
router.put('/updaterole/:firebaseUID', async (req, res) => {
  const { firebaseUID } = req.params;
  const { selectedRole } = req.body;

  if (!selectedRole || !['client', 'freelancer'].includes(selectedRole)) {
    return res.status(400).json({ message: 'Invalid or missing role.' });
  }

  try {
    const user = await User.findOne({ firebaseUID });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Add role if not already present
    if (!user.roles.includes(selectedRole)) {
      user.roles.push(selectedRole);
    }

    // Update currentRole
    user.currentRole = selectedRole;

    await user.save();

    console.log(`✅ Updated role for user ${firebaseUID} to ${selectedRole}`);
    return res.status(200).json({ message: 'Role updated successfully.', user });

  } catch (err) {
    console.error('Error updating role:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/getuser/:id',async (req,res)=>{
  let { id } = req.params;
  try {
    // Find by firebaseUID, not id (id would look inside MongoDB _id)
    const curruser = await User.findOne({ firebaseUID: id });

      if (curruser) {
        console.log('user found');
        return res.json(curruser);
      } else {
        console.log('user not found');
        return res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});
// module.exports = router;

router.get('/chatgetuser/:id',async (req,res)=>{
  let { id } = req.params;
  try {
    // Find by firebaseUID, not id (id would look inside MongoDB _id)
    const curruser = await User.findOne({ _id : id });

      if (curruser) {
        console.log('chat user found');
        return res.json(curruser);
      } else {
        console.log('user not found');
        return res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});



////////////////////////////////////////

// POST /freelancer/users/updateRole













// router.post('/updateRole', async (req, res) => {
//   const { email, currentRole } = req.body;

//   console.log(email);
//   console.log(currentRole);

//   if (!email || !currentRole) {
//     return res.status(400).json({ message: 'Email and role are required.' });
//   }

//   try {
//     // ✅ Find the user in MongoDB by email
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     // ✅ Update the currentRole field
//     user.currentRole = currentRole;
//     await user.save();

//     return res.status(200).json({ message: 'Role updated successfully.', user });
//   } catch (error) {
//     console.error('❌ Error updating role:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });


module.exports = router;