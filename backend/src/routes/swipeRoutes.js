const router = require('express').Router();
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const user = req.user;
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
