const mongoose = require('mongoose');

const roleGuideSchema = mongoose.Schema({
    roleName: {
        type: String,
        required: true,
        unique: true,
        index: true // Indexed for text search
    },
    description: {
        type: String,
        required: true
    },
    mustHaveSkills: [String], // Key technologies that MUST be in the roadmap
    careerPath: String, // Description of typical progression (Junior -> Senior)
    resources: [{
        title: String,
        url: String,
        type: { type: String, enum: ['course', 'doc', 'book'] }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create text index for searching by role name
roleGuideSchema.index({ roleName: 'text' });

const RoleGuide = mongoose.model('RoleGuide', roleGuideSchema);
module.exports = RoleGuide;
