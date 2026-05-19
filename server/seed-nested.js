const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const connectDB = require('./config/db');

dotenv.config();

const seedNestedCourse = async () => {
    try {
        await connectDB();
        
        // 1. Create a Master Course
        const course = await Course.create({
            title: "Advanced JavaScript Concepts",
            description: "Deep dive into Closures, Promises, Async/Await, and the Event Loop.",
            instructor: "Tech Lead Demo",
            duration: "5 hours",
            skillTag: "JavaScript",
            difficulty: "Intermediate",
            provider: "Platform Curriculum",
            level: "Intermediate",
            category: "Frontend",
            recommendedFor: ["student", "professional"],
            rating: 4.9,
            students: 350,
            enforceOrder: true,
            lessons: [] // We will populate this next
        });
        
        console.log("Created Course:", course.title);

        // 2. Create Lesson 1: Video Lesson
        const lesson1 = await Lesson.create({
            courseId: course._id,
            title: "The Javascript Event Loop Explained",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=8aGhZQkoFbQ",
            content: "In this video, we explore how the browser event loop handles asynchronous callbacks.",
            order: 1
        });
        
        console.log("Created Video Lesson");

        // 3. Create Lesson 2: Article Lesson
        const lesson2 = await Lesson.create({
            courseId: course._id,
            title: "Understanding Closures in Depth",
            type: "article",
            content: "<h2>Closures</h2><p>A closure gives you access to an outer function's scope from an inner function. In JavaScript, closures are created every time a function is created, at function creation time.</p><p>This is often used for data privacy and currying.</p>",
            order: 2
        });
        
        console.log("Created Article Lesson");

        // 4. Create Lesson 3: Quiz Lesson
        const lesson3 = await Lesson.create({
            courseId: course._id,
            title: "Knowledge Check: JS Fundamentals",
            type: "quiz",
            order: 3
        });
        
        console.log("Created Quiz Lesson");

        // 5. Create Quiz Questions attached to Lesson 3
        const q1 = await Quiz.create({
            lessonId: lesson3._id,
            question: "What will setTimeout(() => console.log('Hi'), 0) do?",
            options: [
                "Execute immediately, blocking the main thread",
                "Execute on the next tick of the Event Loop after current synchronous code",
                "Throw a syntax error",
                "Execute before any synchronous code"
            ],
            correctAnswer: "Execute on the next tick of the Event Loop after current synchronous code",
            skillTag: "JavaScript"
        });

        const q2 = await Quiz.create({
            lessonId: lesson3._id,
            question: "Which of the following is NOT a valid JavaScript data type?",
            options: [
                "String",
                "Number",
                "Boolean",
                "Character"
            ],
            correctAnswer: "Character",
            skillTag: "JavaScript"
        });

        const q3 = await Quiz.create({
            lessonId: lesson3._id,
            question: "What is the purpose of a closure in JavaScript?",
            options: [
                "To make the code run faster",
                "To close the browser window",
                "To give access to an outer function's scope from an inner function",
                "To prevent variables from being modified"
            ],
            correctAnswer: "To give access to an outer function's scope from an inner function",
            skillTag: "JavaScript"
        });

        console.log("Added 3 Quiz Questions for Multi-Question Quiz test");

        // 6. Link Lessons back to the Course array
        course.lessons = [lesson1._id, lesson2._id, lesson3._id];
        await course.save();

        console.log("Success! Seeded nested course with 3 lessons.");
        process.exit();
    } catch (error) {
        console.error('Error seeding nested courses:', error);
        process.exit(1);
    }
};

seedNestedCourse();
