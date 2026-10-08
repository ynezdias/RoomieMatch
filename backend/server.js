require('dotenv').config() // ✅ MUST BE FIRST LINE

// Some networks cannot resolve Atlas SRV records through their default DNS.
if (process.env.DNS_SERVERS) {
  require('node:dns').setServers(process.env.DNS_SERVERS.split(',').map(server => server.trim()).filter(Boolean))
}

const http = require('http')
const mongoose = require('mongoose')
mongoose.set('bufferCommands', false)
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
if (!process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32)) {
  throw new Error('Set JWT_SECRET; production requires at least 32 characters.')
}

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
      connectTimeoutMS: 5000,
      autoIndex: true
    });
    console.log('✅ MongoDB Atlas connected');

  } catch (err) {
    console.error('❌ DATABASE CONNECTION ERROR:', err.message);
    console.error('⚠️ API requests will return 503 until the database is connected.');
    console.error('👉 Please check your MONGO_URI and IP Whitelist on MongoDB Atlas.');
    if (process.env.NODE_ENV === 'production') process.exit(1);
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
  cors: { origin: process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean) || true },
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

  socket.on('joinMatch', async (matchId, acknowledge = () => {}) => {
    try {
      const Match = require('./src/models/Match');
      const match = await Match.findOne({ _id: matchId, users: socket.userId });
      if (match) {
        socket.join(matchId);
        acknowledge({ ok: true });
      } else {
        console.warn(`⚠️ User ${socket.userId} tried to join unauthorized match ${matchId}`);
        acknowledge({ ok: false });
      }
    } catch (err) {
      console.error('❌ joinMatch error:', err);
      acknowledge({ ok: false });
    }
  })

  // Typing Indicators
  socket.on('typing', async ({ matchId }) => {
    try {
    const Match = require('./src/models/Match');
    const match = await Match.findOne({ _id: matchId, users: socket.userId });
    if (match) {
      socket.to(matchId).emit('typing', { userId: socket.userId, matchId });
    }
    } catch (err) { console.error('Typing event failed:', err.name); }
  });

  socket.on('stopTyping', async ({ matchId }) => {
    try {
    const Match = require('./src/models/Match');
    const match = await Match.findOne({ _id: matchId, users: socket.userId });
    if (match) {
      socket.to(matchId).emit('stopTyping', { userId: socket.userId, matchId });
    }
    } catch (err) { console.error('Typing event failed:', err.name); }
  });

  // Mark as Seen
  socket.on('markSeen', async ({ matchId, messageIds }) => {
    try {
      const Match = require('./src/models/Match');
      const match = await Match.findOne({ _id: matchId, users: socket.userId });
      if (!match) return;

      const Message = require('./src/models/Message');
      await Message.updateMany(
        { _id: { $in: messageIds }, matchId },
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
      const Match = require('./src/models/Match');
      const match = await Match.findOne({ _id: matchId, users: socket.userId });
      if (!match) return;

      const Message = require('./src/models/Message');

      // Soft delete
      const msg = await Message.findOneAndUpdate(
        { _id: messageId, sender: socket.userId, matchId }, // Ensure ownership and match context
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
    const Match = require('./src/models/Match')

    try {
      // SECURITY: Verify user is part of this match before allowing them to send a message
      const match = await Match.findOne({ _id: matchId, users: socket.userId });
      if (!match) {
        console.error(`🚫 Unauthorized sendMessage attempt by ${socket.userId} for match ${matchId}`);
        return;
      }

      const message = await Message.create({
        matchId,
        sender: socket.userId,
        text,
        type,
        mediaUrl
      });

      io.to(matchId).emit('newMessage', message)
    } catch (err) {
      console.error('Send Message Error:', err);
    }
  })

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.userId)
  })
})

global.io = io

io.on('connection', socket => {
  socket.on('leaveMatch', matchId => socket.leave(matchId))
})

/* ===================== START ===================== */
const PORT = process.env.PORT || 5000
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
)
