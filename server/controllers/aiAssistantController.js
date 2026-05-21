// controllers/aiAssistantController.js
// Handles AI assistant chat requests.
// Enriches the prompt with user platform context (roadmap, mistakes, courses)
// before routing to Grok via the AI router service.

const { routeAIRequest } = require('../services/aiRouter.service');
const Roadmap = require('../models/Roadmap');
const Mistake = require('../models/Mistake');
const Course = require('../models/Course');

/**
 * Build a platform-aware system prompt for the Grok assistant.
 * Includes the user's current roadmap, weak skills, and available courses.
 */
async function buildSystemPrompt(userId) {
    let roadmapContext = 'No roadmap found.';
    let mistakeContext = 'No mistake data found.';
    let courseContext = 'No courses found.';

    // 1. Fetch latest roadmap
    try {
        const roadmap = await Roadmap.findOne({ user: userId }).sort({ createdAt: -1 });
        if (roadmap) {
            const phaseNames = roadmap.roadmapPhases
                .map(p => `${p.phase} (${p.duration})`)
                .join(' → ');
            roadmapContext = `Goal: ${roadmap.goal}\nPhases: ${phaseNames}`;
        }
    } catch (e) {
        console.error('[AI Assistant] Failed to fetch roadmap context:', e.message);
    }

    // 2. Fetch top weak skills from mistake records
    try {
        const mistakes = await Mistake.aggregate([
            { $match: { userId, status: 'open' } },
            { $group: { _id: '$skillTag', count: { $sum: '$count' } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        if (mistakes.length > 0) {
            mistakeContext = mistakes
                .map(m => `${m._id}: ${m.count} mistake(s)`)
                .join(', ');
        }
    } catch (e) {
        console.error('[AI Assistant] Failed to fetch mistake context:', e.message);
    }

    // 3. Fetch a sample of available courses (top 10 by title)
    try {
        const courses = await Course.find({}).limit(10).select('title skillTag difficulty');
        if (courses.length > 0) {
            courseContext = courses.map(c => `"${c.title}" (${c.skillTag || 'General'}, ${c.difficulty || 'All levels'})`).join('; ');
        }
    } catch (e) {
        console.error('[AI Assistant] Failed to fetch course context:', e.message);
    }

    return `You are The-Setu AI Assistant, a knowledgeable and friendly career guidance AI embedded in the CareerPath AI learning platform.

PLATFORM CONTEXT:
- The platform helps students and professionals build skill roadmaps, track learning progress, find mentors, and take courses.

USER'S CURRENT ROADMAP:
${roadmapContext}

USER'S WEAK SKILLS (by mistake count):
${mistakeContext}

AVAILABLE COURSES ON PLATFORM:
${courseContext}

YOUR ROLE:
- Answer questions about career paths, skill improvement, and learning strategies.
- Recommend relevant courses from the platform when appropriate.
- Provide actionable advice based on the user's roadmap and identified weak skills.
- Be concise, encouraging, and specific. Respond in plain text without markdown unless formatting genuinely helps.
- If you suggest a course, mention it by its exact name from the platform's course list.
- Do NOT make up information. If you don't know something, say so.`;
}

// @desc    Ask the AI assistant a question (powered by Grok, Gemini fallback)
// @route   POST /api/ai/assistant
// @access  Private (JWT required)
const askAssistant = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            return res.status(400).json({ error: 'A non-empty "question" field is required.' });
        }

        if (question.trim().length > 2000) {
            return res.status(400).json({ error: 'Question is too long. Maximum 2000 characters.' });
        }

        console.log(`[AI Assistant] Question from user ${req.user?.id}: "${question.trim().substring(0, 80)}..."`);

        // Build context-enriched system prompt
        const systemPrompt = await buildSystemPrompt(req.user.id);

        // Route to Grok (with Gemini fallback)
        const reply = await routeAIRequest('assistant', systemPrompt, question.trim());

        res.json({ reply });

    } catch (error) {
        console.error('[AI Assistant] Controller error:', error.message);
        res.status(500).json({
            error: error.message || 'AI assistant is temporarily unavailable. Please try again.'
        });
    }
};

module.exports = { askAssistant };
