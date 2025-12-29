const mongoose = require('mongoose');

const swipeSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  direction: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Swipe', swipeSchema);
