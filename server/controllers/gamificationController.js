const UserStats = require('../models/UserStats');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const UserActivity = require('../models/UserActivity');
const UserMilestone = require('../models/UserMilestone');
const Roadmap = require('../models/Roadmap');

// GET /api/gamification/stats
const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Ensure user has stats (upsert)
        let stats = await UserStats.findOne({ userId });
        if (!stats) {
            stats = await UserStats.create({ userId });
        }

        // Count unlocked badges
        const badgesEarned = await UserBadge.countDocuments({ userId });

        // Calculate overall roadmap progress
        let roadmapProgress = stats.roadmapProgress || 0;
        const roadmap = await Roadmap.findOne({ user: userId }).sort({ createdAt: -1 });
        if (roadmap && roadmap.roadmapPhases && roadmap.roadmapPhases.length > 0) {
            let total = 0, completed = 0;
            roadmap.roadmapPhases.forEach(phase => {
                (phase.skills || []).forEach(skill => {
                    total++;
                    if (skill.status === 'completed' || skill.status === 'verified') completed++;
                });
            });
            roadmapProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

            // Persist it
            if (stats.roadmapProgress !== roadmapProgress) {
                stats.roadmapProgress = roadmapProgress;
                await stats.save();
            }
        }

        res.json({
            dayStreak: stats.dayStreak || 0,
            totalPoints: stats.totalPoints || 0,
            badgesEarned,
            coursesCompleted: stats.coursesCompleted || 0,
            skillsMastered: stats.skillsMastered || 0,
            communityLikes: stats.communityLikes || 0,
            overallProgress: roadmapProgress
        });
    } catch (err) {
        console.error('[Gamification] getUserStats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/gamification/achievements
const getAchievements = async (req, res) => {
    try {
        const userId = req.user.id;
        const userBadges = await UserBadge.find({ userId }).populate('badgeId');

        const unlocked = userBadges.map(ub => ({
            _id: ub.badgeId._id,
            name: ub.badgeId.name,
            description: ub.badgeId.description,
            icon: ub.badgeId.icon,
            unlockedAt: ub.unlockedAt
        }));

        res.json(unlocked);
    } catch (err) {
        console.error('[Gamification] getAchievements error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/gamification/progress
// Returns all badges with user's current progress value
const getAchievementProgress = async (req, res) => {
    try {
        const userId = req.user.id;

        const [stats, allBadges, userBadges] = await Promise.all([
            UserStats.findOne({ userId }),
            Badge.find(),
            UserBadge.find({ userId }).select('badgeId')
        ]);

        const unlockedIds = new Set((userBadges || []).map(ub => ub.badgeId.toString()));
        const s = stats || {};

        const progress = allBadges.map(badge => {
            let current = 0;
            switch (badge.conditionType) {
                case 'streak':   current = s.dayStreak         || 0; break;
                case 'courses':  current = s.coursesCompleted  || 0; break;
                case 'skills':   current = s.skillsMastered    || 0; break;
                case 'likes':    current = s.communityLikes    || 0; break;
                case 'roadmap':  current = s.roadmapProgress   || 0; break;
            }
            return {
                _id: badge._id,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                conditionValue: badge.conditionValue,
                current,
                unlocked: unlockedIds.has(badge._id.toString())
            };
        });

        res.json(progress);
    } catch (err) {
        console.error('[Gamification] getAchievementProgress error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/gamification/activity?period=week|month|year
// Returns activity counts grouped by period
const getActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const period = req.query.period || 'week';
        const now = new Date();

        let startDate, endDate, result;

        if (period === 'week') {
            // Mon–Sun of current week
            const dayOfWeek = now.getDay();
            const monday = new Date(now);
            monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
            monday.setHours(0, 0, 0, 0);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);
            startDate = monday; endDate = sunday;

            const activities = await UserActivity.find({ userId, date: { $gte: startDate, $lte: endDate } });
            const dayCounts = Array(7).fill(0);
            activities.forEach(a => {
                const idx = (new Date(a.date).getDay() + 6) % 7;
                dayCounts[idx]++;
            });
            const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            result = dayLabels.map((label, i) => ({ label, count: dayCounts[i] }));

        } else if (period === 'month') {
            // Sun–Sat weeks in the current calendar month
            const year = now.getFullYear();
            const month = now.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);
            startDate = firstDay; endDate = lastDay;

            const activities = await UserActivity.find({ userId, date: { $gte: startDate, $lte: endDate } });

            // Build week buckets: Week 1, Week 2, Week 3, Week 4 (and Week 5 if month is long)
            const weekBuckets = {};
            activities.forEach(a => {
                const d = new Date(a.date);
                const dayOfMonth = d.getDate();
                const weekNum = Math.ceil(dayOfMonth / 7);
                const key = `Week ${weekNum}`;
                weekBuckets[key] = (weekBuckets[key] || 0) + 1;
            });

            const weeksInMonth = Math.ceil(lastDay.getDate() / 7);
            result = Array.from({ length: weeksInMonth }, (_, i) => {
                const key = `Week ${i + 1}`;
                return { label: key, count: weekBuckets[key] || 0 };
            });

        } else if (period === 'year') {
            // 12 months of the current year
            const year = now.getFullYear();
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31, 23, 59, 59, 999);

            const activities = await UserActivity.find({ userId, date: { $gte: startDate, $lte: endDate } });

            const monthCounts = Array(12).fill(0);
            activities.forEach(a => {
                monthCounts[new Date(a.date).getMonth()]++;
            });
            const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            result = monthLabels.map((label, i) => ({ label, count: monthCounts[i] }));
        } else {
            return res.status(400).json({ message: 'Invalid period. Use week, month, or year.' });
        }

        // Compute total for the period
        const total = result.reduce((sum, r) => sum + r.count, 0);
        res.json({ period, data: result, total });

    } catch (err) {
        console.error('[Gamification] getActivity error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/gamification/milestones
const getMilestones = async (req, res) => {
    try {
        const userId = req.user.id;
        const milestones = await UserMilestone.find({ userId }).sort({ completedAt: 1 });
        res.json(milestones);
    } catch (err) {
        console.error('[Gamification] getMilestones error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUserStats,
    getAchievements,
    getAchievementProgress,
    getActivity,
    getMilestones
};
