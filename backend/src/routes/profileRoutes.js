const express = require('express')
const router = express.Router()
const Profile = require('../models/Profile')
const auth = require('../middleware/authMiddleware')

/* ================= CREATE / UPDATE PROFILE ================= */
router.post('/', auth, async (req, res) => {
  try {
    console.log('🔥 PROFILE ROUTE HIT')
    console.log('USER:', req.user)
    console.log('BODY:', req.body)

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { ...req.body, userId: req.user.id },
      { new: true, upsert: true }
    )

    console.log('✅ PROFILE SAVED:', profile)

    res.status(200).json(profile)
  } catch (err) {
    console.error('❌ PROFILE ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})

/* ================= GET PROFILE ================= */
router.get('/', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id })
    res.json(profile)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
