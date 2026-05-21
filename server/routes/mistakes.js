const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyMistakes, logMistake, resolveMistake, reopenMistake, getMistakeAnalytics } = require('../controllers/mistakeController');

// Ensure /analytics triggers before /:id path params!
router.get('/analytics', protect, getMistakeAnalytics);
router.get('/', protect, getMyMistakes);
router.post('/', protect, logMistake);
router.put('/:id/resolve', protect, resolveMistake);
router.put('/:id/reopen', protect, reopenMistake);

module.exports = router;
