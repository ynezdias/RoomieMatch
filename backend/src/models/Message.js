const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
