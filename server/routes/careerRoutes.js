const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getCareers, createCareer, updateCareer, deleteCareer, predictCareers } = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// @route   GET /api/careers
// @desc    Get all careers
// @access  Public
router.get('/', apiLimiter, getCareers);

// @route   GET /api/careers/predict
// @desc    Get AI career predictions for the logged-in user
// @access  Private
router.get('/predict', protect, predictCareers);

// Protected Admin Routes
router.post('/', protect, adminOnly, createCareer);
router.put('/:id', protect, adminOnly, updateCareer);
router.delete('/:id', protect, adminOnly, deleteCareer);

module.exports = router;
