@echo off
echo ========================================
echo Immigrant Voices - Database Setup
echo ========================================
echo.

echo Step 1: Creating database...
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
%PSQL% -U postgres -c "CREATE DATABASE immigrant_voices;" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Database created successfully
) else (
    echo ! Database might already exist, continuing...
)
echo.

echo Step 2: Running migrations...
cd server
call npm run db:migrate
if %errorlevel% neq 0 (
    echo ✗ Migration failed
    pause
    exit /b 1
)
echo ✓ Migrations completed
echo.

echo Step 3: Seeding database with real data...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ✗ Seeding failed
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
echo 1. Start the server: cd server ^&^& npm run dev
echo 2. Start the client: cd client ^&^& npm run dev
echo 3. Visit: http://localhost:5173/forum
echo.
echo Default login:
echo Email: maria.rodriguez@email.com
echo Password: password123
echo.
pause

