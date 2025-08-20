const express = require("express");
const crypto = require("crypto");
const Payment = require("../models/Payment"); // Adjust the path if necessary
const instance = require("../config/razorpay.js"); 
const Proposal = require("../models/Proposal.js"); // Adjust path to your Proposal model
const Message = require("../models/Message.js");
const Project = require("../models/Project.js");
const User = require("../models/User.js");

const router = express.Router();

// ROUTE 1: Get Razorpay Key ID
router.get("/getkey", (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
});

// ROUTE 2: Create Payment Order
router.post("/create-order", async (req, res) => {
    try {
        const options = {
            amount: Number(req.body.amount) * 100,
            currency: "INR",
        };
        const order = await instance.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("ERROR CREATING ORDER:", error);
        res.status(500).json({ success: false, message: "Could not create order" });
    }
});
// ROUTE 3: Verify Payment (MODIFIED FOR MULTIPLE FREELANCERS)
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      proposalId,
    } = req.body;

    // Load the proposal with necessary details
    const proposal = await Proposal.findById(proposalId)
      .populate({
        path: "project",
        populate: { path: "client", select: "firebaseUID name email" },
      })
      .populate({ path: "freelancer", select: "firebaseUID name email" });

    if (!proposal) {
      return res
        .status(404)
        .json({ success: false, message: "Proposal not found" });
    }

    // ---- Verify Razorpay signature (NO CHANGE HERE) ----
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed." });
    }

    // ---- Payment Verified: Perform Database Updates ----

    // 1) Update Project: Mark as 'in-progress' and ADD the new freelancer
    // We use $addToSet instead of $push to prevent accidentally adding the same freelancer twice.
    await Project.findByIdAndUpdate(
      proposal.project._id,
      {
        status: "in-progress", // Set status to in-progress on the first hire
        $addToSet: { assignedFreelancers: proposal.freelancer._id }, // ✅ MODIFIED
      },
      { new: true }
    );

    // 2) Update This Proposal: Mark it as 'accepted'
    proposal.status = "accepted";
    await proposal.save();

    // 3) ✅ REMOVED: The block that rejects other proposals is now gone.
    /*
    // OLD LOGIC - DELETED
    await Proposal.updateMany(
      { project: proposal.project._id, _id: { $ne: proposal._id } },
      { $set: { status: "rejected" } }
    );
    */

    // 4) Create Payment Record (NO CHANGE HERE)
    const total = Number(proposal.totalBidAmount);
    await Payment.create({
      proposal: proposal._id,
      project: proposal.project._id,
      client: proposal.project.client?._id,
      freelancer: proposal.freelancer._id,
      amount: total,
      payoutAmount: Math.round(total * 0.9), // 90% to freelancer
      platformFee: Math.round(total * 0.1),  // 10% to platform
      status: "in_escrow",
      method: "razorpay",
      transactionId: razorpay_payment_id,
    });

    // 5) Notify Freelancer via Chat (NO CHANGE HERE)
    const clientUID = proposal.project.client?.firebaseUID;
    const freelancerUID = proposal.freelancer?.firebaseUID;
    if (clientUID && freelancerUID) {
      const roomid = [clientUID, freelancerUID].sort().join("-");
      const contentMsg = `Congratulations! Your proposal for "${proposal.project.title}" has been accepted and funded. The payment of ₹${total} is secured. You can now begin work.`;

      await Message.create({
        roomid,
        sender: proposal.project.client._id, // System message sent on behalf of client
        receiver: proposal.freelancer._id,
        content: contentMsg,
        timestamp: new Date(),
      });
    }

    return res.json({
      success: true,
      message: "Payment successful and freelancer hired!",
    });
  } catch (error) {
    console.error("Error in verify-payment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});


router.get("/client/:firebaseUID", async (req, res) => {
  try {
    const { firebaseUID } = req.params;

    // Find the client user to get their MongoDB _id
    const clientUser = await User.findOne({ firebaseUID });
    if (!clientUser) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Find all payments where the payer is this client
    const payments = await Payment.find({ client: clientUser._id })
      .populate("project", "title") // Get the project's title
      .populate("freelancer", "name") // Get the freelancer's name
      .sort({ createdAt: -1 }); // Show the most recent first

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching client transactions:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// (Keep all your existing payment routes)

// --- NEW ROUTE: Get all transactions for a specific freelancer ---
router.get('/freelancer/:firebaseUID', async (req, res) => {
    try {
        const { firebaseUID } = req.params;

        // Find the freelancer user to get their MongoDB _id
        const freelancerUser = await User.findOne({ firebaseUID });
        if (!freelancerUser) {
            return res.status(404).json({ message: 'Freelancer not found' });
        }

        // Find all payments where the payee is this freelancer
        const payments = await Payment.find({ freelancer: freelancerUser._id })
            .populate('project', 'title') // Get the project's title
            .populate('client', 'name')   // Get the client's name
            .sort({ createdAt: -1 });     // Show the most recent first

        res.status(200).json(payments);

    } catch (error) {
        console.error('Error fetching freelancer transactions:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
