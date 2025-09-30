// src/components/QuizDisplay.jsx
import React from 'react';
import QuestionCard from './QuestionCard';
import './QuizDisplay.css'; // We'll create this next

const QuizDisplay = ({ questions }) => {
  return (
    <div className="quiz-display-container">
      <h2>Generated Quiz</h2>
      {questions.map((q, index) => (
        <QuestionCard key={index} question={q} index={index} />
      ))}
    </div>
  );
};

export default QuizDisplay;