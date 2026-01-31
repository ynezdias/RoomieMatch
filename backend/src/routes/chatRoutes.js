const router = require('express').Router()
const Message = require('../models/Message')
const Match = require('../models/Match')

router.get('/matches', async (req, res) => {
  const userId = req.user.id
  const Match = require('../models/Match')
  const Message = require('../models/Message')
  const Profile = require('../models/Profile')

  // Populate users
  const matches = await Match.find({ users: userId }).populate({
    path: 'users',
    select: 'name email',
  })

  const formatted = await Promise.all(
    matches.map(async (m) => {
      const otherUser = m.users.find((u) => u._id.toString() !== userId)
      if (!otherUser) return null

      const profile = await Profile.findOne({ userId: otherUser._id })
      const lastMessage = await Message.findOne({ matchId: m._id }).sort({ createdAt: -1 })

      const isPinned = m.pinnedBy?.includes(userId) || false;

      return {
        _id: m._id,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          photo: profile?.photo || `https://ui-avatars.com/api/?name=${otherUser.name}`,
        },
        lastMessage: lastMessage ? (lastMessage.type === 'text' ? lastMessage.text : `Sent a ${lastMessage.type}`) : 'Say hi!',
        lastMessageTime: lastMessage?.createdAt || m.createdAt,
        isPinned
      }
    })
  )

  const finalMatches = formatted.filter(Boolean).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
  });

  res.json(finalMatches)
})

router.put('/pin/:matchId', async (req, res) => {
  try {
    const Match = require('../models/Match');
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const userId = req.user.id;
    const isPinned = match.pinnedBy.includes(userId);

    if (isPinned) {
      match.pinnedBy = match.pinnedBy.filter(id => id.toString() !== userId);
    } else {
      match.pinnedBy.push(userId);
    }

    await match.save();
    res.json({ isPinned: !isPinned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:matchId', async (req, res) => {
  const messages = await Message.find({
    matchId: req.params.matchId,
  }).sort({ createdAt: 1 })

  res.json(messages)
})

module.exports = router
