const express = require('express')
const router = express.Router()
const Profile = require('../models/Profile')
const auth = require('../middleware/authMiddleware')

router.put('/', auth, async (req, res) => {
  try {
    const { aboutMe, university, city, photo } = req.body

    console.log('🔥 PROFILE UPDATE REQUEST')
    console.log('User:', req.user)
    console.log('Body:', req.body)

    if (!req.user?.id) {
      return res.status(400).json({ message: 'User ID missing' })
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { aboutMe, university, city, photo, userId: req.user.id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    console.log('✅ PROFILE SAVED:', profile)
    res.status(200).json(profile)
  } catch (err) {
    console.error('❌ PROFILE ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id })
    res.json(profile)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
