// src/api/userApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

/**
 * Logs a user in by sending their credentials to the backend.
 * @param {string} email The user's email.
 * @param {string} password The user's password.
 * @returns {Promise<Object>} A promise that resolves to the user data and token.
 */
export const loginAPI = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to log in.');
  }
};

/**
 * Registers a new user.
 * @param {string} name The user's name.
 * @param {string} email The user's email.
 * @param {string} password The user's password.
 * @returns {Promise<Object>} A promise that resolves to the new user data and token.
 */
export const registerAPI = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { name, email, password });
    return response.data;
  } catch (error) {
    console.error('Error registering:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to register.');
  }
};