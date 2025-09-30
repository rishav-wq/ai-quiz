// src/api/quizApi.js
import axios from 'axios';
// src/api/quizApi.js
import apiClient from './apiClient';
// The base URL of our backend server
const API_URL = 'http://localhost:5000/api/quizzes';

/**
 * Sends the text and question count to the backend to generate a quiz.
 * @param {string} text The source text for the quiz.
 * @param {number} questionCount The number of questions to generate.
 * @returns {Promise<Array>} A promise that resolves to the array of questions.
 */
export const generateQuizAPI = async (text, questionCount) => {
  try {
    const response = await axios.post(`${API_URL}/generate`, {
      text,
      questionCount,
    });
    return response.data; // The backend returns the array of questions
  } catch (error) {
    // Log the error and re-throw it to be handled by the component
    console.error('Error generating quiz:', error.response?.data || error.message);
    throw new Error('Failed to generate quiz. Please try again.');
  }
};

/**
 * Saves a generated quiz to the logged-in user's account.
 * @param {string} title The title of the quiz.
 * @param {Array} questions The array of question objects.
 * @returns {Promise<Object>} A promise that resolves to the saved quiz data.
 */
export const saveQuizAPI = async (title, questions) => {
  try {
    // The auth token is automatically sent thanks to our AuthContext setup
    const response = await axios.post(API_URL, { title, questions });
    return response.data;
  } catch (error) {
    console.error('Error saving quiz:', error.response?.data || error.message);
    throw new Error('Failed to save quiz.');
  }
};

/**
 * Fetches all quizzes saved by the logged-in user.
 * @returns {Promise<Array>} A promise that resolves to an array of quizzes.
 */
export const getMyQuizzesAPI = async () => {
  try {
    const response = await axios.get(`${API_URL}/myquizzes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quizzes:', error.response?.data || error.message);
    throw new Error('Failed to fetch quizzes.');
  }
};


/**
 * Generates a quiz from an uploaded PDF file.
 * @param {File} pdfFile The PDF file to upload.
 * @param {number} questionCount The number of questions to generate.
 * @returns {Promise<Array>} A promise that resolves to the array of questions.
 */
export const generateQuizFromPdfAPI = async (pdfFile, questionCount) => {
  // For file uploads, we must use a FormData object
  const formData = new FormData();
  formData.append('pdfFile', pdfFile);
  formData.append('questionCount', questionCount);

  try {
    const response = await apiClient.post('/api/quizzes/generate-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error generating quiz from PDF:', error.response?.data || error.message);
    throw new Error('Failed to generate quiz from PDF.');
  }
};