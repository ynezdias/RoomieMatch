const express = require('express')
const router = express.Router()
const Profile = require('../models/Profile')
const auth = require('../middleware/authMiddleware')

const cloudinary = require('../config/cloudinary')

router.put('/', auth, async (req, res) => {
  console.log('🔥 PROFILE ROUTE HIT')

  try {
    let profileData = { ...req.body, userId: req.user.id }

    // Upload photo if present and is a base64 string (starts with data:image)
    if (req.body.photo && req.body.photo.startsWith('data:image')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(req.body.photo, {
          folder: 'roomiematch_profiles',
        })
        profileData.photo = uploadRes.secure_url
        console.log('☁️ Uploaded to Cloudinary:', uploadRes.secure_url)
      } catch (uploadErr) {
        console.error('❌ Cloudinary Upload Error:', uploadErr)
        // Proceed without failing completely, or default to old photo?
        // For now, let's just log it.
      }
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      profileData,
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
