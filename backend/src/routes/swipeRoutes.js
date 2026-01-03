const express = require('express');
const router = express.Router();
const Swipe = require('../models/Swipe');

// TEMP: hardcoded user
const CURRENT_USER_ID = 'PUT_A_REAL_USER_ID_HERE';

router.post('/', async (req, res) => {
  const { targetUserId, action } = req.body;

  await Swipe.create({
    user: CURRENT_USER_ID,
    targetUser: targetUserId,
    action,
  });

  // Match check
  const match = await Swipe.findOne({
    user: targetUserId,
    targetUser: CURRENT_USER_ID,
    action: 'like',
  });

  res.json({ match: !!match });
});

module.exports = router;
