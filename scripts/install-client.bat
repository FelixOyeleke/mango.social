@echo off
echo ========================================
echo Installing Client Dependencies
echo ========================================
echo.
echo This will take 2-5 minutes...
echo.

cd client
npm install

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✓ Client dependencies installed!
    echo ========================================
    echo.
) else (
    echo.
    echo ========================================
    echo ✗ Installation failed
    echo ========================================
    echo.
)

pause

