const Career = require('../models/Career');
const { predictUserCareers } = require('../services/careerPrediction.service');
const { CareerSchema } = require('../validators/careerSchema');

// Simple in-memory cache for predictions (TTL: 1 hour)
const predictionCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

// @desc    Get all careers
// @route   GET /api/careers
// @access  Public
exports.getCareers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const careers = await Career.find().sort({ createdAt: -1 }).limit(limit);
    res.json(careers);
  } catch (error) {
    console.error('Error fetching careers:', error);
    res.status(500).json({ message: 'Server error while fetching careers' });
  }
};

// @desc    Create a new career
// @route   POST /api/careers
// @access  Private/Admin
exports.createCareer = async (req, res) => {
  try {
    const validatedData = CareerSchema.parse(req.body);
    const newCareer = new Career(validatedData);
    const savedCareer = await newCareer.save();
    
    // Invalidate cache simply since careers changed
    predictionCache.clear();
    
    res.status(201).json(savedCareer);
  } catch (error) {
    console.error('Error creating career:', error);
    if (error.errors) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(400).json({ message: 'Invalid career data', error: error.message });
  }
};

// @desc    Update a career
// @route   PUT /api/careers/:id
// @access  Private/Admin
exports.updateCareer = async (req, res) => {
  try {
    const validatedData = CareerSchema.parse(req.body);
    const career = await Career.findByIdAndUpdate(
      req.params.id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    
    // Invalidate cache since career changed
    predictionCache.clear();

    res.json(career);
  } catch (error) {
    console.error('Error updating career:', error);
    if (error.errors) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(400).json({ message: 'Invalid career data', error: error.message });
  }
};

// @desc    Delete a career
// @route   DELETE /api/careers/:id
// @access  Private/Admin
exports.deleteCareer = async (req, res) => {
  try {
    const career = await Career.findByIdAndDelete(req.params.id);

    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }

    // Invalidate cache since career changed
    predictionCache.clear();

    res.json({ message: 'Career deleted successfully' });
  } catch (error) {
    console.error('Error deleting career:', error);
    res.status(500).json({ message: 'Server error while deleting career' });
  }
};

// @desc    Get AI career predictions for a user
// @route   GET /api/careers/predict
// @access  Private
exports.predictCareers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check Cache
    if (predictionCache.has(userId)) {
        const cached = predictionCache.get(userId);
        if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
            return res.json({ predictions: cached.data });
        }
    }

    const predictions = await predictUserCareers(userId);
    
    // Update Cache
    predictionCache.set(userId, { data: predictions, timestamp: Date.now() });

    res.json({ predictions });
  } catch (error) {
    console.error('Error predicting careers:', error);
    res.status(500).json({ message: 'Server error while generating career predictions', error: error.message });
  }
};
