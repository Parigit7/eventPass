const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Create user with default role 'user'
        const user = await User.create({
            name,
            email,
            password,
            role: 'user'
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log('--- Login Attempt ---');
        console.log('Email:', `"${email}"`);
        console.log('Password Length:', password?.length);

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('Login Result: FAILED - User not found');
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if user is active
        if (user.status === 'deactive') {
            console.log('Login Result: BLOCKED - Account deactive');
            return res.status(403).json({ success: false, error: 'Account is deactive. Please contact admin.' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            console.log('Login Result: FAILED - Wrong password');
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        console.log('Login Result: SUCCESS');
        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).sort('-createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Toggle user status (Admin only)
// @route   PUT /api/auth/users/:id/toggle
exports.toggleUserStatus = async (req, res) => {
    try {
        console.log(`--- Status Toggle Attempt for User ID: ${req.params.id} ---`);
        const user = await User.findById(req.params.id);
        if (!user) {
            console.log('Status Toggle: FAILED - User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        const oldStatus = user.status;
        user.status = user.status === 'active' ? 'deactive' : 'active';
        await user.save();

        console.log(`Status Toggle: SUCCESS - ${oldStatus} -> ${user.status}`);
        res.json({ success: true, status: user.status });
    } catch (error) {
        console.error('Status Toggle: ERROR', error.message);
        res.status(500).json({ error: error.message });
    }
};
