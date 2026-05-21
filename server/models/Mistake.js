const mongoose = require('mongoose');

const mistakeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    description: { type: String },
    skillTag: { type: String, required: true }, // e.g., 'SQL', 'React', 'Networking'
    category: { 
        type: String, 
        enum: ['conceptual', 'syntax', 'logic', 'security', 'time', 'process'],
        default: 'conceptual'
    },
    severity: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    count: { type: Number, default: 1 }, // Optional: Track if same mistake happens multiple times
    source: { 
        type: String, 
        enum: ['quiz', 'assessment', 'course', 'mentor', 'manual'],
        default: 'quiz'
    },
    status: { 
        type: String, 
        enum: ['open', 'resolved'],
        default: 'open' 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Mistake', mistakeSchema);
