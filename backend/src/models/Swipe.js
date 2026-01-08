const mongoose = require('mongoose');

const swipeSchema = new mongoose.Schema(
  {
    swiper: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    direction: { type: String, enum: ['left', 'right'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Swipe', swipeSchema);
