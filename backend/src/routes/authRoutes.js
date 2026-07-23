const pool = require('../db'); // Import file db.js
const bcrypt = require('bcryptjs');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // 1. Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 2. Simpan ke PostgreSQL menggunakan $1, $2, $3
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "Registrasi berhasil", user: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error server atau email sudah terdaftar" });
  }
});