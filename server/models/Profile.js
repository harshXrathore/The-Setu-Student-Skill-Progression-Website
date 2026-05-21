const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    general: {
        firstName: { type: String },
        lastName: { type: String },
        headline: { type: String },
        bio: { type: String },
        location: { type: String },
        avatar: { type: String },
        phone: { type: String },
        email: { type: String },
        website: { type: String }
    },
    occupation: {
        role: { type: String, enum: ['student', 'mentor', 'professional'], default: 'student' },
        university: { type: String },
        major: { type: String },
        graduationYear: { type: String },
        gpa: { type: String },
        company: { type: String },
        jobTitle: { type: String }
    },
    preferences: {
        desiredRole: { type: String },
        salaryRange: {
            min: { type: Number },
            max: { type: Number },
            currency: { type: String, default: 'USD' }
        },
        workType: { type: String, enum: ['remote', 'hybrid', 'onsite', 'any'] },
        employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'] }
    },
    skills: {
        type: [String],
        default: []
    },
    education: [{
        school: { type: String, required: true },
        degree: { type: String },
        fieldOfStudy: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        description: { type: String }
    }],
    experience: [{
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String }
    }],
    certifications: [{
        name: { type: String, required: true },
        issuingOrganization: { type: String },
        issueDate: { type: Date },
        expirationDate: { type: Date },
        credentialId: { type: String },
        credentialUrl: { type: String }
    }],
    projects: [{
        title: { type: String, required: true },
        description: { type: String },
        url: { type: String },
        startDate: { type: Date },
        endDate: { type: Date }
    }],
    languages: [{
        language: { type: String, required: true },
        proficiency: { type: String, enum: ['Elementary', 'Limited Working', 'Professional Working', 'Full Professional', 'Native or Bilingual'] }
    }],
    socials: {
        linkedin: { type: String },
        github: { type: String },
        twitter: { type: String },
        portfolio: { type: String },
        instagram: { type: String },
        discord: { type: String }
    },
    learningGoals: {
        focus: { type: String },
        weeklyHours: { type: Number },
        learningStyle: { type: String }
    },
    mentorDetails: {
        rate: { type: String }, // e.g. "$50/hr"
        availabilityStatus: {
            type: String,
            enum: ['Available', 'Limited', 'Booked', 'Unavailable'],
            default: 'Available'
        },
        availability: [{
            day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
            slots: [{
                startTime: String, // e.g., "09:00"
                endTime: String    // e.g., "17:00"
            }]
        }],
        specialties: [String],
        rating: { type: Number, default: 0 },
        sessionCount: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
