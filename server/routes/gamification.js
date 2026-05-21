const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getUserStats,
    getAchievements,
    getAchievementProgress,
    getActivity,
    getMilestones
} = require('../controllers/gamificationController');

router.get('/stats',           protect, getUserStats);
router.get('/achievements',    protect, getAchievements);
router.get('/progress',        protect, getAchievementProgress);
router.get('/activity',        protect, getActivity);
router.get('/milestones',      protect, getMilestones);

module.exports = router;
