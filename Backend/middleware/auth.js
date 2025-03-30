const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');

const authenticate = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token after "Bearer"

    try {
        // Check if the token is blacklisted
        const blacklistedToken = await BlacklistedToken.findOne({ token });
        if (blacklistedToken) {
            return res.status(401).json({ error: 'Token is blacklisted. Please log in again.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id); // Fetch user from the database
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        req.user = user; // Attach user info to the request
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};

module.exports = { authenticate, authorizeAdmin };