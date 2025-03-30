const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        // Check if the email already exists
        const existingUser = await User.findOne({ 
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create a new user
        const user = await User.create({ 
            username, 
            email, 
            password, 
            role 
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ 
            where: { email } 
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check the password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        // Clean up old blacklisted tokens for this user (using Sequelize's destroy)
        await BlacklistedToken.destroy({
            where: { token }
        });

        // Update last login time
        await user.update({ last_login: new Date() });

        res.status(200).json({ 
            message: 'Login successful', 
            token, 
            user: { 
                username: user.username, 
                email: user.email, 
                role: user.role 
            } 
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: 'Internal server error' });
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
    res.status(200).json({ user: req.user });
});

module.exports = router;