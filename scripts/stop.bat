@echo off
:: ========================================
:: Immigrant Voices - Stop All Servers
:: ========================================

color 0E
title Immigrant Voices - Stopping Servers

echo.
echo ========================================
echo   STOPPING SERVERS
echo ========================================
echo.

:: Kill Node.js processes (server and client)
echo Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js processes stopped
) else (
    echo [INFO] No Node.js processes found
)

:: Kill any remaining npm processes
taskkill /F /IM npm.cmd >nul 2>nul

echo.
echo ========================================
echo   SERVERS STOPPED
echo ========================================
echo.
echo All servers have been stopped.
echo You can now close this window.
echo.
pause

