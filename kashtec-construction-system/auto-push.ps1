# Auto-push script for KASHTEC Construction Management System (PowerShell)
# This script automatically commits and pushes changes to GitHub

Write-Host "🚀 Starting auto-push to GitHub..." -ForegroundColor Green

# Check if there are any changes to commit
$changes = git status --porcelain
if ($changes) {
    Write-Host "📝 Changes detected, committing..." -ForegroundColor Yellow
    
    # Add all changes
    git add .
    
    # Get current timestamp for commit message
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitMsg = "Auto-commit: Changes at $timestamp"
    
    # Commit with timestamp
    git commit -m $commitMsg
    
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Blue
    
    # Push to main branch
    git push origin main
    
    Write-Host "✅ Successfully pushed to GitHub at $timestamp" -ForegroundColor Green
} else {
    Write-Host "ℹ️ No changes to push" -ForegroundColor Cyan
}
