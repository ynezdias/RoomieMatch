const Swipe = require('../models/Swipe');
const Match = require('../models/Match');

exports.handleSwipe = async (req, res) => {
  const userId = req.user.id;
  const { targetUserId, action } = req.body;

  await Swipe.create({
    user: userId,
    target: targetUserId,
    action,
  });

  if (action === 'like') {
    const reciprocal = await Swipe.findOne({
      user: targetUserId,
      target: userId,
      action: 'like',
    });

    if (reciprocal) {
      const match = await Match.create({
        users: [userId, targetUserId],
      });

      // 🔥 REAL-TIME SOCKET EMIT
      global.io.to(userId).emit('match', match);
      global.io.to(targetUserId).emit('match', match);

      return res.json({ match: true });
    }
  }

  res.json({ match: false });
};
