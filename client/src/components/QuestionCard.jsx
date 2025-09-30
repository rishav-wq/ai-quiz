// src/components/QuestionCard.jsx
import React, { useState } from 'react';

const QuestionCard = ({ question, index }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="question-card">
      <h3>Question {index + 1}</h3>
      <p className="question-text">{question.question}</p>
      <ul className="options-list">
        {question.options.map((option, i) => (
          <li
            key={i}
            className={
              showAnswer && option === question.correctAnswer
                ? 'option correct'
                : 'option'
            }
          >
            {option}
          </li>
        ))}
      </ul>
      <button className="show-answer-btn" onClick={() => setShowAnswer(!showAnswer)}>
        {showAnswer ? 'Hide Answer' : 'Show Answer'}
      </button>
      {showAnswer && (
        <div className="answer-container">
          <p>
            <strong>Correct Answer:</strong> {question.correctAnswer}
          </p>
          <p>
            <strong>Explanation:</strong> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;