@echo off
title MPL Creator Analytics - React Dashboard
echo ====================================================
echo Starting MPL Creator Analytics Vite Frontend...
echo ====================================================
cd /d "%~dp0frontend"
npm run dev -- --host
pause
