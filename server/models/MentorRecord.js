const mongoose = require('mongoose');

const mentorRecordSchema = new mongoose.Schema({
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: [{
        content: { type: String, required: true },
        date: { type: Date, default: Date.now }
    }],
    assignments: [{
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: Date },
        status: {
            type: String,
            enum: ['pending', 'pending_review', 'completed'],
            default: 'pending'
        },
        assignDate: { type: Date, default: Date.now },
        completedDate: { type: Date },
        attachmentUrl: { type: String },
        attachmentName: { type: String }
    }],
    resources: [{
        title: { type: String, required: true },
        link: { type: String, required: true },
        description: { type: String },
        sharedDate: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Ensure a unique pair of mentor-student has only one active record
mentorRecordSchema.index({ mentor: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('MentorRecord', mentorRecordSchema);
