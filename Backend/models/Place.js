const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  coordinates: {
    lon: { type: Number, required: true },
    lat: { type: Number, required: true },
  },
  tags: [{ type: String }],
  address: { type: String },
  imageUrl: { type: String },
  source: { type: String, default: 'api' },
  externalId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Place', placeSchema);