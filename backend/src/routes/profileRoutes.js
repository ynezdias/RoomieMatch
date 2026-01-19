const express = require('express')
const router = express.Router()
const Profile = require('../models/Profile')
const auth = require('../middleware/authMiddleware')

router.put('/', auth, async (req, res) => {
  console.log('🔥 PROFILE ROUTE HIT')
  console.log('req.user:', req.user)
  console.log('req.body:', req.body)

  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { ...req.body, userId: req.user.id },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    )

    console.log('✅ PROFILE SAVED:', profile)
    res.json(profile)
  } catch (err) {
    console.error('❌ PROFILE ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})

router.get('/me', auth, async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user.id })
  res.json(profile)
})

module.exports = router
