const mongoose = require('mongoose');
const Place = require('../models/Place');
const connectDB = require('../config/db');

connectDB();

const places = [
  {
    name: 'Marina Beach',
    description: 'One of the longest urban beaches in the world, perfect for a sunset stroll.',
    location: 'Chennai',
    tags: ['Beach', 'Relaxation', 'Local Experience'],
    image: 'https://images.unsplash.com/photo-1598961942110-74a2ab5c2e65?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Meenakshi Temple',
    description: 'A historic Hindu temple known for its stunning architecture and vibrant festivals.',
    location: 'Madurai',
    tags: ['History', 'Culture', 'Architecture'],
    image: 'https://images.unsplash.com/photo-1598961942110-74a2ab5c2e65?auto=format&fit=crop&q=80&w=800', // Replace with real image
  },
  {
    name: 'Ooty Hill Station',
    description: 'A scenic hill station with tea gardens, lakes, and cool weather.',
    location: 'Ooty',
    tags: ['Nature', 'Adventure', 'Relaxation'],
    image: 'https://images.unsplash.com/photo-1598961942110-74a2ab5c2e65?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Rameshwaram Temple',
    description: 'A sacred pilgrimage site with ancient architecture and spiritual significance.',
    location: 'Rameshwaram',
    tags: ['History', 'Culture', 'Architecture'],
    image: 'https://images.unsplash.com/photo-1598961942110-74a2ab5c2e65?auto=format&fit=crop&q=80&w=800',
  },
];

const seedPlaces = async () => {
  try {
    await Place.deleteMany();
    await Place.insertMany(places);
    console.log('Places seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding places:', error);
    process.exit(1);
  }
};

seedPlaces();