import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validateRegistration, validateLogin } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '24h'
    });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
    try {
        const token = generateToken(user._id);

        const options = {
            httpOnly: true, // Prevent XSS attacks
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        };

        res
            .status(statusCode)
            .cookie('token', token, options)
            .json({
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    company: user.company,
                    role: user.role
                }
            });
    } catch (error) {
        console.error('Error in sendTokenResponse:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating token'
        });
    }
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validateRegistration, async (req, res) => {
    try {
        console.log('📥 Registration request received:', req.body);
        const { name, email, password, company } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('⚠️ User already exists with email:', email);
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        console.log('🆕 Creating new user with email:', email);
        const user = await User.create({
            name,
            email,
            password,
            company
        });
        console.log('✅ User created successfully:', user._id);

        sendTokenResponse(user, 201, res);
    } catch (error) {
        console.error('❌ Registration error:', error);
        console.error('📝 Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            console.log('⚠️ Duplicate key error for email:', error.keyValue);
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            console.log('⚠️ Validation errors:', messages);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during registration: ' + error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists and get password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login: ' + error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        // Check if user exists in request
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                company: user.company,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user / clear cookie
// @access  Private
router.post('/logout', protect, (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

export default router;