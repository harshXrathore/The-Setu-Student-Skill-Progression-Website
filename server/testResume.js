const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testParser() {
    const pdfPath = path.join(__dirname, 'uploads', 'attachment-1773477503962-564987441.pdf');
    console.log("Testing PDF Parser on:", pdfPath);
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdfParse(dataBuffer);
        const rawText = pdfData.text;
        console.log("RAW TEXT PREVIEW:", rawText.slice(0, 300));
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const prompt = `
            Analyze the following resume text and extract all technical skills, programming languages, frameworks, tools, and relevant professional methodologies.
            Return ONLY a raw JSON array of strings. No markdown formatting, no explanations.
            If no skills are found, return [].
            Normalize the skills (e.g., "React.js" -> "React", "NodeJS" -> "Node.js").

            Resume Text:
            """
            ${rawText.slice(0, 5000)} // Limit to first 5000 chars to save tokens
            """
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log("RAW GEMINI RESPONSE:", responseText);
    } catch (e) {
        fs.writeFileSync('debug.txt', 'ERROR STACK:\n' + e.stack);
        console.error("Wrote error to debug.txt");
    }
}

testParser();
