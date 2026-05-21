const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getUserProgressDashboard, 
    getUserCourseProgress, 
    markLessonComplete, 
    submitQuiz 
} = require('../controllers/learningProgressController');

router.get('/dashboard', protect, getUserProgressDashboard);
router.get('/course/:courseId', protect, getUserCourseProgress);
router.post('/lesson/complete', protect, markLessonComplete);
router.post('/quiz/submit', protect, submitQuiz);

module.exports = router;
