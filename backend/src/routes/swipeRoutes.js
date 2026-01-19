const express = require('express')
const router = express.Router()
const Profile = require('../models/Profile')
const auth = require('../middleware/authMiddleware')

/**
 * GET SWIPE SUGGESTIONS
 * Returns all profiles EXCEPT current user's profile
 */
router.get('/suggestions', auth, async (req, res) => {
  try {
    console.log('🔥 SWIPE SUGGESTIONS HIT')
    console.log('USER ID:', req.user.id)

    const profiles = await Profile.find({
      userId: { $ne: req.user.id },
    }).populate('userId', 'name email')

    console.log('FOUND PROFILES:', profiles.length)

    res.json(profiles)
  } catch (err) {
    console.error('❌ SWIPE ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
