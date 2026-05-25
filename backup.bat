@echo off
setlocal

REM ================================================================
REM  MC HRIS — Database Backup
REM  Double-click this file to backup the database.
REM  Backup files are saved in the "backups" folder.
REM ================================================================

REM --- Database credentials (must match .env) ---
set DB_CONTAINER=hris_postgres
set DB_USER=hris_user
set DB_NAME=hris_db

echo ================================================================
echo  MC HRIS — Database Backup
echo ================================================================
echo.

REM Check Docker is available
where docker >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo         Please install Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

REM Check docker-compose.yml exists (confirms we are in project root)
if not exist "docker-compose.yml" (
    echo [ERROR] docker-compose.yml was not found.
    echo         Please run this file from the project root folder.
    echo.
    pause
    exit /b 1
)

REM Create the backups folder if it doesn't exist
if not exist "backups" (
    mkdir backups
    echo [INFO] Created backups\ folder.
)

REM ================================================================
REM Generate readable timestamp: YYYY-MM-DD_HHmmss_DayName
REM ================================================================
REM Parse date (format varies by locale, so we handle MM/DD/YYYY or DD/MM/YYYY)
REM For Windows, using wmic to get ISO date format
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do (
    set PART1=%%a
    set PART2=%%b
    set YYYY=%%c
)

REM Assuming MM/DD/YYYY format (US format)
set MM=%PART1%
set DD=%PART2%

REM Parse time
for /f "tokens=1-3 delims=:." %%a in ("%time: =0%") do (
    set HH=%%a
    set MIN=%%b
    set SS=%%c
)

REM Get day of week using PowerShell
for /f "delims=" %%a in ('powershell -NoProfile -Command "Get-Date -Format dddd"') do set DAY_NAME=%%a

set TIMESTAMP=%YYYY%-%MM%-%DD%_%HH%%MIN%%SS%_%DAY_NAME%
set BACKUP_FILE=hris_backup_%TIMESTAMP%.sql

echo [INFO] Creating backup: backups\%BACKUP_FILE%
echo [INFO] Date: %date% %time%
echo.

REM Check the postgres container is running
docker inspect --format="{{.State.Running}}" %DB_CONTAINER% >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Container "%DB_CONTAINER%" is not running.
    echo         Please start the system first using start.bat
    echo.
    pause
    exit /b 1
)

REM Run pg_dump inside the postgres container
docker exec %DB_CONTAINER% pg_dump -U %DB_USER% -d %DB_NAME% > "backups\%BACKUP_FILE%"
if errorlevel 1 (
    echo.
    echo [ERROR] Backup failed!
    echo         Make sure the system is running (start.bat) and try again.
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Backup completed successfully!
echo      File: backups\%BACKUP_FILE%
echo.

REM Display file size
for %%A in ("backups\%BACKUP_FILE%") do set FILE_SIZE=%%~zA
if defined FILE_SIZE (
    set /A SIZE_MB=FILE_SIZE/1024/1024
    echo [INFO] Backup size: %SIZE_MB% MB
)

echo.
echo ================================================================
echo  Backup Summary
echo ================================================================
echo Recent backups:
for /f "delims=" %%f in ('dir /b /o-d "backups\hris_backup_*.sql" 2^>nul ^| findstr /c:".sql"') do (
    for %%A in ("backups\%%f") do (
        set /A SIZE_KB=%%~zA/1024
        echo   - %%f [!SIZE_KB! KB]
    )
)
echo ================================================================
echo.
pause
exit /b 0
