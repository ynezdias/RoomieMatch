const express = require('express');
const auth = require('../middleware/authMiddleware');
const {
  createOrUpdateProfile,
  getMyProfile
} = require('../controllers/profileController');

const router = express.Router();

router.post('/', auth, createOrUpdateProfile);
router.get('/me', auth, getMyProfile);

module.exports = router;
