const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Token dikirim client lewat header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan, silakan login' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Simpan userId di request, dipakai controller wishlist nanti
    next(); // Lanjut ke controller berikutnya
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
  }
};

module.exports = verifyToken;