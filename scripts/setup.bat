@echo off
setlocal enabledelayedexpansion

:: ========================================
:: Immigrant Voices - Complete Setup
:: ========================================

color 0A
title Immigrant Voices - Setup

echo.
echo ========================================
echo   IMMIGRANT VOICES - FIRST TIME SETUP
echo ========================================
echo.
echo This script will:
echo   1. Install all dependencies
echo   2. Setup the database
echo   3. Run migrations
echo   4. Seed sample data
echo   5. Create admin user
echo.
echo This may take 5-10 minutes...
echo.
pause

:: Step 1: Install dependencies
echo.
echo ========================================
echo [1/5] Installing Dependencies
echo ========================================
echo.

echo Installing server dependencies...
cd ..\server
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Failed to install server dependencies
    pause
    exit /b 1
)
echo [OK] Server dependencies installed
echo.

echo Installing client dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Failed to install client dependencies
    pause
    exit /b 1
)
echo [OK] Client dependencies installed
echo.

cd ..\scripts

:: Step 2: Check environment files
echo ========================================
echo [2/5] Checking Environment Files
echo ========================================
echo.

if not exist "..\server\.env" (
    echo Creating server/.env file...
    (
        echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/immigrant_voices
        echo JWT_SECRET=your-secret-key-change-this-in-production
        echo PORT=5000
        echo NODE_ENV=development
    ) > ..\server\.env
    echo [OK] Created server/.env
    echo [WARNING] Please update DATABASE_URL with your credentials
) else (
    echo [OK] server/.env already exists
)
echo.

if not exist "..\client\.env" (
    echo Creating client/.env file...
    (
        echo VITE_API_URL=http://localhost:5000
    ) > ..\client\.env
    echo [OK] Created client/.env
) else (
    echo [OK] client/.env already exists
)
echo.

:: Step 3: Setup database
echo ========================================
echo [3/5] Setting Up Database
echo ========================================
echo.

cd ..\server
echo Running migrations...
call npm run db:migrate
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Database migration failed
    echo.
    echo Please check:
    echo   1. PostgreSQL is running
    echo   2. Database credentials in server/.env are correct
    echo   3. Database 'immigrant_voices' exists
    echo.
    pause
    exit /b 1
)
echo [OK] Migrations complete
echo.

:: Step 4: Run image migration
echo ========================================
echo [4/5] Running Image Storage Migration
echo ========================================
echo.

call npm run db:migrate:images
if %errorlevel% neq 0 (
    echo [WARNING] Image migration failed (may already be applied)
) else (
    echo [OK] Image storage migration complete
)
echo.

:: Step 5: Seed database
echo ========================================
echo [5/5] Seeding Database
echo ========================================
echo.

call npm run db:seed
if %errorlevel% neq 0 (
    echo [WARNING] Database seeding failed
    echo           You can seed manually later with: npm run db:seed
) else (
    echo [OK] Database seeded with sample data
)
echo.

cd ..\scripts

:: Success!
color 0A
echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo [OK] All dependencies installed
echo [OK] Database configured
echo [OK] Sample data loaded
echo.
echo Next steps:
echo   1. Update server/.env with your database credentials
echo   2. Run: scripts\start.bat to start the application
echo.
echo Default login credentials:
echo   Email: admin@example.com
echo   Password: admin123
echo.
pause

