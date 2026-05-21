const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { getPosts, createPost, likePost, deletePost } = require('../controllers/communityController');

router.get('/posts', getPosts);
router.post('/posts', protect, createPost);
router.put('/posts/:id/like', protect, likePost);

// Admin Routes
router.delete('/posts/:id', protect, adminOnly, deletePost);

module.exports = router;
