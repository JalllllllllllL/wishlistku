// 1. Import library yang dibutuhkan
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Memuat variabel dari file .env

const app = express();

// 2. Middleware
app.use(cors()); // Mengizinkan akses Cross-Origin Resource Sharing
app.use(express.json()); // Membaca body request berformat JSON
app.use(express.urlencoded({ extended: true })); // Membaca body request dari form/url-encoded

// 3. Route Utama (Health Check)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server Wishlistku API berjalan dengan lancar! 🚀'
  });
});

// --- IMPORT ROUTE KAMU DI SINI (JIKA ADA) ---
// Contoh:
// const wishlistRoutes = require('./routes/wishlistRoutes');
// app.use('/api/wishlist', wishlistRoutes);

// 4. Handling Route Tidak Ditemukan (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route tidak ditemukan.'
  });
});

// 5. Handling Global Error (500)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 6. Menjalankan Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});