const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dayStreak: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
    skillsMastered: { type: Number, default: 0 },
    communityLikes: { type: Number, default: 0 },
    roadmapProgress: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('UserStats', userStatsSchema);
