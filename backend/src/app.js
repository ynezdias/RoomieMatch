const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
const swipeRoutes = require('./routes/swipeRoutes');

app.use('/api/swipe', swipeRoutes);
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send('RoomieMatch API running');
});

module.exports = app;
