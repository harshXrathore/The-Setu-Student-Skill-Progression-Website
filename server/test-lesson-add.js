const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const connectDB = require('./config/db');

dotenv.config();

const testAddQuiz = async () => {
    try {
        await connectDB();
        const course = await Course.findOne();
        
        const lesson = await Lesson.create({
            courseId: course._id,
            title: "Test Quiz Title",
            type: "quiz",
            content: "",
            videoUrl: "",
            externalUrl: "",
            order: 5
        });

        console.log("Success! Quiz Lesson created:", lesson);
        process.exit();
    } catch (error) {
        console.error('Error adding lesson:');
        console.error(error.stack || error);
        process.exit(1);
    }
};

testAddQuiz();
