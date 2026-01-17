const router = require('express').Router()
const Message = require('../models/Message')
const Match = require('../models/Match')

router.get('/matches', async (req, res) => {
  const userId = req.user.id

  const matches = await Match.find({ users: userId }).populate('users')

  const formatted = matches.map((m) => ({
    _id: m._id,
    otherUser: m.users.find((u) => u._id.toString() !== userId),
  }))

  res.json(formatted)
})

router.get('/:matchId', async (req, res) => {
  const messages = await Message.find({
    matchId: req.params.matchId,
  }).sort({ createdAt: 1 })

  res.json(messages)
})

module.exports = router
