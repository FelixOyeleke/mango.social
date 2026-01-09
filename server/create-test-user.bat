@echo off
echo.
echo ========================================
echo   Create Test User
echo ========================================
echo.
echo This will create a test user account:
echo Email: test@test.com
echo Password: password123
echo.
pause
echo.
echo Creating test user...
echo.
node node_modules\tsx\dist\cli.mjs create-test-user.ts
echo.
echo ========================================
echo   Done!
echo ========================================
echo.
echo You can now sign in at http://localhost:5173/login
echo.
pause

