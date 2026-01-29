@echo off
SET REPO_URL=https://github.com/aksha345/AI-Tester.git
SET PROJECT_DIR=%~dp0

echo ========================================
echo 🚀 AI-Tester: GitHub Push Script
echo ========================================

cd /d "%PROJECT_DIR%"

:: Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Git is not installed or not in your PATH.
    echo Please install Git from https://git-scm.com/
    pause
    exit /b
)

:: Check if .git exists, if not initialize
if not exist ".git" (
    echo 📂 Initializing Git repository...
    git init
    git remote add origin %REPO_URL%
) else (
    :: Ensure the remote is correct
    git remote set-url origin %REPO_URL%
)

echo ➕ Staging files...
git add .

echo 📝 Committing changes...
git commit -m "Initial commit for Local LLM Testcase Generator"

echo 📤 Pushing to GitHub (Main branch)...
git branch -M main
git push -u origin main

echo.
if %errorlevel% neq 0 (
    echo ❌ FAILED! Please check your internet connection or GitHub permissions.
) else (
    echo ✅ SUCCESS! Your code is now live at %REPO_URL%
)

echo.
pause
