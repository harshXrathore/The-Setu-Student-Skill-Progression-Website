const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    instructor: { type: String, required: true }, // Could be a ref to User if we want
    duration: { type: String }, // e.g. "12 hours"
    skillTag: { type: String },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'Beginner', 'Intermediate', 'Advanced'],
        default: 'beginner'
    },
    provider: { type: String },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    recommendedFor: [{ type: String }],
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    totalLessons: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
    category: { type: String, required: true }, // Frontend, Backend, DevOps, etc.
    imageUrl: { type: String },
    courseUrl: { type: String },
    enforceOrder: { type: Boolean, default: false } // Determines if lessons must be taken in order
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
