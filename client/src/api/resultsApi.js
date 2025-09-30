// src/api/resultsApi.js
import axios from 'axios';

export const getMyResultsAPI = async () => {
  try {
    const response = await axios.get('/api/results');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch quiz results.');
  }
};