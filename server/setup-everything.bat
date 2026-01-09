@echo off
echo.
echo ========================================
echo   Immigrant Voices - Complete Setup
echo ========================================
echo.
echo This will:
echo 1. Run database migration (create tables)
echo 2. Create test user (test@test.com)
echo 3. Seed database (add dummy data)
echo.
echo This takes about 30 seconds.
echo.
pause
echo.

echo ========================================
echo   Step 1/3: Running Migration...
echo ========================================
echo.
node node_modules\tsx\dist\cli.mjs src\db\migrations\006_add_reposts_and_communities.ts
echo.

echo ========================================
echo   Step 2/3: Creating Test User...
echo ========================================
echo.
node node_modules\tsx\dist\cli.mjs create-test-user.ts
echo.

echo ========================================
echo   Step 3/3: Seeding Database...
echo ========================================
echo.
node node_modules\tsx\dist\cli.mjs src\db\seed.ts
echo.

echo ========================================
echo   Setup Complete! 🎉
echo ========================================
echo.
echo You can now:
echo 1. Visit http://localhost:5173/login
echo 2. Sign in with:
echo    Email: test@test.com
echo    Password: password123
echo.
echo Or use any seeded user (password: password123):
echo - maria.rodriguez@email.com
echo - ahmed.hassan@email.com
echo - li.wei@email.com
echo - priya.sharma@email.com
echo - carlos.santos@email.com
echo.
echo Enjoy the new Bluesky-style design!
echo.
pause

