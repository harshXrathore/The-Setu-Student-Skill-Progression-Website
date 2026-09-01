const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAdaptiveRoadmap,
    getNextBestAction,
    getDashboardInsights
} = require('../controllers/adaptiveController');

router.get('/roadmap', protect, getAdaptiveRoadmap);
router.get('/next-action', protect, getNextBestAction);
router.get('/insights', protect, getDashboardInsights);

module.exports = router;
