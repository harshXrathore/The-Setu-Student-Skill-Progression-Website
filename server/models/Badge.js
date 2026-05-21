const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // Emoji or URL
    conditionType: { type: String, required: true }, // e.g., 'streak', 'courses', 'skills', 'likes', 'roadmap'
    conditionValue: { type: Number, required: true } // The threshold to unlock
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
