const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const connectDB = require('./config/db');

dotenv.config();

const courses = [
    {
        title: "Complete Cybersecurity Bootcamp",
        description: "Learn ethical hacking, penetration testing, and network security from scratch.",
        instructor: "Security Team",
        duration: "15 hours",
        skillTag: "Cybersecurity",
        difficulty: "Beginner",
        provider: "Platform Curriculum",
        level: "Beginner",
        category: "Cybersecurity",
        recommendedFor: ["student", "professional"],
        rating: 4.8,
        students: 120,
        lessons: [] // We can add lesson IDs here later
    },
    {
        title: "Advanced Penetration Testing",
        description: "Take your ethical hacking skills to the next level with advanced techniques.",
        instructor: "Security Team",
        duration: "10 hours",
        skillTag: "penetration Tester", // Matches exactly with the role
        difficulty: "Advanced",
        provider: "Platform Curriculum",
        level: "Advanced",
        category: "Cybersecurity",
        recommendedFor: ["professional"],
        rating: 4.9,
        students: 55,
        lessons: []
    }
];

const seedCourses = async () => {
    try {
        await connectDB();
        
        // Optional: clear existing courses first
        // await Course.deleteMany();
        // console.log('Existing courses cleared.');

        await Course.insertMany(courses);
        console.log(`Seeded ${courses.length} courses into the database!`);

        process.exit();
    } catch (error) {
        console.error('Error seeding courses:', error);
        process.exit(1);
    }
};

seedCourses();
