// src/controllers/quizController.js
const Quiz = require('../models/Quiz'); // <-- Import the Quiz model
const pdf = require('pdf-parse');
// Import our new AI service
const { generateQuestions } = require('../services/aiService');

const generateQuiz = async (req, res) => {
  try {
    const { text, questionCount } = req.body;

    // Basic validation
    if (!text || !questionCount) {
      return res.status(400).json({ message: 'Both text and questionCount are required.' });
    }

    // Call the AI service to get the questions
    // The 'await' keyword is crucial here
    const questions = await generateQuestions(text, questionCount);

    // Send the AI-generated questions back to the client
    res.status(200).json(questions);

  } catch (error) {
    console.error('Error in quiz generation controller:', error);
    // The error might come from our service, so we send a generic server error message.
    res.status(500).json({ message: 'Server error while generating quiz.' });
  }
};

/**
 * @desc    Save a new quiz
 * @route   POST /api/quizzes/
 * @access  Private
 */
const saveQuiz = async (req, res) => {
  try {
    const { title, questions } = req.body;

    const quiz = new Quiz({
      title,
      questions,
      user: req.user._id, // Get user ID from the protect middleware
    });

    const createdQuiz = await quiz.save();
    res.status(201).json(createdQuiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error while saving quiz.' });
  }
};
/**
 * @desc    Get logged in user's quizzes
 * @route   GET /api/quizzes/myquizzes
 * @access  Private
 */
const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching quizzes.' });
  }
};


/**
 * @desc    Generate a quiz from an uploaded PDF file
 * @route   POST /api/quizzes/generate-pdf
 * @access  Public
 */
const generateQuizFromPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    // Get the question count from the request body
    const { questionCount } = req.body;

    // Use pdf-parse to read the text from the file buffer
    const data = await pdf(req.file.buffer);
    const text = data.text;

    // Call our existing AI service with the extracted text
    const questions = await generateQuestions(text, questionCount);

    res.status(200).json(questions);

  } catch (error) {
    console.error('Error generating quiz from PDF:', error);
    res.status(500).json({ message: 'Server error while generating quiz from PDF.' });
  }
};

module.exports = {
  generateQuiz,
  saveQuiz,
  getMyQuizzes,
  generateQuizFromPdf,
};