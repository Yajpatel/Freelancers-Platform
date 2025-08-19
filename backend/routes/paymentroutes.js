const express = require("express");
const crypto = require("crypto");
const Payment = require("../models/Payment"); // Adjust the path if necessary
const instance = require("../config/razorpay.js"); 
const Proposal = require("../models/Proposal.js"); // Adjust path to your Proposal model
const Message = require("../models/Message.js");

const router = express.Router();

// ROUTE 1: Get Razorpay Key ID
router.get("/getkey", (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
});

// ROUTE 2: Create Payment Order
// ROUTE 2: Create Payment Order
router.post("/create-order", async (req, res) => {
    console.log("instance = "+instance)
  try {
    const options = {
      amount: Number(req.body.amount) * 100,
      currency: "INR",
    };
      const order = await instance.orders.create(options);
      
    res.status(200).json({ success: true, order });
  } catch (error) {
    // ✅ THIS LINE WILL REVEAL THE TRUE CAUSE
    console.error("ERROR CREATING ORDER:", error);
    res.status(500).json({ success: false, message: "Could not create order" });
  }
});
// ROUTE 3: Verify Payment and Update Proposal (IMPROVED VERSION)
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      proposalId,
    } = req.body;

    // Find the proposal first and populate necessary data
    const proposal = await Proposal.findById(proposalId).populate(
      "project client freelancer"
    );

    if (!proposal) {
      return res
        .status(404)
        .json({ success: false, message: "Proposal not found" });
    }

    // SUGGESTION 1: Check if already completed to prevent duplicate actions
      if (proposal.status === "completed") {
      return res.json({
        success: true,
        message: "This proposal has already been paid for.",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Signatures match, payment is authentic

      // CRITICAL FIX 2: Create a record of the payment in your database
      await Payment.create({
        proposal: proposal._id,
        project: proposal.project._id,
        client: proposal.client._id,
        freelancer: proposal.freelancer._id,
        amount: proposal.totalBidAmount,
        status: "in_escrow", // A good status to indicate money is held
        method: "razorpay",
        transactionId: razorpay_payment_id,
      });

      // Update the proposal status
      proposal.status = "completed";
      await proposal.save();

      // SUGGESTION 3: Automatically send a message to the freelancer
      const roomid = [
        proposal.client.firebaseUID,
        proposal.freelancer.firebaseUID,
      ]
        .sort()
        .join("-");
      await Message.create({
        roomid,
        sender: proposal.client._id,
        receiver: proposal.freelancer._id,
        content: `Great news! My payment for the project "${proposal.project.title}" was successful. Your money is safe and will recieve when you compelte the project and submit the projecct successfully so dont worry ! The proposal is now accepted and the project can begin.`,
      });

      res.json({ success: true, message: "Payment successful." });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Payment verification failed." });
    }
  } catch (error) {
    console.error("Error in verify-payment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
