const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Memanggil koneksi database
require('./src/config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Daftarkan Route Auth di sini
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Route Default / Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server Wishlistku API berjalan dengan lancar! 🚀'
  });
});

// Menentukan port
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});