const mongoose = require('mongoose');

const questionResponseSchema = new mongoose.Schema({
    questionId: String,
    question: String,
    selectedOption: String,
    correctAnswer: String,
    isCorrect: Boolean,
    topic: String,
    difficulty: String
});

const assessmentAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment'
    },
    skill: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
    },
    questions: [questionResponseSchema],
    correctAnswersCount: {
        type: Number,
        required: true,
        default: 0
    },
    incorrectAnswersCount: {
        type: Number,
        required: true,
        default: 0
    },
    totalQuestions: {
        type: Number,
        required: true,
        default: 0
    },
    score: {
        type: Number,
        required: true, // Percentage 0-100
        min: 0,
        max: 100
    },
    attemptNumber: {
        type: Number,
        default: 1
    },
    timeSpentSeconds: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

assessmentAttemptSchema.index({ userId: 1, skill: 1, createdAt: -1 });

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
