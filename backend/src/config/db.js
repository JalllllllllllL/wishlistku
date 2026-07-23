require('./db');
const { Pool } = require('pg');
require('dotenv').config();

// Membuat koneksi pool ke PostgreSQL (Neon.tech)
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432, // Port default PostgreSQL adalah 5432
  ssl: {
    rejectUnauthorized: false, // WAJIB ada untuk koneksi cloud seperti Neon.tech
  }
});

// Tes koneksi database saat file ini dimuat
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Berhasil terhubung ke database PostgreSQL (Neon.tech)!');
    client.release(); // Kembalikan koneksi ke pool
  } catch (error) {
    console.error('❌ Gagal terhubung ke database PostgreSQL:', error.message);
  }
})();

module.exports = pool;