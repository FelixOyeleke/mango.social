@echo off
echo ========================================
echo Running Database Migrations
echo ========================================
echo.

echo [1/2] Running migration 008 - Location fields...
psql -U postgres -d immigrant_voices -f server\src\db\migrations\008_add_location_fields.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Migration 008 failed!
    pause
    exit /b 1
)
echo ✓ Migration 008 completed
echo.

echo [2/2] Running migration 009 - App store...
psql -U postgres -d immigrant_voices -f server\src\db\migrations\009_create_user_app_preferences.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Migration 009 failed!
    pause
    exit /b 1
)
echo ✓ Migration 009 completed
echo.

echo ========================================
echo All migrations completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your backend server (npm run dev in server folder)
echo 2. Refresh your browser
echo.
pause

