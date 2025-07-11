const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

// ✅ GET All Messages between two users (Chat History)
router.get('/getConversation/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  const roomid = [user1, user2].sort().join('-');  // Always consistent roomid

  try {
    const messages = await Message.find({ roomid }).sort({ timestamp: 1 });  // Old ➔ New
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

module.exports = router;
