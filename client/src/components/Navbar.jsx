// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">AI Quiz Generator 🧠</Link>
      <div className="navbar-links">
        <Link to="/join" className="nav-button join-button">Join a Quiz</Link>

        {user ? (
          <>
            <span>Hello, {user.name}</span>

            <Link to="/dashboard">My Quizzes</Link> 
              <Link to="/results">My Results</Link> 
              
            <button onClick={handleLogout} className="nav-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            {/* We'll create the register page next */}
            <Link to="/register">Register</Link> 
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;