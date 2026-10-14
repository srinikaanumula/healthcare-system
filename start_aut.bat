@echo off
echo ======================================================================
echo Starting Application Under Test (Healthcare Platform)...
echo ======================================================================
start "Healthcare Backend (5000)" cmd /k "cd /d %~dp0backend && node server.js"
start "Healthcare Frontend (3000)" cmd /k "cd /d %~dp0frontend && node serve-build.js"
echo Backend running on http://localhost:5000
echo Frontend running on http://localhost:3000

pause
