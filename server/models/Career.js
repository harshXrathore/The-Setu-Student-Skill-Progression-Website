const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  salaryRange: {
    type: String,
    trim: true
  },
  demandLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Very High'],
    default: 'Medium',
    trim: true
  },
  growthRate: {
    type: String,
    trim: true
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  advantages: [{
    type: String,
    trim: true
  }],
  challenges: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

module.exports = mongoose.model('Career', careerSchema);
