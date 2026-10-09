const Match = require('../models/Match');
const ensureIndexes = require('./ensureIndexes');

// A stable pair key prevents simultaneous chat requests from creating separate rooms.
// Existing conversations remain intact; no messages or user records are migrated.
module.exports = async function getConversation(first, second) {
  await ensureIndexes(Match);
  const users = [String(first), String(second)].sort();
  const existing = await Match.findOne({ users: { $all: users } }).sort({ createdAt: 1 });
  if (existing) return { match: existing, created: false };
  const pairKey = users.join('_');
  try {
    return { match: await Match.create({ users, pairKey, pinnedBy: [] }), created: true };
  } catch (error) {
    if (error.code !== 11000) throw error;
    const match = await Match.findOne({ pairKey });
    if (!match) throw error;
    return { match, created: false };
  }
};
