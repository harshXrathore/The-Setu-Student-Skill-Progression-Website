const SystemSetting = require('../models/SystemSetting');
const AuditLog = require('../models/AuditLog'); // Direct import for logging

// Helper to log without circular dependency constraints if any
const logSettingChange = async (adminId, action, details) => {
    try {
        await AuditLog.create({
            adminId,
            action: 'SYSTEM_UPDATE',
            target: 'Global Settings',
            details: `${action}: ${details}`
        });
    } catch (e) {
        console.error("Audit Log Error:", e);
    }
};

const getSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = await SystemSetting.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = await SystemSetting.create({});
        }

        // Track changes for audit log
        const changes = [];
        if (req.body.maintenanceMode !== undefined && req.body.maintenanceMode !== settings.maintenanceMode) {
            changes.push(`Maintenance Mode: ${req.body.maintenanceMode}`);
        }
        if (req.body.allowRegistrations !== undefined && req.body.allowRegistrations !== settings.allowRegistrations) {
            changes.push(`Registrations: ${req.body.allowRegistrations}`);
        }

        // Update fields
        settings.maintenanceMode = req.body.maintenanceMode ?? settings.maintenanceMode;
        settings.allowRegistrations = req.body.allowRegistrations ?? settings.allowRegistrations;
        settings.supportEmail = req.body.supportEmail || settings.supportEmail;
        settings.announcementBar = req.body.announcementBar || settings.announcementBar;
        settings.updatedAt = Date.now();

        const updatedSettings = await settings.save();

        // Log if there were changes
        if (changes.length > 0) {
            await logSettingChange(req.user._id, 'Updated Settings', changes.join(', '));
        }

        res.json(updatedSettings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Update Failed' });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
