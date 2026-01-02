const Swipe = require('../models/Swipe');

exports.swipeUser = async (req, res) => {
  try {
    const { targetUserId, action } = req.body;

    const swipe = await Swipe.create({
      swiper: req.user.id,
      target: targetUserId,
      action,
    });

    // Check for match (mutual like)
    let isMatch = false;

    if (action === 'like') {
      const reverseSwipe = await Swipe.findOne({
        swiper: targetUserId,
        target: req.user.id,
        action: 'like',
      });

      if (reverseSwipe) isMatch = true;
    }

    res.status(201).json({
      success: true,
      swipe,
      match: isMatch,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
