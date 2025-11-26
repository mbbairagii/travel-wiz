const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  destination: String,
  days: Number,
  budget: Number,
  adults: Number,
  children: Number,
  travelType: String,
  accommodation: String,
  interests: [String],
  notes: String,
  data: Object,      // full generated plan (optional)
  thumbnail: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
