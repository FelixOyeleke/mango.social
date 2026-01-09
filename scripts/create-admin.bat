@echo off
echo ========================================
echo Creating Admin User
echo ========================================
echo.

cd server
call npm run db:create-admin

echo.
pause

