@echo off
echo ========================================
echo Installing Dependencies
echo ========================================
echo.

echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ✗ Failed to install server dependencies
    pause
    exit /b 1
)
echo ✓ Server dependencies installed
echo.

echo Installing client dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ✗ Failed to install client dependencies
    pause
    exit /b 1
)
echo ✓ Client dependencies installed
echo.

cd ..
echo ========================================
echo ✓ All dependencies installed!
echo ========================================
echo.
echo Next steps:
echo 1. Run: setup-db.bat (to setup database)
echo 2. Run: start-dev.bat (to start the app)
echo.
pause

