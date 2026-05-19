const Profile = require('../models/Profile');
const User = require('../models/User');
const { triggerMilestone } = require('../services/gamification.service');

// @desc    Get current user's profile
// @route   GET /api/profile/me
// @access  Private
const getCurrentProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email', 'avatar', 'isAdmin']);

        if (!profile) {
            return res.status(404).json({ message: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create or update user profile
// @route   POST /api/profile
// @access  Private
const createOrUpdateProfile = async (req, res) => {
    const {
        general,
        occupation,
        preferences,
        skills,
        education,
        experience,
        certifications,
        projects,
        languages,
        socials,
        learningGoals,
        mentorDetails
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;

    // Helper to sanitize dates
    const sanitizeDates = (items) => {
        if (!items || !Array.isArray(items)) return items;
        return items.map(item => {
            const newItem = { ...item };
            ['startDate', 'endDate', 'issueDate', 'expirationDate'].forEach(dateField => {
                if (newItem[dateField] === '') newItem[dateField] = null;
            });
            return newItem;
        });
    };

    if (general) profileFields.general = general;
    if (occupation) profileFields.occupation = occupation;
    if (preferences) profileFields.preferences = preferences;
    if (skills) profileFields.skills = skills;
    if (education) profileFields.education = sanitizeDates(education);
    if (experience) profileFields.experience = sanitizeDates(experience);
    if (certifications) profileFields.certifications = sanitizeDates(certifications);
    if (projects) profileFields.projects = sanitizeDates(projects);
    if (languages) profileFields.languages = languages;
    if (socials) profileFields.socials = socials;
    if (learningGoals) profileFields.learningGoals = learningGoals;
    if (mentorDetails) profileFields.mentorDetails = mentorDetails;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );

            // Also update User avatar if provided
            if (req.body.avatar) {
                await User.findByIdAndUpdate(req.user.id, { avatar: req.body.avatar });
            }

            // Trigger 'Profile Completed' milestone if profile has the basics filled in
            const isComplete = profile.general?.firstName && profile.occupation?.role && (profile.skills?.length > 0);
            if (isComplete) {
                triggerMilestone(req.user.id, 'Profile Completed').catch(() => {});
            }

            return res.json(profile);
        }

        // Create
        profile = new Profile(profileFields);
        await profile.save();

        // Also update User avatar if provided
        if (req.body.avatar) {
            await User.findByIdAndUpdate(req.user.id, { avatar: req.body.avatar });
        }

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get profile by user ID
// @route   GET /api/profile/user/:user_id
// @access  Private
const getProfileByUserId = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'email', 'avatar', 'isAdmin']);

        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getCurrentProfile,
    createOrUpdateProfile,
    getProfileByUserId
};
