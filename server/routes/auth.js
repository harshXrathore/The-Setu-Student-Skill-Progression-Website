const express = require('express');
const router = express.Router();
const { signupStep1, signupStep2, signupComplete, loginUser, getMe, requestOTP, updatePasswordWithOTP } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup-step-1', signupStep1);
router.post('/signup-step-2', signupStep2);
router.post('/signup-complete', signupComplete);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/request-otp', protect, requestOTP);
router.put('/update-password-otp', protect, updatePasswordWithOTP);

module.exports = router;
