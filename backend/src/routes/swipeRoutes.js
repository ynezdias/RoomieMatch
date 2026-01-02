const express = require('express');
const { swipeUser } = require('../controllers/swipeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, swipeUser);

module.exports = router;
