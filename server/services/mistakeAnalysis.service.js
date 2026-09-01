const mongoose = require('mongoose');
const Mistake = require('../models/Mistake');
const Course = require('../models/Course');
const SkillMastery = require('../models/SkillMastery');

class MistakeAnalysisService {
    /**
     * Fetches and aggregates all open mistakes by skillTag for a specific user
     * @param {string} userId - The unique identifier for the user
     * @returns {Object} { weakSkillsSorted: [], countsBySkill: {}, severityPointsBySkill: {}, totalOpenMistakes, mistakeRecords }
     */
    async analyzeUserMistakes(userId) {
        const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

        // Perform computation efficiently in MongoDB via Aggregation Pipeline
        const statsAggregation = await Mistake.aggregate([
            { $match: { userId: userObjId, status: 'open' } },
            { $group: {
                _id: "$skillTag",
                count: { $sum: { $ifNull: ["$count", 1] } },
                severityPoints: { $sum: { $multiply: ["$severity", { $ifNull: ["$count", 1] }] } }
            }},
            { $sort: { severityPoints: -1 } }
        ]);

        const countsBySkill = {};
        const severityPointsBySkill = {};
        const weakSkillsSorted = [];

        statsAggregation.forEach(doc => {
            if (doc._id) {
                countsBySkill[doc._id] = doc.count;
                severityPointsBySkill[doc._id] = doc.severityPoints;
                weakSkillsSorted.push(doc._id);
            }
        });

        // Fetch paginated raw records for the UI Warning Log to prevent blowing up the payload
        const mistakeRecords = await Mistake.find({ 
            userId: userObjId
        }).sort({ severity: -1, createdAt: -1 }).limit(30);

        // Fetch total document count mapping
        const totalOpenMistakes = await Mistake.countDocuments({ userId: userObjId, status: 'open' });

        return {
            weakSkillsSorted,
            countsBySkill,
            severityPointsBySkill,
            totalOpenMistakes,
            mistakeRecords
        };
    }

    /**
     * Reusable Skill-by-Skill Detailed Mistake Analytics
     * Calculates:
     * - mistakeCount
     * - recentMistakes (last 14 days)
     * - trend ('improving' | 'stagnant' | 'deteriorating')
     * - masteryScore
     * - severity ('high' | 'medium' | 'low')
     * @param {string} userId
     * @returns {Promise<Array<{ skill: string, mistakeCount: number, recentMistakes: number, trend: string, masteryScore: number, severity: string }>>}
     */
    async getDetailedSkillMistakeAnalytics(userId) {
        const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        // 1. Batched aggregation per skill for all time + recent
        const [overallStats, recentStats, masteries] = await Promise.all([
            Mistake.aggregate([
                { $match: { userId: userObjId } },
                {
                    $group: {
                        _id: "$skillTag",
                        totalCount: { $sum: { $ifNull: ["$count", 1] } },
                        openCount: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "open"] }, { $ifNull: ["$count", 1] }, 0]
                            }
                        },
                        resolvedCount: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "resolved"] }, { $ifNull: ["$count", 1] }, 0]
                            }
                        },
                        avgSeverity: { $avg: "$severity" }
                    }
                }
            ]),
            Mistake.aggregate([
                { $match: { userId: userObjId, createdAt: { $gte: fourteenDaysAgo } } },
                {
                    $group: {
                        _id: "$skillTag",
                        recentCount: { $sum: { $ifNull: ["$count", 1] } },
                        recentResolved: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "resolved"] }, { $ifNull: ["$count", 1] }, 0]
                            }
                        }
                    }
                }
            ]),
            SkillMastery.find({ userId: userObjId })
        ]);

        const recentMap = new Map();
        recentStats.forEach(r => recentMap.set(r._id, r));

        const masteryMap = new Map();
        masteries.forEach(m => masteryMap.set((m.skillName || '').toLowerCase(), m.masteryScore || 0));

        const analytics = overallStats.map(stat => {
            const skillName = stat._id || 'General';
            const recent = recentMap.get(skillName) || { recentCount: 0, recentResolved: 0 };
            const masteryScore = masteryMap.get(skillName.toLowerCase()) || 0;

            // Trend calculation:
            // If resolved > recentCount -> improving
            // If recentCount is high and openCount is growing -> deteriorating
            // Otherwise stagnant
            let trend = 'stagnant';
            if (stat.resolvedCount > 0 && (recent.recentResolved >= recent.recentCount || recent.recentCount === 0)) {
                trend = 'improving';
            } else if (recent.recentCount >= 3 || stat.openCount >= 5) {
                trend = 'deteriorating';
            }

            // Severity level mapping
            let severity = 'low';
            const avgSev = stat.avgSeverity || 3;
            if (avgSev >= 3.8 || stat.openCount >= 5) {
                severity = 'high';
            } else if (avgSev >= 2.5 || stat.openCount >= 2) {
                severity = 'medium';
            }

            return {
                skill: skillName,
                mistakeCount: stat.openCount,
                totalMistakes: stat.totalCount,
                recentMistakes: recent.recentCount,
                trend,
                masteryScore,
                severity
            };
        });

        // Sort by priority (severity: high first, then mistakeCount descending)
        return analytics.sort((a, b) => {
            const sevScore = { high: 3, medium: 2, low: 1 };
            return (sevScore[b.severity] - sevScore[a.severity]) || (b.mistakeCount - a.mistakeCount);
        });
    }

    /**
     * Determines the prioritized weakest skills and returns matching specific courses
     */
    async recommendCoursesByMistakes(topWeakSkillsSource) {
        // Take top 3 weakest skills directly passing in pre-computed array
        const topWeakSkills = (topWeakSkillsSource || []).slice(0, 3);

        if (topWeakSkills.length === 0) {
            return [];
        }

        // Find courses dynamically tagged with these exact top weak skills
        const recommendedCourses = await Course.find({
            skillTag: { $in: topWeakSkills }
        }).sort({ rating: -1 }).limit(3);

        return recommendedCourses;
    }

    /**
     * Generates visual aggregations for mistake tracking
     * @param {string} userId - The unique identifier for the user
     */
    async getVisualAggregations(userId) {
        const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

        // 1. Mistakes by Skill (Bar Chart)
        const skillDistribution = await Mistake.aggregate([
            { $match: { userId: userObjId } },
            { $group: { _id: "$skillTag", count: { $sum: { $ifNull: ["$count", 1] } } } },
            { $project: { _id: 0, skill: "$_id", count: 1 } },
            { $sort: { count: -1 } }
        ]);

        // 2. Mistakes Over Time (Line Chart) using exact Date formatting for safety
        const mistakeTrend = await Mistake.aggregate([
            { $match: { userId: userObjId } },
            { 
                $group: { 
                    _id: { $dateToString: { format: "%Y-W%V", date: "$createdAt" } }, 
                    count: { $sum: { $ifNull: ["$count", 1] } } 
                } 
            },
            { $sort: { "_id": 1 } },
            { $project: { _id: 0, week: "$_id", count: 1 } }
        ]);

        // 3. Mistakes by Category (Pie Chart)
        const categoryDistribution = await Mistake.aggregate([
            { $match: { userId: userObjId } },
            { $group: { _id: "$category", count: { $sum: { $ifNull: ["$count", 1] } } } },
            { $project: { _id: 0, category: "$_id", count: 1 } }
        ]);

        // 4. Resolution Status (Progress Graph)
        const resolutionStats = await Mistake.aggregate([
            { $match: { userId: userObjId } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } }
        ]);

        return {
            skillDistribution,
            mistakeTrend,
            categoryDistribution,
            resolutionStats
        };
    }
}

module.exports = new MistakeAnalysisService();
