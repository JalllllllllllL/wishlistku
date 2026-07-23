const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Mengambil token setelah kata "Bearer"

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan!' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = verified; // Menyimpan data user (id & email) ke request
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa!' });
  }
};

module.exports = verifyToken;