# Geo AI Insights - Quick Start Guide

## ⚡ Quick Start (5 Minutes)

### Step 1: Ensure MongoDB is Running

**Option A - Using MongoDB as a Windows Service:**
```bash
net start MongoDB
```

**Option B - Using MongoDB in Docker:**
```bash
docker run -d -p 27017:27017 --name geo-ai-mongodb mongo:latest
```

**Option C - Download MongoDB Compass and connect to localhost:27017**

### Step 2: Start the Backend Server

Open a new terminal:
```bash
cd c:\Users\DELL\Documents\Claud-project\geo-ai-insights\server
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running in development mode on port 5000
```

### Step 3: Start the Frontend

Open another terminal:
```bash
cd c:\Users\DELL\Documents\Claud-project\geo-ai-insights
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 4: Access the Application

Open your browser and go to: **http://localhost:5173**

### Step 5: Create Your First Account

1. Click "Sign up"
2. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Password: Test123!@# (must have uppercase, lowercase, number, special char)
   - Company: Your Company (optional)
3. Click "Sign Up"

🎉 **You're in!** Start exploring the seismic interpretation platform.

---

## 🔍 Troubleshooting

### MongoDB Connection Error?
- Make sure MongoDB is running
- Check if port 27017 is available
- Try: `docker ps` to see if MongoDB container is running

### Frontend Not Loading?
- Check if backend is running on port 5000
- Open http://localhost:5000/api/health to verify

### Can't Login?
- Check browser console for errors
- Verify backend terminal shows no errors
- Try creating a new account

---

## 📁 Project Status

✅ Full-stack authentication system
✅ JWT-based security
✅ bcrypt password hashing  
✅ Protected routes
✅ User profile management
✅ Seismic data visualization
✅ Production-ready architecture

---

For full documentation, see [README.md](./README.md)
