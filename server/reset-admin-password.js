const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'thesetu0@gmail.com';
        const password = 'Admin@123';

        let user = await User.findOne({ email });

        if (user) {
            console.log(`User found: ${user.name} (${user.email})`);
            console.log(`Current Role: ${user.role}`);
            console.log(`Is Admin: ${user.isAdmin}`);

            // Reset password
            user.password = password;
            // Ensure admin
            user.isAdmin = true;
            user.role = 'student'; // Must be 'student' or 'mentor' per schema

            await user.save();
            console.log(`✅ Password reset to: ${password}`);
            console.log(`✅ Admin privileges ensured.`);
        } else {
            console.log('❌ User not found. Creating new admin user...');
            user = await User.create({
                name: 'System Admin',
                email: email,
                password: password,
                role: 'student',
                isAdmin: true
            });
            console.log(`✅ Created new admin user: ${email} / ${password}`);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetAdmin();
