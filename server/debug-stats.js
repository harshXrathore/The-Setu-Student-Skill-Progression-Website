const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/dashboard'; // Default from .env check earlier
const API_URL = 'http://localhost:3000/api/admin/stats';
const ADMIN_EMAIL = 'thesetu0@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';

async function debugStats() {
    console.log("🔍 Debugging Stats...\n");

    try {
        // 1. Connect to DB and count directly
        await mongoose.connect(MONGO_URI);
        const userCount = await User.countDocuments({});
        console.log(`📊 [Direct DB] User Count: ${userCount}`);

        if (userCount > 0) {
            const users = await User.find().limit(3);
            console.log("   Sample Users:", users.map(u => u.email));
        }

        // 2. Fetch from API
        // First Login
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        // Fetch Stats
        const statsRes = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (statsRes.ok) {
            const stats = await statsRes.json();
            console.log(`\n🌐 [API Response] Stats:`, stats);
        } else {
            console.log(`\n❌ [API Error] Status: ${statsRes.status}`);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

debugStats();
