@echo off
:: ========================================
:: Immigrant Voices - Reset Database
:: ========================================

color 0C
title Immigrant Voices - Reset Database

echo.
echo ========================================
echo   WARNING: DATABASE RESET
echo ========================================
echo.
echo This will:
echo   - Drop all tables
echo   - Run all migrations
echo   - Seed sample data
echo.
echo [WARNING] ALL DATA WILL BE LOST!
echo.
set /p confirm="Are you sure? Type 'YES' to continue: "

if not "%confirm%"=="YES" (
    echo.
    echo Operation cancelled.
    pause
    exit /b 0
)

echo.
echo Resetting database...
echo.

cd ..\server

:: Run migrations (will recreate tables)
echo Running migrations...
call npm run db:migrate
if %errorlevel% neq 0 (
    echo [ERROR] Migration failed
    pause
    exit /b 1
)

:: Run image migration
echo Running image migration...
call npm run db:migrate:images

:: Seed database
echo Seeding database...
call npm run db:seed
if %errorlevel% neq 0 (
    echo [ERROR] Seeding failed
    pause
    exit /b 1
)

cd ..\scripts

color 0A
echo.
echo ========================================
echo   DATABASE RESET COMPLETE!
echo ========================================
echo.
echo Default login:
echo   Email: admin@example.com
echo   Password: admin123
echo.
pause

