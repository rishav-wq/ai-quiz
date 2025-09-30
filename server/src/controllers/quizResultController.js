// src/controllers/quizResultController.js
const QuizResult = require('../models/QuizResult');

/**
 * @desc    Get results for the logged-in user
 * @route   GET /api/results
 * @access  Private
 */
const getMyResults = async (req, res) => {
  try {
    const results = await QuizResult.find({ host: req.user._id })
      .populate('quiz', 'title') // Get the title from the linked Quiz document
      .sort({ createdAt: -1 }); // Show most recent first
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching results.' });
  }
};

module.exports = { getMyResults };