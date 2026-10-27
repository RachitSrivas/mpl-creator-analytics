@echo off
title MPL Creator Analytics - Backend API
echo ====================================================
echo Starting MPL Creator Analytics FastAPI Backend...
echo ====================================================
cd /d "%~dp0backend"
C:\Python313\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
