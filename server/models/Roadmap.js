const mongoose = require('mongoose');

const roadmapSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    goal: {
        type: String,
        required: true
    },
    roadmapPhases: [{
        phase: String,
        duration: String,
        skills: [{
            name: { type: String, required: true },
            status: {
                type: String,
                enum: ['pending', 'in-progress', 'completed', 'verified', 'mastered', 'locked', 'remediation'],
                default: 'pending'
            },
            type: { type: String },
            hours: { type: Number, default: 10 },
            masteryScore: { type: Number, default: 0 },
            level: { type: String, default: 'Beginner' },
            confidenceScore: { type: Number, default: 50 },
            assessmentScore: { type: Number, default: 0 },
            mistakeCount: { type: Number, default: 0 },
            prerequisites: [{ type: String }],
            isBlocked: { type: Boolean, default: false },
            blockedReason: { type: String, default: '' },
            recommendedAction: { type: String, default: '' },
            recommendationReason: { type: String, default: '' },
            courses: [{
                _id: String,
                title: String,
                difficulty: String,
                skillTag: String,
                reason: String
            }]
        }]
    }],
    version: {
        type: Number,
        default: 1
    },
    versionHistory: [{
        version: Number,
        reason: String,
        timestamp: { type: Date, default: Date.now },
        changedSkills: [String],
        summary: String
    }],
    overallMastery: {
        type: Number,
        default: 0
    },
    skillGapsCount: {
        type: Number,
        default: 0
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
module.exports = Roadmap;
