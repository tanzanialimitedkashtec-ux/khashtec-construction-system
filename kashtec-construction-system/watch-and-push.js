#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const kashtecNotifications = require('./backend/notification-system');

// Configuration
const WATCH_INTERVAL = 30000; // Check every 30 seconds
const PROJECT_DIR = __dirname;

console.log('🚀 Starting GitHub auto-push watcher for KASHTEC Construction Management System');
console.log(`📁 Watching directory: ${PROJECT_DIR}`);
console.log(`⏰ Check interval: ${WATCH_INTERVAL / 1000} seconds`);

// Notify system startup
kashtecNotifications.notifySystemStatus('online', 'Auto-push watcher is running');

function hasChanges() {
    try {
        const status = execSync('git status --porcelain', { 
                encoding: 'utf8', 
                cwd: PROJECT_DIR,
                stdio: 'pipe' 
        });
        return status.trim().length > 0;
    } catch (error) {
        console.error('Error checking git status:', error.message);
        kashtecNotifications.notifyGitError(error, 'Git Status Check');
        return false;
    }
}

function commitAndPush() {
    try {
        console.log('📝 Changes detected, committing...');
        
        // Notify about file changes
        kashtecNotifications.show('File Changes Detected', 'Analyzing modified files for auto-commit...', 'info');
        
        // Add all changes
        execSync('git add .', { cwd: PROJECT_DIR, stdio: 'inherit' });
        
        // Get current timestamp for commit message
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const commitMsg = `Auto-commit: Changes at ${timestamp}`;
        
        // Get git hash for notification
        const gitStatus = execSync('git status --porcelain', { 
                encoding: 'utf8', 
                cwd: PROJECT_DIR,
                stdio: 'pipe' 
        });
        
        // Notify about commit
        kashtecNotifications.show('Creating Commit', `Committing changes with message: ${commitMsg}`, 'info');
        
        // Commit changes
        execSync(`git commit -m "${commitMsg}"`, { 
                cwd: PROJECT_DIR, 
                stdio: 'inherit' 
        });
        
        // Get commit hash
        const commitHash = execSync('git rev-parse HEAD', { 
                encoding: 'utf8', 
                cwd: PROJECT_DIR,
                stdio: 'pipe' 
        }).trim();
        
        console.log('📤 Pushing to GitHub...');
        
        // Notify about push
        kashtecNotifications.show('Pushing to GitHub', `Uploading commit ${commitHash.substring(0, 7)} to remote repository...`, 'info');
        
        // Push to main branch
        execSync('git push origin main', { 
                cwd: PROJECT_DIR, 
                stdio: 'inherit' 
        });
        
        // Success notification
        kashtecNotifications.notifyGitCommit(commitHash, commitMsg);
        
    } catch (error) {
        console.error('❌ Error during git operations:', error.message);
        kashtecNotifications.notifyGitError(error, 'Git Push Operation');
    }
}

// Watch for changes
setInterval(() => {
    if (hasChanges()) {
        commitAndPush();
    } else {
        process.stdout.write('.');
    }
}, WATCH_INTERVAL);

console.log('👀 Auto-push watcher is running. Press Ctrl+C to stop.');

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping auto-push watcher...');
    kashtecNotifications.show('Watcher Stopped', 'Auto-push watcher has been stopped', 'warning');
    process.exit(0);
});

// Handle unexpected errors
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error.message);
    kashtecNotifications.notifyGitError(error, 'Unexpected Error');
});

process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled Promise Rejection:', reason);
    kashtecNotifications.show('System Error', 'Unhandled promise rejection occurred', 'error');
});
