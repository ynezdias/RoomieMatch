const express = require('express')
const router = express.Router()
const Profile = require('../models/Profile')
const auth = require('../middleware/authMiddleware')

const cloudinary = require('../config/cloudinary')

router.put('/', auth, async (req, res) => {

  try {
    const { photo } = req.body;
    if (photo !== undefined && typeof photo !== 'string') {
      return res.status(400).json({ msg: 'Please select a valid profile photo.', code: 'PROFILE_VALIDATION_ERROR', fieldErrors: { photo: 'Please select a valid profile photo.' } });
    }
    const allowedFields = ['aboutMe', 'university', 'city', 'state', 'country', 'budget', 'smoking', 'pets', 'furniture', 'lookingFor'];
    const otherData = Object.fromEntries(allowedFields.filter(key => req.body[key] !== undefined).map(key => [key, req.body[key]]));
    for (const field of ['aboutMe', 'city', 'university', 'state', 'country']) {
      if (typeof otherData[field] === 'string') otherData[field] = otherData[field].trim();
    }
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
        return res.status(502).json({ msg: 'Photo upload failed. Please try again.', message: 'Photo upload failed. Please try again.', code: 'PHOTO_UPLOAD_FAILED' })
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
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      const labels = { city: 'Please enter your city.', university: 'Please enter your university or workplace.', aboutMe: 'About me must be 1,000 characters or fewer.', budget: 'Choose a monthly budget between $0 and $5,000.', lookingFor: 'Choose a valid housing preference.' };
      const paths = err.errors ? Object.keys(err.errors) : [err.path];
      const fieldErrors = Object.fromEntries(paths.map(field => [field, labels[field] || 'Please check this profile field.']));
      const msg = Object.values(fieldErrors).join(' ');
      return res.status(400).json({ msg, message: msg, code: 'PROFILE_VALIDATION_ERROR', fieldErrors });
    }
    console.error('Profile update failed:', err.name);
    res.status(500).json({ msg: 'Unable to save your profile. Please try again.', message: 'Unable to save your profile. Please try again.', code: 'PROFILE_SAVE_FAILED' });
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
