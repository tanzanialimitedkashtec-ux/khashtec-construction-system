#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Custom Notification System for KASHTEC Construction Management
class KashtecNotificationSystem {
    constructor() {
        this.notifications = [];
        this.config = {
            enableDesktop: true,
            enableSound: true,
            enableEmail: false, // Can be enabled later
            soundFile: 'notification.mp3',
            logFile: 'notifications.log'
        };
        this.loadConfig();
    }

    loadConfig() {
        try {
            const configPath = path.join(__dirname, 'config', 'notification-config.json');
            if (fs.existsSync(configPath)) {
                const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                this.config = { ...this.config, ...userConfig };
            }
        } catch (error) {
            console.log('Using default notification config');
        }
    }

    saveConfig() {
        try {
            const configPath = path.join(__dirname, 'config', 'notification-config.json');
            fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('Error saving notification config:', error.message);
        }
    }

    // Create custom notification
    show(title, message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now().toString(),
            title: title,
            message: message,
            type: type,
            timestamp: new Date().toISOString(),
            duration: duration
        };

        // Add to notifications array
        this.notifications.unshift(notification);
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(0, 100);
        }

        // Display notification
        this.displayNotification(notification);

        // Log notification
        this.logNotification(notification);

        // Store notification in localStorage for web interface
        this.storeNotification(notification);

        return notification;
    }

    displayNotification(notification) {
        // Console notification with colors
        const colors = {
            info: '\x1b[36m', // Cyan
            success: '\x1b[32m', // Green
            warning: '\x1b[33m', // Yellow
            error: '\x1b[31m', // Red
            update: '\x1b[35m'  // Magenta
        };

        const reset = '\x1b[0m';
        const icon = this.getIcon(notification.type);
        
        console.log(`${colors[notification.type]}${icon} [${notification.type.toUpperCase()}] ${notification.title}${reset}`);
        console.log(`${colors[notification.type]}   ${notification.message}${reset}`);
        console.log(`${colors[notification.type]}   Time: ${new Date(notification.timestamp).toLocaleString()}${reset}`);
        console.log('─'.repeat(50));

        // Play sound if enabled
        if (this.config.enableSound) {
            this.playNotificationSound();
        }

        // Desktop notification (if supported)
        if (this.config.enableDesktop && process.platform === 'win32') {
            this.showWindowsNotification(notification);
        }
    }

    getIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            update: '🔄'
        };
        return icons[type] || '📢';
    }

    playNotificationSound() {
        try {
            // For Windows - use system beep
            if (process.platform === 'win32') {
                execSync('powershell -c "(New-Object Media.SoundPlayer \'SystemHand\').PlaySync();"', { stdio: 'ignore' });
            } else if (process.platform === 'darwin') {
                // For macOS
                execSync('afplay /System/Library/Sounds/Glass.aiff', { stdio: 'ignore' });
            } else {
                // For Linux
                execSync('paplay /usr/share/sounds/alsa/Front_Left.wav', { stdio: 'ignore' });
            }
        } catch (error) {
            // Fallback to console bell
            process.stdout.write('\x07');
        }
    }

    showWindowsNotification(notification) {
        try {
            // Use Windows Toast notification
            const toast = `
                Add-Type -AssemblyName System.Windows.Forms
                Add-Type -AssemblyName System.Drawing
                
                $notify = New-Object System.Windows.Forms.NotifyIcon
                $notify.Icon = [System.Drawing.SystemIcons]::Information
                $notify.BalloonTipTitle = "${notification.title}"
                $notify.BalloonTipText = "${notification.message}"
                $notify.Visible = $true
                
                Start-Sleep -Seconds 3
                $notify.Dispose()
            `;
            
            execSync(`powershell -Command "${toast}"`, { stdio: 'ignore' });
        } catch (error) {
            console.log('Desktop notification not available:', error.message);
        }
    }

    logNotification(notification) {
        const logEntry = `[${notification.timestamp}] [${notification.type.toUpperCase()}] ${notification.title}: ${notification.message}\n`;
        
        try {
            const logPath = path.join(__dirname, this.config.logFile);
            fs.appendFileSync(logPath, logEntry);
        } catch (error) {
            console.error('Error logging notification:', error.message);
        }
    }

    storeNotification(notification) {
        // Store in localStorage format for web interface
        try {
            const existingNotifications = JSON.parse(localStorage.getItem('kashtec_notifications') || '[]');
            existingNotifications.unshift(notification);
            
            // Keep only last 50 notifications
            const recentNotifications = existingNotifications.slice(0, 50);
            localStorage.setItem('kashtec_notifications', JSON.stringify(recentNotifications));
        } catch (error) {
            console.error('Error storing notification:', error.message);
        }
    }

    // Git-specific notifications
    notifyGitCommit(hash, message, branch = 'main') {
        this.show(
            'Git Commit Pushed',
            `Successfully pushed commit ${hash.substring(0, 7)} to ${branch} branch\n${message}`,
            'success',
            6000
        );
    }

    notifyGitError(error, operation = 'Git Operation') {
        this.show(
            'Git Error',
            `Failed to ${operation}: ${error.message}\nPlease check your connection and credentials.`,
            'error',
            8000
        );
    }

    notifyFileChange(filePath, operation = 'modified') {
        this.show(
            'File Changed',
            `File ${operation}: ${path.basename(filePath)}\nChanges will be auto-pushed to GitHub.`,
            'info',
            3000
        );
    }

    notifyBuildStart(project = 'KASHTEC System') {
        this.show(
            'Build Started',
            `Starting build process for ${project}\nCompiling assets and optimizing code...`,
            'info',
            4000
        );
    }

    notifyBuildComplete(project, duration) {
        this.show(
            'Build Complete',
            `${project} built successfully in ${duration}ms\nReady for deployment.`,
            'success',
            5000
        );
    }

    notifyDeployStart(environment = 'Production') {
        this.show(
            'Deployment Started',
            `Deploying to ${environment} environment\nThis may take a few minutes...`,
            'info',
            4000
        );
    }

    notifyDeployComplete(environment, url) {
        this.show(
            'Deploy Complete',
            `Successfully deployed to ${environment}!\nLive at: ${url}`,
            'success',
            8000
        );
    }

    // System status notifications
    notifySystemStatus(status, details = '') {
        const statusIcons = {
            online: '🟢',
            offline: '🔴',
            maintenance: '🟡',
            updating: '🔄'
        };

        this.show(
            'System Status',
            `System is ${status} ${statusIcons[status] || '⚪'}\n${details}`,
            status.includes('online') ? 'success' : 'info',
            3000
        );
    }

    // Get notification history
    getNotificationHistory(limit = 10) {
        return this.notifications.slice(0, limit);
    }

    // Clear notifications
    clearNotifications() {
        this.notifications = [];
        try {
            localStorage.removeItem('kashtec_notifications');
        } catch (error) {
            console.error('Error clearing notifications:', error.message);
        }
    }

    // Export notifications
    exportNotifications(filePath = 'notifications-export.json') {
        try {
            fs.writeFileSync(filePath, JSON.stringify(this.notifications, null, 2));
            this.show(
                'Export Complete',
                `Exported ${this.notifications.length} notifications to ${filePath}`,
                'success',
                3000
            );
        } catch (error) {
            this.show(
                'Export Failed',
                `Failed to export notifications: ${error.message}`,
                'error',
                5000
            );
        }
    }
}

// Create global instance
const kashtecNotifications = new KashtecNotificationSystem();

// Export for use in other modules
module.exports = kashtecNotifications;

// Also attach to global object for browser usage
if (typeof window !== 'undefined') {
    window.kashtecNotifications = kashtecNotifications;
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
🔔 KASHTEC Notification System

Usage: node notification-system.js <command> [options]

Commands:
  show <title> <message> [type]  - Show custom notification
  commit <hash> <message>        - Notify about git commit
  error <error> <operation>        - Notify about git error
  file <path> [operation]         - Notify about file change
  status <status> [details]         - Notify system status
  history [limit]                  - Show notification history
  clear                           - Clear all notifications
  export <file>                    - Export notifications to file
  config                           - Show current config
  test                             - Test notification system

Examples:
  node notification-system.js show "Hello World" info
  node notification-system.js commit abc123 "Fixed login bug"
  node notification-system.js status online "All systems operational"
  node notification-system.js test
        `);
        process.exit(0);
    }

    const command = args[0];
    const params = args.slice(1);

    switch (command) {
        case 'show':
            kashtecNotifications.show(params[0], params[1] || 'info', params[2] || '5000');
            break;
            
        case 'commit':
            kashtecNotifications.notifyGitCommit(params[0], params[1] || 'Changes committed');
            break;
            
        case 'error':
            kashtecNotifications.notifyGitError(new Error(params[0]), params[1] || 'Operation');
            break;
            
        case 'file':
            kashtecNotifications.notifyFileChange(params[0], params[1] || 'modified');
            break;
            
        case 'status':
            kashtecNotifications.notifySystemStatus(params[0] || 'online', params[1] || '');
            break;
            
        case 'history':
            const limit = parseInt(params[0]) || 10;
            const history = kashtecNotifications.getNotificationHistory(limit);
            history.forEach((notif, index) => {
                console.log(`${index + 1}. [${notif.type.toUpperCase()}] ${notif.title} - ${notif.message}`);
            });
            break;
            
        case 'clear':
            kashtecNotifications.clearNotifications();
            console.log('✅ Notifications cleared');
            break;
            
        case 'export':
            kashtecNotifications.exportNotifications(params[0] || 'notifications-export.json');
            break;
            
        case 'config':
            console.log('Current notification config:', JSON.stringify(kashtecNotifications.config, null, 2));
            break;
            
        case 'test':
            kashtecNotifications.show('Test Notification', 'This is a test notification from KASHTEC system!', 'info');
            kashtecNotifications.show('Success Test', 'This notification tests the success type!', 'success');
            kashtecNotifications.show('Warning Test', 'This notification tests the warning type!', 'warning');
            kashtecNotifications.show('Error Test', 'This notification tests the error type!', 'error');
            break;
            
        default:
            console.log(`Unknown command: ${command}`);
            console.log('Use "node notification-system.js" for help');
            process.exit(1);
    }
}
