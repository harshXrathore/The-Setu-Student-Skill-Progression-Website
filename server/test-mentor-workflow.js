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
        const mentorEmail = `mentor_${Date.now()}@test.com`;
        const mentor = await User.create({
            name: 'Test Mentor',
            email: mentorEmail,
            password: 'password123',
            role: 'mentor',
            isVerified: false
        });

        await Profile.create({
            user: mentor._id,
            occupation: { role: 'mentor', company: 'TestCorp', jobTitle: 'Senior Dev' }
        });
        console.log(`[1] Created unverified Mentor: ${mentor.name} (${mentor._id})`);

        // 2. Fetch Mentors (Should not see the unverified mentor)
        const mockRes1 = {
            json: function (data) { this.data = data; },
            status: function () { return this; },
            send: function (msg) { this.data = msg; }
        };
        await mentorController.getAllMentors({}, mockRes1);
        const mentorsList1 = mockRes1.data;
        const foundUnverified = mentorsList1.find(p => p.user && p.user.email === mentorEmail);
        if (foundUnverified) throw new Error("Unverified mentor appeared in getAllMentors!");
        console.log(`[2] Unverified mentor successfully filtered out of getAllMentors.`);

        // 3. Admin Verifies Mentor
        mentor.isVerified = true;
        await mentor.save();
        console.log(`[3] Admin verified the mentor.`);

        // 4. Fetch Mentors again (Should see the verified mentor)
        const mockRes2 = {
            json: function (data) { this.data = data; },
            status: function () { return this; },
            send: function (msg) { this.data = msg; }
        };
        await mentorController.getAllMentors({}, mockRes2);
        const mentorsList2 = mockRes2.data;
        const foundVerified = mentorsList2.find(p => p.user && p.user._id.toString() === mentor._id.toString());
        if (!foundVerified) throw new Error("Verified mentor DID NOT appear in getAllMentors!");
        console.log(`[4] Verified mentor successfully appeared in getAllMentors.`);

        // 5. Create a Student & Book a Session
        const student = await User.create({
            name: 'Test Student',
            email: `student_${Date.now()}@test.com`,
            password: 'password123',
            role: 'student'
        });
        const reqBook = {
            user: { id: student._id },
            body: { mentorId: mentor._id, topic: 'React Help', date: new Date().toISOString(), notes: 'I need help with hooks' }
        };
        const resBook = {
            json: function (data) { this.data = data; },
            status: function (code) { this.code = code; return this; }
        };
        await mentorController.bookSession(reqBook, resBook);
        const newSession = resBook.data;
        if (!newSession || newSession.status !== 'Pending') throw new Error("Failed to book session properly.");
        console.log(`[5] Student booked session. Session ID: ${newSession._id}, Status: ${newSession.status}`);

        // 6. Mentor Accepts Session with Rescheduling
        const newDateObj = new Date();
        newDateObj.setDate(newDateObj.getDate() + 2); // Reschedule for 2 days later

        const reqUpdateStatus = {
            user: { id: mentor._id },
            params: { id: newSession._id },
            body: {
                status: 'Confirmed',
                newDate: newDateObj.toISOString(),
                newNotes: 'Can we do 2 days from now instead?'
            }
        };
        const resUpdateStatus = {
            json: function (data) { this.data = data; },
            status: function (code) { this.code = code; return this; }
        };
        await mentorController.updateSessionStatus(reqUpdateStatus, resUpdateStatus);
        const updatedSession = resUpdateStatus.data;
        if (updatedSession.status !== 'Confirmed') throw new Error("Failed to accept session.");

        // Check if date was updated
        if (new Date(updatedSession.date).getTime() !== newDateObj.getTime()) throw new Error("Session date was not rescheduled properly.");
        console.log(`[6] Mentor accepted session & rescheduled. New Status: ${updatedSession.status}, New Date: ${updatedSession.date}`);

        // 7. Verify Notification Creation for Student
        const Notification = require('./models/Notification');
        const notifications = await Notification.find({ recipient: student._id });
        if (notifications.length === 0) throw new Error("No notification was created for the student.");
        const newestNotif = notifications[notifications.length - 1];
        if (newestNotif.title !== 'Session Approved') throw new Error("Notification title incorrect.");
        console.log(`[7] Notification verified for Student: "${newestNotif.message}"`);

        console.log("=== ALL TESTS PASSED SUCCESSFULLY! ===");
    } catch (e) {
        console.error("TEST FAILED:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

runTests();
