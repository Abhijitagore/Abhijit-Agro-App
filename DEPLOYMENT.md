# GoreVerse FarmLedger - Production Deployment Guide for Hostinger

## 🚀 Quick Start Deployment Checklist

### Prerequisites
- [x] Hostinger account with Node.js hosting
- [x] PostgreSQL database access
- [x] Domain name configured
- [x] Google OAuth credentials

## 📋 Step-by-Step Deployment

### 1. Database Setup (PostgreSQL on Hostinger)

1. **Access your Hostinger Control Panel**
2. **Create a PostgreSQL Database:**
   - Go to "Databases" → "PostgreSQL Databases"
   - Create a new database: `agrobook_db`
   - Note down: Database Host, Username, Password
   
3. **Run Migration:**
   ```bash
   # SSH into your Hostinger server
   cd backend
   npm install
   npm run db:migrate
   ```

### 2. Backend Configuration

1. **Update `.env.production` file in `/backend` folder:**
   ```env
   NODE_ENV=production
   PORT=5001
   
   # Update these with your Hostinger database details
   DB_HOST=your_actual_database_host.hostinger.com
   DB_PORT=5432
   DB_NAME=agrobook_db
   DB_USER=your_database_username
   DB_PASSWORD=your_actual_database_password
   
   # Generate a strong JWT secret (32+ characters)
   JWT_SECRET=your_very_strong_random_secret_key_here_minimum_32_chars
   
   # Your Google OAuth Client ID
   GOOGLE_CLIENT_ID=121241610750-hqetga0d1qk9rimltdnu0qrvt981t373.apps.googleusercontent.com
   
   # Your production domain
   CORS_ORIGIN=https://yourdomain.com
   
   # Admin email (first user with this email becomes admin)
   ADMIN_EMAIL=your.email@gmail.com
   ```

2. **Copy the production environment file:**
   ```bash
   cp .env.production .env
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```

### 3. Frontend Configuration

1. **Update Google OAuth Authorized Origins:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" → "Credentials"
   - Edit your OAuth 2.0 Client ID
   - Add Authorized JavaScript origins:
     - `https://yourdomain.com`
   - Add Authorized redirect URIs:
     - `https://yourdomain.com`
     - `https://yourdomain.com/dashboard`

2. **Update `vite.config.js` for production:**
   - The proxy is only for development
   - In production, update API calls to use your backend URL

3. **Build the frontend for production:**
   ```bash
   npm run build
   ```

4. **Upload the `dist` folder** to your Hostinger public_html directory

### 4. Environment Variables on Hostinger

**For Backend (Node.js App):**
Set these environment variables in Hostinger Node.js settings:
- `NODE_ENV=production`
- `PORT=5001`
- `DB_HOST=your_database_host`
- `DB_NAME=agrobook_db`
- `DB_USER=your_db_user`
- `DB_PASSWORD=your_db_password`
- `JWT_SECRET=your_jwt_secret`
- `GOOGLE_CLIENT_ID=your_google_client_id`
- `CORS_ORIGIN=https://yourdomain.com`
- `ADMIN_EMAIL=your.email@gmail.com`

### 5. API Endpoint Configuration

Update your frontend to point to your production backend API.

**Option A: Create a production environment file**
Create `/src/config.js`:
```javascript
export const API_URL = import.meta.env.PROD 
  ? 'https://yourdomain.com/api' 
  : 'http://localhost:5001/api';
```

**Option B: Use environment variable**
Create `.env.production` in root:
```env
VITE_API_URL=https://yourdomain.com/api
```

### 6. Hostinger Deployment Options

#### Option A: Using Hostinger's Node.js Hosting
1. Upload your entire project
2. Set the entry point to `backend/src/server.js`
3. Configure environment variables in Hostinger panel
4. Upload the frontend `dist` folder to `public_html`

#### Option B: Using cPanel File Manager
1. Build the frontend: `npm run build`
2. Upload the `dist` folder contents to `public_html`
3. Set up a subdomain for the backend (e.g., `api.yourdomain.com`)
4. Upload and configure the backend on the subdomain

### 7. SSL Certificate
- Enable SSL/HTTPS in Hostinger (usually free with Let's Encrypt)
- Update CORS_ORIGIN to use `https://`

### 8. Testing Checklist

After deployment, test:
- [ ] Homepage loads correctly
- [ ] Google Sign-In works
- [ ] Dashboard displays properly
- [ ] Can add expenses, revenue, crops, fields
- [ ] Excel export works
- [ ] Multi-language switching works
- [ ] All API endpoints respond correctly

## 🔒 Security Notes

1. **Never commit `.env` files to Git**
2. **Use strong JWT secrets** (minimum 32 characters, random)
3. **Enable HTTPS** on your domain
4. **Keep Google OAuth origins restricted** to your domain only
5. **Regular database backups** through Hostinger

## 🔧 Troubleshooting

### Issue: Can't connect to database
- Check DB credentials in `.env`
- Verify PostgreSQL is running
- Check firewall/network settings

### Issue: Google Sign-In fails
- Verify GOOGLE_CLIENT_ID is correct
- Check authorized origins in Google Console
- Ensure CORS_ORIGIN matches your domain

### Issue: 404 on API calls
- Check backend server is running
- Verify API URL configuration
- Check CORS settings

## 📝 Production Checklist

Before going live:
- [ ] Database migrated successfully
- [ ] Environment variables set correctly
- [ ] Google OAuth configured for production domain
- [ ] SSL certificate enabled
- [ ] Backend running and accessible
- [ ] Frontend built and deployed
- [ ] All functionality tested
- [ ] Admin account created
- [ ] Database backup configured

## 🆘 Support

If you encounter issues:
1. Check Hostinger logs
2. Check browser console for frontend errors
3. Check backend logs for API errors
4. Verify all environment variables are set

---

**Application:** GoreVerse FarmLedger
**Developer:** Abhijit Gore
**Version:** 1.0.0
