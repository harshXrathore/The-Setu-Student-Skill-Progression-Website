const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { 
    getCourses, 
    enrollCourse, 
    createCourse, 
    updateCourse, 
    deleteCourse,
    getCourseDashboard,
    getCourseById,
    getLessonById,
    getQuizByLesson,
    addCourseReview
} = require('../controllers/courseController');

router.get('/', getCourses);
router.get('/dashboard', protect, getCourseDashboard);
router.get('/:id', protect, getCourseById);
router.get('/lesson/:id', protect, getLessonById);
router.get('/lesson/:lessonId/quiz', protect, getQuizByLesson);
router.post('/:id/enroll', protect, enrollCourse);
router.post('/:id/reviews', protect, addCourseReview);

// Admin Routes
router.post('/', protect, adminOnly, createCourse);
router.put('/:id', protect, adminOnly, updateCourse);
router.delete('/:id', protect, adminOnly, deleteCourse);

// Admin Lesson Routes
const { addLesson, deleteLesson, addQuizQuestion, updateQuizQuestion, deleteQuizQuestion } = require('../controllers/courseController');
router.post('/:courseId/lessons', protect, adminOnly, addLesson);
router.delete('/:courseId/lessons/:lessonId', protect, adminOnly, deleteLesson);

// Admin Quiz Routes
router.post('/:courseId/lessons/:lessonId/quiz', protect, adminOnly, addQuizQuestion);
router.put('/:courseId/lessons/:lessonId/quiz/:quizId', protect, adminOnly, updateQuizQuestion);
router.delete('/:courseId/lessons/:lessonId/quiz/:quizId', protect, adminOnly, deleteQuizQuestion);

module.exports = router;
