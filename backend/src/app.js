const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const app = express();

const userRoutes = require('./routes/userRoutes');
const swipeRoutes = require('./routes/swipeRoutes');

app.use('/users', userRoutes);
app.use('/swipe', swipeRoutes);

app.use(express.json());
app.use('/api/swipe', require('./routes/swipeRoutes'));
app.use(cors());
app.use(express.json());
app.use('/api/users', require('./routes/userRoutes'));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send('RoomieMatch API running');
});

module.exports = app;
