@echo off
setlocal

echo Starting MC HRIS...
echo.

where docker >nul 2>&1
if errorlevel 1 (
	echo [ERROR] Docker is not installed or not in PATH.
	echo Please install Docker Desktop and try again.
	echo.
	pause
	exit /b 1
)

docker compose version >nul 2>&1
if errorlevel 1 (
	echo [ERROR] Docker Compose is not available.
	echo Please ensure Docker Compose is enabled in Docker Desktop.
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

docker compose up -d --build
if errorlevel 1 (
	echo.
	echo [ERROR] Failed to start MC HRIS.
	echo Check Docker Desktop status and run: docker compose logs
	echo.
	pause
	exit /b 1
)

echo.
echo [OK] MC HRIS started successfully.
echo Frontend URL: http://localhost:3002
echo Backend URL:  http://localhost:5001
echo.
echo Note: On first run, please wait about 30 seconds before using the system.
echo.
pause
exit /b 0
