const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Match',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'Message',
  new mongoose.Schema(
    {
      matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
    },
    { timestamps: true }
  )
)
