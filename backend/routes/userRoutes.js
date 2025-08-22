const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

//////////////////////////////
// User Registration & Role Management
//////////////////////////////
// get firebaseid by the mongodbid
router.get("/get-firebase-uid/:mongoId", async (req, res) => {
  try {
    const user = await User.findById(req.params.mongoId).select("firebaseUID"); // Find user by _id and select only the firebaseUID

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ firebaseUID: user.firebaseUID });
  } catch (err) {
    console.error(err.message);
    // Handle cases where the mongoId is not a valid format
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(500).send("Server Error");
  }
});



// POST: Register new user if not exists
router.post('/saveUser', async (req, res) => {
  console.log("Incoming user:", req.body);
  try {
    const { email, name, firebaseUID, role } = req.body;

    if (!email || !firebaseUID) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let user = await User.findOne({ firebaseUID });
    if (!user) {
      user = new User({
        email,
        name,
        firebaseUID,
        roles: [role.toLowerCase()],
        currentRole: role
      });
      await user.save();
      console.log('✅ Successfully registered new user');
    } else {
      console.log('User already exists');
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('Error in /saveUser:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT: Update user role
router.put('/updaterole/:firebaseUID', async (req, res) => {
  const { firebaseUID } = req.params;
  const { selectedRole } = req.body;

  if (!selectedRole || !['client', 'freelancer'].includes(selectedRole)) {
    return res.status(400).json({ message: 'Invalid or missing role.' });
  }

  try {
    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.roles.includes(selectedRole)) {
      user.roles.push(selectedRole);
    }
    user.currentRole = selectedRole;
    await user.save();

    console.log(`✅ Updated role for user ${firebaseUID} to ${selectedRole}`);
    return res.status(200).json({ message: 'Role updated successfully.', user });
  } catch (err) {
    console.error('Error updating role:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

//////////////////////////////
// Fetch Users
//////////////////////////////

// GET: Fetch user by firebaseUID
router.get('/getuser/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const curruser = await User.findOne({ firebaseUID: id });
    if (curruser) return res.json(curruser);
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET: Fetch user by MongoDB _id (for chat)
router.get('/chatgetuser/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const curruser = await User.findOne({ _id: id });
    if (curruser) return res.json(curruser);
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error fetching chat user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

//////////////////////////////
// User Profile Updates (Single Fields)
//////////////////////////////

// PUT: Update bio
router.put('/update/bio/:id', async (req, res) => {
  const { id } = req.params;
  const { bio } = req.body;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUID: id },
      { $set: { bio } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT: Update skills (array)
router.put('/update/skills/:id', async (req, res) => {
  const { id } = req.params;
  const { skills } = req.body; // array of skills
  try {
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUID: id },
      { $set: { skills } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT: Update payment info
router.put('/update/payment/:id', async (req, res) => {
  const { id } = req.params;
  const { paymentInfo } = req.body; // bank, paypal, upi
  try {
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUID: id },
      { $set: { paymentInfo } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//////////////////////////////
// Experience (Array CRUD)
//////////////////////////////

// POST: Add new experience
router.post('/experience/:id', async (req, res) => {
  const { id } = req.params;
  const newExp = req.body; // { company, role, startDate, endDate, description }
  try {
    const user = await User.findOne({ firebaseUID: id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.experience.push(newExp);
    await user.save();
    res.json(user.experience);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT: Update experience by expId
router.put('/experience/:id/:expId', async (req, res) => {
  const { id, expId } = req.params;
  const updatedExp = req.body;
  try {
    const user = await User.findOne({ firebaseUID: id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const expIndex = user.experience.findIndex(e => e._id.toString() === expId);
    if (expIndex === -1) return res.status(404).json({ message: 'Experience not found' });

    user.experience[expIndex] = { ...user.experience[expIndex], ...updatedExp };
    await user.save();
    res.json(user.experience[expIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE: Delete experience by expId
router.delete('/experience/:id/:expId', async (req, res) => {
  const { id, expId } = req.params;
  try {
    const user = await User.findOne({ firebaseUID: id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.experience = user.experience.filter(e => e._id.toString() !== expId);
    await user.save();
    res.json({ message: 'Experience deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//////////////////////////////
// Education (Array CRUD)
//////////////////////////////

// POST: Add new education
router.post('/education/:id', async (req, res) => {
  const { id } = req.params;
  const newEdu = req.body; // { school, degree, startYear, endYear }
  try {
    const user = await User.findOne({ firebaseUID: id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.education.push(newEdu);
    await user.save();
    res.json(user.education);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT: Update education by eduId
router.put('/education/:id/:eduId', async (req, res) => {
  const { id, eduId } = req.params;
  const updatedEdu = req.body;
  try {
    const user = await User.findOne({ firebaseUID: id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const eduIndex = user.education.findIndex(e => e._id.toString() === eduId);
    if (eduIndex === -1) return res.status(404).json({ message: 'Education not found' });

    user.education[eduIndex] = { ...user.education[eduIndex], ...updatedEdu };
    await user.save();
    res.json(user.education[eduIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE: Delete education by eduId
router.delete('/education/:id/:eduId', async (req, res) => {
  const { id, eduId } = req.params;
  try {
    const user = await User.findOne({ firebaseUID: id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.education = user.education.filter(e => e._id.toString() !== eduId);
    await user.save();
    res.json({ message: 'Education deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//////////////////////////////
// Certifications (Array CRUD)
//////////////////////////////

// POST: Add new certification
router.post('/certifications/:id', async (req, res) => {
  const { id } = req.params;
  const newCert = req.body; // { name, organization, year }
  try {
    const user = await User.findOne({ firebaseUID: id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.certifications.push(newCert);
    await user.save();
    res.json(user.certifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT: Update certification by certId
router.put('/certifications/:id/:certId', async (req, res) => {
  const { id, certId } = req.params;
  const updatedCert = req.body;
  try {
    const user = await User.findOne({ firebaseUID: id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const certIndex = user.certifications.findIndex(c => c._id.toString() === certId);
    if (certIndex === -1) return res.status(404).json({ message: 'Certification not found' });

    user.certifications[certIndex] = { ...user.certifications[certIndex], ...updatedCert };
    await user.save();
    res.json(user.certifications[certIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE: Delete certification by certId
router.delete('/certifications/:id/:certId', async (req, res) => {
  const { id, certId } = req.params;
  try {
    const user = await User.findOne({ firebaseUID: id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.certifications = user.certifications.filter(c => c._id.toString() !== certId);
    await user.save();
    res.json({ message: 'Certification deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Add this route to your userRoutes.js file

// GET: Fetch all freelancers
router.get('/freelancers', async (req, res) => {
  try {
    const freelancers = await User.find({ roles: 'freelancer' })
      .select('name profileImage bio skills firebaseUID'); // Select only the fields you need for the list
    res.json(freelancers);
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: Fetch all reviews for a user
router.get('/reviews/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ firebaseUID: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const reviews = await Review.find({ reviewee: user._id })
            .populate('reviewer', 'name profileImage')
            .populate('project', 'title');

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;
