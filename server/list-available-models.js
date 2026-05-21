const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not set in .env file.');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            if (jsonData.models) {
                console.log('Available Models:');
                jsonData.models.forEach((model) => {
                    console.log(`- ${model.name}`);
                    console.log(`  Supported Config: ${JSON.stringify(model.supportedGenerationMethods)}`);
                });
            } else {
                console.log('No models found, or error:', JSON.stringify(jsonData, null, 2));
            }
        } catch (error) {
            console.error('Error parsing JSON:', error.message);
        }
    });
}).on('error', (err) => {
    console.error('Error fetching models:', err.message);
});
