const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/jeopardy';

// Connect to DB

async function connectDB() {
  try {
    await mongoose.connect(uri);
      console.log('Connected to MongoDB to db - jeopardy');
    } catch (err) {
      console.error('Error connecting to MongoDB: ', err);
      throw err;
    }
}

module.exports = connectDB;