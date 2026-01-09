@echo off
echo ========================================
echo Login Troubleshooting
echo ========================================
echo.

echo Checking database users...
echo.

cd server
call npx tsx src/db/check-users.ts

echo.
echo ========================================
echo.
pause

