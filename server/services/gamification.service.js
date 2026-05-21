const UserStats = require('../models/UserStats');
const UserActivity = require('../models/UserActivity');
const UserMilestone = require('../models/UserMilestone');

/**
 * Update streak based on lastActiveDate vs today, then add points.
 * Returns the updated UserStats document.
 */
async function addPoints(userId, points) {
    try {
        let stats = await UserStats.findOne({ userId });
        if (!stats) {
            stats = new UserStats({ userId });
        }

        // Update streak
        stats = updateStreak(stats);

        // Add points
        stats.totalPoints = (stats.totalPoints || 0) + points;
        stats.lastActiveDate = new Date();

        await stats.save();
        return stats;
    } catch (err) {
        console.error('[Gamification] addPoints error:', err);
    }
}

/**
 * Checks if streak should increment or reset based on lastActiveDate.
 * Mutates stats doc in-place (does NOT save).
 */
function updateStreak(stats) {
    const now = new Date();
    const last = stats.lastActiveDate ? new Date(stats.lastActiveDate) : null;

    if (!last) {
        stats.dayStreak = 1;
        return stats;
    }

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastStart = new Date(last.getFullYear(), last.getMonth(), last.getDate());
    const diffDays = Math.round((todayStart - lastStart) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Already active today, no change
    } else if (diffDays === 1) {
        stats.dayStreak = (stats.dayStreak || 0) + 1;
    } else {
        // Gap > 1 day — reset streak
        stats.dayStreak = 1;
    }

    return stats;
}

/**
 * Log a user activity event (for the weekly activity chart).
 */
async function logActivity(userId, activityType) {
    try {
        await UserActivity.create({ userId, activityType, date: new Date() });
    } catch (err) {
        console.error('[Gamification] logActivity error:', err);
    }
}

/**
 * Record a journey milestone (idempotent — only records once per milestone).
 */
async function triggerMilestone(userId, milestone) {
    try {
        await UserMilestone.findOneAndUpdate(
            { userId, milestone },
            { userId, milestone, completedAt: new Date() },
            { upsert: true, setDefaultsOnInsert: true }
        );
    } catch (err) {
        // Ignore duplicate key errors (milestone already exists)
        if (err.code !== 11000) {
            console.error('[Gamification] triggerMilestone error:', err);
        }
    }
}

/**
 * Increment a numeric stat field on UserStats (e.g. coursesCompleted, skillsMastered).
 */
async function incrementStat(userId, field, amount = 1) {
    try {
        await UserStats.findOneAndUpdate(
            { userId },
            { $inc: { [field]: amount } },
            { upsert: true }
        );
    } catch (err) {
        console.error('[Gamification] incrementStat error:', err);
    }
}

/**
 * Set a numeric stat field value (e.g. roadmapProgress = 85).
 */
async function setStat(userId, field, value) {
    try {
        await UserStats.findOneAndUpdate(
            { userId },
            { $set: { [field]: value } },
            { upsert: true }
        );
    } catch (err) {
        console.error('[Gamification] setStat error:', err);
    }
}

module.exports = { addPoints, logActivity, triggerMilestone, incrementStat, setStat };
