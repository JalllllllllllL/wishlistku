const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Memanggil koneksi database agar langsung dites saat server start
require('./src/config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Agar bisa menerima body berformat JSON
app.use(express.urlencoded({ extended: true }));

// Route Default / Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server Wishlistku API berjalan dengan lancar! 🚀'
  });
});

// Nanti kamu bisa tambahkan route API kamu di bawah sini
// contoh: 
// const authRoutes = require('./routes/auth');
// app.use('/api/auth', authRoutes);

// Menentukan port (otomatis dari Render atau 5000 untuk lokal)
const PORT = process.env.PORT || 5000;

// Menjalankan server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});