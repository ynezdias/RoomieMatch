const mongoose = require('mongoose');

const swipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, enum: ['like', 'dislike'] },
});

module.exports = mongoose.model('Swipe', swipeSchema);
