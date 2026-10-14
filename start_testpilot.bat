@echo off
echo ======================================================================
echo Starting TestPilot Platform on http://localhost:8000
echo ======================================================================
cd /d %~dp0testpilot
npm start
pause
