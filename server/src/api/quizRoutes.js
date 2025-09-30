// src/api/quizRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer'); 

// Import the controller function we just created
const { protect } = require('../middleware/authMiddleware');
const { generateQuiz, saveQuiz,getMyQuizzes,generateQuizFromPdf } = require('../controllers/quizController.js');
// Configure multer for file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });
// Define the route
// When a POST request is made to '/generate', the generateQuiz function will run.
router.post('/generate', generateQuiz);
router.post('/generate-pdf', upload.single('pdfFile'), generateQuizFromPdf);
// Private route to save a quiz
router.post('/', protect, saveQuiz);
router.get('/myquizzes', protect, getMyQuizzes);

module.exports = router;