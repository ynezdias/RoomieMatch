const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Get messages for a match
 */
router.get('/:matchId', auth, async (req, res) => {
  const messages = await Message.find({ matchId: req.params.matchId })
    .populate('sender', 'name')
    .sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = router;
