# 🚀 Quick Start Guide - Immigrant Voices

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed
- Git

## 1-Minute Setup (Windows)

### Step 1: Clone & Install
```bash
# Clone the repository
git clone <your-repo-url>
cd immigrant-voices

# Install dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### Step 2: Configure Environment
```bash
# Copy environment files
copy server\.env.example server\.env

# Edit server/.env and set:
# - DB_PASSWORD=your_postgres_password
# - JWT_SECRET=any_random_string
```

### Step 3: Setup Database (Automated)
```bash
# Option A: Double-click this file
setup-db.bat

# Option B: Run manually
psql -U postgres -c "CREATE DATABASE immigrant_voices;"
cd server
npm run db:migrate
npm run db:seed
```

### Step 4: Start Application
```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

### Step 5: Open Browser
Visit: http://localhost:5173

## Default Login
- Email: `maria.rodriguez@email.com`
- Password: `password123`

## What You Get

### Real Data Included
- ✅ 10 diverse user profiles
- ✅ 8 detailed immigrant stories (8000+ words)
- ✅ Real comments and engagement
- ✅ Authentic categories and tags
- ✅ Live statistics and trending topics

### Features Ready to Test
- ✅ User authentication (register/login)
- ✅ Browse stories with filters
- ✅ Read full stories
- ✅ Like and comment on stories
- ✅ Bookmark favorite stories
- ✅ Create your own story
- ✅ Edit your profile
- ✅ View trending topics
- ✅ See suggested users
- ✅ Community statistics

## Troubleshooting

### "psql: command not found"
Add PostgreSQL to PATH:
- Location: `C:\Program Files\PostgreSQL\16\bin`
- Add to System Environment Variables

### "password authentication failed"
- Check your postgres password
- Update `DB_PASSWORD` in `server/.env`

### "database already exists"
```sql
psql -U postgres
DROP DATABASE immigrant_voices;
CREATE DATABASE immigrant_voices;
\q
```

### Port already in use
- Server (5000): Change `PORT` in `server/.env`
- Client (5173): Change in `client/vite.config.ts`

## Project Structure

```
immigrant-voices/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Express middleware
│   │   ├── db/            # Database files
│   │   └── index.ts       # Server entry
│   └── package.json
└── setup-db.bat           # Database setup script
```

## Available Scripts

### Server
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run db:migrate # Run database migrations
npm run db:seed    # Seed database with data
```

### Client
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Stories
- `GET /api/stories` - Get all stories
- `GET /api/stories/:id` - Get single story
- `POST /api/stories` - Create story (auth required)
- `PUT /api/stories/:id` - Update story (auth required)
- `DELETE /api/stories/:id` - Delete story (auth required)

### Engagement
- `POST /api/stories/:id/like` - Like story
- `POST /api/stories/:id/comment` - Comment on story
- `POST /api/bookmarks/:id` - Bookmark story

### Statistics
- `GET /api/stats/community` - Community stats
- `GET /api/stats/trending` - Trending topics
- `GET /api/stats/suggested-users` - User suggestions

## Next Steps

1. ✅ Setup complete
2. 📖 Read `DATABASE-SETUP-COMPLETE.md` for details
3. 🎨 Customize the theme and branding
4. 📝 Create your own immigrant story
5. 🚀 Deploy to production

## Need Help?

- 📚 Full setup guide: `setup-database.md`
- 🗄️ Database details: `DATABASE-SETUP-COMPLETE.md`
- 🐛 Issues: Check troubleshooting section above

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Query
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Auth**: JWT, bcrypt
- **Deployment**: Ready for Vercel (client) + Railway/Render (server)

---

**Happy Coding! 🎉**

