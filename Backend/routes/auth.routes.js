const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, age, gender, contact } = req.body;
        
        // Input validation
        const validationErrors = {};
        if (!username || username.trim().length === 0) {
            validationErrors.username = 'Username is required';
        }
        if (!email || email.trim().length === 0) {
            validationErrors.email = 'Email is required';
        }
        if (!password || password.length < 6) {
            validationErrors.password = 'Password must be at least 6 characters long';
        }

        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({ 
                error: 'Validation error',
                details: validationErrors
            });
        }

        // Clean input data
        const cleanData = {
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password,
            role: role || 'user',
            account_balance: 1000.00,
            ...(role === 'user' ? { 
                age: age ? parseInt(age) : null,
                gender: gender || null,
                contact: contact ? contact.trim() : null
            } : {})
        };

        // Check for existing user
        const existingUser = await User.findOne({ 
            where: { email: cleanData.email }
        });
        
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        console.log('Creating user:', {
            ...cleanData,
            password: '[REDACTED]'
        });

        const user = await User.create(cleanData);

        res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                account_balance: user.account_balance
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }

        res.status(500).json({ 
            error: 'Registration failed',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate token with longer expiration (24 hours)
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // Update last login time
        await user.update({ last_login: new Date() });

        res.status(200).json({ 
            message: 'Login successful',
            token,
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                account_balance: user.account_balance
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add refresh token route
router.post('/refresh-token', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate new token
        const newToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ token: newToken });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

// Logout a user
router.post('/logout', authenticate, async (req, res) => {
    const authHeader = req.header('Authorization');
    const token = authHeader.split(' ')[1]; // Extract the token

    try {
        // Add the token to the blacklist
        await BlacklistedToken.create({ token });

        res.status(200).json({ message: 'Logout successful. Token has been blacklisted.' });
    } catch (error) {
        console.error('Error during logout:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get the authenticated user's profile
router.get('/profile', authenticate, (req, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.status(200).json({ 
        user: {
            ...userWithoutPassword,
            account_balance: req.user.account_balance
        } 
    });
});

module.exports = router;