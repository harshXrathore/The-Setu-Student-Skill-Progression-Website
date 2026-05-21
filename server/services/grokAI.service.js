// services/grokAI.service.js
// Groq cloud inference integration — powers the AI Assistant chat feature.
// Uses Groq's OpenAI-compatible API with LLaMA 3.3 70B for fast, high-quality responses.
// Gemini remains exclusively for roadmap generation (skillController.js) — NOT touched here.

const fetch = require('node-fetch');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Fast, capable model on Groq

/**
 * Send a prompt to the Groq API and return the response text.
 * @param {string} systemPrompt - Instruction context for the assistant.
 * @param {string} userMessage  - The user's actual question/message.
 * @returns {Promise<string>}    - The generated text response.
 */
async function askGrok(systemPrompt, userMessage) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
        throw new Error('GROQ_API_KEY is not configured in environment variables.');
    }

    const payload = {
        model: GROQ_MODEL,
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: userMessage
            }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
    };

    console.log(`[Groq] Sending request to ${GROQ_API_URL} with model: ${GROQ_MODEL}`);

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Groq] API Error ${response.status}: ${errorBody}`);
        throw new Error(`Groq API returned status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error('Groq API returned an empty response.');
    }

    console.log(`[Groq] Response received (${text.length} chars).`);
    return text;
}

module.exports = { askGrok };
