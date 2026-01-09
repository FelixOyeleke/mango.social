# 📜 Scripts Reference Guide

Quick reference for all available scripts in the Immigrant Voices project.

---

## 🚀 Main Scripts

### `start.bat` - Start the Application
**Purpose:** Start both server and client in development mode

**What it does:**
- ✅ Checks if Node.js is installed
- ✅ Checks if PostgreSQL is running
- ✅ Installs dependencies if missing
- ✅ Checks database setup
- ✅ Starts server on http://localhost:5000
- ✅ Starts client on http://localhost:5173
- ✅ Opens browser automatically

**Usage:**
```bash
cd scripts
start.bat
```

**First time?** This script will guide you through setup!

---

### `setup.bat` - Complete First-Time Setup
**Purpose:** One-command setup for new installations

**What it does:**
- ✅ Installs all dependencies (client + server)
- ✅ Creates `.env` files if missing
- ✅ Runs database migrations
- ✅ Runs image storage migration
- ✅ Seeds sample data
- ✅ Creates admin user

**Usage:**
```bash
cd scripts
setup.bat
```

**Time:** ~5-10 minutes

**Default Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

---

### `stop.bat` - Stop All Servers
**Purpose:** Stop all running Node.js processes

**What it does:**
- ✅ Kills all Node.js processes
- ✅ Kills all npm processes
- ✅ Cleans up background tasks

**Usage:**
```bash
cd scripts
stop.bat
```

---

## 🔧 Development Scripts

### `build.bat` - Production Build
**Purpose:** Build both client and server for production

**What it does:**
- ✅ Compiles TypeScript (server)
- ✅ Builds React app (client)
- ✅ Creates optimized bundles

**Usage:**
```bash
cd scripts
build.bat
```

**Output:**
- Server: `server/dist/`
- Client: `client/dist/`

---

### `reset-db.bat` - Reset Database
**Purpose:** Reset database to fresh state

**What it does:**
- ⚠️ Drops all data
- ✅ Runs all migrations
- ✅ Seeds sample data

**Usage:**
```bash
cd scripts
reset-db.bat
```

**⚠️ WARNING:** This will delete ALL data!

---

## 📦 Legacy Scripts (Deprecated)

The following scripts are deprecated and replaced by the new comprehensive scripts:

- ❌ `start-dev.bat` → Use `start.bat`
- ❌ `start-app.bat` → Use `start.bat`
- ❌ `setup-db.bat` → Use `setup.bat`
- ❌ `install-dependencies.bat` → Use `setup.bat`
- ❌ `install-client.bat` → Use `setup.bat`
- ❌ `install-server.bat` → Use `setup.bat`
- ❌ `create-admin.bat` → Included in `setup.bat`
- ❌ `check-login.bat` → Included in `start.bat`
- ❌ `run-image-migration.bat` → Included in `setup.bat`
- ❌ `setup-complete.bat` → Use `setup.bat`
- ❌ `fix-and-setup.bat` → Use `setup.bat`

---

## 🎯 Quick Start Guide

### For First-Time Setup:
```bash
# 1. Clone the repository
git clone <repo-url>
cd immigrant-voices

# 2. Run complete setup
cd scripts
setup.bat

# 3. Start the application
start.bat
```

### For Daily Development:
```bash
# Start the app
cd scripts
start.bat

# When done, stop servers
stop.bat
```

### For Production Deployment:
```bash
# Build for production
cd scripts
build.bat

# Deploy the dist folders
```

---

## 🔍 Troubleshooting

### "Node.js is not installed"
**Solution:** Install Node.js from https://nodejs.org

### "PostgreSQL may not be running"
**Solution:** 
1. Start PostgreSQL service
2. Or install from https://www.postgresql.org

### "Database migration failed"
**Solution:**
1. Check PostgreSQL is running
2. Verify credentials in `server/.env`
3. Ensure database exists: `createdb immigrant_voices`

### "Port already in use"
**Solution:**
1. Run `stop.bat` to kill existing processes
2. Or change ports in `.env` files

### "Dependencies installation failed"
**Solution:**
1. Check internet connection
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and try again

---

## 📝 Environment Variables

### Server (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/immigrant_voices
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000
```

---

## 🆘 Need Help?

1. Check the main [README.md](../README.md)
2. Read the [Setup Guide](../docs/SETUP-GUIDE.md)
3. Check [Troubleshooting](../docs/TROUBLESHOOTING.md)
4. Open an issue on GitHub

---

**Happy Coding! 🚀**

