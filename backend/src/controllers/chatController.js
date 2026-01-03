const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  const { matchId, text } = req.body;

  const message = await Message.create({
    matchId,
    sender: req.user.id,
    text,
  });

  // 🔥 EMIT MESSAGE
  global.io.to(matchId).emit('message', message);

  res.json(message);
};

exports.getMessages = async (req, res) => {
  const messages = await Message.find({
    matchId: req.params.matchId,
  }).sort('createdAt');

  res.json(messages);
};
