require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Place = require('../models/Place');
const connectDB = require('../config/db');

connectDB();

const tagMap = {
  'tourism=attraction': 'Adventure',
  'tourism=museum': 'History',
  'amenity=place_of_worship': 'Culture',
  'highway=beach': 'Relaxation',
  'leisure=park': 'Nature',
  'sport=*': 'Sport',
  'tourism=zoo': 'Wildlife',
  'historic=*': 'History',
};

const fetchPlaces = async () => {
  try {
    const query = `
      [out:json];
      area[name="Tamil Nadu"]->.tn;
      (
        node[tourism~"attraction|museum|zoo"](area.tn);
        node[amenity=place_of_worship](area.tn);
        node[highway=beach](area.tn);
        node[leisure=park](area.tn);
        node[sport](area.tn);
        node[historic](area.tn);
      );
      out body;
    `;
    const response = await axios.post('https://overpass-api.de/api/interpreter', query);
    const elements = response.data.elements;

    const places = elements
      .filter((el) => el.tags && el.tags.name)
      .map((el) => {
        const osmTags = Object.entries(el.tags)
          .filter(([k]) => tagMap[k])
          .map(([k]) => tagMap[k])
          .filter(Boolean);
        return {
          name: el.tags.name,
          description: el.tags.description || `Explore ${el.tags.name} in Tamil Nadu.`,
          location: el.tags['addr:city'] || 'Tamil Nadu',
          tags: [...new Set(osmTags)],
          image: 'https://via.placeholder.com/800x400?text=' + encodeURIComponent(el.tags.name),
          lat: el.lat,
          lon: el.lon,
        };
      });

    await Place.deleteMany({});
    await Place.insertMany(places);
    console.log(`Seeded ${places.length} places`);
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fetchPlaces();