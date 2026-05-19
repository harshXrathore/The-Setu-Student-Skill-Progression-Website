const Post = require('../models/Post');
const { addPoints, incrementStat } = require('../services/gamification.service');
const { checkAndUnlockBadges } = require('../services/achievementEngine');

// @desc    Get all posts
// @route   GET /api/community/posts
// @access  Public
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name') // get name but not email
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new post
// @route   POST /api/community/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { title, content, category } = req.body;

        const newPost = new Post({
            user: req.user.id,
            title,
            content,
            category
        });

        const post = await newPost.save();

        // Populate user info to return complete object
        const populatedPost = await Post.findById(post._id).populate('user', 'name');

        res.json(populatedPost);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Like a post
// @route   PUT /api/community/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Simple like increment for now (user can spam likes)
        post.likes += 1;
        await post.save();

        // Award 5 points to the POST AUTHOR for receiving a like
        if (post.user) {
            try {
                await addPoints(post.user.toString(), 5);
                await incrementStat(post.user.toString(), 'communityLikes', 1);
                await checkAndUnlockBadges(post.user.toString());
            } catch (gamErr) {
                console.error('[Gamification] likePost hook error:', gamErr);
            }
        }

        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a post
// @route   DELETE /api/community/posts/:id
// @access  Private/Admin
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        await post.deleteOne();
        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getPosts,
    createPost,
    likePost,
    deletePost
};
