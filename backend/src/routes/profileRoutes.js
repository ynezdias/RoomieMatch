const express = require('express')
const router = express.Router()
const Profile = require('../models/Profile')
const auth = require('../middleware/authMiddleware')

const cloudinary = require('../config/cloudinary')

router.put('/', auth, async (req, res) => {
  console.log('🔥 PROFILE ROUTE HIT')

  try {
    const { photo, ...otherData } = req.body;
    let profileData = { ...otherData, userId: req.user.id };

    // Upload photo if present and is a base64 string
    if (photo && photo.startsWith('data:image')) {
      try {
        console.log('☁️ Uploading to Cloudinary...');
        const uploadRes = await cloudinary.uploader.upload(photo, {
          folder: 'roomiematch_profiles',
        })
        profileData.photo = uploadRes.secure_url
        console.log('✅ Cloudinary URL:', uploadRes.secure_url)
      } catch (uploadErr) {
        console.error('❌ Cloudinary Upload Error:', uploadErr.message)
      }
    } else if (photo) {
      // If it's already a URL, keep it
      profileData.photo = photo;
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

    console.log('💾 PROFILE SAVED/UPDATED:', profile._id, 'for User:', req.user.id)
    res.json(profile)
  } catch (err) {
    console.error('❌ PROFILE UPDATE ERROR:', err.message)
    res.status(500).json({ message: err.message })
  }
})

router.get('/me', auth, async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user.id })
  res.json(profile)
})

router.get('/explore', auth, async (req, res) => {
  try {
    const profiles = await Profile.find({
      userId: { $ne: req.user.id }
    }).populate('userId', 'name email')

    res.json(profiles)
  } catch (err) {
    console.error('❌ EXPLORE ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
