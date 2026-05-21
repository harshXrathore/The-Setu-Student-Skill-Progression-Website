const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAllMentors,
    bookSession,
    getMySessions,
    updateSessionStatus,
    getMyStudents,
    getSingleStudent,
    getStudentRoadmap,
    getStudentRecord,
    addRecordItem,
    getMyMentorshipRecords,
    updateAssignmentStatus,
    getMentorReviews,
    getPlatformStats,
    getMentorStats,
    scheduleSession,
    broadcastMessage,
    shareResourceQuick
} = require('../controllers/mentorController');

router.get('/', getAllMentors);
router.get('/platform-stats', protect, getPlatformStats);
router.post('/book', protect, bookSession);
router.get('/sessions', protect, getMySessions);
router.put('/sessions/:id/status', protect, updateSessionStatus);
router.get('/students', protect, getMyStudents);
router.get('/students/:id', protect, getSingleStudent);   // Must come before :id/roadmap etc.
router.get('/students/:id/roadmap', protect, getStudentRoadmap);

// Mentor Record routes
router.get('/students/:id/record', protect, getStudentRecord);
router.post('/students/:id/record/:type', protect, addRecordItem);
router.get('/my-mentorships', protect, getMyMentorshipRecords);
router.get('/reviews', protect, getMentorReviews);
router.get('/stats', protect, getMentorStats);
router.put('/assignments/:assignmentId/status', protect, updateAssignmentStatus);
router.post('/schedule', protect, scheduleSession);
router.post('/broadcast', protect, broadcastMessage);
router.post('/share-resource', protect, shareResourceQuick);

module.exports = router;
