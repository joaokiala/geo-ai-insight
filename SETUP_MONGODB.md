# MongoDB Setup Guide

Your system is currently running in **in-memory mode** (temporary storage). Follow this guide to enable **persistent storage** with MongoDB.

## ✅ Current Status
- ✅ Server runs with in-memory storage (data lost on restart)
- ✅ All features work normally
- ⚠️ User accounts are temporary

## 🎯 Solution Options

### Option 1: MongoDB Atlas (Recommended - FREE & No Installation)

**Advantages:**
- ✅ Completely FREE tier (512MB storage)
- ✅ No software installation needed
- ✅ Works on any computer
- ✅ Data persists forever
- ✅ Automatic backups
- ✅ 5-minute setup

**Steps:**

1. **Create Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Click "Start Free"
   - Sign up with email or Google account

2. **Create Free Cluster**
   - Choose **M0 FREE** tier
   - Select a region close to you
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Setup Database Access**
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `geoai_admin` (or your choice)
   - Password: Generate a secure password (save it!)
   - User Privileges: "Atlas admin"
   - Click "Add User"

4. **Setup Network Access**
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Click "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://geoai_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Update .env File**
   - Open `server/.env`
   - Replace the MONGODB_URI line with:
     ```env
     MONGODB_URI=mongodb+srv://geoai_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/geo-ai-insights?retryWrites=true&w=majority
     ```
   - **Replace**:
     - `YOUR_PASSWORD` with your actual password
     - `cluster0.xxxxx` with your actual cluster address

7. **Restart Server**
   - Stop the current server (Ctrl+C)
   - Run: `npm run dev`
   - You should see: ✅ MongoDB Connected

---

### Option 2: Local MongoDB Installation

**Advantages:**
- ✅ Works offline
- ✅ Full control

**Disadvantages:**
- ❌ Requires software installation
- ❌ More complex setup

**Steps for Windows:**

1. **Download MongoDB**
   - Go to: https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server (latest version)
   - Choose Windows x64 MSI

2. **Install MongoDB**
   - Run the installer
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Uncheck "Install MongoDB Compass" (optional GUI)
   - Complete installation

3. **Start MongoDB Service**
   ```powershell
   net start MongoDB
   ```

4. **Update .env File**
   - Open `server/.env`
   - Update the MONGODB_URI line:
     ```env
     MONGODB_URI=mongodb://localhost:27017/geo-ai-insights
     ```

5. **Restart Server**
   - Stop current server (Ctrl+C)
   - Run: `npm run dev`
   - You should see: ✅ MongoDB Connected: localhost

---

### Option 3: Docker (If you have Docker installed)

```bash
docker run -d -p 27017:27017 --name geo-ai-mongodb mongo:latest
```

Then update `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/geo-ai-insights
```

---

## 🔍 Verify Connection

After setup, check the health endpoint:
```
http://localhost:5000/api/health
```

Should show:
```json
{
  "success": true,
  "message": "Server running with MongoDB",
  "storage": "MongoDB (Persistent)",
  "database": "Connected"
}
```

---

## 🆘 Troubleshooting

**Can't connect to MongoDB Atlas?**
- Check username/password in connection string
- Verify Network Access allows your IP
- Wait 5 minutes after creating cluster

**Local MongoDB won't start?**
- Check if service is running: `net start MongoDB`
- Check port 27017 is not in use
- Review MongoDB installation

**Still using in-memory?**
- Check `.env` file has correct MONGODB_URI
- Restart the server completely
- Check server console for error messages

---

## 📊 Benefits of Persistent Storage

Once MongoDB is connected:
- ✅ Users remain after server restart
- ✅ All data is permanently saved
- ✅ Production-ready setup
- ✅ Can scale to millions of users
- ✅ Professional database features

---

## 💡 Need Help?

1. Check server console for error messages
2. Verify `.env` file syntax (no extra spaces)
3. Test connection at `/api/health` endpoint
4. MongoDB Atlas has 24/7 support docs

---

**Current Mode:** In-Memory (Temporary)
**Recommended:** MongoDB Atlas (Free, 5 minutes)
