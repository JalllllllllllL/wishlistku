const db = require('../config/db');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Mengecek apakah email sudah digunakan
    const userExist = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar!' });
    }

    // 2. Mengacak (Hash) Password demi keamanan
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Menyimpan data user baru ke database PostgreSQL
    const newUser = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    // 4. Memberikan respon sukses
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! 🚀',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { register };