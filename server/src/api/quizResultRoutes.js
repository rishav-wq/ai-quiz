// src/api/quizResultRoutes.js
const express = require('express');
const router = express.Router();
const { getMyResults } = require('../controllers/quizResultController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyResults);

module.exports = router;