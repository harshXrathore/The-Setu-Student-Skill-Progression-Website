const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const email = process.argv[2];

if (!email) {
    console.log("Usage: node make-admin.js <user_email>");
    process.exit(1);
}

const makeAdmin = async () => {
    try {
        await connectDB();
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.isAdmin = true;
        await user.save();
        console.log(`SUCCESS: User ${user.name} (${user.email}) is now an ADMIN.`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

makeAdmin();
