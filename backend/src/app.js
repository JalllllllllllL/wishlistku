const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Saving & Wishlist Tracker API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);

module.exports = app;