const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getCurrentProfile,
    createOrUpdateProfile,
    getProfileByUserId
} = require('../controllers/profileController');

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', protect, getCurrentProfile);

// @route   POST /api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', protect, createOrUpdateProfile);

// @route   GET /api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Private
router.get('/user/:user_id', protect, getProfileByUserId);

module.exports = router;
