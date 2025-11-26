# Goreverse AgroBook - Farm Management System

A comprehensive farm management application with expense tracking, crop management, and analytics.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 💰 **Expense Tracking** - Track all farm costs and expenses
- 💵 **Revenue Management** - Monitor sales and income
- 🌾 **Crop Management** - Manage crops with progress tracking
- 🏞️ **Field Management** - Organize multiple farm fields
- 📊 **Analytics** - Visualize farm performance
- 🌍 **Multi-language Support** - English, Hindi, and Marathi
- 🎨 **Beautiful UI** - Modern dark theme with premium design

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Google OAuth

To enable Google Login, you need to create a Google OAuth Client ID:

#### Step-by-Step Guide:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter project name: "Goreverse AgroBook"
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen:
     - Choose "External" user type
     - Fill in app name: "Goreverse AgroBook"
     - Add your email as support email
     - Click "Save and Continue"
   - Select "Web application" as application type
   - Name: "Goreverse AgroBook Web Client"
   - Add Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:5174`
   - Add Authorized redirect URIs:
     - `http://localhost:5173`
     - `http://localhost:5174`
   - Click "Create"

5. **Copy Your Client ID**
   - You'll see a popup with your Client ID
   - Copy the Client ID (it looks like: `123456789-abc123def456.apps.googleusercontent.com`)

6. **Update the Application**
   - Open `src/App.jsx`
   - Find the line: `const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";`
   - Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID

### 3. Run the Application

```bash
npm run dev
```

The application will open at `http://localhost:5174/`

## Usage

1. **Login** - Click "Sign in with Google" on the login page
2. **Dashboard** - View your farm overview with stats and recent activities
3. **Expenses** - Add and track farm expenses
4. **Revenue** - Record sales and income
5. **Crops** - Manage your crops with progress tracking
6. **Fields** - Organize your farm fields
7. **Analytics** - View performance charts and insights
8. **Language** - Switch between English, Hindi, and Marathi using the dropdown in the sidebar

## Security Features

- ✅ Google OAuth 2.0 authentication
- ✅ JWT token validation
- ✅ Secure session management with localStorage
- ✅ Protected routes (requires authentication)
- ✅ Logout functionality to clear session

## Developer

**Designed & Developed by Abhijit Gore**

## Tech Stack

- React + Vite
- Google OAuth (@react-oauth/google)
- CSS3 with modern design
- LocalStorage for session persistence

## License

Private - All rights reserved

---

For any issues or questions, please contact the developer.
# Abhijit-Agro-App
