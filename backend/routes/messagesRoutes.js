const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

/////
router.get('/getMessages/:userId', async (req, res) => {
  const { userId } = req.params;

  // Find the Mongo User by firebaseUID
  const user = await User.findOne({ firebaseUID: userId });
  if (!user) return res.status(404).json({ message: 'User not found' });

  try {
    // Get all messages where current user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: user._id }, { receiver: user._id }]
    }).sort({ timestamp: -1 });

    const uniqueUserIds = new Set();
    const lastMessageMap = {};

    // Collect unique other users + last message
    messages.forEach((msg) => {
      const otherUserId = msg.sender.toString() === user._id.toString()
        ? msg.receiver.toString()
        : msg.sender.toString();

      if (!lastMessageMap[otherUserId]) {
        lastMessageMap[otherUserId] = msg.content; // save last message text
      }
      uniqueUserIds.add(otherUserId);
    });

    // Fetch details of those users
    let users = await User.find({ _id: { $in: Array.from(uniqueUserIds) } })
      .select('_id name email')
      .lean();

    // Attach last message for UI
    users = users.map(u => ({
      ...u,
      lastMessage: lastMessageMap[u._id.toString()] || ""
    }));

    res.json(users);
  } catch (error) {
    console.error('Error fetching chat users:', error);
    res.status(500).json({ message: 'Failed to fetch chat users' });
  }
});




/////
router.get('/getunreadcount/:id',async (req,res)=>{
  const { id } = req.params;
  console.log(id);

  const user = await User.findOne({ firebaseUID: id }); // Assuming you saved Firebase UID in User
  if (!user) return res.status(404).json({ message: 'User not found' });

  try{
    const count = await Message.countDocuments({
      receiver: user._id,
      seen: false
    });
    console.log("Count found:", count);
    res.json({ unreadCount: count });
  }
  catch(error){
    console.log('something went wrong while getting  count');
    res.status(500).json({ message:'something went wrong while getting  count'});
  }
})

// ✅ GET All Messages between two users (Chat History)
router.get('/getConversation/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  const roomid = [user1, user2].sort().join('-');  // Always consistent roomid

  try {
    const messages = await Message.find({ roomid }).sort({ timestamp: 1 });  // Old ➔ New
    console.log("messaes  = "+messages)
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

module.exports = router;
