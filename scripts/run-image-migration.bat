@echo off
echo ========================================
echo Running Image Storage Migration
echo ========================================
echo.

cd server
call npx tsx src/db/run-migration.ts

echo.
echo ========================================
echo Migration Complete!
echo ========================================
echo.
pause

