const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const candidates = [
    "gemini-2.0-flash-001",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-1.5-pro",
    "gemini-1.5-flash"
];

async function testModels() {
    console.log("Testing various models...");

    for (const modelName of candidates) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            console.log(`SUCCESS!`);
            return; // Stop after first success
        } catch (error) {
            console.log(`FAILED (${error.response ? error.response.status : error.message})`);
        }
    }
    console.log("All candidates failed.");
}

testModels();
