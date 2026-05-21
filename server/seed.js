const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Job = require('./models/Job');
const Post = require('./models/Post');
const Course = require('./models/Course');
const Mistake = require('./models/Mistake');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();
        console.log('MongoDB Connected...');

        // 1. Clear existing data
        await Job.deleteMany({});
        await Post.deleteMany({});
        await Course.deleteMany({});
        await Mistake.deleteMany({});

        // 2. Add Jobs
        const jobs = [
            { title: "Full Stack Developer", company: "TechCorp", location: "Remote", salary: "$120k", skills: ["React", "Node"] },
            { title: "Frontend Eng", company: "StartupIO", location: "NYC", salary: "$100k", skills: ["React", "Typescript"] },
            { title: "Backend Dev", company: "DataSystems", location: "Austin", salary: "$130k", skills: ["Python", "Django"] }
        ];
        await Job.insertMany(jobs);
        console.log('Jobs seeded');

        // 3. Add Courses
        const courses = [
            { title: "Advanced React Patterns", instructor: "Sarah Johnson", duration: "12 hours", lessons: 48, level: "Advanced", rating: 4.8, students: 12453, progress: 65, category: "Frontend" },
            { title: "Node.js Backend Development", instructor: "Michael Chen", duration: "16 hours", lessons: 64, level: "Intermediate", rating: 4.9, students: 18234, progress: 30, category: "Backend" },
            { title: "TypeScript Fundamentals", instructor: "Emily Davis", duration: "8 hours", lessons: 32, level: "Beginner", rating: 4.7, students: 23456, progress: 0, category: "Language" },
            { title: "AWS Cloud Essentials", instructor: "David Wilson", duration: "10 hours", lessons: 40, level: "Intermediate", rating: 4.6, students: 15678, progress: 0, category: "DevOps" }
        ];
        await Course.insertMany(courses);
        console.log('Courses seeded');

        // 4. Add Posts & Mistakes (Need User)
        let user = await User.findOne();
        if (user) {
            const posts = [
                { user: user._id, title: "How to learn React?", content: "Starting my journey...", category: "Learning" },
                { user: user._id, title: "Salary Negotiations", content: "Any tips?", category: "Career Advice" }
            ];
            await Post.insertMany(posts);
            console.log('Posts seeded');

            const mistakes = [
                { user: user._id, title: "Async/Await", description: "Forgot await keyword", severity: "medium", count: 3, category: "JS" },
                { user: user._id, title: "React State", description: "Mutating state directly", severity: "high", count: 5, category: "React" }
            ];
            await Mistake.insertMany(mistakes);
            console.log('Mistakes seeded');
        } else {
            console.log("No user found. Skipping User-dependent data (Posts, Mistakes).");
        }

        console.log('Seeding Complete!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
