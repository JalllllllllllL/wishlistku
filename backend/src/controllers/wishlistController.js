const pool = require('../config/db');

// Fungsi bantu: hitung progres & sisa uang, dipakai berulang di CREATE & READ
const formatWishlistItem = (item) => {
  const targetPrice = parseFloat(item.target_price);
  const savedAmount = parseFloat(item.saved_amount);
  const remaining = targetPrice - savedAmount;
  const progressPercentage = targetPrice > 0
    ? Math.min((savedAmount / targetPrice) * 100, 100)
    : 0;

  return {
    id: item.id,
    itemName: item.item_name,
    targetPrice,
    savedAmount,
    remainingAmount: remaining > 0 ? remaining : 0,
    progressPercentage: parseFloat(progressPercentage.toFixed(2)),
    createdAt: item.created_at,
  };
};

// CREATE - Tambah barang impian baru
const createWishlist = async (req, res) => {
  try {
    const { itemName, targetPrice } = req.body;
    const userId = req.userId; // Didapat dari authMiddleware

    if (!itemName || !targetPrice) {
      return res.status(400).json({ message: 'Nama barang dan harga target wajib diisi' });
    }
    if (targetPrice <= 0) {
      return res.status(400).json({ message: 'Harga target harus lebih dari 0' });
    }

    const [result] = await pool.query(
      'INSERT INTO wishlists (item_name, target_price, saved_amount, user_id) VALUES (?, ?, 0, ?)',
      [itemName, targetPrice, userId]
    );

    res.status(201).json({
      message: 'Barang impian berhasil ditambahkan',
      wishlistId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// READ - Ambil semua wishlist milik user yang sedang login
const getWishlists = async (req, res) => {
  try {
    const userId = req.userId;

    const [rows] = await pool.query(
      'SELECT * FROM wishlists WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const formattedData = rows.map(formatWishlistItem);

    res.status(200).json({ data: formattedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// UPDATE - Tambah nominal ke saldo terkumpul
const updateSavedAmount = async (req, res) => {
  try {
    const { id } = req.params;       // ID wishlist dari URL
    const { amount } = req.body;     // Nominal yang ingin ditambahkan
    const userId = req.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Nominal harus lebih dari 0' });
    }

    // Penting: cek dulu apakah wishlist ini benar milik user yang login
    const [existing] = await pool.query(
      'SELECT * FROM wishlists WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    // Update saldo: saldo_baru = saldo_lama + amount
    await pool.query(
      'UPDATE wishlists SET saved_amount = saved_amount + ? WHERE id = ? AND user_id = ?',
      [amount, id, userId]
    );

    // Ambil data terbaru untuk dikirim balik ke frontend
    const [updated] = await pool.query('SELECT * FROM wishlists WHERE id = ?', [id]);

    res.status(200).json({
      message: 'Saldo berhasil diperbarui',
      data: formatWishlistItem(updated[0]),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE - Hapus barang dari wishlist
const deleteWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [result] = await pool.query(
      'DELETE FROM wishlists WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    res.status(200).json({ message: 'Barang berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = { createWishlist, getWishlists, updateSavedAmount, deleteWishlist };