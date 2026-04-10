@echo off
REM School Magazine App - Initial Setup Script for Windows

echo ========================================
echo School Magazine App - Setup Wizard
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

REM Install dependencies
echo [2/4] Installing dependencies...
echo This may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

REM Copy environment file
echo [3/4] Setting up environment file...
if exist .env.local (
    echo .env.local already exists, skipping...
) else (
    copy .env.example .env.local
    echo ✓ Created .env.local from template
    echo.
    echo IMPORTANT: Edit .env.local with your Firebase credentials!
    echo Open Firebase Console and get your config from Project Settings
)
echo.

REM Initialize Git
echo [4/4] Initializing Git repository...
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo Git is not installed. Skipping Git initialization.
) else (
    if not exist .git (
        call git init
        echo ✓ Git repository initialized
    ) else (
        echo ✓ Git repository already exists
    )
)
echo.

echo ========================================
echo Setup Complete! ✓
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Edit .env.local with your Firebase credentials
echo 2. Run 'npm run dev' to start development server
echo 3. Open http://localhost:3000 in your browser
echo.
echo For deployment instructions, see DEPLOYMENT_GUIDE.md
echo.
pause
