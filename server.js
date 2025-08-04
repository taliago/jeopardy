const express = require('express');
// const mongoose = require('mongoose');
const path = require('path');
const QA = require('./models/questionModel');
const connectDB = require('./scripts/db');
const loadQuestions = require('./scripts/loadQuestions');

const app = express();
const PORT = 3000;

// Middleware functions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Route for HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Connections
  connectDB() // it's a separate function, so we keep the server clean and modular
  .then(async () => {

    await loadQuestions(); // upload qa data if needed

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
  const count = await QA.countDocuments({ subject, answered: 'N' });
  const isAvailable = count > 0;
  res.json({ available: isAvailable });
});

// Check question availability and return it to user
app.get('/check-level', async (req, res) => {
  const { subject, level } = req.query;
  const question = await QA.findOne({ subject, level, answered: 'N' });

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
  const { subject, level, correctAnswer } = req.query;
  const question = await QA.findOne({ subject, level });
  const isCorrect = question.correctAnswer === correctAnswer;
  if (isCorrect) {
    await QA.updateOne({subject, level}, {$set: {answered: 'Y'}});
  }
  res.json({ correctAns: isCorrect });
});
