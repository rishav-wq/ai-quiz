// src/pages/ResultsPage.jsx
import React,  { useState, useEffect } from 'react';
import { getMyResultsAPI } from '../api/resultsApi';
import './ResultsPage.css'; // We'll create this next

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getMyResultsAPI();
        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <p>Loading results...</p>;

  return (
    <div className="dashboard-container">
      <h2>My Quiz Results</h2>
      {results.length === 0 ? (
        <p>You have no saved results yet.</p>
      ) : (
        <div className="results-list">
          {results.map((result) => (
            <div key={result._id} className="result-card">
              <h3>{result.quiz.title}</h3>
              <p>Played on: {new Date(result.createdAt).toLocaleDateString()}</p>
              <h4>Scores:</h4>
              <ul className="final-scores-list">
                {result.participants.map((p, i) => (
                  <li key={i}>
                    <span>{i + 1}. {p.name}</span>
                    <span>{p.score}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsPage;