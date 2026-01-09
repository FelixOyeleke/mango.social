@echo off
echo ========================================
echo Installing Server Dependencies
echo ========================================
echo.
echo This will take 2-5 minutes...
echo.

cd server
npm install

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✓ Server dependencies installed!
    echo ========================================
    echo.
    echo Next step: Run setup-db.bat
    echo.
) else (
    echo.
    echo ========================================
    echo ✗ Installation failed
    echo ========================================
    echo.
    echo Please check:
    echo 1. Node.js is installed
    echo 2. You have internet connection
    echo 3. You're in the correct directory
    echo.
)

pause

