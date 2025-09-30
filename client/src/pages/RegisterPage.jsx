// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerAPI } from '../api/userApi';
import './JoinPage.css'; // We can reuse these styles

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Call the register API function
      const userData = await registerAPI(name, email, password);
      // Log the user in immediately after registration
      login(userData);
      // Redirect to the homepage
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="join-container">
      <div className="join-box">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="join-input"
          />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="join-input"
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="join-input"
          />
          <button type="submit" className="join-button">Register</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default RegisterPage;