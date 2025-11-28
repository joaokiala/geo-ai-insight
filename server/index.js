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

// Load environment variables
dotenv.config();

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
            expiresIn: process.env.JWT_EXPIRE
        });
    };
    
    app.post('/api/auth/register', async (req, res) => {
        try {
            const { name, email, password, company } = req.body;
            if (users.find(u => u.email === email)) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = { id: Date.now().toString(), name, email, password: hashedPassword, company, role: 'user' };
            users.push(user);
            const token = generateToken(user.id);
            res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            res.json({ success: true, token, user: { id: user.id, name, email, company, role: user.role } });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });
    
    app.post('/api/auth/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = users.find(u => u.email === email);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            const token = generateToken(user.id);
            res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, company: user.company, role: user.role } });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });
    
    app.get('/api/auth/me', (req, res) => {
        try {
            const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
            if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = users.find(u => u.id === decoded.id);
            if (!user) return res.status(401).json({ success: false, message: 'User not found' });
            res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, company: user.company, role: user.role } });
        } catch (error) {
            res.status(401).json({ success: false, message: 'Not authorized' });
        }
    });
    
    app.post('/api/auth/logout', (req, res) => {
        res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
        res.json({ success: true, message: 'Logged out successfully' });
    });
}

// Connect to database
connectDB();

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: useInMemory ? 'Server running with in-memory storage' : 'Server running with MongoDB',
        storage: useInMemory ? 'In-Memory (Temporary)' : 'MongoDB (Persistent)',
        database: useInMemory ? 'N/A' : (mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'),
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
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`💾 Storage: ${useInMemory ? 'In-Memory (Temporary)' : 'MongoDB (Persistent)'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    if (useInMemory) {
        console.log('⚠️  WARNING: Data will be lost on server restart!');
    }
});

export default app;
