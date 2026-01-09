@echo off
:: ========================================
:: Immigrant Voices - Production Build
:: ========================================

color 0A
title Immigrant Voices - Building for Production

echo.
echo ========================================
echo   BUILDING FOR PRODUCTION
echo ========================================
echo.

:: Build server
echo [1/2] Building server...
cd ..\server
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Server build failed
    pause
    exit /b 1
)
echo [OK] Server built successfully
echo.

:: Build client
echo [2/2] Building client...
cd ..\client
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Client build failed
    pause
    exit /b 1
)
echo [OK] Client built successfully
echo.

cd ..\scripts

echo ========================================
echo   BUILD COMPLETE!
echo ========================================
echo.
echo Build artifacts:
echo   Server: server/dist/
echo   Client: client/dist/
echo.
echo To start production server:
echo   cd server
echo   npm start
echo.
pause

