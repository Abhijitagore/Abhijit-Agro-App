#!/bin/bash

# GoreVerse FarmLedger - Production Deployment Script
# This script helps prepare your application for Hostinger deployment

echo "🌱 GoreVerse FarmLedger - Production Build Script"
echo "=================================================="
echo ""

# Step 1: Build Frontend
echo "📦 Step 1: Building frontend for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend build successful!"
echo ""

# Step 2: Check Backend Dependencies
echo "📦 Step 2: Installing backend dependencies..."
cd backend
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed!"
    exit 1
fi

echo "✅ Backend dependencies installed!"
echo ""

# Step 3: Create production checklist
echo "📋 Step 3: Production Deployment Checklist"
echo ""
echo "Before deploying to Hostinger, make sure you have:"
echo ""
echo "  [ ] Updated backend/.env.production with your database credentials"
echo "  [ ] Updated .env.production with your production API URL"
echo "  [ ] Configured Google OAuth authorized origins"
echo "  [ ] Set up PostgreSQL database on Hostinger"
echo "  [ ] Uploaded backend folder to Hostinger"
echo "  [ ] Uploaded dist folder contents to public_html"
echo "  [ ] Configured environment variables in Hostinger panel"
echo "  [ ] Enabled SSL certificate on your domain"
echo "  [ ] Run database migration: npm run db:migrate"
echo ""

# Step 4: Display deployment info
echo "📝 Deployment Files Ready:"
echo ""
echo "  Frontend: ./dist folder → Upload to public_html"
echo "  Backend:  ./backend folder → Upload to Node.js app directory"
echo ""
echo "Next Steps:"
echo "1. Read DEPLOYMENT.md for detailed instructions"
echo "2. Configure your environment variables"
echo "3. Upload files to Hostinger"
echo "4. Run database migrations"
echo "5. Test your deployment"
echo ""
echo "✨ Good luck with your deployment!"
