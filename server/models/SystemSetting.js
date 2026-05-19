const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
    // We can use a fixed ID or just query for the first document
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    allowRegistrations: {
        type: Boolean,
        default: true
    },
    supportEmail: {
        type: String,
        default: 'support@careerpath.ai'
    },
    announcementBar: {
        enabled: { type: Boolean, default: false },
        message: { type: String, default: '' }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
