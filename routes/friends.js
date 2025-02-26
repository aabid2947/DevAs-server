import express from 'express';
import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';
import  auth  from '../middleware/auth.js';

const router = express.Router();

router.post('/request', auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { recipientId } = req.body;

    if (senderId === recipientId) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    const newRequest = new FriendRequest({ sender: senderId, recipient: recipientId });
    await newRequest.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/accept', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.body;

    const request = await FriendRequest.findById(requestId);
    if (!request || request.recipient.toString() !== userId || request.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid friend request' });
    }

    request.status = 'accepted';
    await request.save();

    await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.recipient } });
    await User.findByIdAndUpdate(request.recipient, { $addToSet: { friends: request.sender } });

    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reject', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.body;

    const request = await FriendRequest.findById(requestId);
    if (!request || request.recipient.toString() !== userId || request.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid friend request' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/list', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('friends', 'username email');
    
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/requests', auth,async (req, res) => {
  try {
    // Fetch friend requests where the logged-in user is the recipient and the status is pending
    const friendRequests = await FriendRequest.find({
      recipient: req.user.id, // req.user.id comes from authentication middleware
      status: 'pending',
    })
      
      if (!friendRequests || friendRequests.length === 0) {
      
      return res.status(200).json({data:[]});
    }

    return res.status(200).json({ data: friendRequests });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

 // authenticate middleware ensures the user is logged in
export default router;

