@echo off
echo ==========================================
echo   TimeFlow - Timekeeping App Installer
echo ==========================================
echo.
echo This script will install dependencies, build the project, and start the server.
echo Requirement: Node.js must be installed.
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Installing Frontend Dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Building Frontend (This may take a minute)...
call npm run build
if %errorlevel% neq 0 (
    echo Error building frontend.
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Building Backend...
cd ../backend
call npm run build
if %errorlevel% neq 0 (
    echo Error building backend.
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================
echo   Setup Complete! Starting Server...
echo   Open your browser to: http://localhost:3000
echo   Press Ctrl+C to stop.
echo ==========================================
echo.
set PORT=3000
call npm start
pause
