const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: Date,
});


module.exports = mongoose.model(
  'Match',
  new mongoose.Schema(
    {
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
  )
)

