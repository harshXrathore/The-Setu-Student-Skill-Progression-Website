const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Mistake = require('../models/Mistake');
const Profile = require('../models/Profile');
const Roadmap = require('../models/Roadmap');
const Review = require('../models/Review');
const UserCourseProgress = require('../models/UserCourseProgress');
const mongoose = require('mongoose');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ rating: -1 });
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
const enrollCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        course.students += 1;
        await course.save();

        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { coursesEnrolled: course._id }
        });

        res.json({ message: 'Enrolled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json(course);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        await course.deleteOne();
        res.json({ message: 'Course removed' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// Get personalized learning dashboard
const getCourseDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Fetch user profile
        const profile = await Profile.findOne({ user: userId });
        const userRole = profile?.occupation?.role || 'student';
        
        // 2. Fetch mistakes to find weak skills
        const mistakes = await Mistake.find({ userId: userId, status: 'open', source: 'quiz' });
        const weakSkills = [...new Set(mistakes.map(m => m.skillTag).filter(Boolean))];
        
        // 3. Fetch roadmap to find required skills
        const roadmap = await Roadmap.findOne({ user: userId }).sort({ createdAt: -1 });
        let roadmapSkills = [];
        if (roadmap && roadmap.roadmapPhases) {
            roadmap.roadmapPhases.forEach(phase => {
                if (phase.skills) {
                    phase.skills.forEach(skill => {
                        if (skill.status === 'pending' || skill.status === 'in-progress') {
                            roadmapSkills.push(skill.name);
                        }
                    });
                }
            });
        }
        roadmapSkills = [...new Set(roadmapSkills.filter(Boolean))];
        
        // 4. Fetch courses
        const popular = await Course.find().sort({ students: -1, rating: -1 }).limit(5);
        const weakSkillCourses = await Course.find({ skillTag: { $in: weakSkills } }).limit(5);
        const roadmapCourses = await Course.find({ skillTag: { $in: roadmapSkills } }).limit(5);
        
        const profileSkills = profile?.skills || [];
        let recommended = await Course.find({ 
            $or: [
                { recommendedFor: userRole },
                { skillTag: { $in: profileSkills } }
            ]
        }).limit(5);
        
        // --- Fallback & Seeding Logic using Gemini AI ---
        const generateAICurriculum = async (targetSkill, role) => {
            try {
                const { GoogleGenerativeAI } = require('@google/generative-ai');
                if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
                
                const prompt = `Generate a 3-lesson curriculum for '${targetSkill}'. Audience: ${role}. Output strict JSON:
                {
                    "title": "Course Title",
                    "description": "Short description",
                    "lessons": [
                        { "title": "Lesson 1", "content": "Detailed markdown explanation covering intro." },
                        { "title": "Lesson 2", "content": "Detailed markdown explanation covering advanced concepts." },
                         { "title": "Lesson 3", "content": "Detailed markdown explanation covering practical usage." }
                    ]
                }`;
                const response = await model.generateContent(prompt);
                const data = JSON.parse(response.response.text());

                const course = await Course.create({
                    title: data.title || `Mastering ${targetSkill}`,
                    description: data.description || `Platform generated curriculum for ${targetSkill}`,
                    instructor: "AI Curated Learning",
                    duration: "3 hours",
                    skillTag: targetSkill,
                    difficulty: "Intermediate",
                    provider: "AI Curriculum Engine",
                    recommendedFor: [role],
                    level: "Intermediate",
                    category: targetSkill,
                    lessons: []
                });

                const lessonIds = [];
                for (let i = 0; i < (data.lessons || []).length; i++) {
                    const l = data.lessons[i];
                    const lessonDoc = await Lesson.create({
                        courseId: course._id,
                        title: l.title,
                        type: 'article',
                        content: l.content,
                        order: i
                    });
                    lessonIds.push(lessonDoc._id);
                }
                course.lessons = lessonIds;
                await course.save();
                return course;
            } catch (err) {
                console.error("AI Generation failed block:", err);
                const fallbackCourse = await Course.create({
                    title: `Introduction to ${targetSkill}`,
                    description: `A curated beginner course focusing on the fundamentals of ${targetSkill}.`,
                    instructor: "AI Curated Learning",
                    skillTag: targetSkill,
                    difficulty: "Beginner",
                    provider: "Platform Curriculum",
                    category: targetSkill,
                    lessons: []
                });
                return fallbackCourse;
            }
        };

        if (recommended.length === 0 && profileSkills.length > 0) {
            const targetSkill = profileSkills[0];
            let fallbackCourse = await Course.findOne({ skillTag: targetSkill });
            if (!fallbackCourse) {
                fallbackCourse = await generateAICurriculum(targetSkill, userRole);
            }
            recommended = [fallbackCourse];
        }

        let finalRoadmapCourses = roadmapCourses;
        if (roadmapCourses.length === 0 && roadmapSkills.length > 0) {
            const targetSkill = roadmapSkills[0];
            let fallbackCourse = await Course.findOne({ skillTag: targetSkill });
            if (!fallbackCourse) {
                fallbackCourse = await generateAICurriculum(targetSkill, "Professional");
            }
            finalRoadmapCourses = [fallbackCourse];
        }
        
        // Global deduplication to ensure courses don't bleed across swimming lanes
        const seen = new Set();
        const dedup = (arr) => arr.filter(c => {
            if(!c || !c._id) return false;
            const id = c._id.toString();
            if(seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        res.json({
            recommended: dedup(recommended),
            roadmap: dedup(finalRoadmapCourses),
            weakSkills: dedup(weakSkillCourses),
            popular: dedup(popular)
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('lessons');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

const getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.json(lesson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

const getQuizByLesson = async (req, res) => {
    try {
        const quiz = await Quiz.find({ lessonId: req.params.lessonId });
        res.json(quiz);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

const addLesson = async (req, res) => {
    try {
        const { title, type, content, videoUrl, externalUrl, order } = req.body;
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const lesson = await Lesson.create({
            courseId: req.params.courseId,
            title,
            type,
            content,
            videoUrl,
            externalUrl,
            order
        });

        if (!course.lessons) {
            course.lessons = [];
        }
        course.lessons.push(lesson._id);
        await course.save();

        res.status(201).json(lesson);
    } catch (error) {
        console.error("addLesson error:", error);
        res.status(500).send('Server Error');
    }
};

const deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        
        await Course.findByIdAndUpdate(req.params.courseId, {
            $pull: { lessons: req.params.lessonId }
        });
        
        await lesson.deleteOne();
        res.json({ message: 'Lesson removed' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

const addQuizQuestion = async (req, res) => {
    try {
        const { question, options, correctAnswer, skillTag } = req.body;
        const lesson = await Lesson.findById(req.params.lessonId);
        if (!lesson || lesson.type !== 'quiz') {
            return res.status(400).json({ message: 'Invalid lesson or not a quiz type' });
        }

        const quizQuestion = await Quiz.create({
            lessonId: req.params.lessonId,
            question,
            options,
            correctAnswer,
            skillTag
        });

        res.status(201).json(quizQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

const updateQuizQuestion = async (req, res) => {
    try {
        const { question, options, correctAnswer, skillTag } = req.body;
        
        const quizQuestion = await Quiz.findById(req.params.quizId);
        if (!quizQuestion) {
            return res.status(404).json({ message: 'Quiz question not found' });
        }
        
        if (quizQuestion.lessonId.toString() !== req.params.lessonId) {
            return res.status(400).json({ message: 'This question does not belong to this lesson' });
        }

        quizQuestion.question = question || quizQuestion.question;
        quizQuestion.options = options || quizQuestion.options;
        quizQuestion.correctAnswer = correctAnswer || quizQuestion.correctAnswer;
        quizQuestion.skillTag = skillTag || quizQuestion.skillTag;

        await quizQuestion.save();
        res.status(200).json(quizQuestion);
    } catch (error) {
        console.error("Error updating quiz question:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteQuizQuestion = async (req, res) => {
    try {
        const quizQuestion = await Quiz.findById(req.params.quizId);
        if (!quizQuestion) {
            return res.status(404).json({ message: 'Quiz question not found' });
        }
        
        if (quizQuestion.lessonId.toString() !== req.params.lessonId) {
            return res.status(400).json({ message: 'This question does not belong to this lesson' });
        }

        await Quiz.findByIdAndDelete(req.params.quizId);
        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error("Error deleting quiz question:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

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

        // N+1 Optimization: MongoDB natively computes the average without fetching massive objects
        const [avg] = await Review.aggregate([
            { $match: { courseId: mongoose.Types.ObjectId.isValid(courseId) ? new mongoose.Types.ObjectId(courseId) : courseId } },
            { $group: { _id: '$courseId', avgRating: { $avg: '$rating' } } }
        ]);
        const course = await Course.findById(courseId);
        course.rating = avg ? avg.avgRating : Number(rating);
        await course.save();

        res.status(201).json({ message: 'Review added', review });
    } catch (error) {
        console.error("Error adding course review:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getCourses,
    enrollCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseDashboard,
    getCourseById,
    getLessonById,
    getQuizByLesson,
    addLesson,
    deleteLesson,
    addQuizQuestion,
    updateQuizQuestion,
    deleteQuizQuestion,
    addCourseReview
};
