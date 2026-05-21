const mongoose = require('mongoose');

const userMilestoneSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    milestone: { type: String, required: true }, // e.g., 'First Login', 'Profile Completed', 'First Course Started'
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure a user only earns a milestone once
userMilestoneSchema.index({ userId: 1, milestone: 1 }, { unique: true });

module.exports = mongoose.model('UserMilestone', userMilestoneSchema);
