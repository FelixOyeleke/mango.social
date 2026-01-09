# 🥭 Mango Social

A modern social platform for immigrants to share stories, find jobs, connect with their community, and access valuable resources.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Mango Social is a comprehensive community platform designed specifically for immigrants. Share your immigration journey, find job opportunities with visa sponsorship, connect with others for dating and friendships, access valuable resources, and participate in local events. The platform features a modern, reactive interface with customizable app preferences that let you enable only the features you need.

---

## ✨ Features

### 🌟 Core Features (Always Available)
- **Forum & Stories** - Share immigration experiences and connect with others
- **Communities** - Join groups based on interests and background
- **Events** - Discover local meetups and community events
- **Direct Messaging** - Chat with other members privately or in groups
- **User Profiles** - Customizable profiles with avatars, banners, and bios
- **Follow System** - Follow users and build your network
- **Notifications** - Real-time updates for interactions

### 🎯 Optional Apps (User-Configurable)
Users can enable/disable these apps based on their needs:
- **💼 Jobs Board** - Find immigration-friendly job opportunities with visa sponsorship
- **❤️ Dating** - Connect with other immigrants for relationships
- **🛍️ Marketplace** - Buy and sell items within the community
- **📚 Resources** - Immigration guides, visa information, and helpful resources

### 🔧 Advanced Features
- **Reactive App Preferences** - Enable/disable apps dynamically without page reload
- **Hashtags & Mentions** - Tag topics and mention users in posts
- **Polls** - Create and participate in community polls
- **Reposts & Quotes** - Share and comment on posts
- **Search** - Find posts, users, and hashtags
- **Trending Topics** - See what's popular in the community
- **Admin Dashboard** - Comprehensive admin panel for user management
- **Bookmarks** - Save posts for later

### 🔐 Authentication & Security
- JWT-based authentication with secure token handling
- Password hashing with bcrypt
- Protected routes and API endpoints
- Role-based access control (user, admin, moderator)
- Rate limiting to prevent abuse

### 🖼️ Image Management
- Direct database storage (no external services required)
- Avatar uploads (2MB max)
- Banner images for profiles
- Story featured images (5MB max)
- Supported formats: JPEG, PNG, GIF, WebP

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router v6** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client with interceptors
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express** - Fast web framework
- **TypeScript** - Type-safe backend code
- **PostgreSQL 14+** - Robust relational database
- **JWT** - Secure authentication tokens
- **bcrypt** - Password hashing
- **express-validator** - Request validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **rate-limit** - API rate limiting

---

## 📁 Project Structure

```
mango.social/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── widgets/   # Sidebar widgets
│   │   │   ├── admin/     # Admin components
│   │   │   ├── messaging/ # Messaging components
│   │   │   └── profile/   # Profile components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── appPreferencesStore.ts
│   │   │   └── locationStore.ts
│   │   ├── utils/         # Utility functions
│   │   ├── styles/        # CSS styles
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   │   ├── auth.ts
│   │   │   ├── apps.ts
│   │   │   ├── stories.ts
│   │   │   ├── jobs.ts
│   │   │   └── ...
│   │   ├── middleware/    # Custom middleware
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── db/           # Database setup & migrations
│   │   │   ├── migrations/
│   │   │   ├── connection.ts
│   │   │   ├── schema.sql
│   │   │   └── seed.ts
│   │   └── index.ts      # Server entry point
│   └── package.json
│
├── docs/                  # Documentation
│   ├── QUICK-START.md
│   ├── SETUP-GUIDE.md
│   ├── IMAGE_UPLOAD_GUIDE.md
│   ├── JOB_OPPORTUNITIES_FEATURE.md
│   └── DEPLOYMENT_CHECKLIST.md
│
├── scripts/              # Utility scripts
│   ├── start-dev.bat     # Start development servers
│   ├── setup-db.bat      # Setup database
│   ├── setup.bat         # Complete setup
│   └── ...
│
├── images/               # Static assets
├── package.json          # Root package.json
└── README.md            # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/FelixOyeleke/mango.social.git
cd mango.social
```

### 2. Install Dependencies
```bash
# Install all dependencies (root, client, and server)
npm install

# Or install individually
cd client && npm install
cd ../server && npm install
```

### 3. Setup Environment Variables

Create `.env` files in both `client` and `server` directories:

**server/.env**
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/mango_social
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=development
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000
```

### 4. Setup Database
```bash
# Create database
psql -U postgres -c "CREATE DATABASE mango_social;"

# Run all migrations
cd server
npm run db:migrate
npm run db:migrate:images
npm run db:migrate:jobs
npm run db:migrate:messaging
npm run db:migrate:features
npm run db:migrate:username
npm run db:migrate:banner

# Seed database with sample data (optional)
npm run db:seed
```

### 5. Start Development Servers
```bash
# From root directory
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

### Default Test User
After seeding, you can login with:
- **Email**: test@test.com
- **Password**: password123

---

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

- **[Quick Start Guide](docs/QUICK-START.md)** - Get up and running quickly
- **[Setup Guide](docs/SETUP-GUIDE.md)** - Detailed setup instructions
- **[Image Upload Guide](docs/IMAGE_UPLOAD_GUIDE.md)** - Image upload feature documentation
- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Production deployment guide

---

## 🔧 Scripts

### Root Level
```bash
npm run dev              # Start both client and server
npm run build            # Build both client and server
npm run start            # Start production server
npm run install:all      # Install all dependencies
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
```

### Client
```bash
cd client
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Server
```bash
cd server
npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript
npm start                # Start production server
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Inspired by Big Think's clean design
- Built with modern web technologies
- Community-driven development

---

**Built with ❤️ for the immigrant community**

