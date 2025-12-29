const express = require('express');
const auth = require('../middleware/authMiddleware');
const { swipeUser } = require('../controllers/swipeController');

const router = express.Router();

router.post('/', auth, swipeUser);

module.exports = router;
