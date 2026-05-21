const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MentorRecord = require('./models/MentorRecord');
const User = require('./models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dashboard';

async function runTest() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        // Clean up previous records for test isolation
        await MentorRecord.deleteMany({ 'notes.content': 'TEST_NOTE_999' });

        // Create dummy users on the fly if needed, or query existing ones
        // Since this is just a quick API test, let's create a temp mentor and student

        const tempMentor = await User.create({
            name: 'Test Mentor',
            email: `testmentor_${Date.now()}@example.com`,
            password: 'password123',
            role: 'mentor',
            isVerified: true
        });

        const tempStudent = await User.create({
            name: 'Test Student',
            email: `teststudent_${Date.now()}@example.com`,
            password: 'password123',
            role: 'user'
        });

        console.log('Created temporary users for testing.');

        // Test 1: Create a record (simulating mentor adding a note)
        console.log('\n--- 1. Testing Record Creation & Adding Note ---');
        let record = await MentorRecord.create({
            mentor: tempMentor._id,
            student: tempStudent._id,
            notes: [{ content: 'TEST_NOTE_999' }],
            assignments: [],
            resources: []
        });
        console.log('Record created with note:', record.notes[0].content);

        // Test 2: Add an assignment
        console.log('\n--- 2. Testing Adding Assignment ---');
        record.assignments.unshift({
            title: 'Complete React Tutorial',
            description: 'Finish the official docs',
            dueDate: new Date(Date.now() + 86400000) // Tomorrow
        });
        await record.save();
        console.log('Assignment added:', record.assignments[0].title);

        const assignmentId = record.assignments[0]._id;

        // Test 3: Add a resource
        console.log('\n--- 3. Testing Adding Resource ---');
        record.resources.unshift({
            title: 'MDN Web Docs',
            link: 'https://developer.mozilla.org'
        });
        await record.save();
        console.log('Resource added:', record.resources[0].title);

        // Test 4: Update assignment status as student
        console.log('\n--- 4. Testing Updating Assignment Status ---');
        const assignmentToUpdate = record.assignments.id(assignmentId);
        assignmentToUpdate.status = 'completed';
        assignmentToUpdate.completedDate = new Date();
        await record.save();
        console.log('Assignment status updated to:', record.assignments.id(assignmentId).status);

        if (record.assignments.id(assignmentId).status === 'completed') {
            console.log('\n✅ ALL MENTOR RECORD TESTS PASSED SUCCESSFULLY!');
        } else {
            console.error('\n❌ FAILED to update assignment status.');
        }

        // Cleanup
        await User.findByIdAndDelete(tempMentor._id);
        await User.findByIdAndDelete(tempStudent._id);
        await MentorRecord.findByIdAndDelete(record._id);

    } catch (error) {
        console.error('Test script failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

runTest();
