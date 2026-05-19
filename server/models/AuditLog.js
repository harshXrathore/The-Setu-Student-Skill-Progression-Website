const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'DELETE_USER',
            'PROMOTE_ADMIN',
            'DEMOTE_ADMIN',
            'UPDATE_ROLE_GUIDE',
            'SYSTEM_UPDATE',
            'DELETE_ROADMAP',
            'BROADCAST_SENT',
            'BULK_DELETE',
            'VERIFY_USER',
            'UPDATE_ROADMAP'
        ]
    },
    target: {
        type: String, // e.g., "User: john@example.com" or "Role: Frontend"
        required: true
    },
    details: {
        type: String, // Optional extra info
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
