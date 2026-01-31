require('dotenv').config() // ✅ MUST BE FIRST LINE

const http = require('http')
const mongoose = require('mongoose')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

const app = require('./src/app')

/* ===================== DATABASE ===================== */
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('❌ MONGO_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    console.log('✅ MongoDB Atlas connected');

  } catch (err) {
    console.error('❌ DATABASE CONNECTION ERROR:', err.message);
    console.error('⚠️ The server will start, but database operations will fail.');
    console.error('👉 Please check your MONGO_URI and IP Whitelist on MongoDB Atlas.');
    // We don't exit(1) here to let the process stay alive for debugging if needed, 
    // but we've removed the silent in-memory fallback that causes data loss.
  }
};

startServer();

/* ===================== ROUTES ===================== */
// Routes are handled in src/app.js. No need to duplicate them here.
// app.use('/', require('./src/app')) // Already using app from ./src/app

/* ===================== SERVER ===================== */
const server = http.createServer(app)

/* ===================== SOCKET.IO ===================== */
const io = new Server(server, {
  cors: { origin: '*' },
})

/* ---------- Socket Auth Middleware ---------- */
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('❌ No token'))

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.id
    next()
  } catch {
    return next(new Error('❌ Invalid token'))
  }
})

/* ---------- Socket Events ---------- */
io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.userId)

  socket.join(socket.userId)

  socket.on('joinMatch', (matchId) => {
    socket.join(matchId)
  })

  // Typing Indicators
  socket.on('typing', ({ matchId }) => {
    socket.to(matchId).emit('typing', { userId: socket.userId, matchId });
  });

  socket.on('stopTyping', ({ matchId }) => {
    socket.to(matchId).emit('stopTyping', { userId: socket.userId, matchId });
  });

  // Mark as Seen
  socket.on('markSeen', async ({ matchId, messageIds }) => {
    try {
      const Message = require('./src/models/Message');
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { seenBy: socket.userId } }
      );

      // Broadcast to everyone in the match (so the sender knows it was seen)
      io.to(matchId).emit('messageSeen', {
        matchId,
        messageIds,
        seenBy: socket.userId
      });
    } catch (error) {
      console.error('❌ markSeen error:', error);
    }
  });

  // Delete Message
  socket.on('deleteMessage', async ({ matchId, messageId }) => {
    try {
      const Message = require('./src/models/Message');

      // Soft delete
      const msg = await Message.findOneAndUpdate(
        { _id: messageId, sender: socket.userId }, // Ensure ownership
        { isDeleted: true },
        { new: true }
      );

      if (msg) {
        io.to(matchId).emit('messageDeleted', { messageId, matchId });
      }
    } catch (error) {
      console.error('❌ deleteMessage error:', error);
    }
  })

  socket.on('sendMessage', async ({ matchId, text, type = 'text', mediaUrl = null }) => {
    const Message = require('./src/models/Message')
    const Match = require('./src/models/Match') // Ensure Match exists if needed

    try {
      const message = await Message.create({
        matchId,
        sender: socket.userId,
        text,
        type,
        mediaUrl
      });

      // Populate sender details if needed by frontend immediately, 
      // or let frontend handle it. Usually sending raw ID is faster 
      // but if you show profile pic in chat, might need populate.
      // For now preventing N+1 queries by just sending the doc.

      io.to(matchId).emit('newMessage', message)

      // Push notification logic could go here
    } catch (err) {
      console.error('Send Message Error:', err);
    }
  })

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.userId)
  })
})

global.io = io

/* ===================== START ===================== */
const PORT = process.env.PORT || 5000
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
)
