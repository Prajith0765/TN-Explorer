const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Save a place
router.post('/save', protect, async (req, res) => {
  try {
    const { name, description, lon, lat, tags, address, imageUrl, externalId } = req.body;
    let place = await Place.findOne({ externalId });
    if (!place) {
      place = new Place({
        name,
        description,
        coordinates: { lon, lat },
        tags,
        address,
        imageUrl,
        externalId,
        source: 'api',
      });
      await place.save();
    }
    const user = await User.findById(req.user.id);
    if (!user.savedDestinations.includes(place._id)) {
      user.savedDestinations.push(place._id);
      await user.save();
    }
    res.json({ message: 'Place saved', place });
  } catch (error) {
    console.error('Save place error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get saved destinations
router.get('/saved', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedDestinations');
    res.json(user.savedDestinations);
  } catch (error) {
    console.error('Get saved places error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;