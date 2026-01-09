@echo off
echo ========================================
echo Immigrant Voices - Complete Setup
echo ========================================
echo.

echo Step 1: Installing server dependencies...
cd server
if not exist "node_modules\" (
    echo Installing packages...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ✗ Failed to install server dependencies
        echo.
        pause
        exit /b 1
    )
    echo ✓ Server dependencies installed
) else (
    echo ✓ Server dependencies already installed
)
echo.

echo Step 2: Installing client dependencies...
cd ..\client
if not exist "node_modules\" (
    echo Installing packages...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ✗ Failed to install client dependencies
        echo.
        pause
        exit /b 1
    )
    echo ✓ Client dependencies installed
) else (
    echo ✓ Client dependencies already installed
)
cd ..
echo.

echo Step 3: Creating database...
psql -U postgres -c "CREATE DATABASE immigrant_voices;" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Database created successfully
) else (
    echo ! Database might already exist, continuing...
)
echo.

echo Step 4: Running migrations...
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

echo Step 5: Seeding database with real data...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ✗ Seeding failed
    cd ..
    pause
    exit /b 1
)
echo ✓ Database seeded successfully
echo.

cd ..
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You can now:
echo 1. Start the app: start-dev.bat
echo 2. Visit: http://localhost:5173
echo.
echo Default login:
echo Email: maria.rodriguez@email.com
echo Password: password123
echo.
pause

