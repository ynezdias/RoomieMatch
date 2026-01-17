const router = require('express').Router()
const Match = require('../models/Match')

router.post('/', async (req, res) => {
  const { targetUserId, direction } = req.body
  const userId = req.user.id

  if (direction === 'right') {
    const existing = await Match.findOne({
      users: { $all: [userId, targetUserId] },
    })

    if (!existing) {
      const match = await Match.create({
        users: [userId, targetUserId],
      })

      req.io.to(targetUserId).emit('newMatch')
      return res.json({ match: true })
    }
  }

  res.json({ match: false })
})

module.exports = router
