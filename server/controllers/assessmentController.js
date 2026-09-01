const assessmentService = require('../services/assessment.service');

// @desc    Get or generate assessment for a skill
// @route   GET /api/assessments/skill/:skillName
// @access  Private
const getAssessmentBySkill = async (req, res) => {
    try {
        const { skillName } = req.params;
        const difficulty = req.query.difficulty || 'intermediate';

        if (!skillName) {
            return res.status(400).json({ error: 'Skill name is required' });
        }

        const assessment = await assessmentService.getOrGenerateAssessment(skillName, difficulty);
        
        // Return without exposing correct answers to the client during test taking
        const sanitizedQuestions = assessment.questions.map(q => ({
            questionId: q.questionId,
            question: q.question,
            options: q.options,
            topic: q.topic,
            difficulty: q.difficulty
        }));

        res.json({
            _id: assessment._id,
            title: assessment.title,
            skill: assessment.skill,
            difficulty: assessment.difficulty,
            questions: sanitizedQuestions
        });
    } catch (error) {
        console.error('[AssessmentController] getAssessmentBySkill error:', error);
        res.status(500).json({ error: 'Failed to retrieve assessment', details: error.message });
    }
};

// @desc    Submit answers for an assessment
// @route   POST /api/assessments/:id/submit
// @access  Private
const submitAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const { answers, timeSpentSeconds } = req.body;
        const userId = req.user.id;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Answers array is required' });
        }

        const result = await assessmentService.submitAttempt(
            userId,
            id,
            answers,
            timeSpentSeconds || 0
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('[AssessmentController] submitAssessment error:', error);
        res.status(500).json({ error: 'Failed to submit assessment', details: error.message });
    }
};

// @desc    Get user's assessment history
// @route   GET /api/assessments/history
// @access  Private
const getAssessmentHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skill } = req.query;

        const history = await assessmentService.getUserHistory(userId, skill);
        res.json(history);
    } catch (error) {
        console.error('[AssessmentController] getAssessmentHistory error:', error);
        res.status(500).json({ error: 'Failed to retrieve assessment history' });
    }
};

module.exports = {
    getAssessmentBySkill,
    submitAssessment,
    getAssessmentHistory
};
