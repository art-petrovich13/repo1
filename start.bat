@echo off
rem Starts API (8000), reminders scheduler and frontend (5173) in separate windows.
setlocal
set "ROOT=%~dp0"

start "API - php artisan serve" /d "%ROOT%module_a" cmd /k php artisan serve --host=127.0.0.1 --port=8000
start "Scheduler - reminders" /d "%ROOT%module_a" cmd /k php artisan schedule:work

rem Frontend: "dev" (sources, hot reload). For the built version from dist use: npm run preview
set "MODE=dev"
if /i "%~1"=="preview" set "MODE=preview"
start "Frontend - npm run %MODE%" /d "%ROOT%module_b" cmd /k npm run %MODE%

timeout /t 4 >nul
start "" http://localhost:5173
