const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionId: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        default: ''
    },
    topic: {
        type: String,
        default: 'General'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    }
});

const assessmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    skill: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    category: {
        type: String,
        default: 'General'
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
    },
    questions: [questionSchema],
    isSystem: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

assessmentSchema.index({ skill: 1, difficulty: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
