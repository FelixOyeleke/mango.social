@echo off
setlocal enabledelayedexpansion

:: ========================================
:: Immigrant Voices - Startup Script
:: ========================================

color 0A
title Immigrant Voices - Starting...

echo.
echo ========================================
echo   IMMIGRANT VOICES PLATFORM
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Check if PostgreSQL is running
echo [1/5] Checking PostgreSQL...
pg_isready >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL may not be running
    echo          Attempting to start anyway...
    echo.
) else (
    echo [OK] PostgreSQL is running
    echo.
)

:: Check if dependencies are installed
echo [2/5] Checking dependencies...

if not exist "..\server\node_modules" (
    echo [INFO] Server dependencies not found
    echo        Installing server dependencies...
    cd ..\server
    call npm install --silent
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Failed to install server dependencies
        pause
        exit /b 1
    )
    cd ..\scripts
)

if not exist "..\client\node_modules" (
    echo [INFO] Client dependencies not found
    echo        Installing client dependencies...
    cd ..\client
    call npm install --silent
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Failed to install client dependencies
        pause
        exit /b 1
    )
    cd ..\scripts
)

echo [OK] Dependencies installed
echo.

:: Check if database is setup
echo [3/5] Checking database...
cd ..\server
call npx tsx src/db/check-users.ts >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Database may not be setup
    echo.
    set /p setup_db="Would you like to setup the database now? (Y/N): "
    if /i "!setup_db!"=="Y" (
        echo.
        echo Running database migrations...
        call npm run db:migrate
        echo.
        echo Seeding database...
        call npm run db:seed
        echo.
        echo [OK] Database setup complete
    ) else (
        echo [WARNING] Skipping database setup
        echo           The app may not work correctly
    )
) else (
    echo [OK] Database is ready
)
echo.
cd ..\scripts

:: Check environment files
echo [4/5] Checking environment files...
if not exist "..\server\.env" (
    echo [WARNING] server/.env not found
    echo           Using default configuration
)
if not exist "..\client\.env" (
    echo [WARNING] client/.env not found
    echo           Using default configuration
)
echo.

:: Start the servers
echo [5/5] Starting servers...
echo.
echo ========================================
echo   SERVER INFORMATION
echo ========================================
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo ========================================
echo.
echo Starting in 3 seconds...
timeout /t 3 /nobreak >nul

:: Start server in new window
start "Immigrant Voices - Server" cmd /k "color 0E && cd ..\server && echo [SERVER] Starting backend... && npm run dev"

:: Wait a bit for server to start
timeout /t 3 /nobreak >nul

:: Start client in new window
start "Immigrant Voices - Client" cmd /k "color 0B && cd ..\client && echo [CLIENT] Starting frontend... && npm run dev"

:: Wait for servers to initialize
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   STARTUP COMPLETE!
echo ========================================
echo.
echo [OK] Server started on http://localhost:5000
echo [OK] Client started on http://localhost:5173
echo.
echo The application will open in your browser shortly...
echo.
echo Press any key to open the browser now, or
echo close this window to keep servers running.
echo.
pause >nul

:: Open browser
start http://localhost:5173

echo.
echo Browser opened!
echo Keep the server windows open while using the app.
echo.

