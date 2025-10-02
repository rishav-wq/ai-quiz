// client/src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
   baseURL: 'https://ai-quiz-hnh3.onrender.com', // Your backend URL
});

// This "interceptor" runs before every request
apiClient.interceptors.request.use(
  (config) => {
    // Get user data from local storage
    const user = JSON.parse(localStorage.getItem('user'));

    // If a user and token exist, add the Authorization header
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
