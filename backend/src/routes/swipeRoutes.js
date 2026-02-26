const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const swipeController = require('../controllers/swipeController');

/**
 * GET /api/swipe/suggestions
 */
router.get('/suggestions', auth, swipeController.getSuggestions);

/**
 * POST /api/swipe
 */
router.post('/', auth, swipeController.handleSwipe);

module.exports = router;
