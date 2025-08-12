- ABOUT THE GAME -
A small quiz game. You choose a category and difficulty, answer questions, and try to win.
Questions come from a CSV file and are stored in MongoDB. The game shows a win or lose screen at the end.

- HOW TO RUN -
Install dependencies: 
    "npm install"
Start the server:
    "npm start"
Open in your browser:
    "http://localhost:3000"

- APP STRUCTURE -
server.js - starts the Express server
scripts/:    
    db.js - connects to MongoDB
    gameLogic.js - checks answers and updates the game state
    loadQuestions.js - loads questions from a CSV file into the database
models/:
    questionModel.js - question schema for MongoDB
public/:
    index.html - main game page
    gameOver.html - end game page
    style.css - styles
media/ - pictures and GIFs
package.json - dependencies and npm scripts
trivia_questions.csv - the original questions file
