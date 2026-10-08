const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // ✅ CORRECT IMPORT
const User = require('../models/User');

/**
 * Update user profile
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name: typeof req.body.name === 'string' ? req.body.name.trim() : req.user.name },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * Get current user
 */
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
