const pool = require('../db'); // Import file db.js

// Asumsikan ada middleware verifyToken yang menyematkan req.userId
router.get('/', verifyToken, async (req, res) => {
  try {
    const wishlists = await pool.query(
      'SELECT * FROM wishlists WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    
    res.status(200).json({ data: wishlists.rows }); // Hasil array ada di properti .rows
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data" });
  }
});