const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Wajib ditambahkan jika menggunakan layanan cloud database (Neon/Render)
  }
});

pool.connect()
  .then(() => console.log('✅ Berhasil terhubung ke PostgreSQL (Neon)'))
  .catch((err) => console.error('❌ Gagal terhubung ke database', err));

module.exports = pool;