const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const path = require('path');
const Questions = require('../models/questionModel'); // imports schema of collection - questions

// We don't need a server here, bc we call for loadQuestions from the server. 
// So server is the main part, that connects everything.

async function loadQuestions() {   
    try {
    
        // drops collection if exists - every session is a new game

        const collections = await mongoose.connection.db.listCollections({name: 'questions'}).toArray();
        if (collections.length > 0) {
            await mongoose.connection.db.dropCollection('questions');
            console.log('Dropped existing questions collection');
        }
        
        const questions = [];

        await new Promise((resolve, reject) => {
            fs.createReadStream(path.join(__dirname, '..', 'trivia_questions.csv')) 
            .pipe(csv())
            .on('data', (row) => {

                const question = {
                    subject: row.subject,
                    level: row.level,
                    question: row.question,
                    optionA: row.a,
                    optionB: row.b,
                    optionC: row.c,
                    optionD: row.d,
                    correctAnswer: row.correct,
                    answered: row.answered,
                }

                questions.push(question); // saves only relevant fields (by schema)
            })
            .on('end', resolve)
            .on('error', reject);
        });

        console.log("Preparing to insert", questions.length, "questions");

        let successCount = 0;
        let failureCount = 0;

        for (const data of questions) {
            const qDoc = new Questions(data);
            try {
                await qDoc.save(); 
                successCount++;
            } catch (err) {
                failureCount++;
                console.error(`Validation failed for question: ${data.question}\n  Error: ${err.message}`);
            }
        }

        console.log(`Successfully inserted ${successCount} questions`);
        if (failureCount > 0) {
            console.warn(`Skipped ${failureCount} invalid question(s) due to validation errors`);
        }
    } catch (err) {
        console.error("Unexpected error during CSV import:", err.message);
    }
}

module.exports = loadQuestions;