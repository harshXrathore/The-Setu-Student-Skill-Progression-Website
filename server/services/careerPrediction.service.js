const Profile = require('../models/Profile');
const Roadmap = require('../models/Roadmap');
const Mistake = require('../models/Mistake');
const Career = require('../models/Career');
const { routeAIRequest } = require('./aiRouter.service');

/**
 * Normalizes text to lowercase and trims for matching purposes.
 */
function normalizeSkill(skill) {
    if (!skill) return '';
    return String(skill).toLowerCase().trim();
}

/**
 * Calculates a match score for a single career based on the user's data.
 * Weights:
 * - Skill match = 50%
 * - Learning goal match = 20%
 * - Roadmap progress = 20%
 * - Market demand = 10%
 * 
 * Returns { score, missingSkills, estimatedTime }
 */
function calculateCareerScore(career, userProfile, roadmapProgress, weakSkills) {
    let score = 0;

    // 1. Skill Match (50%)
    const userSkills = (userProfile.skills || []).map(normalizeSkill);
    const requiredSkills = career.requiredSkills || [];
    let matchedSkillsCount = 0;
    const missingSkills = [];

    requiredSkills.forEach(reqSkill => {
        if (userSkills.includes(normalizeSkill(reqSkill))) {
            matchedSkillsCount++;
        } else {
            missingSkills.push(reqSkill);
        }
    });

    let skillMatchRatio = 0;
    if (requiredSkills.length > 0) {
        skillMatchRatio = matchedSkillsCount / requiredSkills.length;
    } else {
        skillMatchRatio = 1; // If no required skills, it's a 100% match structurally
    }
    const skillScore = skillMatchRatio * 50;
    score += skillScore;

    // 2. Learning Goal Match (20%)
    let goalScore = 0;
    const learningFocus = normalizeSkill(userProfile.learningGoals?.focus);
    if (learningFocus) {
        const careerTitle = normalizeSkill(career.title);
        const careerIndustry = normalizeSkill(career.industry);
        const focusTokens = learningFocus.split(/\s+/).filter(Boolean);
        const isMatch = focusTokens.some(token => careerTitle.includes(token) || careerIndustry.includes(token));
        
        if (isMatch || careerTitle.includes(learningFocus) || careerIndustry.includes(learningFocus)) {
            goalScore = 20;
        } else {
            // Partial credit if there's any overlap
            goalScore = 5; 
        }
    }
    score += goalScore;

    // 3. Roadmap Progress (20%)
    // roadmapProgress is expected as a percentage (0-100)
    let progressScore = (Math.min(100, Math.max(0, roadmapProgress)) / 100) * 20;
    score += progressScore;

    // 4. Market Demand (10%)
    let demandScore = 0;
    const demandLevel = normalizeSkill(career.demandLevel);
    if (demandLevel.includes('very high')) {
        demandScore = 10;
    } else if (demandLevel.includes('high')) {
        demandScore = 8;
    } else if (demandLevel.includes('medium')) {
        demandScore = 5;
    } else if (demandLevel.includes('low')) {
        demandScore = 2;
    } else {
        demandScore = 5; // Default average
    }
    score += demandScore;

    // Deduct slightly for weak skills if they overlap with required skills
    const weakSkillsNormalized = weakSkills.map(normalizeSkill);
    const overlapsWithWeaknesses = requiredSkills.filter(reqSkill => weakSkillsNormalized.includes(normalizeSkill(reqSkill)));
    if (overlapsWithWeaknesses.length > 0) {
        score -= (overlapsWithWeaknesses.length * 2); // 2 points penalty per matching weak skill
    }

    // Estimate Time (Weighted based on skill complexity heuristics)
    let estimatedMonths = 0;
    missingSkills.forEach(skill => {
        const lower = skill.toLowerCase();
        if (['aws', 'kubernetes', 'c++', 'rust', 'machine learning', 'data science', 'docker'].some(k => lower.includes(k))) {
            estimatedMonths += 1.5;
        } else if (['html', 'css', 'figma', 'git', 'ui'].some(k => lower.includes(k))) {
            estimatedMonths += 0.5;
        } else {
            estimatedMonths += 1;
        }
    });
    estimatedMonths = Math.ceil(estimatedMonths);
    const estimatedTime = estimatedMonths === 0 
        ? "Ready now" 
        : `${estimatedMonths} ${estimatedMonths === 1 ? 'month' : 'months'}`;

    return {
        career: career.title,
        careerId: career._id,
        matchScore: Math.max(0, Math.min(100, Math.round(score))),
        missingSkills,
        estimatedTime
    };
}

/**
 * Generates an AI explanation for a predicted career using Grok.
 */
async function generatePredictionExplanation(prediction, userSkillsText) {
    const prompt = `You are an expert career advisor AI.
The user has the following skills: ${userSkillsText || 'None specified'}.
The system predicted this suitable career path: ${prediction.career}.
The user is missing these skills for the role: ${prediction.missingSkills.join(', ') || 'None'}.

Provide a concise, encouraging explanation (2-3 sentences max) explaining why this career is a good fit and what they should focus on learning next to close the gap. Do not use markdown formatting.`;

    try {
        const reply = await routeAIRequest('prediction', prompt, "Explain my career prediction.");
        return reply || "It looks like a good match! Focus on learning the missing skills to advance.";
    } catch (error) {
        console.error(`[AI Prediction] Error generating explanation for ${prediction.career}:`, error.message);
        return "Focus on closing your skill gaps to successfully transition into this role.";
    }
}

/**
 * Predicts the top 3 careers for a user based on their platform data.
 */
exports.predictUserCareers = async (userId) => {
    // 1. Fetch User Data
    const userProfile = await Profile.findOne({ user: userId });
    if (!userProfile) {
        console.warn(`[AI Prediction] User profile not found for user: ${userId}. Returning empty predictions.`);
        return []; // Gracefully handle users lacking profiles
    }

    // 2. Fetch Roadmap Progress
    let roadmapProgress = 0;
    const roadmap = await Roadmap.findOne({ user: userId }).sort({ createdAt: -1 });
    if (roadmap && roadmap.roadmapPhases) {
        // Calculate percentage of completed skills
        let totalSkills = 0;
        let completedSkills = 0;
        roadmap.roadmapPhases.forEach(phase => {
            if (phase.skills) {
                totalSkills += phase.skills.length;
                completedSkills += phase.skills.filter(s => s.status === 'completed').length;
            }
        });
        if (totalSkills > 0) {
            roadmapProgress = Math.round((completedSkills / totalSkills) * 100);
        }
    }

    // 3. Fetch Weak Skills (Mistake Tracking)
    let weakSkills = [];
    const mistakes = await Mistake.aggregate([
        { $match: { userId, status: 'open' } },
        { $group: { _id: '$skillTag', count: { $sum: '$count' } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);
    weakSkills = mistakes.map(m => m._id);

    // 4. Fetch All Careers
    const careers = await Career.find();
    if (!careers || careers.length === 0) {
        return []; // No careers in DB
    }

    // 5. Calculate Scores
    const predictions = careers.map(career => {
        return calculateCareerScore(career, userProfile, roadmapProgress, weakSkills);
    });

    // 6. Sort by highest score and take Top 3
    predictions.sort((a, b) => b.matchScore - a.matchScore);
    const topPredictions = predictions.slice(0, 3);

    // 7. Enrich with AI Explanations
    const userSkillsText = userProfile.skills ? userProfile.skills.join(', ') : '';
    
    // We execute these in parallel for performance
    const explainedPredictions = await Promise.all(
        topPredictions.map(async (pred) => {
            const explanation = await generatePredictionExplanation(pred, userSkillsText);
            return {
                ...pred,
                aiExplanation: explanation
            };
        })
    );

    return explainedPredictions;
};
