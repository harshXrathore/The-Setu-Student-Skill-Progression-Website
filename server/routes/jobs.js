const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { getJobs, getJobById, applyToJob, createJob, updateJob, deleteJob, getRecommendedJobs, getJobStats, toggleBookmarkJob, getSavedJobs, getAppliedJobs } = require('../controllers/jobController');

router.get('/', getJobs);
router.get('/stats', protect, getJobStats); 
router.get('/recommended', protect, getRecommendedJobs); 
router.get('/saved', protect, getSavedJobs);
router.get('/applications/history', protect, getAppliedJobs);
router.get('/:id', getJobById);
router.post('/:id/apply', protect, applyToJob);
router.post('/:id/bookmark', protect, toggleBookmarkJob);

// Admin Routes
router.post('/', protect, adminOnly, createJob);
router.put('/:id', protect, adminOnly, updateJob);
router.delete('/:id', protect, adminOnly, deleteJob);

module.exports = router;
