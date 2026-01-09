@echo off
echo ========================================
echo   Mango Social - Vercel Deployment
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
    echo.
)

echo Step 1: Building the application...
echo.
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo.
echo Step 2: Deploying to Vercel...
echo.
echo Choose deployment type:
echo 1. Preview deployment (for testing)
echo 2. Production deployment
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Deploying to preview...
    vercel
) else if "%choice%"=="2" (
    echo.
    echo Deploying to production...
    vercel --prod
) else (
    echo Invalid choice. Exiting.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set environment variables in Vercel dashboard
echo 2. Configure your production database
echo 3. Run database migrations
echo 4. Test your deployment
echo.
pause

