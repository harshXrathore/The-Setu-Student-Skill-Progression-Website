const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityType: { type: String, required: true }, // e.g., 'lesson_completed', 'course_completed', 'quiz_attempt', 'mentor_session'
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// Optional: compound index to quickly query a user's activity in a date range
userActivitySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);
