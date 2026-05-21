const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ['Career Advice', 'Learning', 'Technical Help', 'General'],
        default: 'General'
    },
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    // We can add a separate Comment model later, for now just counting
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
