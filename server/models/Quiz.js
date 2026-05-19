const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }, // Should match one of the options exactly, or index
    skillTag: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    type: { type: String, enum: ['conceptual', 'syntax', 'logic', 'security', 'time', 'process'], default: 'conceptual' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
