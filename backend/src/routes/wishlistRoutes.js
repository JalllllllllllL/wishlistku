const express = require('express');
const router = express.Router();
const { addWishlist, getWishlists } = require('../controllers/wishlistController');
const verifyToken = require('../middlewares/authMiddleware');

// Semua rute di bawah ini wajib melampirkan token JWT yang valid
router.post('/', verifyToken, addWishlist);
router.get('/', verifyToken, getWishlists);

module.exports = router;