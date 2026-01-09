# 🚀 First Time Setup - Immigrant Voices

## The Error You're Seeing

```
'tsx' is not recognized as an internal or external command
```

**This means:** Dependencies aren't installed yet!

---

## ✅ Complete Setup (One Command)

### **Option 1: All-in-One Setup (Recommended)**

Just double-click this file:
```
setup-complete.bat
```

This will:
1. ✅ Install server dependencies
2. ✅ Install client dependencies  
3. ✅ Create database
4. ✅ Run migrations
5. ✅ Seed with test data

**Then you're done!** 🎉

---

## 🔧 Manual Setup (Step by Step)

If the automatic setup doesn't work, follow these steps:

### Step 1: Install Dependencies
```bash
# Double-click:
install-dependencies.bat

# OR manually:
cd server
npm install
cd ..\client
npm install
cd ..
```

### Step 2: Setup Database
```bash
# Double-click:
setup-db.bat

# OR manually:
psql -U postgres -c "CREATE DATABASE immigrant_voices;"
cd server
npm run db:migrate
npm run db:seed
```

### Step 3: Start the App
```bash
# Double-click:
start-dev.bat
```

### Step 4: Login
```
Open: http://localhost:5173
Email: maria.rodriguez@email.com
Password: password123
```

---

## 📋 Prerequisites

Before running setup, make sure you have:

### Required Software
- [x] **Node.js 18+** - [Download](https://nodejs.org/)
- [x] **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/windows/)
- [x] **Git** (optional) - [Download](https://git-scm.com/download/win)

### Check if Installed
```bash
# Check Node.js
node --version
# Should show: v18.x.x or higher

# Check npm
npm --version
# Should show: 9.x.x or higher

# Check PostgreSQL
psql --version
# Should show: psql (PostgreSQL) 14.x or higher
```

---

## 🎯 Quick Start Commands

### First Time Setup
```bash
1. install-dependencies.bat    # Install packages
2. setup-db.bat                # Setup database
3. start-dev.bat               # Start app
```

### Daily Use
```bash
start-dev.bat                  # Just start the app
```

---

## 🐛 Troubleshooting

### Error: "npm is not recognized"
**Solution:** Install Node.js from https://nodejs.org/

### Error: "psql is not recognized"
**Solution:** 
1. Install PostgreSQL
2. Add to PATH: `C:\Program Files\PostgreSQL\16\bin`

### Error: "password authentication failed"
**Solution:** 
1. Edit `server\.env`
2. Change `DB_PASSWORD=postgres` to your actual password

### Error: "ENOENT: no such file or directory"
**Solution:** Run `install-dependencies.bat` first

### Error: "Port 5000 already in use"
**Solution:** 
1. Close other apps using port 5000
2. Or change PORT in `server\.env`

---

## 📁 What Gets Installed

### Server Dependencies (~200 MB)
- Express (web framework)
- PostgreSQL client
- JWT authentication
- bcrypt (password hashing)
- TypeScript
- And more...

### Client Dependencies (~300 MB)
- React 18
- Vite (build tool)
- Tailwind CSS
- React Query
- React Router
- And more...

**Total:** ~500 MB of node_modules

---

## ⏱️ Installation Time

- **Dependencies:** 2-5 minutes (depending on internet speed)
- **Database setup:** 10-30 seconds
- **Total:** ~5 minutes

---

## 🎉 After Setup

You should see:
```
✓ Server dependencies installed
✓ Client dependencies installed
✓ Database created
✓ Migrations completed
✓ Database seeded successfully

Setup Complete!

Default login:
Email: maria.rodriguez@email.com
Password: password123
```

Then:
1. Run `start-dev.bat`
2. Wait for both servers to start
3. Open http://localhost:5173
4. Login and explore!

---

## 📚 Files Created

### Setup Scripts
- ✅ `setup-complete.bat` - Complete setup (recommended)
- ✅ `install-dependencies.bat` - Just install packages
- ✅ `setup-db.bat` - Just setup database
- ✅ `start-dev.bat` - Start the app

### Utility Scripts
- ✅ `check-login.bat` - Check database users
- ✅ `create-admin.bat` - Create admin user

### Documentation
- ✅ `FIRST-TIME-SETUP.md` - This file
- ✅ `QUICK-START.md` - Quick reference
- ✅ `LOGIN-INFO.md` - Login credentials
- ✅ `TROUBLESHOOTING-LOGIN.md` - Login help

---

## 🔄 Reset Everything

If something goes wrong, start fresh:

```bash
# 1. Delete node_modules
rmdir /s /q server\node_modules
rmdir /s /q client\node_modules

# 2. Drop database
psql -U postgres -c "DROP DATABASE immigrant_voices;"

# 3. Run complete setup
setup-complete.bat
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `server/node_modules/` folder exists
- [ ] `client/node_modules/` folder exists
- [ ] Database `immigrant_voices` exists
- [ ] Can run: `cd server && npm run db:check`
- [ ] Server starts: `cd server && npm run dev`
- [ ] Client starts: `cd client && npm run dev`
- [ ] Can login at http://localhost:5173

---

## 🆘 Still Having Issues?

1. **Run diagnostics:**
   ```bash
   check-login.bat
   ```

2. **Check logs:**
   - Server terminal for errors
   - Browser console (F12)

3. **Try complete reset:**
   ```bash
   setup-complete.bat
   ```

4. **Check prerequisites:**
   - Node.js installed?
   - PostgreSQL installed?
   - PostgreSQL running?

---

## 🎯 Next Steps After Setup

1. ✅ Login with test account
2. ✅ Browse immigrant stories
3. ✅ Create your own story
4. ✅ Test all features
5. ✅ Create admin user (optional): `create-admin.bat`

---

**Ready? Run `setup-complete.bat` now!** 🚀

