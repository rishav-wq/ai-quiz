// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginAPI } from '../api/userApi';
import './JoinPage.css'; // We can reuse the styles from JoinPage

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from our context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userData = await loginAPI(email, password);
      login(userData); // Set user in global context and localStorage
      navigate('/'); // Redirect to the homepage
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="join-container">
      <div className="join-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="join-button">Login</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;