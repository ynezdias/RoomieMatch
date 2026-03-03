const router = require('express').Router()
const Message = require('../models/Message')
const Match = require('../models/Match')
const Profile = require('../models/Profile')
const auth = require('../middleware/authMiddleware')

router.get('/matches', auth, async (req, res) => {
  try {
    const userId = req.user.id

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
  } catch (err) {
    console.error('Fetch matches error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.put('/pin/:matchId', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const userId = req.user.id;
    if (!match.pinnedBy) match.pinnedBy = [];

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

router.get('/:matchId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      matchId: req.params.matchId,
    }).sort({ createdAt: 1 })

    res.json(messages)
  } catch (err) {
    console.error('Fetch messages error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/get-or-create/:targetUserId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id
    const { targetUserId } = req.params

    if (!targetUserId || targetUserId === 'undefined') {
      return res.status(400).json({ error: "Invalid target user ID" })
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({ error: "You cannot chat with yourself" })
    }

    // 1. Check if match already exists
    let match = await Match.findOne({
      users: { $all: [currentUserId, targetUserId] },
    })

    // 2. If not, create it
    if (!match) {
      match = new Match({
        users: [currentUserId, targetUserId],
        pinnedBy: []
      })
      await match.save()

      // Create a system message
      await Message.create({
        matchId: match._id,
        sender: currentUserId,
        text: "You started a conversation!",
        type: 'system',
      })
    }

    res.json({ matchId: match._id })
  } catch (err) {
    console.error('Get-or-create match error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
