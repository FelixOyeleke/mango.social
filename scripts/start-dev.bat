@echo off
echo Starting Immigrant Voices...
echo.
echo Server: http://localhost:5000
echo Client: http://localhost:5173
echo.

start "Server" cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak >nul
start "Client" cmd /k "cd client && npm run dev"

echo.
echo ✓ Servers starting in separate windows
echo ✓ Open http://localhost:5173 when ready
echo.

