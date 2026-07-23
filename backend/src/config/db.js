const mysql = require('mysql2/promise');
require('dotenv').config();

// Membuat koneksi pool ke MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306, // Dipastikan ber-tipe angka
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true, // Menjaga koneksi tetap hidup saat idle
  keepAliveInitialDelay: 0
});

// Tes koneksi database saat file ini dimuat
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Berhasil terhubung ke database MySQL!');
    connection.release(); // Kembalikan koneksi ke pool
  } catch (error) {
    console.error('❌ Gagal terhubung ke database MySQL:', error.message);
  }
})();

module.exports = pool;