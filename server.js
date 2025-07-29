const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const loadQuestions = require('./scripts/loadQuestions');

const app = express();
const PORT = 3000;
const uri = 'mongodb://127.0.0.1:27017/jeopardy';

// Route for HTML page
    app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
    });

// Connect to DB

async function connectDB() {
  try {
    await mongoose.connect(uri);
      console.log('Connected to MongoDB to db - jeopardy');
  } catch (err) {
      console.error('Error connecting to MongoDB: ', err);
      throw err;
    }

  /*mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to MongoDB to db - jeopardy');

    await loadQuestions(); // upload qa data if needed

    // Start the server
    app.listen(PORT, () => {
      console.log('Server running on http://localhost:3000');
    });

  })
  .catch((err) => {
    console.error('Error connecting to MongoDB: ', err);
  });*/
}

module.exports = connectDB;
