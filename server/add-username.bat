@echo off
echo.
echo ========================================
echo   Adding Username Field to Users
echo ========================================
echo.
echo This will add a username field to the users table
echo and generate usernames for existing users.
echo.
pause
echo.
echo Running migration...
echo.
node node_modules\tsx\dist\cli.mjs src\db\migrations\007_add_username.ts
echo.
echo ========================================
echo   Migration Complete!
echo ========================================
echo.
echo Users can now set custom usernames in their profile.
echo.
pause

