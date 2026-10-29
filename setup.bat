@echo off
rem First-time setup (Windows): dependencies, .env, database, seeders.
setlocal
set "ROOT=%~dp0"

where php >nul 2>nul || (echo [ERROR] php not found in PATH & goto :fail)
where composer >nul 2>nul || (echo [ERROR] composer not found in PATH & goto :fail)

echo.
echo === module_a: composer install ===
cd /d "%ROOT%module_a" || goto :fail
call composer install --no-interaction || goto :fail

if not exist ".env" (
  copy ".env.example" ".env" >nul
  call php artisan key:generate --force || goto :fail
)

echo.
echo === module_a: database ===
call php artisan db:create || goto :fail
call php artisan migrate:fresh --seed --force || goto :fail

echo.
echo === module_b: npm ci ===
where npm >nul 2>nul && (
  cd /d "%ROOT%module_b" && call npm ci || goto :fail
) || echo [WARN] npm not found - skipping module_b dependencies

echo.
echo Setup finished. Run start.bat
pause
exit /b 0

:fail
echo.
echo [FAILED] See the error above.
pause
exit /b 1
