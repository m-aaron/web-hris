@echo off
setlocal

echo Stopping MC HRIS...
echo.

where docker >nul 2>&1
if errorlevel 1 (
	echo [ERROR] Docker is not installed or not in PATH.
	echo.
	pause
	exit /b 1
)

docker compose version >nul 2>&1
if errorlevel 1 (
	echo [ERROR] Docker Compose is not available.
	echo.
	pause
	exit /b 1
)

if not exist "docker-compose.yml" (
	echo [ERROR] docker-compose.yml was not found in this folder.
	echo Please run this file from the project root.
	echo.
	pause
	exit /b 1
)

docker compose down
if errorlevel 1 (
	echo.
	echo [ERROR] Failed to stop MC HRIS cleanly.
	echo Try again or run: docker compose ps
	echo.
	pause
	exit /b 1
)

echo.
echo [OK] MC HRIS has been stopped.
echo.
pause
exit /b 0
