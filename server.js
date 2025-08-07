const express = require('express');
const path = require('path');
const connectDB = require('./scripts/db');
const loadQuestions = require('./scripts/loadQuestions');
const gameLogic = require('./scripts/gameLogic');

const app = express();
const PORT = 3000;

// Middleware functions
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Route for HTML page
app.get('/', (req, res) => {
  // Builds a response for client
  res.sendFile(path.join(__dirname, 'index.html'));
});

//Use game logic 
app.use('/', gameLogic);


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
