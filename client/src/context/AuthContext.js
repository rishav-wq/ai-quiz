// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// 1. Create the context
const AuthContext = createContext();

// 2. Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  // 3. Initialize user state from localStorage to stay logged in on refresh
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Effect to set the auth token in axios headers whenever the user changes
  useEffect(() => {
    if (user && user.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // 4. Login function
  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // 5. Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // 6. Provide the user state and functions to the rest of the app
  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 7. Create a custom hook for easy access to the context
export const useAuth = () => {
  return useContext(AuthContext);
};