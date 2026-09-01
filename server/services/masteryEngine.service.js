const mongoose = require('mongoose');
const SkillMastery = require('../models/SkillMastery');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Mistake = require('../models/Mistake');
const UserCourseProgress = require('../models/UserCourseProgress');
const Course = require('../models/Course');

/**
 * Mastery Engine Service
 * Calculates numerical skill mastery (0-100) based on weighted learner signals:
 * - Assessment performance: 50%
 * - Mistake performance / penalty: 25%
 * - Course / lesson completion: 15%
 * - Practice consistency & recency: 10%
 */

// Configurable constants
const MASTERY_WEIGHTS = {
    ASSESSMENT: 0.50,
    MISTAKE: 0.25,
    COMPLETION: 0.15,
    PRACTICE: 0.10
};

const MASTERY_THRESHOLDS = {
    BEGINNER_MAX: 39,
    DEVELOPING_MAX: 69,
    PROFICIENT_MAX: 84,
    MASTERED_MIN: 85,
    PREREQUISITE_MIN: 70
};

class MasteryEngineService {
    /**
     * Map a numerical score to a human-readable mastery level
     * @param {number} score 0-100
     * @returns {'Beginner' | 'Developing' | 'Proficient' | 'Mastered'}
     */
    getMasteryLevel(score) {
        const clamped = Math.max(0, Math.min(100, Math.round(score || 0)));
        if (clamped < 40) return 'Beginner';
        if (clamped < 70) return 'Developing';
        if (clamped < 85) return 'Proficient';
        return 'Mastered';
    }

    /**
     * Calculate mastery score deterministically using weighted signals
     * @param {Object} signals
     * @returns {number} clamped 0-100
     */
    calculateMasteryScore({
        assessmentScore = 0,
        hasAssessment = false,
        mistakeCount = 0,
        resolvedMistakeCount = 0,
        isCompleted = false,
        progressPercentage = 0,
        practiceCount = 0,
        lastPracticedAt = null
    } = {}) {
        // 1. Assessment component (0-100)
        let assessmentComponent = 0;
        if (hasAssessment || assessmentScore !== 0) {
            assessmentComponent = Math.max(0, Math.min(100, assessmentScore));
        } else if (isCompleted) {
            assessmentComponent = 70;
        } else if (progressPercentage > 0) {
            assessmentComponent = Math.min(60, progressPercentage * 0.6);
        } else {
            assessmentComponent = 0;
        }

        // 2. Mistake component (0-100, 100 = 0 mistakes or all resolved)
        // High open mistakes drastically reduce this component
        let mistakePenalty = Math.max(0, mistakeCount) * 12; // Each open mistake deducts 12 points
        let resolutionBonus = Math.max(0, resolvedMistakeCount) * 5; // Resolved mistakes give resilience points
        let mistakeScore = (mistakeCount === 0 && resolvedMistakeCount === 0 && !hasAssessment && !isCompleted && progressPercentage === 0)
            ? 0
            : Math.max(0, Math.min(100, 100 - mistakePenalty + resolutionBonus));

        // 3. Completion / Progress component (0-100)
        let completionScore = isCompleted ? 100 : Math.max(0, Math.min(100, progressPercentage));

        // 4. Practice consistency component (0-100)
        // More practice sessions and recency increase this score
        let practiceScore = Math.min(100, (practiceCount || 0) * 20);
        if (lastPracticedAt) {
            const daysSinceLastPractice = Math.floor((Date.now() - new Date(lastPracticedAt).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceLastPractice <= 3) {
                practiceScore = Math.min(100, practiceScore + 30); // High recency bonus
            } else if (daysSinceLastPractice <= 7) {
                practiceScore = Math.min(100, practiceScore + 15);
            }
        }
        practiceScore = Math.max(0, Math.min(100, practiceScore));

        // Weighted total
        const totalScore = 
            (assessmentComponent * MASTERY_WEIGHTS.ASSESSMENT) +
            (mistakeScore * MASTERY_WEIGHTS.MISTAKE) +
            (completionScore * MASTERY_WEIGHTS.COMPLETION) +
            (practiceScore * MASTERY_WEIGHTS.PRACTICE);

        return Math.max(0, Math.min(100, Math.round(totalScore)));
    }

    /**
     * Recalculates and persists a user's mastery for a specific skill
     * @param {string} userId
     * @param {string} skillName
     * @returns {Promise<Object>} Updated SkillMastery doc
     */
    async recalculateUserSkillMastery(userId, skillName) {
        if (!userId || !skillName) return null;

        const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
        const normalizedSkill = skillName.trim();
        const skillRegex = new RegExp(`^${normalizedSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

        // 1. Fetch latest assessment attempts for this skill
        const attempts = await AssessmentAttempt.find({
            userId: userObjId,
            skill: { $regex: skillRegex }
        }).sort({ createdAt: -1 }).limit(5);

        let assessmentScore = 0;
        let hasAssessment = false;
        let assessmentCount = attempts.length;

        if (attempts.length > 0) {
            hasAssessment = true;
            // Weighted average giving highest weight to the most recent attempt
            const weights = [0.5, 0.25, 0.15, 0.05, 0.05];
            let totalWeight = 0;
            let weightedSum = 0;
            attempts.forEach((att, idx) => {
                const w = weights[idx] || 0.05;
                weightedSum += att.score * w;
                totalWeight += w;
            });
            assessmentScore = Math.round(weightedSum / totalWeight);
        }

        // 2. Fetch open & resolved mistakes for this skill
        const openMistakes = await Mistake.find({
            userId: userObjId,
            skillTag: { $regex: skillRegex },
            status: 'open'
        });
        const resolvedMistakes = await Mistake.find({
            userId: userObjId,
            skillTag: { $regex: skillRegex },
            status: 'resolved'
        });

        const mistakeCount = openMistakes.reduce((acc, m) => acc + (m.count || 1), 0);
        const resolvedMistakeCount = resolvedMistakes.reduce((acc, m) => acc + (m.count || 1), 0);
        const mistakeRate = (mistakeCount + resolvedMistakeCount) > 0 
            ? Math.round((mistakeCount / (mistakeCount + resolvedMistakeCount)) * 100) 
            : 0;

        // 3. Fetch Course progress relating to this skill
        const courses = await Course.find({
            $or: [
                { skillTag: { $regex: skillRegex } },
                { title: { $regex: skillRegex } }
            ]
        }).select('_id');

        let isCompleted = false;
        let progressPercentage = 0;
        let userProgressListCount = 0;

        if (courses.length > 0) {
            const courseIds = courses.map(c => c._id);
            const userProgressList = await UserCourseProgress.find({
                userId: userObjId,
                courseId: { $in: courseIds }
            });
            userProgressListCount = userProgressList.length;

            if (userProgressList.length > 0) {
                const completedCount = userProgressList.filter(p => p.status === 'completed').length;
                if (completedCount > 0) isCompleted = true;
                progressPercentage = Math.round(
                    userProgressList.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / userProgressList.length
                );
            }
        }

        // 4. Practice metrics
        const practiceCount = attempts.length + userProgressListCount;
        const lastPracticedAt = attempts.length > 0 ? attempts[0].createdAt : new Date();

        // 5. Calculate numerical score
        const masteryScore = this.calculateMasteryScore({
            assessmentScore,
            hasAssessment,
            mistakeCount,
            resolvedMistakeCount,
            isCompleted,
            progressPercentage,
            practiceCount,
            lastPracticedAt
        });

        const level = this.getMasteryLevel(masteryScore);

        // Determine status
        let status = 'pending';
        if (masteryScore >= MASTERY_THRESHOLDS.MASTERED_MIN) {
            status = 'mastered';
        } else if (masteryScore >= 70 || isCompleted) {
            status = 'completed';
        } else if (masteryScore > 0 || progressPercentage > 0 || attempts.length > 0) {
            status = 'in-progress';
        }

        // 6. Upsert SkillMastery document
        const updated = await SkillMastery.findOneAndUpdate(
            { userId: userObjId, skillName: normalizedSkill },
            {
                $set: {
                    masteryScore,
                    level,
                    assessmentScore,
                    assessmentCount,
                    mistakeCount,
                    mistakeRate,
                    practiceCount,
                    lastPracticedAt,
                    status,
                    ...(isCompleted ? { completedAt: new Date() } : {})
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return updated;
    }

    /**
     * Get a map of skillName (lowercase) -> SkillMastery doc for a user
     * @param {string} userId
     * @returns {Promise<Map<string, Object>>}
     */
    async getSkillMasteryMap(userId) {
        const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
        const masteries = await SkillMastery.find({ userId: userObjId });
        const map = new Map();
        masteries.forEach(m => {
            map.set(m.skillName.toLowerCase(), m);
        });
        return map;
    }

    /**
     * Get dashboard mastery summary and intelligence metrics
     * @param {string} userId
     * @returns {Promise<Object>}
     */
    async getUserMasterySummary(userId) {
        const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
        const masteries = await SkillMastery.find({ userId: userObjId }).sort({ masteryScore: -1 });

        if (masteries.length === 0) {
            return {
                overallMastery: 0,
                level: 'Beginner',
                totalSkillsTracked: 0,
                skillsMasteredCount: 0,
                skillGapsCount: 0,
                learningVelocity: 0,
                strongestSkills: [],
                weakestSkills: [],
                distribution: {
                    Beginner: 0,
                    Developing: 0,
                    Proficient: 0,
                    Mastered: 0
                }
            };
        }

        const totalScore = masteries.reduce((sum, m) => sum + (m.masteryScore || 0), 0);
        const overallMastery = Math.round(totalScore / masteries.length);
        const level = this.getMasteryLevel(overallMastery);

        const distribution = {
            Beginner: masteries.filter(m => m.level === 'Beginner').length,
            Developing: masteries.filter(m => m.level === 'Developing').length,
            Proficient: masteries.filter(m => m.level === 'Proficient').length,
            Mastered: masteries.filter(m => m.level === 'Mastered').length
        };

        const strongestSkills = masteries.slice(0, 4).map(m => ({
            name: m.skillName,
            masteryScore: m.masteryScore,
            level: m.level
        }));

        const weakestSkills = [...masteries]
            .filter(m => m.masteryScore < 70)
            .sort((a, b) => a.masteryScore - b.masteryScore)
            .slice(0, 4)
            .map(m => ({
                name: m.skillName,
                masteryScore: m.masteryScore,
                level: m.level,
                mistakeCount: m.mistakeCount
            }));

        const skillsMasteredCount = distribution.Mastered;
        const skillGapsCount = distribution.Beginner + distribution.Developing;

        // Estimate velocity from recent 7 days of assessment improvements
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentAttempts = await AssessmentAttempt.find({
            userId: userObjId,
            createdAt: { $gte: sevenDaysAgo }
        });
        
        // Velocity calculation: +X% mastery this week
        const learningVelocity = recentAttempts.length > 0
            ? Math.min(25, Math.round(recentAttempts.length * 3.5))
            : 0;

        return {
            overallMastery,
            level,
            totalSkillsTracked: masteries.length,
            skillsMasteredCount,
            skillGapsCount,
            learningVelocity,
            strongestSkills,
            weakestSkills,
            distribution
        };
    }
}

// Export singleton instance and constants
module.exports = new MasteryEngineService();
module.exports.MASTERY_WEIGHTS = MASTERY_WEIGHTS;
module.exports.MASTERY_THRESHOLDS = MASTERY_THRESHOLDS;
