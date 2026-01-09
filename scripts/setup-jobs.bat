@echo off
:: ========================================
:: Immigrant Voices - Setup Jobs Feature
:: ========================================

color 0A
title Immigrant Voices - Jobs Setup

echo.
echo ========================================
echo   SETTING UP JOB OPPORTUNITIES FEATURE
echo ========================================
echo.

cd ..\server

echo Running jobs database migration...
call npm run db:migrate:jobs

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERROR] Jobs migration failed
    echo.
    echo Please check:
    echo   1. PostgreSQL is running
    echo   2. Database exists
    echo   3. Server dependencies are installed
    echo.
    pause
    exit /b 1
)

color 0A
echo.
echo ========================================
echo   JOBS FEATURE SETUP COMPLETE!
echo ========================================
echo.
echo The following tables have been created:
echo   - jobs
echo   - job_applications
echo   - saved_jobs
echo   - companies
echo.
echo You can now:
echo   1. Start the app: cd scripts && start.bat
echo   2. Access jobs at: http://localhost:5173/jobs
echo.
pause

