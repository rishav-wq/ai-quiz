// src/api/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

// When a POST request is made to the base URL ('/'), run the registerUser function
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;