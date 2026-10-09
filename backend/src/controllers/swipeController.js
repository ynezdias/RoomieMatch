const Swipe = require('../models/Swipe');
const Profile = require('../models/Profile');
const Message = require('../models/Message');
const mongoose = require('mongoose');
const User = require('../models/User');
const getConversation = require('../services/conversations');
// THIS IS FOR STUDY 
/**
 * GET SWIPE SUGGESTIONS
 * Returns all profiles EXCEPT current user's profile AND people already swiped on
 */
exports.getSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // 1. Get IDs of users I have already swiped on
    const mySwipes = await Swipe.find({ swiper: currentUserId }).select('target');
    const swipedUserIds = mySwipes.map((s) => s.target);

    // 2. Add my own ID to the exclusion list
    swipedUserIds.push(currentUserId);

    // 3. Find profiles NOT in that list
    const profiles = await Profile.find({
      userId: { $nin: swipedUserIds },
    }).populate('userId', 'name email');

    res.json(profiles);
  } catch (err) {
    console.error('❌ SWIPE SUGGESTIONS ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST SWIPE
 * Handles swiping logic and mutual matching
 */
exports.handleSwipe = async (req, res) => {
  try {
    const { targetUserId, direction } = req.body;
    const currentUserId = req.user.id;

    if (!mongoose.isObjectIdOrHexString(targetUserId) || !['left', 'right'].includes(direction) || targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Invalid target user or swipe direction' });
    }
    if (!await User.exists({ _id: targetUserId })) return res.status(404).json({ message: 'User not found' });

    // 1. Save or update the swipe
    let swipe = await Swipe.findOne({
      swiper: currentUserId,
      target: targetUserId,
    });

    if (swipe) {
      swipe.direction = direction;
      await swipe.save();
    } else {
      swipe = new Swipe({
        swiper: currentUserId,
        target: targetUserId,
        direction,
      });
      await swipe.save();
    }

    // 2. Check for Match (only if I swiped RIGHT)
    let isMatch = false;
    let matchDoc = null;

    if (direction === 'right') {
      const otherSwipe = await Swipe.findOne({
        swiper: targetUserId,
        target: currentUserId,
        direction: 'right',
      });

      if (otherSwipe) {
        isMatch = true;
        console.log('✨ IT IS A MATCH!');

        // Check if match already exists
        const conversation = await getConversation(currentUserId, targetUserId);
        matchDoc = conversation.match;
        if (conversation.created) {

          // 🔥 CREATE SYSTEM MESSAGE FOR MATCH
          const systemMsg = await Message.create({
            matchId: matchDoc._id,
            sender: currentUserId, // Use one of the users as sender, but type is 'system'
            text: "You matched! Start chatting now.",
            type: 'system',
          });

          // 🔥 REAL-TIME SOCKET EMIT for system message
          if (global.io) {
            global.io.to(matchDoc._id.toString()).emit('newMessage', systemMsg);
          }
        }

        // 🔥 REAL-TIME SOCKET EMIT (if global.io exists)
        if (global.io) {
          global.io.to(currentUserId).emit('match', matchDoc);
          global.io.to(targetUserId).emit('match', matchDoc);
        }
      }
    }

    res.json({ match: isMatch, matchId: matchDoc?._id });
  } catch (err) {
    console.error('❌ SWIPE ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};
