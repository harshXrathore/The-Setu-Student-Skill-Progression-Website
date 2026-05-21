require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const Session = require('./models/Session');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dashboard';

async function testNotifs() {
    await mongoose.connect(MONGO_URI);
    const notifications = await Notification.find({}).populate('recipient', 'name email');
    console.log(`Found ${notifications.length} notifications.`);
    notifications.forEach(n => {
        console.log(`- To: ${n.recipient?.name} (${n.recipient?.email}) | Title: ${n.title} | Read: ${n.read}`);
    });

    const sessions = await Session.find({}).populate('student', 'name').populate('mentor', 'name');
    console.log(`\nFound ${sessions.length} sessions.`);
    sessions.forEach(s => {
        console.log(`- ${s.status} | From ${s.student?.name} to ${s.mentor?.name}`);
    });

    await mongoose.disconnect();
}

testNotifs();
