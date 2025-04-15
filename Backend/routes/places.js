const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Haversine distance (km)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Common places
router.get('/common', async (req, res) => {
  try {
    const popular = ['Marina Beach', 'Meenakshi Temple', 'Ooty Hill Station', 'Rameshwaram Temple'];
    const places = await Place.find({ name: { $in: popular } }).limit(4);
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Recommended places (personalized + location-based)
router.get('/recommended', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { lat, lon } = req.query;

    let query = {};
    if (user.interests.length > 0) {
      query.tags = { $in: user.interests };
    }

    const places = await Place.find(query).limit(8);

    if (lat && lon) {
      places.sort((a, b) => {
        const distA = a.lat && a.lon ? getDistance(parseFloat(lat), parseFloat(lon), a.lat, a.lon) : Infinity;
        const distB = b.lat && b.lon ? getDistance(parseFloat(lat), parseFloat(lon), b.lat, b.lon) : Infinity;
        return distA - distB;
      });
    }

    res.json(places.slice(0, 4));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search places
router.get('/search', async (req, res) => {
  try {
    const { location, tags } = req.query;
    const query = {};
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (tags) {
      const tagArray = tags.split(',').map((tag) => tag.trim());
      query.tags = { $in: tagArray };
    }
    const places = await Place.find(query);
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to trips
router.put('/trips/upcoming', protect, async (req, res) => {
  try {
    const { placeId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.upcomingTrips.some((trip) => trip.place.toString() === placeId)) {
      return res.status(400).json({ message: 'Place already in upcoming trips' });
    }
    user.upcomingTrips.push({ place: placeId });
    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('upcomingTrips.place');
    res.json(updatedUser.upcomingTrips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/trips/completed', protect, async (req, res) => {
  try {
    const { placeId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.completedTrips.some((trip) => trip.place.toString() === placeId)) {
      return res.status(400).json({ message: 'Place already in completed trips' });
    }
    user.completedTrips.push({ place: placeId });
    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('completedTrips.place');
    res.json(updatedUser.completedTrips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;