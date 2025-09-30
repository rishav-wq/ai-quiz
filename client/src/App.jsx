// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import GeneratorPage from './pages/GeneratorPage';
import JoinPage from './pages/JoinPage';
import ParticipantLobby from './pages/ParticipantLobby';
import socket from './services/socketService';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HostLobbyPage from './pages/HostLobbyPage';
import ResultsPage from './pages/ResultsPage';

function App() {
  // This effect manages the global socket connection for the whole app
  useEffect(() => {
    socket.connect();
    socket.on('connect', () => console.log('✅ Connected to socket server with ID:', socket.id));
    socket.on('disconnect', () => console.log('❌ Disconnected from socket server'));
    
    return () => {
      socket.disconnect();
    };
  }, []);

  // The return statement should ONLY contain the Routes.
  // This code acts as a "switchboard" for your pages.
  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<GeneratorPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/quiz/:roomCode" element={<ParticipantLobby />} />
      <Route path="/login" element={<LoginPage />} />
       <Route path="/register" element={<RegisterPage />} />
       <Route path="/dashboard" element={<DashboardPage />} />
       <Route path="/host-lobby" element={<HostLobbyPage />} />
       <Route path="/results" element={<ResultsPage />} />
    </Routes>
    </>
  );
}

export default App;