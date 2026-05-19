const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const { triggerMilestone } = require('../services/gamification.service');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Validate Strong Password
const isValidPassword = (password) => {
    // Min 6 characters, at least one uppercase, one lowercase, one number, and one symbol
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    return regex.test(password);
};

// @desc    Signup Step 1: Create unverified account & send OTP
// @route   POST /api/auth/signup-step-1
// @access  Public
const signupStep1 = async (req, res) => {
    const { name, email, role } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Please provide name and email' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        if (existingUser.isVerified) {
            return res.status(400).json({ message: 'User already exists and is verified. Please log in.' });
        }
        // If they exist but aren't verified, we'll just resend the OTP below.
    }

    // Provide a random secure password for now. They will set a real one in Step 3.
    const tempPassword = crypto.randomBytes(32).toString('hex');

    // Create or update unverified user
    let user = existingUser;
    if (!user) {
        user = await User.create({
            name,
            email,
            password: tempPassword,
            role: role || 'student',
            isVerified: false
        });
    } else {
        user.name = name;
        user.role = role || 'student';
    }

    if (user) {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash the OTP before saving
        const salt = await bcrypt.genSalt(10);
        user.verificationOtp = await bcrypt.hash(otp, salt);
        user.verificationOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save({ validateBeforeSave: false });

        // Send OTP via email
        const message = `Welcome to The-Setu!\n\nYour email verification OTP is: ${otp}\n\nIt is valid for 10 minutes.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your Email Address',
                message,
            });

            res.status(200).json({ 
                message: 'OTP sent to email address.',
            });
        } catch (err) {
            user.verificationOtp = undefined;
            user.verificationOtpExpire = undefined;
            await user.save({ validateBeforeSave: false });
            
            console.error('Email error:', err);
            return res.status(500).json({ message: 'User created but verification email could not be sent' });
        }
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Signup Step 2: Verify OTP
// @route   POST /api/auth/signup-step-2
// @access  Public
const signupStep2 = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
             return res.status(400).json({ message: 'User is already verified' });
        }

        if (!user.verificationOtp || !user.verificationOtpExpire) {
            return res.status(400).json({ message: 'No OTP requested or OTP expired' });
        }

        if (Date.now() > user.verificationOtpExpire) {
            return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
        }

        // Verify OTP
        const isMatch = await bcrypt.compare(otp, user.verificationOtp);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Success - tell frontend to proceed to Step 3 (password creation)
        res.status(200).json({ message: 'OTP verified successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Signup Step 3: Set Password and complete login
// @route   POST /api/auth/signup-complete
// @access  Public
const signupComplete = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({ message: 'Please provide email, OTP, and password' });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long and include an uppercase letter, a lowercase letter, a number, and a symbol.' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Re-verify the OTP for security before saving the password
        if (!user.verificationOtp || Date.now() > user.verificationOtpExpire) {
             return res.status(400).json({ message: 'OTP expired. Please restart signup.' });
        }

        const isMatch = await bcrypt.compare(otp, user.verificationOtp);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP. Cannot complete signup.' });
        }

        // Set verified, new password, and clear OTP fields
        user.isVerified = true;
        user.password = password; // mongoose pre-save hook will hash it
        user.verificationOtp = undefined;
        user.verificationOtpExpire = undefined;

        await user.save();

        // Trigger 'First Login' milestone
        try {
            await triggerMilestone(user.id, 'First Login');
        } catch (gamErr) {
            console.error('[Gamification] signupComplete milestone error:', gamErr);
        }

        // Successful verification means they are fully logged in
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (!user) {
        console.log("Login failed: User not found for email:", email);
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    console.log(`Login attempt for ${email}: Match=${isMatch}`);

    if (user && isMatch) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });
    } else {
        console.log("Login failed: Password mismatch");
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Request OTP for password update
// @route   POST /api/auth/request-otp
// @access  Private
const requestOTP = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash the OTP before saving
        const salt = await bcrypt.genSalt(10);
        user.resetPasswordOtp = await bcrypt.hash(otp, salt);
        user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        await user.save({ validateBeforeSave: false });

        // Send OTP via email
        const message = `Your password reset OTP is: ${otp}\n\nIt is valid for 10 minutes.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP',
                message,
            });

            res.status(200).json({ message: 'OTP sent to email address' });
        } catch (err) {
            user.resetPasswordOtp = undefined;
            user.resetPasswordOtpExpire = undefined;
            await user.save({ validateBeforeSave: false });
            
            console.error('Email error:', err);
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update password with OTP
// @route   PUT /api/auth/update-password-otp
// @access  Private
const updatePasswordWithOTP = async (req, res) => {
    try {
        const { otp, newPassword } = req.body;
        
        if (!otp || !newPassword) {
            return res.status(400).json({ message: 'Please provide OTP and new password' });
        }

        if (!isValidPassword(newPassword)) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long and include an uppercase letter, a lowercase letter, a number, and a symbol.' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.resetPasswordOtp || !user.resetPasswordOtpExpire) {
            return res.status(400).json({ message: 'No OTP requested or OTP expired' });
        }

        if (Date.now() > user.resetPasswordOtpExpire) {
            // OTP expired
            user.resetPasswordOtp = undefined;
            user.resetPasswordOtpExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
        }

        // Verify OTP
        const isMatch = await bcrypt.compare(otp, user.resetPasswordOtp);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Update password (mongoose pre-save hook will hash it)
        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    signupStep1,
    signupStep2,
    signupComplete,
    loginUser,
    getMe,
    requestOTP,
    updatePasswordWithOTP
};
