const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Jalur Register & Login
router.post('/register', register);
router.post('/login', login); // BARU

module.exports = router;