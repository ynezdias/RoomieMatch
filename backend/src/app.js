const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const swipeRoutes = require('./routes/swipeRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`)
  next()
})

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* ===== ROUTES ===== */
app.use('/api/auth', authRoutes);     // login, register
app.use('/api/users', userRoutes);    // user info
app.use('/api/profile', profileRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/chat', require('./routes/chatRoutes'));

/* ===== HEALTH CHECK ===== */
app.get('/', (req, res) => {
  res.send('RoomieMatch API running');
});

module.exports = app;
