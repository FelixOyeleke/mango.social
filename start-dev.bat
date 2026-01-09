@echo off
echo.
echo ========================================
echo   Starting Immigrant Voices
echo ========================================
echo.
echo Starting backend server (port 5000)...
echo Starting frontend server (port 5173)...
echo.
echo Press Ctrl+C to stop both servers
echo.

start "Backend Server" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo   Servers Starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Two new windows will open.
echo Close this window when done.
echo.
pause

