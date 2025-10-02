// src/api/resultsApi.js
import axios from 'axios';

export const getMyResultsAPI = async () => {
  try {
    const response = await axios.get('https://ai-quiz-hnh3.onrender.com/api/results');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch quiz results.');
  }
};
