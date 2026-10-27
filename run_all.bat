@echo off
title MPL Creator Performance Analytics Suite
echo =============================================================
echo Launching MPL Creator Performance Analytics & Reconciliation
echo =============================================================
echo.
echo 1. Starting Backend API at http://localhost:8000
start "MPL Backend (FastAPI)" cmd /c "%~dp0start_backend.bat"
timeout /t 2 /nobreak >nul
echo.
echo 2. Starting Frontend Dashboard at http://localhost:5173
start "MPL Frontend (React+Vite)" cmd /c "%~dp0start_frontend.bat"
echo.
echo Both servers initiated!
echo Opening browser to http://localhost:5173 in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173
