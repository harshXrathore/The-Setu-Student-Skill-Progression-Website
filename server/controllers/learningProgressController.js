const UserCourseProgress = require('../models/UserCourseProgress');
const Course = require('../models/Course');
const Mistake = require('../models/Mistake');
const Quiz = require('../models/Quiz');
const { addPoints, logActivity, triggerMilestone, incrementStat } = require('../services/gamification.service');
const { checkAndUnlockBadges } = require('../services/achievementEngine');

exports.getUserProgressDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const progressList = await UserCourseProgress.find({ userId }).populate('courseId');
        
        const completed = progressList.filter(p => p.status === 'completed');
        const inProgress = progressList.filter(p => p.status === 'in-progress');
        
        res.json({
            completed,
            inProgress,
            totalProgress: progressList,
            overallPercentage: progressList.length > 0 
                ? Math.round(progressList.reduce((acc, p) => acc + p.progressPercentage, 0) / progressList.length)
                : 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getUserCourseProgress = async (req, res) => {
    try {
        const progress = await UserCourseProgress.findOne({
            userId: req.user.id,
            courseId: req.params.courseId
        });
        res.json(progress || { completedLessons: [], progressPercentage: 0, status: 'not-started' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.markLessonComplete = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;
        const userId = req.user.id;
        
        let progress = await UserCourseProgress.findOne({ userId, courseId });
        
        if (!progress) {
            progress = new UserCourseProgress({
                userId,
                courseId,
                completedLessons: [],
                status: 'in-progress'
            });
        }
        
        if (!progress.completedLessons.includes(lessonId)) {
            // Secure API Validation: If lesson is a Quiz, it requires >= 50% passing grade
            const lesson = await require('../models/Lesson').findById(lessonId);
            if (lesson && lesson.type === 'quiz') {
                const quizzes = await Quiz.find({ lessonId });
                if (quizzes.length > 0) {
                    const answers = req.body.answers || [];
                    let score = 0;
                    for (const q of quizzes) {
                        const ans = answers.find(a => a.quizId === q._id.toString());
                        if (ans && ans.selectedOption === q.correctAnswer) score++;
                    }
                    if ((score / quizzes.length) < 0.5) {
                        return res.status(400).json({ msg: 'Quiz failed. Score >= 50% required to complete lesson.' });
                    }
                }
            }

            progress.completedLessons.push(lessonId);
            
            // Calculate percentage
            const course = await Course.findById(courseId);
            const totalLessons = course.lessons ? course.lessons.length : 0;
            
            const wasPreviouslyCompleted = progress.status === 'completed';
            
            if (totalLessons === 0 || progress.completedLessons.length >= totalLessons) {
                progress.progressPercentage = 100;
                progress.status = 'completed';
            } else {
                progress.progressPercentage = Math.round((progress.completedLessons.length / totalLessons) * 100);
                progress.status = 'in-progress';
            }
            
            await progress.save();

            // --- Gamification hooks ---
            try {
                // Award 10 pts for completing a lesson
                await addPoints(userId, 10);
                await logActivity(userId, 'lesson_completed');
                await triggerMilestone(userId, 'First Course Started');

                // Award extra 100 pts if course just reached completion
                if (progress.status === 'completed' && !wasPreviouslyCompleted) {
                    await addPoints(userId, 100);
                    await incrementStat(userId, 'coursesCompleted', 1);
                    await logActivity(userId, 'course_completed');
                }

                // Check for newly unlocked badges
                await checkAndUnlockBadges(userId);
            } catch (gamErr) {
                console.error('[Gamification] markLessonComplete hook error:', gamErr);
            }
        }
        
        res.json(progress);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, selectedOption } = req.body;
        const userId = req.user.id;
        
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
        
        const isCorrect = quiz.correctAnswer === selectedOption;
        
        if (!isCorrect) {
            // Determine severity from difficulty
            const severityMap = { easy: 2, medium: 3, hard: 4 };
            const severityLevel = severityMap[quiz.difficulty || 'medium'];

            // Record mistake via Upsert to increment counts on duplicates
            await Mistake.findOneAndUpdate(
                {
                    userId: userId,
                    title: `Incorrect answer on ${quiz.skillTag || 'General'} quiz`,
                    status: 'open'
                },
                {
                    $setOnInsert: {
                        description: `Selected: ${selectedOption}. Expected: ${quiz.correctAnswer}`,
                        severity: severityLevel,
                        category: quiz.type || 'conceptual',
                        skillTag: quiz.skillTag || 'General',
                        source: 'quiz'
                    },
                    $inc: { count: 1 }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        // Log activity (regardless of correct/incorrect)
        try {
            await logActivity(userId, 'quiz_attempt');
        } catch (gamErr) {
            console.error('[Gamification] submitQuiz hook error:', gamErr);
        }
        
        res.json({ isCorrect, correctAnswer: quiz.correctAnswer });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};
