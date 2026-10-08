const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

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
const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean);
if (process.env.NODE_ENV === 'production' && !allowedOrigins?.length) {
  throw new Error('CORS_ORIGINS must contain the deployed frontend origin in production.');
}
app.use(cors({ origin: allowedOrigins || true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* ===== ROUTES ===== */
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      msg: 'Database unavailable. Please try again after the database connection is restored.',
      code: 'DATABASE_UNAVAILABLE',
    });
  }
  next();
});

app.use('/api/auth', authRoutes);     // login, register
app.use('/api/users', userRoutes);    // user info
app.use('/api/profile', profileRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

/* ===== HEALTH CHECK ===== */
app.get('/', (req, res) => {
  res.send('RoomieMatch API running');
});

app.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ database: connected ? 'connected' : 'unavailable' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error('Request failed:', err.name);
  if (err.code === 11000) return res.status(409).json({ msg: 'This email is already registered.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ msg: 'Invalid JSON request.' });
  res.status(500).json({ msg: 'Unable to complete the request. Please try again.' });
});

module.exports = app;
