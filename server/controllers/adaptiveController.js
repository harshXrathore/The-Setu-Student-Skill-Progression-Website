const adaptiveRoadmapService = require('../services/adaptiveRoadmap.service');
const masteryEngineService = require('../services/masteryEngine.service');
const skillGraphService = require('../services/skillGraph.service');
const mistakeAnalysisService = require('../services/mistakeAnalysis.service');

// @desc    Get user's adaptive roadmap
// @route   GET /api/adaptive/roadmap
// @access  Private
const getAdaptiveRoadmap = async (req, res) => {
    try {
        const roadmap = await adaptiveRoadmapService.getAdaptedRoadmap(req.user.id);
        if (!roadmap) {
            return res.status(404).json({ message: 'No roadmap found. Please generate one first.' });
        }
        res.json(roadmap);
    } catch (error) {
        console.error('[AdaptiveController] getAdaptiveRoadmap error:', error);
        res.status(500).json({ error: 'Failed to retrieve adaptive roadmap' });
    }
};

// @desc    Get user's Next Best Action
// @route   GET /api/adaptive/next-action
// @access  Private
const getNextBestAction = async (req, res) => {
    try {
        const action = await adaptiveRoadmapService.getNextBestAction(req.user.id);
        res.json(action);
    } catch (error) {
        console.error('[AdaptiveController] getNextBestAction error:', error);
        res.status(500).json({ error: 'Failed to determine next best action' });
    }
};

// @desc    Get dashboard skill intelligence and mastery insights
// @route   GET /api/adaptive/insights
// @access  Private
const getDashboardInsights = async (req, res) => {
    try {
        const insights = await adaptiveRoadmapService.getDashboardInsights(req.user.id);
        res.json(insights);
    } catch (error) {
        console.error('[AdaptiveController] getDashboardInsights error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard insights' });
    }
};

module.exports = {
    getAdaptiveRoadmap,
    getNextBestAction,
    getDashboardInsights
};
