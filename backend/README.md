# Goreverse AgroBook Backend API

Complete Node.js + Express + PostgreSQL backend for the Goreverse AgroBook application.

## 🏗️ Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** Google OAuth 2.0 + JWT
- **ORM:** Native `pg` driver

## 📦 Installation

### Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** v18+ installed
3. **Google OAuth Client ID** (from Google Cloud Console)

### Setup Steps

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure `.env` file:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=agrobook_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   JWT_SECRET=your_super_secret_jwt_key_change_this
   GOOGLE_CLIENT_ID=your_google_client_id
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Create PostgreSQL database:**
   ```bash
   # Login to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE agrobook_db;

   # Exit psql
   \q
   ```

5. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Start the server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Production mode
   npm start
   ```

The API will be available at `http://localhost:5000`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/google-login` - Google OAuth login
- `GET /api/auth/profile` - Get user profile (protected)

### Crops
- `GET /api/crops` - Get all crops
- `GET /api/crops/:id` - Get crop with all details
- `POST /api/crops` - Create new crop
- `PUT /api/crops/:id` - Update crop
- `DELETE /api/crops/:id` - Delete crop

#### Crop Sub-resources
- `POST /api/crops/:crop_id/schedules` - Add schedule
- `PUT /api/crops/schedules/:id` - Update schedule
- `DELETE /api/crops/schedules/:id` - Delete schedule
- `POST /api/crops/:crop_id/fertilizers` - Add fertilizer
- `DELETE /api/crops/fertilizers/:id` - Delete fertilizer
- `POST /api/crops/:crop_id/pesticides` - Add pesticide
- `DELETE /api/crops/pesticides/:id` - Delete pesticide
- `POST /api/crops/:crop_id/sprays` - Add spray
- `DELETE /api/crops/sprays/:id` - Delete spray

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get single expense
- `GET /api/expenses/stats` - Get expense statistics
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Revenue
- `GET /api/revenue` - Get all revenue
- `GET /api/revenue/:id` - Get single revenue
- `GET /api/revenue/stats` - Get revenue statistics
- `POST /api/revenue` - Create revenue
- `PUT /api/revenue/:id` - Update revenue
- `DELETE /api/revenue/:id` - Delete revenue

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Login Flow

1. Frontend sends Google OAuth credential to `/api/auth/google-login`
2. Backend verifies Google token
3. Backend creates/updates user in database
4. Backend returns JWT token
5. Frontend stores token and includes it in subsequent requests

## 📊 Database Schema

See `src/config/migrate.js` for complete schema.

**Main tables:**
- `users` - User accounts (from Google OAuth)
- `crops` - Crop records
- `schedules` - Crop schedules
- `fertilizers` - Fertilizer applications
- `pesticides` - Pesticide applications
- `sprays` - Spray applications
- `expenses` - Farm expenses
- `revenue` - Farm income
- `fields` - Field locations

## 🚀 Deployment

### Environment Variables (Production)

Make sure to set production values for:
- `JWT_SECRET` - Use a strong random string
- `DB_PASSWORD` - Secure database password
- `CORS_ORIGIN` - Your frontend production URL

### Security Checklist

- ✅ Use HTTPS in production
- ✅ Set strong `JWT_SECRET`
- ✅ Configure CORS properly
- ✅ Use environment variables for secrets
- ✅ Enable PostgreSQL SSL connections
- ✅ Implement rate limiting (recommended)
- ✅ Add input validation

## 📝 Developer

**Designed & Developed by Abhijit Gore**

---

For frontend integration, see the main project README.
