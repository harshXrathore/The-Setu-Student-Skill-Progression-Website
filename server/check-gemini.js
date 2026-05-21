const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function check() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Checking models with key ending in:", key ? key.slice(-4) : 'NONE');
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        const fs = require('fs');
        if (data.models) {
            const names = data.models
                .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name);
            fs.writeFileSync('models.json', JSON.stringify(names, null, 2));
            console.log("Written to models.json");
        } else {
            console.log("Error:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}
check();
