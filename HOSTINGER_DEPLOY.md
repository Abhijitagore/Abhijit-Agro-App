# 🌱 GoreVerse FarmLedger - Hostinger Deployment Quick Guide

## ⚡ Quick Deploy (5 Minutes)

### What You Need:
1. Hostinger account with Node.js hosting
2. PostgreSQL database
3. Your domain name
4. Google OAuth Client ID (already configured: `121241610750-hqetga0d1qk9rimltdnu0qrvt981t373`)

---

## 🚀 Deploy in 3 Steps

### Step 1: Build Your App
```bash
./deploy.sh
```
This creates a production-ready build in the `dist` folder.

### Step 2: Configure Environment

**Option A - Using Hostinger File Manager:**
1. Log into Hostinger Control Panel
2. Go to File Manager
3. Create a `.env` file in your backend directory
4. Copy content from `backend/.env.production` and update:
   - `DB_HOST` → Your Hostinger database host
   - `DB_USER` → Your database username
   - `DB_PASSWORD` → Your database password
   - `CORS_ORIGIN` → Your website URL (e.g., `https://yourdomain.com`)
   - `JWT_SECRET` → Create a strong random string (32+ characters)
   - `ADMIN_EMAIL` → Your email address

**Option B - Using SSH:**
```bash
ssh your-username@your-server.hostinger.com
cd your-app-directory/backend
cp .env.production .env
nano .env  # Edit the file with your credentials
```

### Step 3: Upload Files

**Frontend (Static Files):**
1. Upload all files from `dist/` folder to `public_html/`
   - Or use FTP/SFTP client
   - Or use Hostinger File Manager

**Backend (Node.js App):**
1. Upload entire `backend/` folder to your Node.js app directory
2. In Hostinger panel, set Node.js entry point to: `src/server.js`
3. Set Node.js version to: `18.x` or higher

---

## 🗄️ Database Setup

### Create Database (Hostinger Panel)
1. Go to Databases → PostgreSQL
2. Create new database: `agrobook_db`
3. Note the credentials (host, username, password)

### Run Migration (SSH Required)
```bash
ssh your-username@your-server
cd backend
npm install
npm run db:migrate
```

---

## 🔑 Google OAuth Setup

### Update Authorized Origins
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   - `https://yourdomain.com`
4. Add to **Authorized redirect URIs**:
   - `https://yourdomain.com`

---

## ✅ Pre-Deployment Checklist

Before going live, verify:

- [ ] **Database created** on Hostinger
- [ ] **Backend `.env` file** configured with real credentials
- [ ] **Google OAuth** authorized origins updated
- [ ] **SSL certificate** enabled (HTTPS)
- [ ] **dist folder** uploaded to `public_html`
- [ ] **backend folder** uploaded and configured
- [ ] **Database migration** completed
- [ ] **Node.js app** running in Hostinger panel

---

## 🧪 Test Your Deployment

After deployment, test:
1. Visit `https://yourdomain.com`
2. Click "Sign in with Google"
3. Try adding an expense
4. Try exporting to Excel
5. Check if data persists after refresh

---

## 🆘 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:** Check your `.env` file has correct `DB_HOST`, `DB_USER`, `DB_PASSWORD`

### Issue: "Google Sign-In not working"
**Solution:** 
1. Check authorized origins in Google Console
2. Verify `CORS_ORIGIN` in backend `.env` matches your domain
3. Make sure you're using HTTPS (not HTTP)

### Issue: "API calls failing"
**Solution:**
1. Check backend is running in Hostinger panel
2. Verify `VITE_API_URL` in frontend `.env.production`
3. Check browser console for errors

### Issue: "App shows blank page"
**Solution:**
1. Check browser console for errors
2. Verify all files uploaded from `dist/` folder
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## 📞 Need Help?

1. Check `DEPLOYMENT.md` for detailed instructions
2. Review Hostinger documentation
3. Check backend logs in Hostinger panel
4. Check browser console for frontend errors

---

## 📁 File Structure for Hostinger

```
public_html/                 (Your domain root)
├── index.html              (from dist folder)
├── assets/                 (from dist/assets)
└── farm.svg               (from dist)

/home/username/backend/     (Node.js app directory)
├── src/
│   └── server.js          (Entry point)
├── .env                   (Your production config)
├── package.json
└── node_modules/
```

---

## 🎯 Environment Variables Reference

### Backend (`.env` in backend folder)
```env
NODE_ENV=production
PORT=5001
DB_HOST=your_database_host.hostinger.com
DB_NAME=agrobook_db
DB_USER=your_db_username
DB_PASSWORD=your_db_password
JWT_SECRET=your_32_character_random_secret
GOOGLE_CLIENT_ID=121241610750-hqetga0d1qk9rimltdnu0qrvt981t373.apps.googleusercontent.com
CORS_ORIGIN=https://yourdomain.com
ADMIN_EMAIL=your.email@gmail.com
```

### Frontend (`.env.production` in root folder)
```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=GoreVerse FarmLedger
```

---

**🌱 GoreVerse FarmLedger** - Farm Management Made Simple  
Developed by Abhijit Gore
