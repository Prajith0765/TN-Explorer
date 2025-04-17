const mongoose = require('mongoose');
const Place = require('../models/Place');

const places = [
  {
    name: 'Marina Beach',
    description: 'A famous beach in Chennai known for its scenic beauty.',
    coordinates: { lon: 80.2824, lat: 13.0500 },
    tags: ['beach', 'tourism'],
    address: 'Marina Beach, Chennai, Tamil Nadu',
    imageUrl: 'https://source.unsplash.com/featured/?beach,marina',
    source: 'seeded',
  },
  {
    name: 'Meenakshi Temple',
    description: 'An iconic Hindu temple in Madurai with intricate architecture.',
    coordinates: { lon: 78.1198, lat: 9.9195 },
    tags: ['history', 'temple'],
    address: 'Madurai, Tamil Nadu',
    imageUrl: 'https://source.unsplash.com/featured/?temple,meenakshi',
    source: 'seeded',
  },
];

const seedPlaces = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/tamilnadu_explorer', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await Place.deleteMany({});
    await Place.insertMany(places);
    console.log('Places seeded successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
    mongoose.connection.close();
  }
};

seedPlaces();