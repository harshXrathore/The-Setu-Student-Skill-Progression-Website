const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAssessmentBySkill,
    submitAssessment,
    getAssessmentHistory
} = require('../controllers/assessmentController');

router.get('/history', protect, getAssessmentHistory);
router.get('/skill/:skillName', protect, getAssessmentBySkill);
router.post('/:id/submit', protect, submitAssessment);

module.exports = router;
