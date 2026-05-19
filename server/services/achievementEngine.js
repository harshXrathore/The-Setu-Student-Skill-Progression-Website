const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const UserStats = require('../models/UserStats');

/**
 * Default badge definitions — seeded once on server start.
 */
const DEFAULT_BADGES = [
    { name: 'Week Warrior',  description: 'Maintain a 7-day streak',     icon: '🏆', conditionType: 'streak',    conditionValue: 7   },
    { name: 'Quick Learner', description: 'Complete 5 courses',           icon: '⭐', conditionType: 'courses',   conditionValue: 5   },
    { name: 'Goal Setter',   description: 'Set your first career goal',   icon: '🎯', conditionType: 'courses',   conditionValue: 1   },
    { name: 'Skill Builder', description: 'Master 10 skills',             icon: '💪', conditionType: 'skills',    conditionValue: 10  },
    { name: 'Bookworm',      description: 'Complete 20 courses',          icon: '📚', conditionType: 'courses',   conditionValue: 20  },
    { name: 'Rising Star',   description: 'Receive 100 community likes',  icon: '🌟', conditionType: 'likes',     conditionValue: 100 },
    { name: 'Graduate',      description: 'Complete your learning roadmap', icon: '🎓', conditionType: 'roadmap', conditionValue: 100 },
];

/**
 * Seeds default badges into the DB if they don't already exist.
 * Safe to call multiple times.
 */
async function seedBadges() {
    try {
        for (const badge of DEFAULT_BADGES) {
            await Badge.findOneAndUpdate(
                { name: badge.name },
                badge,
                { upsert: true, setDefaultsOnInsert: true }
            );
        }
        console.log('[AchievementEngine] Default badges seeded.');
    } catch (err) {
        console.error('[AchievementEngine] seedBadges error:', err);
    }
}

/**
 * Evaluates all badge conditions against the user's current stats.
 * Unlocks any badges not yet earned.
 * Returns an array of newly unlocked Badge documents.
 */
async function checkAndUnlockBadges(userId) {
    const newlyUnlocked = [];
    try {
        const stats = await UserStats.findOne({ userId });
        if (!stats) return newlyUnlocked;

        const allBadges = await Badge.find();
        const userBadges = await UserBadge.find({ userId }).select('badgeId');
        const unlockedIds = new Set(userBadges.map(ub => ub.badgeId.toString()));

        for (const badge of allBadges) {
            if (unlockedIds.has(badge._id.toString())) continue; // Already unlocked

            let met = false;
            switch (badge.conditionType) {
                case 'streak':   met = (stats.dayStreak || 0)       >= badge.conditionValue; break;
                case 'courses':  met = (stats.coursesCompleted || 0) >= badge.conditionValue; break;
                case 'skills':   met = (stats.skillsMastered || 0)  >= badge.conditionValue; break;
                case 'likes':    met = (stats.communityLikes || 0)  >= badge.conditionValue; break;
                case 'roadmap':  met = (stats.roadmapProgress || 0) >= badge.conditionValue; break;
                default: break;
            }

            if (met) {
                try {
                    await UserBadge.create({ userId, badgeId: badge._id, unlockedAt: new Date() });
                    newlyUnlocked.push(badge);
                } catch (dupErr) {
                    if (dupErr.code !== 11000) throw dupErr; // Ignore race-condition duplicates
                }
            }
        }
    } catch (err) {
        console.error('[AchievementEngine] checkAndUnlockBadges error:', err);
    }
    return newlyUnlocked;
}

module.exports = { seedBadges, checkAndUnlockBadges, DEFAULT_BADGES };
