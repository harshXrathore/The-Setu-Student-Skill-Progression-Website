const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salaryRange: { type: String }, // Rename from salary to salaryRange
    jobType: {                     // Rename from type to jobType
        type: String,
        // Allow external APIs to have variations but standardizing to these if possible
        default: 'Full-time'
    },
    postedDate: { type: Date, default: Date.now }, // Rename from posted to postedDate
    requiredSkills: [String],                      // Rename from skills to requiredSkills
    description: { type: String },
    applicationUrl: { type: String },              // Rename from applyUrl to applicationUrl
    
    // External Integration Fields
    source: {
        type: String,
        enum: ["admin", "adzuna"],
        default: "admin",
        required: true
    },
    externalId: {
        type: String,
        sparse: true, // Allows null/missing for admin jobs, but unique for external APIs if we added unique:true
        index: true
    },

    // Kept from original
    match: { type: Number, default: 0 }, 
    applicants: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
