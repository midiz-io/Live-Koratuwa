# 🌱 Interactive Garden Experience — Garden Box Viewer

A **watch-only interactive garden box experience** that allows visitors to explore numbered garden boxes, view localized information, and track their visited boxes during a session. Includes an admin dashboard for analytics and box management.

**🌐 Live Demo :** [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/GeekHirushaDev/LiveKaratuwa)

## 🎯 Project Overview

This is a **session-based visitor tracking system** for garden exploration with no picking/reservation functionality. Visitors can:

- Select their preferred language from 10+ options
- Explore an interactive map of numbered garden boxes
- View detailed information about each box in their language
- Track which boxes they've visited during their session
- Experience a mobile-first, responsive interface

**Admin Features:**
- JWT-authenticated dashboard with analytics
- Box management (CRUD operations) with rich text editor
- Session monitoring and visitor tracking
- Multi-language content management
- Image and audio upload support
- Language usage analytics
- CSV export functionality

## 🛠 Tech Stack

**Backend:**
- Node.js + Express
- Prisma ORM + MySQL
- JWT authentication
- bcryptjs for password hashing
- express-rate-limit for security
- Multer for file uploads

**Frontend:**
- React 18 + Vite
- Tailwind CSS + shadcn/ui components
- React Quill for rich text editing
- i18next for internationalization (10+ languages)
- Recharts for data visualization
- Axios for API communication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Local Development

### 1. Environment Setup

Copy the environment template and configure your database:

```bash
# Copy environment template
cp server/.env.example server/.env
```

Edit `server/.env` with your database credentials:

```env
# Database Configuration
DATABASE_URL="mysql://root:password@localhost:3306/organic_garden"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
SESSION_SECRET="your-session-secret-here"

# Server Configuration
PORT=3001
TRUST_PROXY=false
NODE_ENV=development
```

### 2. Install Dependencies

```bash
# Install all dependencies (root, server, and client)
npm run install:all

# Or install individually:
npm install                    # Root dependencies
cd server && npm install       # Backend dependencies  
cd ../client && npm install    # Frontend dependencies
```

### 3. Database Setup

```bash
# Navigate to server directory
cd server

# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed the database with sample data
npm run db:seed
```

**Verify database setup:**
```bash
# Check seeded data
npm run db:verify
```

This creates:
- 12 sample garden boxes with multilingual content (EN/SI/ZH)
- 1 admin user: `admin@local` / `password123`

### 4. Running the Application

**Option 1: Run both servers concurrently (recommended)**
```bash
# From project root
npm run dev
```

**Option 2: Run servers individually**
```bash
# Terminal 1 - Backend (port 3001)
cd server
npm run dev

# Terminal 2 - Frontend (port 5173)  
cd client
npm run dev
```

### 5. Access the Application

- **Visitor UI**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5173/admin
- **API Health Check**: http://localhost:3001/api/health

**Admin Credentials:**
- Email: `admin@local`
- Password: `password123`

## 📊 Database Schema

### Tables Created

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `boxes` | Garden box information | `number`, `name_en/si/zh`, `description_en/si/zh` |
| `sessions` | Visitor sessions | `sessionKey` (UUID), `ipAddress`, `language` |
| `views` | Box visit tracking | `sessionId`, `boxId`, `language`, `createdAt` |
| `admins` | Admin users | `email`, `password` (hashed) |

### Relationships
- `sessions` → `views` (one-to-many)
- `boxes` → `views` (one-to-many)
- Unique constraint: `(sessionId, boxId)` in views table

## 🔌 API Documentation

### Public API (Visitor)

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/api/session/start` | Initialize visitor session | `{"language": "en"}` | `{"sessionKey": "uuid"}` |
| GET | `/api/boxes` | List all boxes with visited status | - | `[{id, number, name, description, visited}]` |
| GET | `/api/boxes/:id` | Get single box details | - | `{id, number, name, description}` |
| POST | `/api/visit` | Mark box as visited | `{"sessionKey": "uuid", "boxId": 1}` | `{"success": true}` |

### Admin API (JWT Required)

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/api/admin/login` | Admin authentication | `{"email": "admin@local", "password": "password123"}` | `{"token": "jwt"}` |
| GET | `/api/admin/stats/overview` | Dashboard overview | - | `{totalSessions, totalViews, topLanguages}` |
| GET | `/api/admin/stats/boxes` | Box popularity stats | - | `[{boxId, number, views}]` |
| GET | `/api/admin/stats/language-trend` | Language analytics | - | `[{language, count, percentage}]` |
| GET | `/api/admin/sessions` | Session monitoring | Query: `?page=1&limit=20` | `{sessions, pagination}` |
| GET | `/api/admin/boxes` | List all boxes | - | `[{id, number, name_en/si/zh, ...}]` |
| POST | `/api/admin/boxes` | Create new box | Box data | `{id, number, ...}` |
| PUT | `/api/admin/boxes/:id` | Update box | Box data | `{id, number, ...}` |
| DELETE | `/api/admin/boxes/:id` | Delete box | - | `{"success": true}` |
| GET | `/api/admin/export/csv` | Export analytics | - | CSV file download |

### Example API Requests

**Start a visitor session:**
```bash
curl -X POST http://localhost:3001/api/session/start \
  -H "Content-Type: application/json" \
  -d '{"language": "en"}'
```

**Get boxes for a session:**
```bash
curl -X GET http://localhost:3001/api/boxes \
  -H "Cookie: sessionKey=your-session-key"
```

**Admin login:**
```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@local", "password": "password123"}'
```

**Get admin stats (with JWT):**
```bash
curl -X GET http://localhost:3001/api/admin/stats/overview \
  -H "Authorization: Bearer your-jwt-token"
```

## 🎨 Frontend Features

### Visitor Experience

1. **Language Selection Screen**
   - Full-screen language picker with 10+ languages
   - Flag icons and native language names
   - Saves language preference in session

2. **Quick Start Onboarding**
   - 4-step illustrated guide
   - Explains how to use the garden viewer
   - Skip option available

3. **Interactive Garden Map**
   - Grid layout of numbered garden boxes
   - Visual indicators for visited boxes (checkmark + dimming)
   - Progress tracking (X/12 boxes visited)
   - Mobile-first responsive design

4. **Box Detail Modal**
   - Localized name and description
   - Placeholder for images/videos
   - Automatically marks box as visited when opened
   - Share functionality placeholder

5. **Session Management**
   - Automatic session creation on first visit
   - `sessionKey` stored in httpOnly cookie
   - Visited boxes persist across page reloads
   - IP address detection for analytics

### Admin Dashboard

1. **Authentication**
   - JWT-based login system
   - Secure token storage
   - Protected admin routes

2. **Analytics Dashboard**
   - Summary cards: sessions, views, languages, engagement
   - Interactive charts: bar chart (box popularity), pie chart (language distribution)
   - Real-time data from admin API

3. **Box Management**
   - CRUD operations for garden boxes
   - Multilingual content editing (EN/SI/ZH)
   - Search and filtering
   - Responsive table design

4. **Session Monitoring**
   - View all visitor sessions
   - Track viewed boxes per session
   - Language usage analytics
   - Pagination and search

## 🧪 Testing & Quality Assurance

### Manual Testing Checklist

**Visitor Experience:**
- [ ] Language selection works and saves preference
- [ ] Session created automatically on first visit
- [ ] Box views are tracked and persisted
- [ ] Visited boxes show visual indicators
- [ ] Box detail modal displays correct information
- [ ] Session persists across page reloads
- [ ] Mobile responsive design works

**Admin Dashboard:**
- [ ] Admin login works with seeded credentials
- [ ] Dashboard shows accurate analytics
- [ ] Charts display correct data
- [ ] Box CRUD operations work
- [ ] Session monitoring shows visitor data
- [ ] JWT authentication enforced
- [ ] CSV export functionality works

### API Testing

**Test visitor endpoints:**
```bash
# Test session creation
curl -X POST http://localhost:3001/api/session/start \
  -H "Content-Type: application/json" \
  -d '{"language": "si"}'

# Test box listing
curl -X GET http://localhost:3001/api/boxes

# Test box visit tracking
curl -X POST http://localhost:3001/api/visit \
  -H "Content-Type: application/json" \
  -d '{"sessionKey": "test-key", "boxId": 1}'
```

**Test admin endpoints:**
```bash
# Test admin login
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@local", "password": "password123"}'

# Test protected endpoint
curl -X GET http://localhost:3001/api/admin/stats/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Database Verification

```bash
# Check seeded data
cd server
npx prisma studio  # Opens Prisma Studio in browser

# Or query directly
npx prisma db execute --stdin
# Then run: SELECT * FROM boxes LIMIT 5;
```

## 🔧 Development Scripts

### Root Level
```bash
npm run dev              # Run both frontend and backend
npm run install:all      # Install all dependencies
npm run db:setup         # Setup database (push + seed)
npm run db:reset         # Reset database (drop + push + seed)
```

### Server Level
```bash
npm run dev              # Start development server
npm run start            # Start production server
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed database with sample data
npm run db:reset         # Reset database
npm run test-stubs       # Test API endpoint stubs
```

### Client Level
```bash
npm run dev              # Start Vite development server
npm run build            # Build for production
npm run preview          # Preview production build
```

## 📁 Project Structure

```
LiveKaratuwa/
├── server/                 # Backend (Node.js + Express)
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Database seeding
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── config/             # Configuration files
│   └── index.js            # Server entry point
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── App.jsx         # App entry point
│   └── public/             # Static assets
├── package.json            # Root package.json
└── README.md              # This file
```

## 🚨 Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Recreate database if needed
DROP DATABASE organic_garden;
CREATE DATABASE organic_garden;
```

**Prisma Client Error:**
```bash
cd server
npm run db:generate
```

**Port Already in Use:**
```bash
# Kill process on port 3001
npx kill-port 3001

# Kill process on port 5173
npx kill-port 5173
```

**Frontend Build Errors:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables

Ensure all required environment variables are set in `server/.env`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/organic_garden"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3001
NODE_ENV=development
```

---

## 🌐 Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/GeekHirushaDev/LiveKaratuwa)

### Manual Deployment Steps

1. **Prepare Database** (PlanetScale recommended)
   - Sign up at [planetscale.com](https://planetscale.com)
   - Create a new database
   - Get your connection string

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables:
     ```env
     DATABASE_URL=mysql://your-planetscale-connection-string
     JWT_SECRET=your-random-32-character-secret
     NODE_ENV=production
     CORS_ORIGINS=https://your-project.vercel.app
     ```
   - Deploy!

4. **Setup Database Schema**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Run setup script
   ./deploy-setup.ps1  # Windows
   # or
   ./deploy-setup.sh   # Linux/Mac
   ```

5. **Verify Deployment**
   - Visit your Vercel URL
   - Test language selection
   - Login to admin panel
   - Verify all features work

📖 **Full Guide:** See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

---

## 📋 Pre-Deployment Checklist

Before committing or deploying:

- [ ] Backend runs without errors (`npm run dev` in `/server`)
- [ ] Frontend builds successfully (`npm run build` in `/client`)
- [ ] Database seeded correctly (12 boxes + languages)
- [ ] All API endpoints respond correctly
- [ ] Visitor UI fully functional (language selection, box viewing, tracking)
- [ ] Admin dashboard shows accurate analytics
- [ ] JWT authentication enforced for admin routes
- [ ] Mobile responsive design works
- [ ] Environment variables properly configured
- [ ] README documentation complete and accurate

## 🎯 Key Features Summary

✅ **Session-based visitor tracking** - No user accounts required  
✅ **Multilingual support** - 10+ languages with database-driven content  
✅ **Mobile-first design** - Responsive Tailwind CSS interface  
✅ **Admin analytics dashboard** - JWT-protected with charts  
✅ **Box management CRUD** - Full admin control with rich text editor  
✅ **Media upload** - Image and audio support with progress tracking  
✅ **Visit tracking** - Persistent session-based box viewing  
✅ **Security** - Rate limiting, JWT auth, input validation  
✅ **Developer-friendly** - Comprehensive documentation and scripts  
✅ **Vercel-ready** - One-click deployment configuration

---

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Detailed local setup instructions
- [Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md) - Complete Vercel deployment guide
- [API Contract](./server/docs/API_CONTRACT.md) - API documentation
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment verification

---

**Status**: Production Ready ✅  
**Focus**: Watch-only garden exploration with analytics  
**No Features**: Picking, reservation, payment, or e-commerce functionality

**Built with ❤️ for LiveKaratuwa Garden Experience**
