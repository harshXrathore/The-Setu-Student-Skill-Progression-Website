const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Service to extract technical skills from PDF resumes using AI.
 */
class ResumeParserService {
    
    /**
     * Extracts text from a PDF and uses Gemini to find structured skills.
     * @param {string} filePath - Absolute path to the uploaded PDF file
     * @returns {Promise<string[]>} - Array of extracted skills
     */
    static async extractSkillsFromPDF(filePath) {
        if (!process.env.GEMINI_API_KEY) {
            console.error('[ResumeParser] GEMINI_API_KEY missing.');
            return [];
        }

        try {
            // 1. Extract raw text using pdf-parse
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            const rawText = pdfData.text;

            if (!rawText || rawText.trim() === '') {
                throw new Error("No readable text found in PDF");
            }

            // 2. Use Gemini AI to extract an array of skills
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

            // 3. Parse and return JSON
            const cleanText = responseText.replace(/```json|```/g, '').trim();
            const extractedSkills = JSON.parse(cleanText);

            if (Array.isArray(extractedSkills)) {
                return extractedSkills.map(s => s.trim()).filter(s => s.length > 0);
            }

            return [];
        } catch (error) {
            console.error('[ResumeParser] Error extracting skills:', error);
            return [];
        }
    }
}

module.exports = ResumeParserService;
