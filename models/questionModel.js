const mongoose = require('mongoose');

// Shema's defenition
const QuestionSchema = new mongoose.Schema({
    subject: { type: String, enum: ['History', 'Geography', 'Computer'], required: true },
    level: { type: Number, enum: [100, 200, 300, 400, 500], required: true },
    question: { type: String, unique: true, required: true },
    optionA: { type: String, required: true },
    optionB: { type: String, required: true },
    optionC: { type: String, required: true },
    optionD: { type: String, required: true },
    correctAnswer: { type: String, enum: ['a', 'b', 'c', 'd'], required: true },
    answered: { type: String, enum: ['N','Y'], default: 'N'}
});

// Schema's export
const Question = mongoose.model('question', QuestionSchema) // question - collection name
module.exports = Question;