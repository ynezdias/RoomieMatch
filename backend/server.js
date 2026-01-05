require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = require('./src/app');

/* ===================== DATABASE ===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

/* ===================== ROUTES ===================== */
app.use('/users', require('./src/routes/userRoutes'));
app.use('/swipe', require('./src/routes/swipeRoutes'));
app.use('/chat', require('./src/routes/chatRoutes'));
app.use('/auth', require('./src/routes/authRoutes'));


/* ===================== SERVER ===================== */
const server = http.createServer(app);

/* ===================== SOCKET.IO ===================== */
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('sendMessage', async ({ matchId, senderId, text }) => {
    const Message = require('./models/Message');

    const message = await Message.create({
      matchId,
      sender: senderId,
      text,
    });

    io.to(matchId).emit('newMessage', message);
  });

  socket.on('joinMatch', (matchId) => {
    socket.join(matchId);
  });
});


// make io available everywhere
global.io = io;

/* ===================== START ===================== */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
