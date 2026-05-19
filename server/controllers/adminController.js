const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const RoleGuide = require('../models/RoleGuide');
const AuditLog = require('../models/AuditLog');
const Job = require('../models/Job');
const Course = require('../models/Course');
const Post = require('../models/Post');

// Helper to log admin actions
const logAction = async (adminId, action, target, details = '') => {
    try {
        await AuditLog.create({
            adminId,
            action,
            target,
            details
        });
    } catch (error) {
        console.error("Failed to create audit log:", error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 }); // Newest first
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            await logAction(req.user._id, 'DELETE_USER', `User: ${user.email} (${user.name})`);
            // Also delete their roadmaps? Optional but good for cleanup
            await Roadmap.deleteMany({ user: req.params.id });
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all roadmaps
// @route   GET /api/admin/roadmaps
// @access  Private/Admin
const getAllRoadmaps = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const totalRoadmaps = await Roadmap.countDocuments(query);
        const totalPages = Math.ceil(totalRoadmaps / limit);

        const roadmaps = await Roadmap.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            roadmaps,
            page,
            totalPages,
            totalRoadmaps
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete roadmap
// @route   DELETE /api/admin/roadmaps/:id
// @access  Private/Admin
const deleteRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findById(req.params.id);

        if (roadmap) {
            await roadmap.deleteOne();
            await logAction(req.user._id, 'DELETE_ROADMAP', `Roadmap ID: ${req.params.id}`);
            res.json({ message: 'Roadmap removed' });
        } else {
            res.status(404).json({ message: 'Roadmap not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Export roadmaps as CSV
// @route   GET /api/admin/roadmaps/export
// @access  Private/Admin
const exportRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find().populate('user', 'name email');

        let csv = 'ID,Title,User,Email,Status,Goal,Phases Count,Phase Information,Created At\n';

        roadmaps.forEach(roadmap => {
            const id = roadmap._id;
            const title = `"${roadmap.title.replace(/"/g, '""')}"`;
            const user = roadmap.user ? `"${roadmap.user.name.replace(/"/g, '""')}"` : '"Unknown"';
            const email = roadmap.user ? `"${roadmap.user.email.replace(/"/g, '""')}"` : '"Unknown"';
            const status = roadmap.status || 'pending';
            const goal = `"${(roadmap.goal || '').replace(/"/g, '""').substring(0, 100)}..."`;
            const phasesCount = roadmap.roadmapPhases ? roadmap.roadmapPhases.length : 0;

            // Generate detailed phase info
            const phaseInfo = roadmap.roadmapPhases ? roadmap.roadmapPhases.map((p, i) => {
                const phaseName = p.phase || p.phaseTitle || `Phase ${i + 1}`;
                const skills = p.skills ? p.skills.map(s => s.name || s).join(', ') : 'No skills';
                return `[${phaseName}: ${skills}]`;
            }).join('; ') : '';
            const phaseInfoEscaped = `"${phaseInfo.replace(/"/g, '""')}"`;

            const createdAt = new Date(roadmap.createdAt).toLocaleDateString();

            csv += `${id},${title},${user},${email},${status},${goal},${phasesCount},${phaseInfoEscaped},${createdAt}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename="roadmaps-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a role guide
// @route   DELETE /api/admin/roleguide/:id
// @access  Private/Admin
const deleteRoleGuide = async (req, res) => {
    try {
        const guide = await RoleGuide.findById(req.params.id);

        if (guide) {
            await guide.deleteOne();
            await logAction(req.user._id, 'UPDATE_ROLE_GUIDE', `Deleted guide: ${guide.roleName}`);
            res.json({ message: 'Role guide removed' });
        } else {
            res.status(404).json({ message: 'Role guide not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Bulk delete roadmaps
// @route   POST /api/admin/roadmaps/bulk-delete
// @access  Private/Admin
const bulkDeleteRoadmaps = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No roadmap IDs provided' });
        }

        const result = await Roadmap.deleteMany({ _id: { $in: ids } });

        await logAction(
            req.user._id,
            'BULK_DELETE',
            `Deleted ${result.deletedCount} roadmaps`
        );

        res.json({ message: `Successfully deleted ${result.deletedCount} roadmaps` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update roadmap details
// @route   PUT /api/admin/roadmaps/:id
// @access  Private/Admin
const updateRoadmap = async (req, res) => {
    try {
        const { title, goal, status, roadmapPhases } = req.body;
        const roadmap = await Roadmap.findById(req.params.id);

        if (roadmap) {
            roadmap.title = title || roadmap.title;
            roadmap.goal = goal || roadmap.goal;
            roadmap.status = status || roadmap.status;

            if (roadmapPhases) {
                roadmap.roadmapPhases = roadmapPhases;
            }

            const updatedRoadmap = await roadmap.save();
            await logAction(req.user._id, 'UPDATE_ROADMAP', `Roadmap ID: ${updatedRoadmap._id}`);

            res.json(updatedRoadmap);
        } else {
            res.status(404).json({ message: 'Roadmap not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create or Update Role Guide
// @route   POST /api/admin/roleguide
// @access  Private/Admin
const createRoleGuide = async (req, res) => {
    const { _id, roleName, description, mustHaveSkills, careerPath, resources } = req.body;

    try {
        let guide = null;
        if (_id) guide = await RoleGuide.findById(_id);
        if (!guide) guide = await RoleGuide.findOne({ roleName });

        if (guide) {
            // Update
            guide.roleName = roleName || guide.roleName;
            guide.description = description || guide.description;
            guide.mustHaveSkills = mustHaveSkills || guide.mustHaveSkills;
            guide.careerPath = careerPath || guide.careerPath;
            guide.resources = resources || guide.resources;

            const updatedGuide = await guide.save();
            res.json(updatedGuide);
        } else {
            // Create
            const newGuide = await RoleGuide.create({
                roleName,
                description,
                mustHaveSkills,
                careerPath,
                resources
            });
            res.status(201).json(newGuide);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all role guides
// @route   GET /api/admin/roleguide
// @access  Private/Admin
const getAllRoleGuides = async (req, res) => {
    try {
        const guides = await RoleGuide.find({}).sort({ roleName: 1 });
        res.json(guides);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle user admin status
// @route   PUT /api/admin/users/:id/make-admin
// @access  Private/Admin
const toggleUserAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isAdmin = !user.isAdmin;
            const updatedUser = await user.save();

            await logAction(
                req.user._id,
                updatedUser.isAdmin ? 'PROMOTE_ADMIN' : 'DEMOTE_ADMIN',
                `User: ${updatedUser.email}`
            );

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('adminId', 'name email')
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const Notification = require('../models/Notification');

const sendBroadcast = async (req, res) => {
    const { title, message, type = 'info', targetRole = 'all' } = req.body;

    if (!title || !message) {
        return res.status(400).json({ message: 'Title and message are required' });
    }

    try {
        // 1. Build Query
        const query = {};
        if (targetRole !== 'all') {
            query.role = targetRole;
        }

        // 2. Get user IDs
        const users = await User.find(query, '_id');

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found for this target audience' });
        }

        // 3. Prepare notifications array
        const notifications = users.map(user => ({
            recipient: user._id,
            title,
            message,
            type
        }));

        // 4. Bulk insert for performance
        await Notification.insertMany(notifications);

        // 5. Log the action
        await logAction(
            req.user._id,
            'BROADCAST_SENT',
            `Sent to ${users.length} users (${targetRole}): ${title}`
        );

        res.json({ message: `Broadcast sent successfully to ${users.length} users.` });

    } catch (error) {
        console.error("Broadcast failed:", error);
        res.status(500).json({ message: 'Failed to send broadcast' });
    }
};

const bulkDeleteUsers = async (req, res) => {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'No users selected' });
    }

    try {
        // 1. Delete users
        const result = await User.deleteMany({ _id: { $in: userIds } });

        // 2. Log Action
        await logAction(
            req.user._id,
            'BULK_DELETE',
            `Deleted ${result.deletedCount} users`,
            `IDs: ${userIds.join(', ')}`
        );

        res.json({ message: `Successfully deleted ${result.deletedCount} users` });
    } catch (error) {
        console.error("Bulk delete failed:", error);
        res.status(500).json({ message: 'Bulk delete failed' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalRoadmaps = await Roadmap.countDocuments({});
        const activeRoles = await RoleGuide.countDocuments({});

        // Count users created today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: startOfDay } });

        // 1. User Growth (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const userGrowthRaw = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    users: { $sum: 1 },
                    // Mock "Active" users as 70% of total for now (until we have lastLogin)
                    active: { $sum: { $cond: [{ $gte: [{ $rand: {} }, 0.3] }, 1, 0] } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Format for Recharts (e.g., "Jan", "Feb")
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const userGrowth = userGrowthRaw.map(item => ({
            month: monthNames[item._id.month - 1],
            users: item.users,
            active: item.active
        }));

        // 2. Role Distribution
        const roleDistRaw = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    value: { $sum: 1 }
                }
            }
        ]);

        // Map roles to colors
        const roleColors = {
            "student": "#3b82f6", // Blue
            "mentor": "#8b5cf6",  // Purple
            "admin": "#10b981"    // Green
        };

        const roleDistribution = roleDistRaw.map(item => ({
            name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
            value: item.value,
            color: roleColors[item._id] || "#64748b"
        }));

        res.json({
            totalUsers,
            totalRoadmaps,
            activeRoles,
            newUsersToday,
            totalJobs: await Job.countDocuments({}),
            totalCourses: await Course.countDocuments({}),
            totalPosts: await Post.countDocuments({}),
            charts: {
                userGrowth,
                roleDistribution
            }
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};

// @desc    Verify a mentor
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
const verifyMentor = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isVerified = true;
            if (user.role === 'mentor') {
                user.isVerifiedMentor = true;
            }
            await user.save();

            // Log Action
            await logAction(
                req.user._id,
                'VERIFY_USER',
                `Verified user: ${user.name}`,
                `User ID: ${user._id}`
            );

            res.json({ message: 'User verified successfully', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a role guide by ID
// @route   PUT /api/admin/roleguide/:id
// @access  Private/Admin
const updateRoleGuide = async (req, res) => {
    try {
        const guide = await RoleGuide.findById(req.params.id);
        if (!guide) {
            return res.status(404).json({ message: 'Role guide not found' });
        }
        const { roleName, description, mustHaveSkills, careerPath, resources } = req.body;
        if (roleName)         guide.roleName         = roleName;
        if (description)      guide.description      = description;
        if (mustHaveSkills)   guide.mustHaveSkills   = mustHaveSkills;
        if (careerPath)       guide.careerPath       = careerPath;
        if (resources)        guide.resources        = resources;

        const updated = await guide.save();
        await logAction(req.user._id, 'UPDATE_ROLE_GUIDE', `Updated guide: ${updated.roleName}`);
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllUsers,
    deleteUser,
    getAllRoadmaps,
    deleteRoadmap,
    updateRoadmap,
    exportRoadmaps,
    bulkDeleteRoadmaps,
    createRoleGuide,
    getAllRoleGuides,
    deleteRoleGuide,
    updateRoleGuide,
    toggleUserAdmin,
    getAuditLogs,
    sendBroadcast,
    bulkDeleteUsers,
    getDashboardStats,
    verifyMentor
};
