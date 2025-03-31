const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');

const authenticate = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Check if token is blacklisted using Sequelize
        const blacklistedToken = await BlacklistedToken.findOne({
            where: { token }
        });
        if (blacklistedToken) {
            return res.status(401).json({ 
                error: 'Token is invalid',
                code: 'TOKEN_BLACKLISTED'
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check token expiration with some buffer time (5 minutes)
        const expirationBuffer = 5 * 60; // 5 minutes in seconds
        if (decoded.exp - (Date.now() / 1000) < expirationBuffer) {
            return res.status(401).json({ 
                error: 'Token is about to expire',
                code: 'TOKEN_EXPIRING'
            });
        }

        // Find user using Sequelize
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Set user data in request
        req.user = {
            id: user.id,  // Ensure ID is explicitly set
            ...user.get({ plain: true })
        };
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token has expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        console.error('Token verification failed:', error.message);
        res.status(401).json({ error: 'Invalid token.' });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};

module.exports = { authenticate, authorizeAdmin };