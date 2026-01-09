# Quick Setup Guide - Immigrant Voices Full-Stack App

## ⚡ Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
npm run install:all
```

### Step 2: Setup PostgreSQL Database
```bash
# Create database
createdb immigrant_voices

# Run schema
psql -d immigrant_voices -f server/src/db/schema.sql
```

### Step 3: Configure Environment
```bash
# Copy example env file
cp server/.env.example server/.env

# Edit server/.env with your settings (minimum required):
# - DB_PASSWORD=your_postgres_password
# - JWT_SECRET=any_random_string_here
```

### Step 4: Start Development
```bash
npm run dev
```

Visit: http://localhost:5173

## 🎯 What You Get

### Frontend (React + TypeScript)
- ✅ Modern React 18 with hooks
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ React Router for navigation
- ✅ Zustand for state management
- ✅ Dark mode support
- ✅ Fully responsive

### Backend (Node.js + Express + PostgreSQL)
- ✅ RESTful API
- ✅ JWT authentication
- ✅ PostgreSQL database
- ✅ TypeScript
- ✅ Input validation
- ✅ Error handling
- ✅ Rate limiting
- ✅ Security headers

### Features
- ✅ User registration & login
- ✅ Create/edit/delete stories
- ✅ Comments system
- ✅ Bookmarks
- ✅ Likes
- ✅ Search & filter
- ✅ Pagination
- ✅ User profiles
- ✅ Newsletter subscription

## 📁 Project Structure

```
immigrant-voices/
├── client/              # React frontend (port 5173)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # State management
│   │   └── App.tsx      # Main app
│   └── package.json
│
├── server/              # Node.js backend (port 5000)
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Auth, error handling
│   │   ├── db/          # Database
│   │   └── index.ts     # Server entry
│   └── package.json
│
└── package.json         # Root scripts
```

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start both frontend & backend
npm run dev:client       # Start only frontend
npm run dev:server       # Start only backend

# Build
npm run build            # Build both
npm run build:client     # Build frontend only
npm run build:server     # Build backend only

# Production
npm start                # Start production server

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
```

## 🌐 API Endpoints

### Auth
- POST `/api/auth/register` - Register
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user

### Stories
- GET `/api/stories` - List stories
- GET `/api/stories/:slug` - Get story
- POST `/api/stories` - Create story (auth)
- PUT `/api/stories/:id` - Update story (auth)
- DELETE `/api/stories/:id` - Delete story (auth)

### Comments
- GET `/api/comments/story/:storyId` - Get comments
- POST `/api/comments` - Create comment (auth)

### Bookmarks
- GET `/api/bookmarks` - Get bookmarks (auth)
- POST `/api/bookmarks/:storyId` - Add bookmark (auth)
- DELETE `/api/bookmarks/:storyId` - Remove bookmark (auth)

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Check credentials in server/.env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=immigrant_voices
DB_USER=postgres
DB_PASSWORD=your_password
```

### Port Already in Use
```bash
# Frontend (5173)
lsof -ti:5173 | xargs kill

# Backend (5000)
lsof -ti:5000 | xargs kill
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

## 🚀 Next Steps

1. **Customize Design** - Edit Tailwind config in `client/tailwind.config.js`
2. **Add OAuth** - Configure Google/Facebook in `server/.env`
3. **Add Email** - Setup SMTP for password reset
4. **Deploy** - Use Vercel (frontend) + Railway/Render (backend)

## 📚 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Auth**: JWT, Passport
- **State**: Zustand
- **Data Fetching**: React Query

## 💡 Tips

- Use TypeScript for better DX
- API auto-proxied in development (Vite)
- Hot reload enabled for both frontend & backend
- Dark mode toggle in header
- Mobile-first responsive design

## 🔐 Security

- Passwords hashed with bcrypt
- JWT tokens for auth
- Rate limiting enabled
- Helmet.js for security headers
- Input validation with express-validator
- CORS configured

## 📖 Learn More

- [React Docs](https://react.dev)
- [Express Docs](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)

---

**Need help?** Check the full README-FULLSTACK.md for detailed documentation.

