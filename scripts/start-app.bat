@echo off
echo ========================================
echo Starting Immigrant Voices Application
echo ========================================
echo.

echo Checking if database exists...
psql -U postgres -d immigrant_voices -c "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Database not found!
    echo.
    echo Please run setup first:
    echo   1. Double-click setup-db.bat
    echo   OR
    echo   2. Run manually:
    echo      psql -U postgres -c "CREATE DATABASE immigrant_voices;"
    echo      cd server
    echo      npm run db:migrate
    echo      npm run db:seed
    echo.
    pause
    exit /b 1
)

echo ✓ Database found
echo.

echo Starting servers...
echo.
echo Server will run on: http://localhost:5000
echo Client will run on: http://localhost:5173
echo.
echo Press Ctrl+C in each window to stop the servers
echo.

start "Immigrant Voices - Server" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul
start "Immigrant Voices - Client" cmd /k "cd client && npm run dev"

echo.
echo ✓ Servers starting in separate windows...
echo.
echo Once both servers are ready:
echo   → Open http://localhost:5173 in your browser
echo.
echo Default login:
echo   Email: maria.rodriguez@email.com
echo   Password: password123
echo.

