const express = require('express')
const router = express.Router()
const User = require('../models/User')
const auth = require('../middleware/auth')

// UPDATE PROFILE
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    )

    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' })
  }
})
const multer = require('multer')

const upload = multer({
  dest: 'uploads/',
})

router.post(
  '/profile/photo',
  authMiddleware,
  upload.single('photo'),
  async (req, res) => {
    req.user.photo = req.file.filename
    await req.user.save()
    res.json({ success: true })
  }
)


module.exports = router
