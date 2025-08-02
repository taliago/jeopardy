// here will be logic of Inserting data from CSV to question- collection
// using validation!

// and also important to check if there any data in collection already,
// to not overwrite it


const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Questions = require('../models/questionModel'); // imports schema of collection - questions
const connectDB = require('../server'); // imports connection to DB model


async function readCSVAndInsert() {   
    try {

        await connectDB();
    
        const collections = await mongoose.connection.db.listCollections({name: 'questions'}).toArray();
        if (collections.length > 0) {
            await mongoose.connection.db.dropCollection('questions');
            console.log('Dropped existing questions collection');
        }

        const questions = [];

        await new Promise((resolve, reject) => {
            fs.createReadStream('../trivia_questions.csv') 
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
    } finally {
        mongoose.connection.close();
        console.log("MongoDB connection closed");
    }
    /*Questions.insertMany(questions, { ordered: false, validateBeforeSave: true }) // inserts docs with validation
    .then(docs => {
            console.log("Successfully inserted:", docs.length, "questions");
        })
        .catch(err => {
            console.error("Error inserting questions:", err);
        })
        .finally(() => {
        mongoose.connection.close();
        });*/
}

// MAIN
readCSVAndInsert();