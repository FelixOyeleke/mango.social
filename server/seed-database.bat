@echo off
echo.
echo ========================================
echo   Immigrant Voices - Database Seeder
echo ========================================
echo.
echo This will populate your database with dummy data:
echo - 10 users
echo - 8 stories
echo - Comments, likes, and bookmarks
echo.
pause
echo.
echo Running database seed...
echo.
node node_modules\tsx\dist\cli.mjs src\db\seed.ts
echo.
echo ========================================
echo   Seeding Complete!
echo ========================================
echo.
echo You can now visit http://localhost:5173/forum
echo to see the stories in your feed.
echo.
pause

