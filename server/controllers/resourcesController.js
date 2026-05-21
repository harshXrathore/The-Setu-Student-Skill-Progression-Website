const Course = require('../models/Course');

// @desc    Get resource stats from DB
// @route   GET /api/resources/stats
// @access  Public
const getResourceStats = async (req, res) => {
  try {
    const courses = await Course.countDocuments();
    res.json({ courses });
  } catch (err) {
    console.error('getResourceStats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch resource stats' });
  }
};

module.exports = { getResourceStats };
