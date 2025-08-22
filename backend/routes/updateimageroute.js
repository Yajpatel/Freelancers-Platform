// routes/userRoutes.js (or wherever your routes are)
const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Your User model
const upload = require("../config/cloudinaryConfig"); // Import the multer config

// ... other routes

// Route to update profile image

router.put(
  "/profile-image/:id",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      const firebaseId = req.params.id; // The ID from the URL is the Firebase UID
      const imageUrl = req.file.path; // URL from Cloudinary

      // --- THE FIX IS HERE ---
      // Find the user by their 'firebaseUID' instead of '_id'
      const updatedUser = await User.findOneAndUpdate(
        { firebaseUID: firebaseId }, // Search condition
        { profileImage: imageUrl }, // Update data
        { new: true } // Option to return the updated document
      );
      // --- END OF FIX ---

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile image:", error);
      res.status(500).json({ message: "Server error during image update." });
    }
  }
);

module.exports = router;
