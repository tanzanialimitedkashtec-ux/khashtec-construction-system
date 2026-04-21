#!/bin/bash

# Auto-push script for KASHTEC Construction Management System
# This script automatically commits and pushes changes to GitHub

echo "🚀 Starting auto-push to GitHub..."

# Check if there are any changes to commit
if git diff --quiet || git status --porcelain; then
    echo "📝 Changes detected, committing..."
    
    # Add all changes
    git add .
    
    # Get current timestamp for commit message
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    COMMIT_MSG="Auto-commit: Changes at $TIMESTAMP"
    
    # Commit with timestamp
    git commit -m "$COMMIT_MSG"
    
    echo "📤 Pushing to GitHub..."
    
    # Push to main branch
    git push origin main
    
    echo "✅ Successfully pushed to GitHub at $TIMESTAMP"
else
    echo "ℹ️ No changes to push"
fi
