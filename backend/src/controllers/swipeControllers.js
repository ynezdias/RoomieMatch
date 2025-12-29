const Swipe = require('../models/Swipe');

exports.swipeUser = async (req, res) => {
  const { toUserId, direction } = req.body;

  // Save swipe
  const swipe = await Swipe.create({
    fromUser: req.userId,
    toUser: toUserId,
    direction
  });

  // Check for match
  let isMatch = false;
  if (direction === 'like') {
    const existing = await Swipe.findOne({
      fromUser: toUserId,
      toUser: req.userId,
      direction: 'like'
    });

    if (existing) isMatch = true;
  }

  res.json({ swipe, isMatch });
};
