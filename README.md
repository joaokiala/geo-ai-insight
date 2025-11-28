# Geo AI Insights - Production Authentication System

Advanced Seismic Interpretation Platform with AI-powered tools and secure authentication.

## 🚀 Features

### Authentication & Security
- ✅ **JWT-based Authentication** - Secure token-based auth with HTTP-only cookies
- ✅ **Password Security** - bcrypt hashing with salt rounds
- ✅ **Input Validation** - Server-side validation and sanitization
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **CORS Configuration** - Secure cross-origin resource sharing
- ✅ **Protected Routes** - Role-based access control

### Seismic Analysis
- **2D Seismic Viewer** - Interactive seismic section visualization
- **AI Horizon Picking** - Automated horizon detection and tracking (Python-powered)
- **Fault Detection** - Intelligent fault identification (Python-powered)
- **Attribute Analysis** - Coherence, curvature, amplitude extraction
- **Map Generation** - Structure and isochron maps
- **SEG-Y Support** - Import industry-standard seismic data

## 📋 Prerequisites

- Node.js (v18 or higher)
- Python 3.9+ (for AI service)
- npm or yarn
- **MongoDB (Optional)** - System works without MongoDB using in-memory storage
  - For persistent storage, use MongoDB Atlas (free) or local MongoDB
  - See [SETUP_MONGODB.md](./SETUP_MONGODB.md) for setup instructions

## 🛠️ Installation

### 1. Clone or Navigate to Project

```bash
cd c:/Users/DELL/Documents/true_qoder/geo-ai-insights
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Install Python AI Service Dependencies

```bash
cd ../ai-service
pip install -r requirements.txt
```

### 5. Configure Environment Variables (Optional)

The system works immediately with in-memory storage. For persistent storage:

Edit `server/.env` and update MongoDB connection:

```env
# For MongoDB Atlas (free cloud database - recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/geo-ai-insights

# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/geo-ai-insights
```

**See [SETUP_MONGODB.md](./SETUP_MONGODB.md) for detailed MongoDB setup instructions.**

Other settings in `.env`:
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secure-secret-key-min-32-characters
JWT_EXPIRE=24h
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:5001
```

**IMPORTANT**: Change `JWT_SECRET` to a strong random string in production!

### 6. Start the Application (MongoDB Optional)

**The system works immediately without MongoDB!** It uses intelligent fallback to in-memory storage.

#### Option A: Start All Services Separately

Terminal 1 (AI Service):
```bash
cd ai-service
python app.py
```

Terminal 2 (Backend):
```bash
cd server
npm run dev
```

Terminal 3 (Frontend):
```bash
npm run dev
```

#### Option B: Start Everything with Docker (Recommended)

```bash
docker-compose up
```

This will start all services:
- Frontend (port 5173)
- Backend (port 5000) 
- AI Service (port 5001)

#### Option C: Start Both Concurrently (Once dependencies are installed)

From the root directory:
```bash
npm start
```

### 7. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- AI Service: http://localhost:5001
- API Health Check: http://localhost:5000/api/health

**Storage Status:** Check `/api/health` to see if using MongoDB or in-memory storage.

## 🔐 First Time Setup

1. Navigate to http://localhost:5173
2. You'll be redirected to the login page
3. Click "Sign up" to create your first account
4. Fill in your details:
   - Name: Your full name
   - Email: your@email.com
   - Password: Min 8 chars with uppercase, lowercase, number, and special character
   - Company: Your organization (optional)
5. Click "Sign Up"
6. You'll be automatically logged in and redirected to the dashboard

## 📱 Using the Platform

### Navigation
- **Seismic Viewer**: View and analyze 2D seismic sections
- **AI Tools**: Access automated interpretation features
- **Map Generator**: Create structure and attribute maps
- **Import Data**: Upload SEG-Y files and well logs

### User Profile
- Click your profile icon in the top-right
- View account information
- Logout securely

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

### AI Services
- `POST /api/ai/horizon-pick` - AI-powered horizon picking
- `POST /api/ai/fault-detection` - AI-powered fault detection
- `POST /api/ai/attribute-analysis` - Seismic attribute analysis
- `GET /api/ai/health` - Check AI service health

### Request Examples

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your-token-here" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "company": "Oil & Gas Co"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your-token-here" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**AI Horizon Picking:**
```bash
curl -X POST http://localhost:5000/api/ai/horizon-pick \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your-token-here" \
  -d '{
    "seismicData": [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]
  }'
```

## 🏗️ Project Structure

```
geo-ai-insights/
├── ai-service/             # Python AI service
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # AI service Dockerfile
├── server/                 # Backend API
│   ├── models/             # MongoDB models
│   │   └── User.js         # User model with bcrypt
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication endpoints
│   │   └── ai.js           # AI service endpoints
│   ├── middleware/         # Express middleware
│   │   ├── auth.js         # JWT verification
│   │   └── validate.js     # Input validation
│   ├── utils/              # Utility functions
│   │   └── aiService.js    # AI service client
│   ├── .env                # Environment variables
│   ├── index.js            # Server entry point
│   └── package.json        # Backend dependencies
├── src/
│   ├── components/         # React components
│   │   ├── Login.jsx       # Login page
│   │   ├── Signup.jsx      # Registration page
│   │   ├── UserProfile.jsx # User dropdown
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   ├── SeismicViewer.jsx  # Seismic visualization
│   │   └── Sidebar.jsx     # Navigation sidebar
│   ├── context/           
│   │   └── AuthContext.jsx # Authentication state
│   ├── utils/              # Utility functions
│   │   ├── seismicGenerator.js
│   │   ├── attributeCalculator.js
│   │   ├── aiInterpreter.js
│   │   ├── realSeismicLoader.js
│   │   └── segyParser.js
│   ├── styles/
│   │   └── main.css        # Global styles
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── index.html
├── docker-compose.yml      # Docker orchestration
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── package.json            # Frontend dependencies
```

## 🔐 Security Features

1. **Password Requirements**:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character (@$!%*?&)

2. **Token Security**:
   - HTTP-only cookies prevent XSS attacks
   - 24-hour expiration
   - Secure flag in production (HTTPS only)

3. **Rate Limiting**:
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 10 requests per 15 minutes

4. **Input Validation**:
   - Server-side validation on all inputs
   - Sanitization to prevent injection attacks
   - Email format validation

## 🚀 Production Deployment

### Environment Setup

1. Set `NODE_ENV=production` in server/.env
2. Use a strong JWT_SECRET (min 32 characters)
3. Configure production MongoDB (MongoDB Atlas recommended)
4. Enable HTTPS (required for secure cookies)
5. Update CORS origins to your production domain

### Build Frontend

```bash
npm run build
```

### Deployment Options

- **Backend**: Deploy to Heroku, AWS, DigitalOcean, or Railway
- **Frontend**: Deploy to Vercel, Netlify, or AWS S3
- **AI Service**: Deploy to AWS, Google Cloud, or Azure ML
- **Database**: MongoDB Atlas (fully managed)

### Additional Security for Production

- Enable MongoDB authentication
- Use environment variables for all secrets
- Implement refresh tokens for extended sessions
- Add audit logging for authentication events
- Consider implementing 2FA
- Set up monitoring and alerts

## 📝 License

MIT

## 👥 Support

For issues or questions:
1. Check the MongoDB connection
2. Verify environment variables are set correctly
3. Ensure all services are running
4. Check browser console for errors

---

**Built with**: React, Node.js, Express, MongoDB, JWT, Tailwind CSS, Three.js, Python, Flask, TensorFlow