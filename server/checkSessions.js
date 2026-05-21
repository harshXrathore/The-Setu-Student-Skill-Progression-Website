require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dashboard').then(async () => {
    const Session = mongoose.model('Session', new mongoose.Schema({}, { strict: false })); // Dynamic schema
    const sessions = await Session.find({});
    console.log("All sessions in DB (ID and Mentor/Student ID):");
    sessions.forEach(s => console.log(`ID: ${s._id}, Mentor: ${s.mentor}, Student: ${s.student}`));
    process.exit(0);
});
