const fs = require('fs');
let content = fs.readFileSync('c:/Users/harsh/Downloads/Website Dashboard Structure (1)/server/controllers/courseController.js', 'utf8');

const importAdd = `
const Review = require('../models/Review');
const UserCourseProgress = require('../models/UserCourseProgress');
`;
content = content.replace("const Roadmap = require('../models/Roadmap');", "const Roadmap = require('../models/Roadmap');\n" + importAdd);

const funcAdd = `
// @desc    Add a review for a course
// @route   POST /api/courses/:id/reviews
// @access  Private
const addCourseReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const courseId = req.params.id;
        const userId = req.user._id;

        const progress = await UserCourseProgress.findOne({ userId, courseId });
        if (!progress) return res.status(403).json({ message: 'You must enroll first' });

        if (progress.progressPercentage < 10 && progress.status !== 'completed') {
            return res.status(403).json({ message: 'Complete more of the course before reviewing' });
        }

        const alreadyReviewed = await Review.findOne({ courseId, userId });
        if (alreadyReviewed) return res.status(400).json({ message: 'Already reviewed' });

        const review = await Review.create({ courseId, userId, rating: Number(rating), comment });

        const reviews = await Review.find({ courseId });
        const course = await Course.findById(courseId);
        course.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        await course.save();

        res.status(201).json({ message: 'Review added', review });
    } catch (error) {
        console.error("Error adding course review:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

`;
content = content.replace('module.exports = {', funcAdd + 'module.exports = {');
content = content.replace(/deleteQuizQuestion\s*};/, 'deleteQuizQuestion,\n    addCourseReview\n};\n');

fs.writeFileSync('c:/Users/harsh/Downloads/Website Dashboard Structure (1)/server/controllers/courseController.js', content, 'utf8');
