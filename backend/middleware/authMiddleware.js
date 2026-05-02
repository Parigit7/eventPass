const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        console.log('Authorization failed: No token provided');
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`Token verified for ID: ${decoded.id}`);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            console.log(`Authorization failed: User not found for ID ${decoded.id}`);
            return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
        }

        next();
    } catch (err) {
        console.log(`Token verification FAILED: ${err.message}`);
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.log(`Role authorization failed: User role ${req.user.role} not in [${roles}]`);
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Admin middleware
exports.admin = (req, res, next) => {
    console.log('--- ADMIN CHECK START ---');
    console.log(`Target URL: ${req.originalUrl}`);
    console.log(`Method: ${req.method}`);
    
    if (!req.user) {
        console.log('Result: FAILED - req.user is undefined (protect middleware might have failed or was bypassed)');
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    console.log(`User: ${req.user.email}`);
    console.log(`Role: ${req.user.role}`);
    console.log(`Status: ${req.user.status}`);

    if (req.user.role === 'admin') {
        console.log('Result: SUCCESS');
        console.log('--- ADMIN CHECK END ---');
        next();
    } else {
        console.log('Result: FAILED - Not an admin');
        console.log('--- ADMIN CHECK END ---');
        res.status(403).json({ success: false, error: 'Not authorized as an admin' });
    }
};
