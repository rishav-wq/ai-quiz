// src/pages/GeneratorPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateQuizAPI, saveQuizAPI, generateQuizFromPdfAPI } from '../api/quizApi'; // updated
import QuizDisplay from '../components/QuizDisplay';
import socket from '../services/socketService';
import './GeneratorPage.css';

const GeneratorPage = () => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [questionCount, setQuestionCount] = useState(3);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [participants, setParticipants] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);

  // NEW: Tabs and PDF upload
  const [inputType, setInputType] = useState('text'); 
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    socket.on('quizCreated', (data) => {
      console.log('Quiz created with code:', data.roomCode);
      setRoomCode(data.roomCode);
      setParticipants([]);
      setQuizStarted(false);
      setCurrentQuestionIndex(-1);
    });

    socket.on('updateParticipantList', (participantList) => {
      console.log('Updated participant list:', participantList);
      setParticipants(participantList);
    });
    
    socket.on('nextQuestion', () => {
      setQuizStarted(true);
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    });

    return () => {
      socket.off('quizCreated');
      socket.off('updateParticipantList');
      socket.off('nextQuestion');
    };
  }, []);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setQuestions([]);
    setRoomCode('');
    setPdfFile(null);

    try {
      let generatedQuestions;
      if (inputType === 'text') {
        if (!text.trim()) {
          setError('Please enter some text to generate a quiz.');
          setIsLoading(false);
          return;
        }
        generatedQuestions = await generateQuizAPI(text, questionCount);
      } else {
        if (!pdfFile) {
          setError('Please upload a PDF file.');
          setIsLoading(false);
          return;
        }
        generatedQuestions = await generateQuizFromPdfAPI(pdfFile, questionCount);
      }
      setQuestions(generatedQuestions);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLiveSession = () => {
    if (questions.length > 0) {
      socket.emit('createQuiz', { questions });
    }
  };

  const handleStartQuiz = () => {
    if (roomCode && participants.length > 0) {
      socket.emit('startQuiz', { roomCode });
    }
  };

  const handleNextQuestion = () => {
    socket.emit('nextQuestion', { roomCode });
  };

  const handleSaveQuiz = async () => {
    const title = prompt("Enter a title for your quiz:");
    if (title && questions.length > 0) {
      try {
        await saveQuizAPI(title, questions);
        alert('Quiz saved successfully!');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>AI Quiz Generator 🧠</h1>
        <p>Enter your text or upload a PDF, and let AI create a quiz for you!</p>
      </header>
      
      <div className="form-container">
        {/* Input Tabs */}
        <div className="input-tabs">
          <button
            className={`tab-button ${inputType === 'text' ? 'active' : ''}`}
            onClick={() => setInputType('text')}
            type="button"
          >
            Paste Text
          </button>
          <button
            className={`tab-button ${inputType === 'pdf' ? 'active' : ''}`}
            onClick={() => setInputType('pdf')}
            type="button"
          >
            Upload PDF
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {inputType === 'text' ? (
            <textarea
              className="text-input"
              placeholder="Paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
          ) : (
            <div className="file-input-container">
              <input
                type="file"
                id="pdfUpload"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {pdfFile && <p>Selected file: {pdfFile.name}</p>}
            </div>
          )}

          <div className="controls-container">
            <label htmlFor="questionCount">Number of Questions:</label>
            <input
              id="questionCount"
              className="number-input"
              type="number"
              min="1"
              max="10"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              disabled={isLoading}
            />
            <button className="generate-button" type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </form>
      </div>

      <div className="results-container">
        {isLoading && <p className="loading-text">Loading your quiz...</p>}
        {error && <p className="error-text">{error}</p>}

        {user && questions.length > 0 && !roomCode && !isLoading && (
          <div className="start-session-container">
            <button onClick={handleSaveQuiz} className="save-quiz-button">
              💾 Save Quiz
            </button>
          </div>
        )}

        {questions.length > 0 && !roomCode && !isLoading && (
          <div className="start-session-container">
            <button onClick={handleStartLiveSession} className="start-session-button">
              🚀 Start Live Session
            </button>
          </div>
        )}

        {roomCode && (
          <div className="room-code-container">
            {!quizStarted ? (
              <>
                <h2>Lobby Created!</h2>
                <p>Share this code with participants:</p>
                <div className="room-code-display">{roomCode}</div>

                <div className="participant-list">
                  <h4>Participants ({participants.length})</h4>
                  {participants.length > 0 ? (
                    <ul>
                      {participants.map((p) => (
                        <li key={p.id}>{p.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Waiting for participants to join...</p>
                  )}
                </div>

                <button
                  onClick={handleStartQuiz}
                  className="start-session-button"
                  disabled={participants.length === 0}
                >
                  Start Quiz for {participants.length} player(s)
                </button>
              </>
            ) : (
              <>
                <h2>Quiz in Progress</h2>
                <div className="host-question-view">
                  <h3>Showing Question {currentQuestionIndex + 1} of {questions.length}</h3>
                  {questions[currentQuestionIndex] && (
                    <p>{questions[currentQuestionIndex].question}</p>
                  )}
                </div>
                <div className="participant-list">
                  <h4>Live Leaderboard</h4>
                  <ul>
                    {participants.map((p) => (
                      <li key={p.id}>
                        {p.name} - {p.score || 0}
                      </li>
                    ))}
                  </ul>
                </div>
                {currentQuestionIndex < questions.length - 1 ? (
                  <button onClick={handleNextQuestion} className="start-session-button">
                    Next Question
                  </button>
                ) : (
                  <button onClick={handleNextQuestion} className="start-session-button">
                    Show Final Results
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {!quizStarted && questions.length > 0 && <QuizDisplay questions={questions} />}
      </div>
    </div>
  );
};

export default GeneratorPage;
