const Course = require('../models/Course');
const UserCourseProgress = require('../models/UserCourseProgress');
const SkillMastery = require('../models/SkillMastery');

/**
 * Course Recommendation Service
 * Hybrid Semantic Course Recommendation Engine with Explainability
 */

// Synonym and domain relevance dictionary for semantic expansion
const SEMANTIC_SYNONYMS = {
    'siem': ['wazuh', 'splunk', 'elastic', 'qradar', 'log analysis', 'security monitoring', 'soc', 'sentinel'],
    'threat hunting': ['threat detection', 'malware analysis', 'forensics', 'incident response', 'yara', 'mitre'],
    'penetration testing': ['ethical hacking', 'metasploit', 'burp suite', 'vulnerability assessment', 'kali linux'],
    'frontend development': ['react', 'vue', 'html', 'css', 'javascript', 'tailwind', 'ui'],
    'backend development': ['node.js', 'express', 'databases', 'sql', 'rest api', 'microservices'],
    'databases': ['sql', 'postgresql', 'mongodb', 'mysql', 'schema', 'indexing'],
    'devops': ['docker', 'kubernetes', 'ci/cd', 'terraform', 'jenkins', 'aws', 'cloud'],
    'machine learning': ['deep learning', 'pytorch', 'tensorflow', 'scikit-learn', 'data science', 'pandas']
};

class CourseRecommendationService {
    /**
     * Compute semantic token similarity between target skill and course text
     * @param {string} targetSkill
     * @param {Object} course
     * @returns {number} 0-1 similarity score
     */
    calculateSemanticSimilarity(targetSkill, course) {
        const skillNorm = (targetSkill || '').toLowerCase().trim();
        const titleNorm = (course.title || '').toLowerCase();
        const descNorm = (course.description || '').toLowerCase();
        const tagNorm = (course.skillTag || '').toLowerCase();
        const categoryNorm = (course.category || '').toLowerCase();

        // Direct exact or substring match gives maximum score
        if (tagNorm === skillNorm || titleNorm.includes(skillNorm)) {
            return 1.0;
        }

        // Semantic synonym expansion match
        const synonyms = SEMANTIC_SYNONYMS[skillNorm] || [];
        let synonymMatches = 0;
        for (const syn of synonyms) {
            if (titleNorm.includes(syn) || descNorm.includes(syn) || tagNorm.includes(syn) || categoryNorm.includes(syn)) {
                synonymMatches++;
            }
        }

        if (synonymMatches > 0) {
            return Math.min(0.95, 0.6 + (synonymMatches * 0.15));
        }

        // Word token overlap (Jaccard similarity)
        const skillWords = new Set(skillNorm.split(/\s+/).filter(w => w.length > 2));
        const courseWords = new Set(`${titleNorm} ${descNorm} ${categoryNorm}`.split(/\s+/).filter(w => w.length > 2));

        let intersection = 0;
        for (const word of skillWords) {
            if (courseWords.has(word)) intersection++;
        }

        if (skillWords.size === 0) return 0;
        return Math.min(0.8, (intersection / skillWords.size));
    }

    /**
     * Compute difficulty alignment between user mastery level and course difficulty
     * @param {string} userLevel ('Beginner' | 'Developing' | 'Proficient' | 'Mastered')
     * @param {string} courseDifficulty
     * @returns {number} 0-1 match score
     */
    calculateDifficultyMatch(userLevel, courseDifficulty) {
        const diffNorm = (courseDifficulty || 'beginner').toLowerCase();
        const lvlNorm = (userLevel || 'beginner').toLowerCase();

        if (lvlNorm === 'beginner' && diffNorm.includes('beginner')) return 1.0;
        if (lvlNorm === 'developing' && (diffNorm.includes('intermediate') || diffNorm.includes('beginner'))) return 0.95;
        if (lvlNorm === 'proficient' && (diffNorm.includes('intermediate') || diffNorm.includes('advanced'))) return 1.0;
        if (lvlNorm === 'mastered' && diffNorm.includes('advanced')) return 1.0;

        // Minor mismatch penalty
        return 0.5;
    }

    /**
     * Recommend top courses for a specific skill and user
     * @param {string} userId
     * @param {string} skillName
     * @param {Object} options
     * @returns {Promise<Array<Object>>}
     */
    async recommendCoursesForSkill(userId, skillName, options = { limit: 3 }) {
        const skillNorm = (skillName || '').trim();
        if (!skillNorm) return [];

        // 1. Fetch user's current mastery for this skill
        const mastery = await SkillMastery.findOne({
            userId,
            skillName: new RegExp(`^${skillNorm}$`, 'i')
        });

        const userLevel = mastery ? mastery.level : 'Beginner';
        const masteryScore = mastery ? mastery.masteryScore : 0;
        const isWeak = masteryScore < 70;

        // 2. Fetch user's completed courses to avoid redundant recommendations
        const completedProgress = await UserCourseProgress.find({
            userId,
            status: 'completed'
        }).select('courseId');
        const completedCourseIds = new Set(completedProgress.map(p => p.courseId.toString()));

        // 3. Fetch potential matching courses
        const candidateCourses = await Course.find().limit(50);

        // 4. Score each course
        const scoredCourses = [];

        for (const course of candidateCourses) {
            // Skip already completed courses
            if (completedCourseIds.has(course._id.toString())) continue;

            const semanticRelevance = this.calculateSemanticSimilarity(skillNorm, course);
            if (semanticRelevance < 0.2) continue; // Filter out irrelevant courses

            const difficultyMatch = this.calculateDifficultyMatch(userLevel, course.difficulty);
            const ratingScore = Math.min(1.0, (course.rating || 4.5) / 5.0);
            const skillGapPriority = isWeak ? 1.0 : 0.6;

            // Multi-factor weighted score
            const finalScore = 
                (semanticRelevance * 0.40) +
                (difficultyMatch * 0.25) +
                (ratingScore * 0.15) +
                (skillGapPriority * 0.20);

            // Generate explainable reason
            let reason = `Recommended to build your ${skillNorm} foundation`;
            if (isWeak) {
                reason = `Recommended because it targets ${skillNorm}, your active skill gap (${masteryScore}% mastery), matching your ${userLevel} level.`;
            } else if (masteryScore >= 70) {
                reason = `Recommended to advance your ${skillNorm} proficiency toward mastery.`;
            }

            scoredCourses.push({
                _id: course._id,
                title: course.title,
                description: course.description,
                instructor: course.instructor,
                duration: course.duration,
                difficulty: course.difficulty,
                rating: course.rating || 4.8,
                students: course.students || 0,
                skillTag: course.skillTag || skillNorm,
                category: course.category,
                imageUrl: course.imageUrl,
                courseUrl: course.courseUrl,
                recommendationScore: Math.round(finalScore * 100),
                reason
            });
        }

        // Sort descending by score
        scoredCourses.sort((a, b) => b.recommendationScore - a.recommendationScore);

        return scoredCourses.slice(0, options.limit || 3);
    }

    /**
     * Batched course recommendations for multiple skills
     * @param {string} userId
     * @param {string[]} skillNames
     * @returns {Promise<Record<string, Array>>}
     */
    async recommendCoursesForSkillList(userId, skillNames = []) {
        const result = {};
        for (const skill of skillNames) {
            result[skill] = await this.recommendCoursesForSkill(userId, skill, { limit: 2 });
        }
        return result;
    }
}

module.exports = new CourseRecommendationService();
