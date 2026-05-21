const Mistake = require('../models/Mistake');
const Course = require('../models/Course');

class MistakeAnalysisService {
    /**
     * Fetches and aggregates all open mistakes by skillTag for a specific user
     * @param {string} userId - The unique identifier for the user
     * @returns {Object} { weakSkillsSorted: [], countsBySkill: {} }
     */
    async analyzeUserMistakes(userId) {
        const mongoose = require('mongoose');
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
            userId
        }).sort({ severity: -1, createdAt: -1 }).limit(30);

        // Fetch total document count mapping
        const totalOpenMistakes = await Mistake.countDocuments({ userId, status: 'open' });

        return {
            weakSkillsSorted,
            countsBySkill,
            severityPointsBySkill,
            totalOpenMistakes,
            mistakeRecords
        };
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
        }).sort({ rating: -1 }).limit(3); // Match UI bound parameters

        return recommendedCourses;
    }
    /**
     * Generates visual aggregations for mistake tracking
     * @param {string} userId - The unique identifier for the user
     */
    async getVisualAggregations(userId) {
        const mongoose = require('mongoose');
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
            { $group: { _id: "$status", count: { $sum: 1 } } }, // count the actual entries for status
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
