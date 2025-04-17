const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Register User
router.post('/register', async (req, res) => {
  const { name, email, password, dateOfBirth } = req.body;

  try {
    // Validate input
    if (!name || !email || !password || !dateOfBirth) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      dateOfBirth,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error('Register error:', error.message);
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('buffering timed out')) {
      return res.status(500).json({ message: 'Database connection error, please try again later' });
    }
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('buffering timed out')) {
      return res.status(500).json({ message: 'Database connection error, please try again later' });
    }
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

// Get User Profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      interests: user.interests,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update User Interests (for EditProfile)
router.put('/update-interests', protect, async (req, res) => {
  const { interests } = req.body;
  console.log('Received update-interests request:', { userId: req.user?.id, interests });

  try {
    if (!Array.isArray(interests)) {
      console.log('Validation failed: Interests is not an array');
      return res.status(400).json({ message: 'Interests must be an array' });
    }

    const validInterests = [
      'Beach', 'Mountains', 'Cities', 'Culture', 'Food & Wine',
      'Adventure', 'History', 'Art', 'Nature', 'Photography',
      'Wildlife', 'Architecture', 'Shopping', 'Nightlife', 'Relaxation',
      'Sports', 'Music', 'Festivals', 'Local Experience', 'Eco Tourism',
    ];
    const invalidInterests = interests.filter((interest) => !validInterests.includes(interest));
    if (invalidInterests.length > 0) {
      console.log('Validation failed: Invalid interests', invalidInterests);
      return res.status(400).json({ message: `Invalid interests: ${invalidInterests.join(', ')}` });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { interests },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Interests updated:', user.interests);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      interests: user.interests,
    });
  } catch (error) {
    console.error('Error updating interests:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Interests (for Interests page)
router.put('/interests', protect, async (req, res) => {
  const { interests } = req.body;
  try {
    if (!Array.isArray(interests)) {
      return res.status(400).json({ message: 'Interests must be an array' });
    }
    const validInterests = [
      'History', 'Adventure', 'Culture', 'Relaxation', 'Nature', 'Sport', 'Wildlife',
      'Beach', 'Mountains', 'Food & Wine', 'Art', 'Photography', 'Festivals',
      'Local Experience', 'Eco Tourism',
    ];
    const invalidInterests = interests.filter((interest) => !validInterests.includes(interest));
    if (invalidInterests.length > 0) {
      return res.status(400).json({ message: `Invalid interests: ${invalidInterests.join(', ')}` });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { interests },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Interests updated', interests: user.interests });
  } catch (error) {
    console.error('Error updating interests:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;