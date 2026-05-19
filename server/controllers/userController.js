const User = require('../models/User');

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile,
            mentorDetails: user.mentorDetails,
            avatar: user.avatar
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;

            // Nested profile update
            if (req.body.profile) {
                user.profile = { ...user.profile, ...req.body.profile };
            }
            if (req.body.mentorDetails) {
                user.mentorDetails = { ...user.mentorDetails, ...req.body.mentorDetails };
            }
            if (req.body.avatar !== undefined) {
                user.avatar = req.body.avatar;
            }

            const updatedUser = await user.save();

            res.json({
                id: updatedUser.id,
                name: updatedUser.name,
                role: updatedUser.role,
                profile: updatedUser.profile,
                mentorDetails: updatedUser.mentorDetails,
                avatar: updatedUser.avatar
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMe,
    updateProfile
};
