import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js'; // Add AI routes

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined in environment variables');
    console.log('💡 Please set JWT_SECRET in your .env file');
    process.exit(1);
}

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

const app = express();

// In-memory storage fallback
let useInMemory = false;
let users = [];

// Security Middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later'
});

app.use('/api/', limiter);

// CORS Configuration
app.use(cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// MongoDB Connection
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('your-username')) {
            console.log('⚠️  MongoDB URI not configured, using in-memory storage');
            console.log('💡 To enable persistent storage:');
            console.log('   1. Install MongoDB locally, OR');
            console.log('   2. Create free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas');
            console.log('   3. Update MONGODB_URI in .env file');
            useInMemory = true;
            setupInMemoryRoutes();
            return;
        }
        
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log('💾 Using persistent database storage');
        useInMemory = false;
        app.use('/api/auth', authRoutes);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log('⚠️  Falling back to in-memory storage');
        useInMemory = true;
        setupInMemoryRoutes();
    }
};

// In-memory authentication routes
function setupInMemoryRoutes() {
    console.log('📝 Setting up in-memory authentication routes...');
    
    const generateToken = (id) => {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '24h'
        });
    };
    
    app.post('/api/auth/register', async (req, res) => {
        try {
            console.log('📥 In-memory registration request received:', req.body);
            const { name, email, password, company } = req.body;
            
            // Validate required fields
            if (!name || !email || !password) {
                console.log('⚠️ Missing required fields:', { name: !!name, email: !!email, password: !!password });
                return res.status(400).json({ 
                    success: false, 
                    message: 'Name, email, and password are required' 
                });
            }
            
            // Validate email format
            const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(email)) {
                console.log('⚠️ Invalid email format:', email);
                return res.status(400).json({ 
                    success: false, 
                    message: 'Please provide a valid email' 
                });
            }
            
            // Validate password strength
            if (password.length < 8) {
                console.log('⚠️ Password too short:', password.length);
                return res.status(400).json({ 
                    success: false, 
                    message: 'Password must be at least 8 characters' 
                });
            }
            
            // Check if user already exists
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                console.log('⚠️ User already exists with email:', email);
                return res.status(400).json({ 
                    success: false, 
                    message: 'User already exists with this email' 
                });
            }
            
            // Hash password
            console.log('🔒 Hashing password for user:', email);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Create user
            const user = { 
                id: Date.now().toString(), 
                name, 
                email, 
                password: hashedPassword, 
                company: company || '',
                role: 'user' 
            };
            
            users.push(user);
            console.log('✅ User created successfully:', user.id);
            
            // Generate token
            const token = generateToken(user.id);
            
            // Set cookie
            res.cookie('token', token, { 
                httpOnly: true, 
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            });
            
            // Send response
            console.log('📤 Sending registration response for user:', user.id);
            res.status(201).json({ 
                success: true, 
                token,
                user: { 
                    id: user.id, 
                    name: user.name, 
                    email: user.email, 
                    company: user.company,
                    role: user.role 
                } 
            });
        } catch (error) {
            console.error('❌ In-memory registration error:', error);
            console.error('📝 Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            res.status(500).json({ 
                success: false, 
                message: 'Server error during registration: ' + error.message 
            });
        }
    });
    
    app.post('/api/auth/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            
            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email and password are required' 
                });
            }
            
            // Find user
            const user = users.find(u => u.email === email);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid credentials' 
                });
            }
            
            // Generate token
            const token = generateToken(user.id);
            
            // Set cookie
            res.cookie('token', token, { 
                httpOnly: true, 
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            });
            
            // Send response
            res.json({ 
                success: true, 
                token,
                user: { 
                    id: user.id, 
                    name: user.name, 
                    email: user.email, 
                    company: user.company,
                    role: user.role 
                } 
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error during login: ' + error.message 
            });
        }
    });
    
    app.get('/api/auth/me', (req, res) => {
        try {
            const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Not authorized' 
                });
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = users.find(u => u.id === decoded.id);
            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }
            
            res.json({ 
                success: true, 
                user: { 
                    id: user.id, 
                    name: user.name, 
                    email: user.email, 
                    company: user.company,
                    role: user.role 
                } 
            });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(401).json({ 
                success: false, 
                message: 'Not authorized: ' + error.message 
            });
        }
    });
    
    app.post('/api/auth/logout', (req, res) => {
        res.cookie('token', 'none', { 
            expires: new Date(Date.now() + 10 * 1000), 
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    });
}

// Connect to database
connectDB();

// Use AI routes
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: useInMemory ? 'Server running with in-memory storage' : 'Server running with MongoDB',
        storage: useInMemory ? 'In-Memory (Temporary)' : 'MongoDB (Persistent)',
        database: useInMemory ? 'N/A' : (mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'),
        aiService: AI_SERVICE_URL,
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`💾 Storage: ${useInMemory ? 'In-Memory (Temporary)' : 'MongoDB (Persistent)'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    if (useInMemory) {
        console.log('⚠️  WARNING: Data will be lost on server restart!');
    }
    
    // Log environment info
    console.log(`🔐 JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '❌ Missing'}`);
    console.log(`🌐 CLIENT_URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
}).on('error', (err) => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
});

export default app;
