const mongoose = require('mongoose');
const Roadmap = require('./models/Roadmap');
const dotenv = require('dotenv');

dotenv.config();

const testSave = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/career-path-ai');
        console.log("DB Connected");

        // Mock User ID (Replace with a valid one from your DB if strictly relational, 
        // but for this test we'll create a dummy ID)
        const dummyUserId = new mongoose.Types.ObjectId();

        const mockData = {
            user: dummyUserId,
            title: "Test Roadmap",
            goal: "Test Goal",
            roadmapPhases: [
                {
                    phase: "Phase 1",
                    duration: "1 Month",
                    skills: [
                        {
                            name: "Test Skill",
                            status: "pending",
                            type: "frontend", // <--- This field is the suspect
                            hours: 10
                        }
                    ]
                }
            ]
        };

        console.log("Attempting to save:", JSON.stringify(mockData, null, 2));

        const saved = await Roadmap.create(mockData);
        console.log("Saved Roadmap:", saved);

        // Verify if 'type' field exists in the saved document
        if (saved.roadmapPhases[0].skills[0].type) {
            console.log("SUCCESS: 'type' field was saved.");
        } else {
            console.error("FAILURE: 'type' field is MISSING in saved document.");
        }

        process.exit();
    } catch (err) {
        console.error("Save Failed:", err);
        process.exit(1);
    }
};

testSave();
