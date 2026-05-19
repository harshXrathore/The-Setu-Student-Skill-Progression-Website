const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'student', // 'student' or 'mentor'
        enum: ['student', 'mentor']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profile: {
        jobTitle: String,
        bio: String,
        experienceLevel: String,
        interests: [String]
    },
    savedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],
    coursesEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    avatar: {
        type: String, // URL path to the uploaded image
        default: ''
    },
    mentorDetails: {
        rate: String,
        availabilityStatus: String,
        specialties: [String],
        availability: [{
            day: String,
            slots: [{ startTime: String, endTime: String }]
        }]
    },
    isVerifiedMentor: {
        type: Boolean,
        default: false
    },
    lastBroadcastDate: {
        type: Date
    },
    resetPasswordOtp: String,
    resetPasswordOtpExpire: Date,
    verificationOtp: String,
    verificationOtpExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
