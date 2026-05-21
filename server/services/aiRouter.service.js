// services/aiRouter.service.js
// AI routing layer — decides which AI model handles each request type.
//
//   "roadmap"   → Gemini  (handled by skillController.js — NOT touched here)
//   "assistant" → Grok    (with Gemini fallback on error)

const { askGrok } = require('./grokAI.service');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_FALLBACK_MODEL = 'gemini-flash-latest';

/**
 * Route an AI request to the appropriate LLM.
 *
 * @param {'roadmap'|'assistant'} type   - Request type determines which model to use.
 * @param {string}                 systemPrompt - Context/instruction prompt.
 * @param {string}                 userMessage  - The user's question or input.
 * @returns {Promise<string>}       - The AI-generated response text.
 */
async function routeAIRequest(type, systemPrompt, userMessage) {
    if (type === 'roadmap') {
        // Roadmap generation is handled exclusively by skillController.js via Gemini.
        // This branch exists only for future extensibility — do not call this for roadmaps.
        throw new Error('Roadmap requests must go through /api/skills/analyze (Gemini).');
    }

    // --- Assistant flow: Grok primary, Gemini fallback ---
    try {
        console.log('[AI Router] Routing to Grok (assistant request)...');
        const response = await askGrok(systemPrompt, userMessage);
        return response;
    } catch (grokError) {
        console.warn(`[AI Router] Grok failed: ${grokError.message}. Falling back to Gemini...`);

        // Gemini fallback for assistant requests only
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
            const model = genAI.getGenerativeModel({ model: GEMINI_FALLBACK_MODEL });
            const combinedPrompt = `${systemPrompt}\n\nUser question: ${userMessage}`;
            const result = await model.generateContent([combinedPrompt]);
            const response = await result.response;
            const text = response.text();
            console.log('[AI Router] Gemini fallback succeeded.');
            return text;
        } catch (geminiError) {
            console.error('[AI Router] Both Grok and Gemini failed:', geminiError.message);
            throw new Error('AI assistant is temporarily unavailable. Please try again shortly.');
        }
    }
}

module.exports = { routeAIRequest };
