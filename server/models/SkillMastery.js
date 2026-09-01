const mongoose = require('mongoose');

const skillMasterySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    skillName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    category: {
        type: String,
        default: 'General'
    },
    masteryScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    level: {
        type: String,
        enum: ['Beginner', 'Developing', 'Proficient', 'Mastered'],
        default: 'Beginner'
    },
    confidenceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },
    assessmentScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    assessmentCount: {
        type: Number,
        default: 0
    },
    mistakeRate: {
        type: Number,
        default: 0
    },
    mistakeCount: {
        type: Number,
        default: 0
    },
    practiceCount: {
        type: Number,
        default: 0
    },
    lastPracticedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    estimatedHours: {
        type: Number,
        default: 10
    },
    actualHours: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['locked', 'pending', 'in-progress', 'completed', 'verified', 'mastered', 'remediation'],
        default: 'pending'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockedReason: {
        type: String,
        default: ''
    },
    prerequisites: [{
        type: String
    }],
    resources: [{
        title: String,
        url: String,
        type: { type: String, default: 'course' }
    }]
}, {
    timestamps: true
});

// Ensure a user only has one mastery record per skill
skillMasterySchema.index({ userId: 1, skillName: 1 }, { unique: true });
skillMasterySchema.index({ userId: 1, masteryScore: -1 });

module.exports = mongoose.model('SkillMastery', skillMasterySchema);
