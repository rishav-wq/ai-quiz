// src/services/socketService.js
import { io } from 'socket.io-client';

// The URL of your backend server
const SERVER_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create the socket instance
const socket = io(SERVER_URL, {
  autoConnect: false // We will connect manually when the app starts
});

export default socket;