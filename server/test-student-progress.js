require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Session = require('./models/Session');
const Roadmap = require('./models/Roadmap');
const mentorController = require('./controllers/mentorController');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dashboard';

async function runTests() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    try {
        // 1. Create a Mentor
        const mentorEmail = `mentor_prog_${Date.now()}@test.com`;
        const mentor = await User.create({
            name: 'Prog Mentor',
            email: mentorEmail,
            password: 'password123',
            role: 'mentor',
            isVerified: true
        });

        await Profile.create({
            user: mentor._id,
            occupation: { role: 'mentor' }
        });
        console.log(`[1] Created Mentor: ${mentor.name}`);

        // 2. Create Student
        const student = await User.create({
            name: 'Prog Student',
            email: `student_prog_${Date.now()}@test.com`,
            password: 'password123',
            role: 'student'
        });

        // 3. Create Session between them
        await Session.create({
            mentor: mentor._id,
            student: student._id,
            topic: 'Progress Check',
            date: new Date(),
            status: 'Confirmed'
        });
        console.log(`[2] Created active session between mentor and student`);

        // 4. Create Roadmap for Student with 1/4 completed skills
        await Roadmap.create({
            user: student._id,
            title: 'Test Roadmap',
            goal: 'Learn Testing',
            roadmapPhases: [
                {
                    phase: 'Phase 1',
                    duration: '1 week',
                    skills: [
                        { name: 'Skill A', status: 'completed', hours: 2 },
                        { name: 'Skill B', status: 'pending', hours: 3 },
                        { name: 'Skill C', status: 'pending', hours: 4 },
                        { name: 'Skill D', status: 'pending', hours: 1 }
                    ]
                }
            ]
        });
        console.log(`[3] Generated Student Roadmap with 25% true completion`);

        // 5. Test getMyStudents (Expect 25% progress)
        const reqStudents = { user: { id: mentor._id } };
        const resStudents = {
            json: function (data) { this.data = data; },
            status: function (code) { this.code = code; return this; }
        };
        await mentorController.getMyStudents(reqStudents, resStudents);

        if (!resStudents.data || resStudents.data.length === 0) {
            throw new Error("FAILED: getMyStudents returned empty array");
        }

        const fetchedStudent = resStudents.data.find(s => s.id === student._id.toString());
        if (!fetchedStudent || fetchedStudent.progress !== 25) {
            throw new Error(`FAILED: Expected progress 25%, got ${fetchedStudent?.progress}`);
        }
        console.log(`[4] getMyStudents successfully calculated exact 25% progress from DB!`);

        // 6. Test getStudentRoadmap (Expected Success)
        const reqRoadmap = { user: { id: mentor._id }, params: { id: student._id } };
        const resRoadmap = {
            json: function (data) { this.data = data; },
            status: function (code) { this.code = code; return this; }
        };
        await mentorController.getStudentRoadmap(reqRoadmap, resRoadmap);

        if (!resRoadmap.data || resRoadmap.data.title !== 'Test Roadmap') {
            throw new Error("FAILED: Did not fetch expected student roadmap");
        }
        if (resRoadmap.data.roadmapPhases[0].skills.length !== 4) {
            throw new Error("FAILED: Roadmap did not contain expected skills");
        }
        console.log(`[5] getStudentRoadmap successfully returned deep phase/skill payload`);

        // 7. Test getStudentRoadmap with Unauthorized Mentor
        const hackerMentor = await User.create({
            name: 'Hacker', email: `hacker_${Date.now()}@test.com`, password: '123', role: 'mentor'
        });
        const reqRoadmapHacker = { user: { id: hackerMentor._id }, params: { id: student._id } };
        const resRoadmapHacker = {
            json: function (data) { this.data = data; },
            status: function (code) { this.code = code; return this; }
        };
        await mentorController.getStudentRoadmap(reqRoadmapHacker, resRoadmapHacker);

        if (resRoadmapHacker.code !== 403) {
            throw new Error("FAILED: Security breach! Unauthorized mentor read student roadmap");
        }
        console.log(`[6] Unauthorized mentor request strictly blocked (403 Forbidden). Good security.`);

        console.log("=== ALL PROGRESS / ROADMAP TESTS PASSED SUCCESSFULLY! ===");
    } catch (e) {
        console.error("TEST FAILED:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

runTests();
