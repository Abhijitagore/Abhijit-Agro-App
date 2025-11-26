#!/bin/bash

# Goreverse AgroBook - Backend Setup Script
# Designed & Developed by Abhijit Gore

echo "🌾 Goreverse AgroBook - Backend Setup 🌾"
echo "========================================"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed!"
    echo "   Install it from: https://www.postgresql.org/download/"
    exit 1
fi

echo "✅ PostgreSQL found"

# Check if database exists
DB_EXISTS=$(psql -U postgres -lqt | cut -d \| -f 1 | grep -w agrobook_db)

if [ -z "$DB_EXISTS" ]; then
    echo ""
    echo "📊 Creating database 'agrobook_db'..."
    psql -U postgres -c "CREATE DATABASE agrobook_db;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Database created successfully!"
    else
        echo "⚠️  Could not create database automatically"
        echo "   Please run manually: psql -U postgres -c 'CREATE DATABASE agrobook_db;'"
    fi
else
    echo "✅ Database 'agrobook_db' already exists"
fi

echo ""
echo "🔄 Running database migrations..."
npm run db:migrate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🚀 You can now start the server with:"
    echo "   npm run dev"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    echo "   Please check your database connection settings in .env"
    exit 1
fi
