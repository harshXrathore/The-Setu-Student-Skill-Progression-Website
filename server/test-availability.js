require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Session = require('./models/Session');
const mentorController = require('./controllers/mentorController');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dashboard';

async function runTests() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    try {
        // 1. Create a Mentor
        const mentorEmail = `mentor_avail_${Date.now()}@test.com`;
        const mentor = await User.create({
            name: 'Avail Mentor',
            email: mentorEmail,
            password: 'password123',
            role: 'mentor',
            isVerified: true
        });

        // Add availability
        await Profile.create({
            user: mentor._id,
            occupation: { role: 'mentor', company: 'TestCorp', jobTitle: 'Avail Dev' },
            mentorDetails: {
                availability: [{
                    day: 'Wednesday',
                    slots: [
                        { startTime: '10:00', endTime: '12:00' },
                        { startTime: '15:00', endTime: '17:00' }
                    ]
                }]
            }
        });
        console.log(`[1] Created verified Mentor with Wed availability: ${mentor.name}`);

        // 2. Create a Student & Book a Session
        const student = await User.create({
            name: 'Avail Student',
            email: `student_avail_${Date.now()}@test.com`,
            password: 'password123',
            role: 'student'
        });

        // Compute a next Wednesday date
        let d = new Date();
        d.setDate(d.getDate() + ((3 + 7 - d.getDay()) % 7 || 7)); // Jump to next Wednesday
        if (d.getDay() !== 3) throw new Error("Math fail");

        // Attempt 1: Outside Hours (Wednesday 08:30)
        d.setHours(8, 30, 0, 0);
        const reqBook1 = {
            user: { id: student._id },
            body: { mentorId: mentor._id, topic: 'React', date: d.toISOString(), notes: 'x' }
        };
        const resBook1 = {
            json: function (data) { this.data = data; },
            status: function (code) { this.code = code; return this; }
        };
        await mentorController.bookSession(reqBook1, resBook1);
        if (resBook1.code !== 400) throw new Error("FAILED: Booked a session outside available hours! Code: " + resBook1.code);
        console.log(`[2] Rejected booking outside hours (08:30). Expected behavior.`);

        // Attempt 2: Incorrect Day (Tuesday)
        let tues = new Date(d);
        tues.setDate(tues.getDate() - 1);
        tues.setHours(11, 0, 0, 0);
        const reqBook2 = {
            user: { id: student._id },
            body: { mentorId: mentor._id, topic: 'React', date: tues.toISOString(), notes: 'x' }
        };
        const resBook2 = {
            json: function (data) { this.data = data; },
            status: function (code) { this.code = code; return this; }
        };
        await mentorController.bookSession(reqBook2, resBook2);
        if (resBook2.code !== 400) throw new Error("FAILED: Booked a session on wrong day! Code: " + resBook2.code);
        console.log(`[3] Rejected booking on invalid day (Tuesday). Expected behavior.`);

        // Attempt 3: Inside Hours (Wednesday 11:30)
        d.setHours(11, 30, 0, 0);
        const reqBook3 = {
            user: { id: student._id },
            body: { mentorId: mentor._id, topic: 'React', date: d.toISOString(), notes: 'x' }
        };
        const resBook3 = {
            json: function (data) { this.data = data; },
            status: function (code) { this.code = code; return this; }
        };
        await mentorController.bookSession(reqBook3, resBook3);
        if (resBook3.code && resBook3.code !== 200) throw new Error("FAILED: Valid booking was rejected! Data: " + JSON.stringify(resBook3.data));
        console.log(`[4] Accepted valid booking (Wednesday 11:30). Expected behavior.`);

        console.log("=== ALL AVAILABILITY TESTS PASSED SUCCESSFULLY! ===");
    } catch (e) {
        console.error("TEST FAILED:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

runTests();
