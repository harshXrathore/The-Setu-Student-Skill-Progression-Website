const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// A user can only leave one review per course
reviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
