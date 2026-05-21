// test-adaptive-roadmap.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Mistake = require('./models/Mistake');
const Course = require('./models/Course');
const Roadmap = require('./models/Roadmap');
const skillController = require('./controllers/skillController');

async function runTest() {
    await connectDB();

    // 1. Setup Mock User
    const user = await User.findOne() || await User.create({
        name: "Test Adaptive User",
        email: `test_adaptive_${Date.now()}@example.com`,
        password: "password123",
        role: "student"
    });

    console.log("Using User:", user._id);

    // 2. Setup Mock Courses
    const course = await Course.create({
        title: "Advanced JavaScript Security",
        skillTag: "JavaScript",
        category: "Programming",
        instructor: "Test Instructor"
    });

    // 3. Setup Mock Mistakes (High frequency to trigger remediation)
    await Mistake.deleteMany({ userId: user._id });
    for(let i=0; i<6; i++) {
        await Mistake.create({
            userId: user._id,
            title: `JS Error ${i}`,
            skillTag: "JavaScript",
            source: "quiz",
            severity: 3
        });
    }

    // 4. Setup Mock Roadmap
    await Roadmap.deleteMany({ user: user._id });
    const roadmap = await Roadmap.create({
        user: user._id,
        title: "Test Roadmap",
        goal: "Test Goal",
        roadmapPhases: [
            {
                phase: "Phase 1: JS Mastery",
                duration: "2 weeks",
                skills: [
                    { name: "JavaScript", type: "language", hours: 10 }
                ]
            }
        ]
    });

    // 5. Test Controller Output
    let jsonOutput;
    const req = { user: { id: user._id } };
    const res = {
        json: (data) => { jsonOutput = data; },
        status: (code) => ({ send: console.log, json: console.log })
    };

    await skillController.getLatestRoadmap(req, res);

    console.log("\n=== Final Adapted Roadmap ===");
    console.log(JSON.stringify({learningPlan: jsonOutput.learningPlan}, null, 2));

    // Cleanup
    await Course.findByIdAndDelete(course._id);
    await Mistake.deleteMany({ userId: user._id });
    await Roadmap.findByIdAndDelete(roadmap._id);
    mongoose.connection.close();
}

runTest();
