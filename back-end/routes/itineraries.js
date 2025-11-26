const express = require('express');
const Itinerary = require('../models/Itinerary');
const auth = require('../middleware/auth');

const router = express.Router();

// create itinerary
router.post('/', auth, async (req, res) => {
  try {
    const payload = req.body;
    const it = await Itinerary.create({ ...payload, user: req.userId });
    res.status(201).json(it);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// list user's itineraries
// example: back-end/routes/itineraries.js
router.get("/", auth, async (req, res) => {
  const docs = await Itinerary.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
  res.json(docs);
});


// get single itinerary
router.get('/:id', auth, async (req, res) => {
  try {
    const it = await Itinerary.findOne({ _id: req.params.id, user: req.userId });
    if (!it) return res.status(404).json({ message: 'Not found' });
    res.json(it);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete itinerary
router.delete('/:id', auth, async (req, res) => {
  try {
    await Itinerary.deleteOne({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
