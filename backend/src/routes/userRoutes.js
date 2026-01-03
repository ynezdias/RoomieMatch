const express = require('express');
const router = express.Router();
const User = require('../models/User');

// TEMP: replace with auth later
router.get('/suggestions', async (req, res) => {
  const users = await User.find().limit(10);
  res.json(users);
});

module.exports = router;
