// src/pages/JoinPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socketService';
import './JoinPage.css'; // We'll create this CSS file next

const JoinPage = () => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for a successful join
    socket.on('joinSuccess', (data) => {
       navigate(`/quiz/${data.roomCode}`);
      // We will navigate to the quiz page later
      // navigate(`/quiz/${data.roomCode}`); 
    });

    // Listen for errors
    socket.on('error', (errorMessage) => {
      setError(errorMessage);
    });

    return () => {
      socket.off('joinSuccess');
      socket.off('error');
    };
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && roomCode) {
      socket.emit('joinQuiz', { name, roomCode });
    }
  };

  return (
    <div className="join-container">
      <div className="join-box">
        <h2>Join a Quiz</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="join-input"
          />
          <input
            type="text"
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="join-input"
          />
          <button type="submit" className="join-button">Join</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default JoinPage;