const router = require('express').Router()
const Message = require('../models/Message')
const Match = require('../models/Match')

router.get('/matches', async (req, res) => {
  const userId = req.user.id

  // Populate users to get names/emails
  // ALSO populate the profile for each user to get the photo
  const matches = await Match.find({ users: userId }).populate({
    path: 'users',
    select: 'name email',
  })

  // We need to fetch profiles for these users to get photos
  // This is a bit inefficient (n+1), but simple for now. 
  // Better approach: aggregate or populate virtuals.
  // For now, let's just map it.

  const formatted = await Promise.all(
    matches.map(async (m) => {
      const otherUser = m.users.find((u) => u._id.toString() !== userId)
      if (!otherUser) return null // Should not happen

      const profile = await require('../models/Profile').findOne({ userId: otherUser._id })

      return {
        _id: m._id,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          photo: profile?.photo || `https://ui-avatars.com/api/?name=${otherUser.name}`,
        },
        lastMessage: 'Say hi!', // Placeholder, could fetch last message
      }
    })
  )

  res.json(formatted.filter(Boolean))
})

router.get('/:matchId', async (req, res) => {
  const messages = await Message.find({
    matchId: req.params.matchId,
  }).sort({ createdAt: 1 })

  res.json(messages)
})

module.exports = router
