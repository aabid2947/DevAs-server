import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = '6b4d9f73f8f4e87c1a7c4f9e3c18f0ed3c9d8c7fa206ad2b6989a2d0e6a7e5a6';

const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, interests } = req.body;

    // Check if a user already exists with the same email or username
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    user = new User({
      username,
      email,
      password,
      interests, // Save interests during registration
    });

    await user.save();

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    // Fetch friends and interests data
    const populatedUser = await User.findById(user.id)
      .populate('friends', 'username email interests');

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        interests: user.interests, // Include interests in the response
        friendList: populatedUser.friends, // Populate friends' details
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    // Fetch friends and interests data
    const populatedUser = await User.findById(user.id)
      .populate('friends', 'username email interests');

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        interests: user.interests, // Include interests in the response
        friendList: populatedUser.friends, // Populate friends' details
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;

