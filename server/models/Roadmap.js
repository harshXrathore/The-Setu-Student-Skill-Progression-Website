const mongoose = require('mongoose');

const roadmapSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    goal: {
        type: String,
        required: true
    },
    roadmapPhases: [{
        phase: String,
        duration: String,
        skills: [{
            name: String,
            status: {
                type: String,
                enum: ['pending', 'in-progress', 'completed', 'verified'],
                default: 'pending'
            },
            type: { type: String },
            hours: Number
        }]
    }],
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
module.exports = Roadmap;
