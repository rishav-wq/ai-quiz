// 1. Import dotenv first
const dotenv = require('dotenv');
dotenv.config();

// 2. Standard imports
const express = require('express');
const cors = require('cors');
const quizRoutes = require('./src/api/quizRoutes');
const userRoutes = require('./src/api/userRoutes');
const connectDB = require('./src/config/db');
const http = require('http');
const { Server } = require('socket.io');
const QuizResult = require('./src/models/QuizResult');
const quizResultRoutes = require('./src/api/quizResultRoutes');

// Constants
const QUESTION_DURATION = 10; // 20 seconds per question

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS CONFIGURATION ---
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// --- SETUP FOR SOCKET.IO ---
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// --- In-memory store for active quizzes ---
const activeQuizzes = new Map();

// Helper function to start a new question
const startQuestion = (roomCode) => {
  const quiz = activeQuizzes.get(roomCode);
  if (!quiz) return;

  quiz.currentQuestionIndex++;
  if (quiz.currentQuestionIndex < quiz.questions.length) {
    const nextQuestion = quiz.questions[quiz.currentQuestionIndex];
    quiz.questionStartTime = Date.now();
    quiz.answeredParticipants = new Set();

    // Remove the correct answer before sending to clients
    const questionForParticipants = {
      ...nextQuestion,
      correctAnswer: undefined
    };

    io.to(roomCode).emit('nextQuestion', {
      question: questionForParticipants,
      questionNumber: quiz.currentQuestionIndex + 1,
      totalQuestions: quiz.questions.length
    });

    // Clear any existing timer
    if (quiz.questionTimer) {
      clearTimeout(quiz.questionTimer);
    }

    quiz.questionTimer = setTimeout(() => {
      console.log(`⏰ Time's up for room ${roomCode}`);
      io.to(roomCode).emit('timesUp');
      const sortedParticipants = [...quiz.participants].sort((a, b) => b.score - a.score);
      io.to(roomCode).emit('updateParticipantList', sortedParticipants);
      
      // Auto-advance to next question after a brief delay
      setTimeout(() => startQuestion(roomCode), 3000);
    }, QUESTION_DURATION * 1000);

  } else {
    // Quiz ends
    const finalScores = [...quiz.participants].sort((a, b) => b.score - a.score);
    io.to(roomCode).emit('quizEnd', finalScores);

    // Save results to database
    if (quiz.quizId) {
      QuizResult.create({
        quiz: quiz.quizId,
        host: quiz.hostUserId,
        roomCode: roomCode,
        participants: finalScores.map(p => ({ name: p.name, score: p.score })),
      }).catch(error => console.error('❌ Failed to save quiz results:', error));
    }

    // Cleanup
    activeQuizzes.delete(roomCode);
  }
};

// --- REAL-TIME LOGIC ---
io.on('connection', (socket) => {
  console.log(`🔌 A user connected: ${socket.id}`);

  socket.on('createQuiz', (quizData) => {
    try {
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`New quiz created with room code: ${roomCode}`);

      activeQuizzes.set(roomCode, {
        hostUserId: quizData.user?._id || socket.id,
        hostSocketId: socket.id,
        quizId: quizData.quizId,
        questions: quizData.questions,
        participants: [],
        currentQuestionIndex: -1,
        questionStartTime: null,
        answeredParticipants: new Set(),
        questionTimer: null
      });

      socket.join(roomCode);
      socket.emit('quizCreated', { roomCode });
    } catch (error) {
      console.error('Error creating quiz:', error);
      socket.emit('error', { message: 'Failed to create quiz' });
    }
  });

  socket.on('joinQuiz', ({ name, roomCode }) => {
    const quiz = activeQuizzes.get(roomCode);
    if (quiz) {
      console.log(`Participant ${name} is joining room ${roomCode}`);
      socket.join(roomCode);
      const newParticipant = { id: socket.id, name, score: 0 };
      quiz.participants.push(newParticipant);
      socket.emit('joinSuccess', { roomCode });
      io.to(roomCode).emit('updateParticipantList', quiz.participants);
    } else {
      socket.emit('error', 'Quiz not found. Please check the room code.');
    }
  });

  socket.on('startQuiz', ({ roomCode }) => {
    const quiz = activeQuizzes.get(roomCode);
    if (quiz?.hostSocketId === socket.id) {
      console.log(`🎮 Quiz starting in room ${roomCode}`);
      quiz.currentQuestionIndex = -1;
      startQuestion(roomCode);
    }
  });

  socket.on('submitAnswer', ({ roomCode, answer }) => {
    const quiz = activeQuizzes.get(roomCode);
    if (!quiz?.questionStartTime) return;

    if (quiz.answeredParticipants.has(socket.id)) {
      return;
    }

    const question = quiz.questions[quiz.currentQuestionIndex];
    const participant = quiz.participants.find(p => p.id === socket.id);

    if (question && participant) {
      const wasCorrect = question.correctAnswer === answer;
      if (wasCorrect) {
        const timeTaken = (Date.now() - quiz.questionStartTime) / 1000;
        const points = Math.round(Math.max(0, 1000 - (timeTaken * (1000 / QUESTION_DURATION))));
        participant.score += points;
      }

      quiz.answeredParticipants.add(socket.id);
      socket.emit('answerResult', { wasCorrect, correctAnswer: question.correctAnswer });
      io.to(quiz.hostSocketId).emit('playerAnswered', participant);

      const sortedParticipants = [...quiz.participants].sort((a, b) => b.score - a.score);
      io.to(roomCode).emit('updateParticipantList', sortedParticipants);
    }
  });
 socket.on('nextQuestion', async ({ roomCode, userId }) => { // <-- Receive userId
    const quiz = activeQuizzes[roomCode];

    // --- UPDATED SECURITY CHECK ---
    // Check against the permanent database User ID
    if (quiz && quiz.hostUserId === userId) {

        clearTimeout(quiz.questionTimer);
        startQuestion(roomCode);
    }
});

  socket.on('disconnect', () => {
    console.log(`👋 A user disconnected: ${socket.id}`);
    // Remove participant from any active quizzes
    for (const [roomCode, quiz] of activeQuizzes.entries()) {
      const participantIndex = quiz.participants.findIndex(p => p.id === socket.id);
      if (participantIndex !== -1) {
        quiz.participants.splice(participantIndex, 1);
        io.to(roomCode).emit('updateParticipantList', quiz.participants);
      }
      // If host disconnects, end the quiz
      if (quiz.hostSocketId === socket.id) {
        io.to(roomCode).emit('quizEnd', { message: 'Quiz ended - Host disconnected' });
        activeQuizzes.delete(roomCode);
      }
    }
  });
});

// --- API ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', quizResultRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running successfully!' });
});

// --- START SERVER ---
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
  console.log(`📡 Allowing CORS from: ${allowedOrigins.join(', ')}`);
});