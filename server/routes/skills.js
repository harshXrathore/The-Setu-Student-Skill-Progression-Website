const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { analyzeProfile, getLatestRoadmap, updateSkillStatus } = require('../controllers/skillController');

router.post('/analyze', protect, analyzeProfile);
router.get('/latest', protect, getLatestRoadmap);
router.patch('/:roadmapId/skills/:skillName', protect, updateSkillStatus);

module.exports = router;
