@echo off
echo ========================================
echo Fix and Setup - Immigrant Voices
echo ========================================
echo.

echo Step 1: Killing any process on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /PID %%a /F 2>nul
)
echo.

echo Step 2: Creating database...
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
%PSQL% -U postgres -c "DROP DATABASE IF EXISTS immigrant_voices;"
%PSQL% -U postgres -c "CREATE DATABASE immigrant_voices;"
if %errorlevel% neq 0 (
    echo.
    echo ✗ Failed to create database
    echo   Make sure PostgreSQL is running
    echo   Password should be: 007Olamidey16@
    echo.
    pause
    exit /b 1
)
echo ✓ Database created
echo.

echo Step 3: Running migrations...
cd server
call npm run db:migrate
if %errorlevel% neq 0 (
    echo ✗ Migration failed
    cd ..
    pause
    exit /b 1
)
echo ✓ Migrations completed
echo.

echo Step 4: Seeding database...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ✗ Seeding failed
    cd ..
    pause
    exit /b 1
)
echo ✓ Database seeded
echo.

cd ..
echo ========================================
echo ✓ Setup Complete!
echo ========================================
echo.
echo Next step: Run start-dev.bat
echo.
echo Login credentials:
echo Email: maria.rodriguez@email.com
echo Password: password123
echo.
pause

