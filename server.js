const express = require('express');
// const mongoose = require('mongoose');
const path = require('path');
const QA = require('./models/questionModel');
const connectDB = require('./scripts/db');
const loadQuestions = require('./scripts/loadQuestions');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

// Middleware functions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let points = 0;
let mistakes = 0;


// Route for HTML page
app.get('/', (req, res) => {
  // Builds a response for client
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Connections
connectDB() // it's a separate function, so we keep the server clean and modular
  .then(async () => {

    await loadQuestions(); // Stops to upload qa data if needed

    // Start the server
    app.listen(PORT, () => {
      console.log('Server running on http://localhost:3000');
    });

  })
  .catch((err) => {
    console.error('Error connecting to MongoDB: ', err);
    process.exit(1);
  });

// Check subject availability 
app.get('/check-subject', async (req, res) => {
  const subject = req.query.subject;
  // Stops to finds all left questions on that theme
  const unanswered = await QA.find({ subject, answered: 'N' });
  // Collects available levels in an array
  const availableLevels = unanswered.map(question => question.level);

  // Builds a response for clients
  res.json({
    available: availableLevels.length > 0,
    availableLevels
  });
});

// Check question availability and return it to user
app.get('/check-level', async (req, res) => {
  const { subject, level } = req.query;
  // Stops to find the question
  const question = await QA.findOne({ subject, level, answered: 'N' });

  // Builds a response for client based on question's availability
  if (question) {
    res.json({
      available: true,
      question: question.question,
      options: {
        a: question.optionA,
        b: question.optionB,
        c: question.optionC,
        d: question.optionD,
      }
    });
  } else {
    res.json({ available: false });
  }
});

// check if answer is right
app.get('/check-answer', async (req, res) => {
  const { subject, level, selectedAnswer } = req.query;

  // checks if the game is over
  if (mistakes >= 4) {
    // Builds a response for client
    return res.json({ correctAns: false, points, mistakes, gameOver: true });
  }

  // Stops to find the question in db
  const question = await QA.findOne({ subject, level });

  if (question) {
    // checks if the answer was correct
    const isCorrect = question.correctAnswer === selectedAnswer;

    // Stops to update the db with the fact that the question has been answered
    await QA.updateOne({ subject, level }, { $set: { answered: 'Y' } });

    // Counts score and mistakes 
    if (isCorrect) {
      points += parseInt(level);
    }
    else {
      mistakes++;
    }

    // Stops to check if there are any questions left
    const unansweredLeft = await QA.exists({ answered: 'N' });

    // Builds a response for client
    res.json({ correctAns: isCorrect, points, mistakes, gameOver: !unansweredLeft });
  }
});

// Restart game by reseting all questions to answered = 'N'
app.post('/restart-game', async (req, res) => {
  try {
    // Stops to update the collection
    await QA.updateMany({}, { $set: { answered: 'N' } });
    // Update score and mistake counters
    points = 0;
    mistakes = 0;

    // Builds a response for client
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to reset game:', err);
    res.status(500).json({ success: false, error: 'Reset failed' });
  }
});

