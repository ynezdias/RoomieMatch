const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    pairKey: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

matchSchema.index({ pairKey: 1 }, { unique: true, partialFilterExpression: { pairKey: { $type: 'string' } } });
module.exports = mongoose.model('Match', matchSchema);

