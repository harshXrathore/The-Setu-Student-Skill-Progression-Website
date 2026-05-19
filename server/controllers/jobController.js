const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const Profile = require('../models/Profile');
const SkillGraphService = require('../services/skillGraph.service');
const JobMatchService = require('../services/jobMatch.service');
const JobRankingService = require('../services/jobRanking.service');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;
        const skip = (page - 1) * limit;

        const jobs = await Job.find().sort({ postedDate: -1 }).skip(skip).limit(limit);
        const total = await Job.countDocuments();

        res.json({
            jobs,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};


// @desc    Apply to a job
// @route   POST /api/jobs/:id/apply
// @access  Private
const applyToJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        if (!req.user || !req.user.id) {
           return res.status(401).json({ message: 'Not authorized' });
        }

        // Check for duplicates
        const existingApp = await JobApplication.findOne({ userId: req.user.id, jobId: job._id });
        if (existingApp) {
             return res.status(400).json({ message: 'Already applied' });
        }

        // Track Application
        await JobApplication.create({
            userId: req.user.id,
            jobId: job._id,
            status: 'Applied'
        });

        job.applicants += 1;
        await job.save();

        res.json({ message: 'Application submitted successfully', applicationUrl: job.applicationUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private/Admin
const createJob = async (req, res) => {
    try {
        const jobData = { ...req.body, source: 'admin' };
        const job = await Job.create(jobData);
        res.status(201).json(job);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Admin
const updateJob = async (req, res) => {
    try {
        const updates = { ...req.body };
        // Security logic constraints blocking protected fields from arbitrary overwrites
        delete updates.source;
        delete updates.externalId;

        const job = await Job.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        await job.deleteOne();
        res.json({ message: 'Job removed' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get top recommended jobs for the current user
// @route   GET /api/jobs/recommended
// @access  Private
const getRecommendedJobs = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const userSkills = profile.skills || [];
        const userSkillsSet = new Set(userSkills.map(s => s.trim().toLowerCase()));

        const expandedSkillsSet = await SkillGraphService.expandSkills(userSkills);

        const activeJobs = await Job.find({}).lean(); 

        let scoredJobs = activeJobs.map(job => {
            const matchScore = JobMatchService.calculateScore(profile, job, expandedSkillsSet, userSkillsSet);
            const missingSkills = JobMatchService.detectMissingSkills(job, userSkillsSet);
            return {
                ...job,
                matchScore,
                missingSkills
            };
        });

        // Pre-filter Top 10 immediately to reduce bulk query size
        scoredJobs = scoredJobs
            .filter(j => j.matchScore >= 30)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10); 

        // Extract UNIQUE missing skills across the narrowed Top 10 jobs
        const allMissingSkillsSet = new Set();
        scoredJobs.forEach(j => j.missingSkills.forEach(s => allMissingSkillsSet.add(s.trim().toLowerCase())));
        const allMissingSkills = Array.from(allMissingSkillsSet);

        // Fetch relevant courses via ONE global query
        const bulkCourses = await JobMatchService.getBulkCourses(allMissingSkills);

        // Map courses back to respective jobs
        scoredJobs = scoredJobs.map(job => {
             const relevantCourses = bulkCourses.filter(c => {
                 return job.missingSkills.some(ms => {
                     const regex = new RegExp(JobMatchService.escapeRegex(ms), 'i');
                     return (c.skillTag && regex.test(c.skillTag)) || 
                            (c.category && regex.test(c.category)) || 
                            (c.title && regex.test(c.title));
                 });
             }).slice(0, 3); 
             
             return {
                 ...job,
                 recommendedCourses: relevantCourses
             };
        });

        const { jobs: finalRankedJobs, metadata } = await JobRankingService.rankJobsBySuitability(profile, scoredJobs);

        res.json({
            jobs: finalRankedJobs,
            metadata
        });

    } catch (error) {
        console.error('[JobController] getRecommendedJobs error:', error);
        res.status(500).json({ message: 'Server Error processing recommendations' });
    }
};

// @desc    Get job statistics for dashboard
// @route   GET /api/jobs/stats
// @access  Private
const getJobStats = async (req, res) => {
    try {
        const activeJobs = await Job.countDocuments();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newJobsThisWeek = await Job.countDocuments({ postedDate: { $gte: sevenDaysAgo } });
        const companiesHiring = (await Job.distinct('company')).length;

        res.json({
            activeJobs,
            newJobsThisWeek,
            companiesHiring
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Toggle Bookmark/Save Job status
// @route   POST /api/jobs/:id/bookmark
const toggleBookmarkJob = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        const jobId = req.params.id;

        if (user.savedJobs.includes(jobId)) {
            user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
        } else {
            user.savedJobs.push(jobId);
        }
        await user.save();
        res.json({ message: 'Bookmark toggled', savedJobs: user.savedJobs });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get Bookmarked Jobs
// @route   GET /api/jobs/saved
const getSavedJobs = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id).populate('savedJobs');
        res.json(user.savedJobs || []);
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

// @desc    Get User's Job Application History
// @route   GET /api/jobs/applications/history
const getAppliedJobs = async (req, res) => {
    try {
        const apps = await JobApplication.find({ userId: req.user.id })
                                         .populate('jobId')
                                         .sort({ createdAt: -1 });
        res.json(apps || []);
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getJobs,
    getJobById,
    applyToJob,
    createJob,
    updateJob,
    deleteJob,
    getRecommendedJobs,
    getJobStats,
    toggleBookmarkJob,
    getSavedJobs,
    getAppliedJobs
};
