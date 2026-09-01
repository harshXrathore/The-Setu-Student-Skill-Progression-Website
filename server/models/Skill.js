const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    category: { 
        type: String,
        default: 'General'
    },
    description: {
        type: String,
        default: ''
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
    },
    prerequisites: [{ 
        type: String 
    }],
    dependents: [{ 
        type: String 
    }],
    relatedSkills: [{ 
        type: String 
    }]
}, {
    timestamps: true
});


module.exports = mongoose.model('Skill', skillSchema);
