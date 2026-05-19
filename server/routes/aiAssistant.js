// routes/aiAssistant.js
// AI Assistant route — POST /api/ai/assistant
// Protected: requires a valid JWT (same protect middleware used across the app)

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { askAssistant } = require('../controllers/aiAssistantController');

// POST /api/ai/assistant
// Body: { question: "..." }
router.post('/assistant', protect, askAssistant);

module.exports = router;
