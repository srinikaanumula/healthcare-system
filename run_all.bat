@echo off
echo ======================================================================
echo Starting TestPilot and Reference Healthcare Platform...
echo ======================================================================

echo [1/3] Launching Healthcare Backend on port 5000...
start "Healthcare Backend (5000)" cmd /k "cd /d %~dp0backend && node server.js"

echo [2/3] Launching Healthcare Frontend on port 3000...
start "Healthcare Frontend (3000)" cmd /k "cd /d %~dp0frontend && node serve-build.js"

echo [3/3] Launching TestPilot Platform on port 8000...
start "TestPilot Platform (8000)" cmd /k "cd /d %~dp0testpilot && npm start"

timeout /t 3 >nul
echo Opening TestPilot Web Interface in browser...
start http://localhost:8000

echo ======================================================================
echo All services launched!
echo TestPilot:  http://localhost:8000
echo AUT Web:    http://localhost:3000
echo AUT API:    http://localhost:5000
echo ======================================================================
pause
