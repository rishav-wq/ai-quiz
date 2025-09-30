// src/models/Quiz.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  explanation: { type: String, required: true },
});

const quizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // This creates a reference to a User
    required: true,
    ref: 'User', // The model to link to
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled Quiz',
  },
  questions: [questionSchema],
}, {
  timestamps: true,
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;