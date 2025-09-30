// src/models/QuizResult.js
const mongoose = require('mongoose');

const participantScoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
});

const quizResultSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roomCode: {
    type: String,
    required: true,
  },
  participants: [participantScoreSchema],
}, {
  timestamps: true,
});

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = QuizResult;