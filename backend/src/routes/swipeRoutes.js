const express = require('express');
const router = express.Router();

const Swipe = require('../models/Swipe');
const Match = require('../models/Match');
const authMiddleware = require('../middleware/auth');

/*
  POST /swipe
  body: { targetUserId, direction }
*/
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, direction } = req.body;
    const userId = req.user.id;

    if (!targetUserId || !direction) {
      return res.status(400).json({ message: 'Missing data' });
    }

    /* ---------- Save Swipe ---------- */
    await Swipe.findOneAndUpdate(
      { swiper: userId, target: targetUserId },
      { direction },
      { upsert: true }
    );

    /* ---------- Only care if RIGHT ---------- */
    if (direction !== 'right') {
      return res.json({ matched: false });
    }

    /* ---------- Check Opposite Swipe ---------- */
    const reverseSwipe = await Swipe.findOne({
      swiper: targetUserId,
      target: userId,
      direction: 'right',
    });

    if (!reverseSwipe) {
      return res.json({ matched: false });
    }

    /* ---------- Create Match ---------- */
    const match = await Match.create({
      users: [userId, targetUserId],
      createdAt: new Date(),
    });

    /* ---------- REAL-TIME SOCKET EMIT ---------- */
    const io = global.io;

    io.to(userId).emit('newMatch', {
      matchId: match._id,
      userId: targetUserId,
    });

    io.to(targetUserId).emit('newMatch', {
      matchId: match._id,
      userId,
    });

    res.json({ matched: true, match });

  } catch (err) {
    console.error('❌ Swipe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
