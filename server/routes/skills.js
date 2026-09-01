const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    analyzeProfile,
    getLatestRoadmap,
    updateSkillStatus,
    getUserSkillMastery,
    getSkillGraph,
    getSkillGaps,
    getSkillRecommendations
} = require('../controllers/skillController');

router.post('/analyze', protect, analyzeProfile);
router.get('/latest', protect, getLatestRoadmap);
router.get('/mastery', protect, getUserSkillMastery);
router.get('/graph', protect, getSkillGraph);
router.get('/gaps', protect, getSkillGaps);
router.get('/recommendations', protect, getSkillRecommendations);
router.patch('/:roadmapId/skills/:skillName', protect, updateSkillStatus);

module.exports = router;
