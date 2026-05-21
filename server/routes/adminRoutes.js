const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
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
} = require('../controllers/adminController');
const { getSettings, updateSettings } = require('../controllers/settingsController');

router.use(protect);
router.use(adminOnly);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.post('/users/bulk-delete', bulkDeleteUsers);
router.put('/users/:id/make-admin', toggleUserAdmin);
router.put('/users/:id/verify', verifyMentor);

router.get('/roadmaps/export', exportRoadmaps);
router.post('/roadmaps/bulk-delete', bulkDeleteRoadmaps);
router.get('/roadmaps', getAllRoadmaps);
router.delete('/roadmaps/:id', deleteRoadmap);
router.put('/roadmaps/:id', updateRoadmap);

router.post('/broadcast', sendBroadcast);
router.get('/audit-logs', getAuditLogs);

router.route('/settings')
    .get(getSettings)
    .put(updateSettings);

router.get('/stats', getDashboardStats);

router.route('/roleguide')
    .get(getAllRoleGuides)
    .post(createRoleGuide);

router.put('/roleguide/:id', updateRoleGuide);
router.delete('/roleguide/:id', deleteRoleGuide);

module.exports = router;
