const db = require('../config/db');

// Menambah Wishlist Baru
const addWishlist = async (req, res) => {
  try {
    const { title, target_amount } = req.body;
    const userId = req.user.id; // Didapat dari middleware token yang login

    const newWishlist = await db.query(
      'INSERT INTO wishlists (user_id, title, target_amount) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, target_amount]
    );

    res.status(201).json({
      success: true,
      message: 'Wishlist berhasil ditambahkan! 🎁',
      data: newWishlist.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Melihat Daftar Wishlist User yang Sedang Login
const getWishlists = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlists = await db.query('SELECT * FROM wishlists WHERE user_id = $1 ORDER BY id DESC', [userId]);

    res.status(200).json({
      success: true,
      data: wishlists.rows
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { addWishlist, getWishlists };