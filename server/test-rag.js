const mongoose = require('mongoose');
const RoleGuide = require('./models/RoleGuide');
const dotenv = require('dotenv');

dotenv.config();

// MOCKING the logic from skillController to verify retrieval without spinning up full Express app
const testRAG = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/career-path-ai');
        console.log("DB Connected");

        const targetRoleName = "Full Stack Developer";
        console.log(`[TEST] Searching for role: "${targetRoleName}"...`);

        const roleGuide = await RoleGuide.findOne({
            roleName: { $regex: targetRoleName, $options: 'i' }
        });

        if (roleGuide) {
            console.log(`[PASS] Found Guide: ${roleGuide.roleName}`);
            console.log(`[PASS] Must Have Skills: ${roleGuide.mustHaveSkills.join(', ')}`);
        } else {
            console.error(`[FAIL] No guide found for ${targetRoleName}`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testRAG();
