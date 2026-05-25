@echo off
setlocal

echo Resetting and reseeding MC HRIS database...
echo.

where docker >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH.
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

echo Ensuring database container is running...
docker compose up -d postgres
if errorlevel 1 (
    echo [ERROR] Failed to start postgres service.
    echo.
    pause
    exit /b 1
)

echo.
echo Running backup + reset + reseed...
pushd backend
npm run db:reset-seed
set "SEED_EXIT=%ERRORLEVEL%"
popd

if not "%SEED_EXIT%"=="0" (
    echo.
    echo [ERROR] Database reset/reseed failed.
    echo Check details above.
    echo.
    pause
    exit /b %SEED_EXIT%
)

echo.
echo [OK] Database reset/reseed completed successfully.
echo.
echo ================================================================
echo  Backup Information
echo ================================================================
echo The database state before reset has been backed up.
echo Backup location: backups\
echo.
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
