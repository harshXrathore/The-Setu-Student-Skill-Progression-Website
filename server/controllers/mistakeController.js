const Mistake = require('../models/Mistake');
const mistakeAnalysisService = require('../services/mistakeAnalysis.service');

// @desc    Get current user's mistake stats
// @route   GET /api/mistakes
// @access  Private
const getMyMistakes = async (req, res) => {
    try {
        const mistakes = await Mistake.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(mistakes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Log a new mistake manually
// @route   POST /api/mistakes
// @access  Private
const logMistake = async (req, res) => {
    try {
        const { title, description, category, severity, skillTag, source } = req.body;

        // Check if similar open mistake exists for user, increment count if so
        let mistake = await Mistake.findOne({ userId: req.user.id, title, status: 'open' });

        if (mistake) {
            mistake.count += 1;
            await mistake.save();
        } else {
            mistake = new Mistake({
                userId: req.user.id,
                title,
                description,
                category: category || 'conceptual',
                severity: severity || 3,
                skillTag: skillTag || 'General',
                source: source || 'manual'
            });
            await mistake.save();
        }

        res.json(mistake);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Mark a mistake as resolved
// @route   PUT /api/mistakes/:id/resolve
// @access  Private
const resolveMistake = async (req, res) => {
    try {
        const mistakeExists = await Mistake.findById(req.params.id);
        if (!mistakeExists) {
            return res.status(404).json({ message: 'Mistake not found' });
        }
        if (mistakeExists.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to resolve this mistake' });
        }

        const mistake = await Mistake.findByIdAndUpdate(
            req.params.id,
            { status: 'resolved' },
            { new: true }
        );

        res.json(mistake);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Reopen a resolved mistake
// @route   PUT /api/mistakes/:id/reopen
// @access  Private
const reopenMistake = async (req, res) => {
    try {
        const mistakeExists = await Mistake.findById(req.params.id);
        if (!mistakeExists) {
            return res.status(404).json({ message: 'Mistake not found' });
        }
        if (mistakeExists.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to modify this mistake' });
        }

        const mistake = await Mistake.findByIdAndUpdate(
            req.params.id,
            { status: 'open' },
            { new: true }
        );

        res.json(mistake);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get Mistake Analytics for Dashboard
// @route   GET /api/mistakes/analytics
// @access  Private
const getMistakeAnalytics = async (req, res) => {
    try {
        // Parallelize primary queries
        const [analysis, visualAggregations] = await Promise.all([
            mistakeAnalysisService.analyzeUserMistakes(req.user.id),
            mistakeAnalysisService.getVisualAggregations(req.user.id)
        ]);

        // Recommendations dynamically require the sorted skills output
        const recommendations = await mistakeAnalysisService.recommendCoursesByMistakes(analysis.weakSkillsSorted);

        res.json({
            ...visualAggregations,
            analysis,
            recommendations
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getMyMistakes,
    logMistake,
    resolveMistake,
    reopenMistake,
    getMistakeAnalytics
};
