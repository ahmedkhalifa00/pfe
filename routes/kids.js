const express = require('express');
const Kid = require('../models/Kids');
const router = express.Router();
gir
// Create a new kid
router.post('/kids', (req, res) => {
  const { name, parentId, latitude, longitude } = req.body;
  const newKid = new Kid({
    name,
    parentId,
    location: { latitude, longitude }
  });
  newKid.save()
    .then(kid => res.json(kid))
    .catch(err => res.status(400).json({ error: err.message }));
});

// Get all kids for a parent
router.get('/parents/:parentId/kids', (req, res) => {
  Kid.find({ parentId: req.params.parentId })
    .then(kids => res.json(kids))
    .catch(err => res.status(400).json({ error: err.message }));
});

module.exports = router;
