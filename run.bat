@echo off
cd /d "%~dp0"
if not exist node_modules npm install
node index.js
pause
