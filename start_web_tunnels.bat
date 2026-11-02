@echo off
echo ==============================================================
echo Starting Public Web Tunnels for Healthcare App ^& TestPilot...
echo ==============================================================
echo.
echo Launching 3 public HTTPS URLs via localtunnel:
echo - Healthcare Frontend (Port 3000)
echo - Healthcare Backend (Port 5000)
echo - TestPilot QA Platform (Port 8000)
echo.

start "Public Tunnel - Frontend (3000)" cmd /k "npx --yes localtunnel --port 3000"
start "Public Tunnel - Backend (5000)" cmd /k "npx --yes localtunnel --port 5000"
start "Public Tunnel - TestPilot (8000)" cmd /k "npx --yes localtunnel --port 8000"

echo.
echo All 3 public tunnels have been launched in separate windows.
echo Copy each generated public URL (e.g. https://xxxx.loca.lt) to access your apps online!
echo ==============================================================
pause
