// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyQuizzesAPI } from '../api/quizApi';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await getMyQuizzesAPI();
        setQuizzes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleStartSession = (quiz) => {
    // Pass the entire quiz object in the state
    navigate('/host-lobby', { state: { quiz } });
  };

  if (loading) return <p>Loading your quizzes...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="dashboard-container">
      <h2>My Quizzes</h2>
      {quizzes.length === 0 ? (
        <p>You haven't saved any quizzes yet.</p>
      ) : (
        <div className="quiz-list">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.questions.length} Questions</p>
              <button 
                onClick={() => handleStartSession(quiz)}
                className="start-session-button"
              >
                Start Live Session
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;