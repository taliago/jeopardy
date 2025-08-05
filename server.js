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
  // Finds all left questions on that theme
  const unanswered = await QA.find({ subject, answered: 'N' });
  // Collects available levels
  const availableLevels = unanswered.map(question => question.level);

  res.json({ 
    available: availableLevels.length > 0,
    availableLevels
   });
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
  
  if (question) {
    const isCorrect = question.correctAnswer === correctAnswer;

    await QA.updateOne({ subject, level }, { $set: { answered: 'Y' } });

    if (isCorrect) {
      points += parseInt(level);
    }
    else {
      mistakes ++;
    }

    // Check if there are any questions left
    const unansweredLeft = await QA.exists({ answered: 'N' });

    res.json({ correctAns: isCorrect, points, mistakes, gameOver: !unansweredLeft });
  } 
});
