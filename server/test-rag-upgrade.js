const mongoose = require('mongoose');
const RoleGuide = require('./models/RoleGuide');
const dotenv = require('dotenv');

dotenv.config();

const verifyUpgrades = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/career-path-ai');
        console.log("DB Connected");

        // Test Case 1: Search for a NEW role (Cybersecurity) using Text Search
        // Note: Text search is case-insensitive and stems words
        const query = "Security Analyst";
        console.log(`\n[TEST 1] Testing Text Search for: "${query}"...`);

        const roleGuide = await RoleGuide.findOne({
            $text: { $search: query }
        }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });

        if (roleGuide) {
            console.log(`[PASS] Found Guide: ${roleGuide.roleName}`);
            console.log(`[INFO] Description: ${roleGuide.description}`);

            // Test Case 2: Verify Resources are present
            console.log(`\n[TEST 2] Verifying Resources...`);
            if (roleGuide.resources && roleGuide.resources.length > 0) {
                console.log(`[PASS] Found ${roleGuide.resources.length} resources.`);
                roleGuide.resources.forEach(r => console.log(`   - [${r.type}] ${r.title}`));
            } else {
                console.error(`[FAIL] No resources found in guide.`);
            }

            // Test Case 3: Verify Must-Have Skills
            console.log(`\n[TEST 3] Verifying Must-Have Skills...`);
            if (roleGuide.mustHaveSkills && roleGuide.mustHaveSkills.length > 0) {
                console.log(`[PASS] Skills: ${roleGuide.mustHaveSkills.join(', ')}`);
            } else {
                console.error(`[FAIL] No skills found.`);
            }

        } else {
            console.error(`[FAIL] No guide found for "${query}" using text search.`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyUpgrades();
