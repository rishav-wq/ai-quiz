// src/pages/HostLobbyPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import socket from '../services/socketService';
import './GeneratorPage.css'; // We can reuse the styles from the generator page


const HostLobbyPage = () => {
  const location = useLocation();
  const { user } = useAuth(); // Get the logged-in user
  // Get the entire quiz object from the state
  const { quiz } = location.state || {};
  const questions = quiz?.questions || [];

  const [roomCode, setRoomCode] = useState('');
  const [participants, setParticipants] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answeredPlayers, setAnsweredPlayers] = useState([]); // ✅ New state

  useEffect(() => {
    // When creating the quiz, send the user object along with the quiz data
    if (questions.length > 0 && user) { // Check that user exists
      socket.emit('createQuiz', { questions, quizId: quiz._id, user });
    }

    socket.on('quizCreated', (data) => setRoomCode(data.roomCode));
    socket.on('updateParticipantList', (list) => setParticipants(list));

    socket.on('nextQuestion', () => {
      setQuizStarted(true);
      setCurrentQuestionIndex(prev => prev + 1);
      setAnsweredPlayers([]); // ✅ Reset answers for new question
    });

    // ✅ Listen for when a player answers
    socket.on('playerAnswered', (player) => {
      setAnsweredPlayers(prev => [...prev, player.id]);
    });

    // Cleanup listeners on component unmount
    return () => {
      socket.off('quizCreated');
      socket.off('updateParticipantList');
      socket.off('nextQuestion');
      socket.off('playerAnswered');
    };
  }, [questions, quiz, user]); // Add user to dependency array

  const handleStartQuiz = () => {
    socket.emit('startQuiz', { roomCode });
  };

  const handleNextQuestion = () => {
    // Send the user's ID along with the room code
    socket.emit('nextQuestion', { roomCode, userId: user._id });
  };

  if (!quiz) {
    return <p>No quiz data found. Please return to your dashboard.</p>;
  }

  return (
    <div className="app-container">
      <div className="room-code-container" style={{ marginTop: '40px' }}>
        {!quizStarted ? (
          // LOBBY VIEW
          <>
            <h2>Lobby Created!</h2>
            <p>Share this code with participants:</p>
            <div className="room-code-display">{roomCode}</div>
            <div className="participant-list">
              <h4>Participants ({participants.length})</h4>
              {participants.length > 0 ? (
                <ul>{participants.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
              ) : (<p>Waiting for participants to join...</p>)}
            </div>
            <button
              onClick={handleStartQuiz}
              className="start-session-button"
              disabled={participants.length === 0}
            >
              Start Quiz
            </button>
          </>
        ) : (
          // QUIZ IN PROGRESS VIEW
          <>
            <h2>Quiz in Progress</h2>
            <div className="host-question-view">
              <h3>Showing Question {currentQuestionIndex + 1} of {questions.length}</h3>
              <p>{questions[currentQuestionIndex]?.question}</p>
            </div>
            <div className="participant-list">
              <h4>
                Live Leaderboard ({answeredPlayers.length}/{participants.length} answered)
              </h4>
              <ul>
                {participants.map((p) => (
                  <li key={p.id}>
                    {answeredPlayers.includes(p.id) && '✅ '}
                    {p.name} - {p.score || 0}
                  </li>
                ))}
              </ul>
            </div>
            {currentQuestionIndex < questions.length - 1 ? (
              <button onClick={handleNextQuestion} className="start-session-button">
                Next Question
              </button>
            ) : (
              <button onClick={handleNextQuestion} className="start-session-button">
                Show Final Results
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HostLobbyPage;
