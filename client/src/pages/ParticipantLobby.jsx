// client/src/pages/ParticipantLobby.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../services/socketService';
import './ParticipantLobby.css';

const QUESTION_DURATION = 10; // ⏱️ Define question duration (seconds)

const ParticipantLobby = () => {
  const { roomCode } = useParams();
  const [participants, setParticipants] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [finalScores, setFinalScores] = useState(null); 
  const [timeLeft, setTimeLeft] = useState(null); // ⏱️ New state for timer

  // Countdown effect
  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(prev => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timeLeft]);

  // Socket listeners
  useEffect(() => {
    socket.on('updateParticipantList', (participantList) => setParticipants(participantList));

    socket.on('nextQuestion', ({ question }) => { // server now sends object
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setTimeLeft(QUESTION_DURATION); // ⏱️ Start timer
    });

    socket.on('answerResult', (result) => setAnswerResult(result));

    socket.on('timesUp', () => {
      setTimeLeft(0); // ⏱️ Stop timer
      // Optionally auto-submit or lock answers
    });

    socket.on('quizEnd', (scores) => {
      setFinalScores(scores);
    });

    return () => {
      socket.off('updateParticipantList');
      socket.off('nextQuestion');
      socket.off('answerResult');
      socket.off('timesUp');
      socket.off('quizEnd');
    };
  }, []);

  const handleAnswerSubmit = (option) => {
    if (!selectedAnswer) {
      setSelectedAnswer(option);
      socket.emit('submitAnswer', { roomCode, answer: option });
    }
  };

  const getButtonClass = (option) => {
    if (!answerResult) return 'option-button';
    if (option === answerResult.correctAnswer) return 'option-button correct';
    if (option === selectedAnswer && !answerResult.wasCorrect) return 'option-button incorrect';
    return 'option-button';
  };

  // Show final results
  if (finalScores) {
    return (
      <div className="lobby-container">
        <div className="lobby-box">
          <h2>🎉 Quiz Over! 🎉</h2>
          <h3>Final Scores:</h3>
          <ul className="final-scores-list">
            {finalScores.map((p, i) => (
              <li key={p.id}>
                <span>{i + 1}. {p.name}</span>
                <span>{p.score}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      {!currentQuestion ? (
        <div className="lobby-box">
          <h2>Quiz Lobby</h2>
          <p>Room Code: <strong>{roomCode}</strong></p>
          <hr />
          <div className="participant-list-lobby">
            <h4>Participants ({participants.length})</h4>
            <ul>{participants.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
          </div>
          <p className="waiting-message">Waiting for the host to start the quiz...</p>
        </div>
      ) : (
        <div className="quiz-box">
          <h2>{currentQuestion.question}</h2>
          
          {/* ⏱️ Timer above options */}
          <div className="timer">Time Left: {timeLeft}</div>

          <div className="options-grid">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={getButtonClass(option)}
                onClick={() => handleAnswerSubmit(option)}
                disabled={!!selectedAnswer}
              >
                {option}
              </button>
            ))}
          </div>
          {answerResult && (
            <div className="explanation-box">
              <p>{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParticipantLobby;
