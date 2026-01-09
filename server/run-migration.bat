@echo off
echo.
echo ========================================
echo   Immigrant Voices - Database Migration
echo ========================================
echo.
echo This will create new database tables for:
echo - Reposts
echo - Communities
echo - Extended user profiles
echo.
pause
echo.
echo Running migration...
echo.
node node_modules\tsx\dist\cli.mjs src\db\migrations\006_add_reposts_and_communities.ts
echo.
echo ========================================
echo   Migration Complete!
echo ========================================
echo.
echo Next step: Run seed-database.bat to add dummy data
echo.
pause

