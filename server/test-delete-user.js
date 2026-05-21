require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ role: 'student' });
        if (!user) {
            console.log("No user found.");
            process.exit(0);
        }
        console.log(`Found user: ${user.email}, ID: ${user._id}`);
        // let's create a dummy user to test deletion
        const newUser = await User.create({
            name: "Delete Test",
            email: "delete@test.com",
            password: "password123"
        });
        console.log(`Created test user: ${newUser._id}`);

        // Try to run the exact deleteOne query that controller uses
        const doc = await User.findById(newUser._id);
        if (doc) {
            await doc.deleteOne();
            console.log("Successfully deleted document using doc.deleteOne()");
        }
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}
test();
