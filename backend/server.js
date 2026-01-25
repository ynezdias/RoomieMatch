require('dotenv').config() // ✅ MUST BE FIRST LINE

const http = require('http')
const mongoose = require('mongoose')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

const app = require('./src/app')

/* ===================== DATABASE ===================== */
/* ===================== DATABASE ===================== */
const startServer = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Try connecting to Atlas first
    console.log('Trying to connect to MongoDB Atlas...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB Atlas connected');

  } catch (err) {
    console.warn('⚠️ Could not connect to Atlas (likely IP whitelist issue).');
    console.log('⚡ Switching to Local In-Memory Database (MongoDB Memory Server)...');

    // Fallback to In-Memory DB
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    await mongoose.connect(uri);
    console.log(`✅ Connected to In-Memory DB at ${uri}`);

    // Seed data because it's empty
    const seed = require('./src/utils/seed');
    await seed();
  }
};

startServer();

/* ===================== ROUTES ===================== */
app.use('/auth', require('./src/routes/authRoutes'))
app.use('/users', require('./src/routes/userRoutes'))
app.use('/swipe', require('./src/routes/swipeRoutes'))
app.use('/chat', require('./src/routes/chatRoutes'))

// 🔥 THIS WAS MISSING
// app.use('/api/profile', require('./src/routes/profileRoutes'))

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

  socket.on('sendMessage', async ({ matchId, text }) => {
    const Message = require('./src/models/Message')

    const message = await Message.create({
      matchId,
      sender: socket.userId,
      text,
    })

    io.to(matchId).emit('newMessage', message)
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
