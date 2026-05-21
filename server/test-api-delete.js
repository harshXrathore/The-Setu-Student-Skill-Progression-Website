require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const testApi = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        let admin = await User.findOne({ isAdmin: true });
        if (!admin) {
            admin = await User.create({
                name: "Admin Temp",
                email: "admin_temp@demo.com",
                password: "password123",
                isAdmin: true
            });
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });
        console.log("Admin token generated:", token);

        const dummyUser = await User.create({
            name: "Delete Me",
            email: "delete2@test.com",
            password: "password123"
        });
        console.log("Created dummy user:", dummyUser._id);

        const res = await fetch(`http://localhost:3000/api/admin/users/${dummyUser._id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log("Status Code:", res.status);
        const data = await res.json();
        console.log("Response Data:", data);
        
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}
testApi();
