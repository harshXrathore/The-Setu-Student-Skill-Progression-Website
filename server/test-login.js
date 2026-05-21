const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'thesetu0@gmail.com';
        const password = 'Admin@123';

        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        console.log(`User found: ${user.email}`);
        console.log(`Stored Hashed Password: ${user.password}`);

        const isMatch = await user.matchPassword(password);
        console.log(`Testing password "${password}"...`);

        if (isMatch) {
            console.log('✅ Password Match! Login SHOULD work.');
        } else {
            console.log('❌ Password Mismatch!');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testLogin();
