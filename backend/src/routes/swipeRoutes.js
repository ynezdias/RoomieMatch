const express = require('express')
const router = express.Router()
const Profile = require('../models/Profile')
const Swipe = require('../models/Swipe')
const Match = require('../models/Match')
const auth = require('../middleware/authMiddleware')

/**
 * GET SWIPE SUGGESTIONS
 * Returns all profiles EXCEPT current user's profile AND people already swiped on
 */
router.get('/suggestions', auth, async (req, res) => {
  try {
    // 1. Get IDs of users I have already swiped on
    const mySwipes = await Swipe.find({ swiper: req.user.id }).select('target')
    const swipedUserIds = mySwipes.map((s) => s.target)

    // 2. Add my own ID to the exclusion list
    swipedUserIds.push(req.user.id)

    // 3. Find profiles NOT in that list
    const profiles = await Profile.find({
      userId: { $nin: swipedUserIds },
    }).populate('userId', 'name email')

    res.json(profiles)
  } catch (err) {
    console.error('❌ SWIPE SUGGESTIONS ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})

/**
 * POST SWIPE
 * body: { targetUserId, direction: 'left' | 'right' }
 */
router.post('/', auth, async (req, res) => {
  try {
    const { targetUserId, direction } = req.body
    const currentUserId = req.user.id

    if (!targetUserId || !direction) {
      return res.status(400).json({ message: 'Missing targetUserId or direction' })
    }

    // 1. Save the swipe
    // Check if swipe already exists to prevent duplicates
    let swipe = await Swipe.findOne({
      swiper: currentUserId,
      target: targetUserId,
    })

    if (swipe) {
      // Update direction if re-swiping (rare but possible)
      swipe.direction = direction
      await swipe.save()
    } else {
      swipe = new Swipe({
        swiper: currentUserId,
        target: targetUserId,
        direction,
      })
      await swipe.save()
    }

    // 2. Check for Match (only if I swiped RIGHT)
    let isMatch = false
    let matchDoc = null

    if (direction === 'right') {
      const otherSwipe = await Swipe.findOne({
        swiper: targetUserId,
        target: currentUserId,
        direction: 'right',
      })

      if (otherSwipe) {
        isMatch = true
        console.log('✨ IT IS A MATCH!')

        // Create Match record if not exists
        // Check if match already exists
        matchDoc = await Match.findOne({
          users: { $all: [currentUserId, targetUserId] },
        })

        if (!matchDoc) {
          matchDoc = new Match({
            users: [currentUserId, targetUserId],
          })
          await matchDoc.save()
        }
      }
    }

    res.json({ match: isMatch, matchId: matchDoc?._id })
  } catch (err) {
    console.error('❌ SWIPE ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
