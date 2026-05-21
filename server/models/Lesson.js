const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['video', 'article', 'external', 'quiz'],
        required: true
    },
    content: { type: String }, // For internal text/article lessons
    videoUrl: { type: String }, // For embedded videos
    externalUrl: { type: String }, // For external resource links
    order: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
