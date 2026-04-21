@echo off
title KASHTEC Auto-Push to GitHub
echo.
echo ========================================
echo   KASHTEC Auto-Push Script
echo ========================================
echo.

echo Checking for changes...
cd /d "%~dp0"

git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    for /f %%i in ('git status --porcelain') do set has_changes=%%i
)

if defined has_changes (
    echo [+] Changes detected!
    echo.
    echo Adding all files...
    git add .
    
    echo.
    echo Committing changes...
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set timestamp=%%c-%%a-%%b 
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set timestamp=!timestamp! %%a:%%b!
    
    git commit -m "Auto-commit: Changes at %timestamp%"
    
    echo.
    echo Pushing to GitHub...
    git push origin main
    
    echo.
    echo [SUCCESS] Changes pushed to GitHub!
) else (
    echo [INFO] No changes to push
)

echo.
echo Press any key to exit...
pause >nul
