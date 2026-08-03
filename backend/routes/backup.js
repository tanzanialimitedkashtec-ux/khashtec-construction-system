const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const LOG_FILE = path.join(__dirname, '..', '..', 'backup-logs.json');
const SCRIPT_PATH = path.join(__dirname, '..', '..', 'scripts', 'backup-db.js');

// Helper to read logs
function getBackupLogs() {
    try {
        if (fs.existsSync(LOG_FILE)) {
            const data = fs.readFileSync(LOG_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading backup logs:', error);
    }
    return [];
}

// Helper to write logs
function addBackupLog(status, message) {
    try {
        const logs = getBackupLogs();
        const newLog = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            status,
            message
        };
        logs.unshift(newLog); // Add to beginning (newest first)
        // Keep only the last 50 logs to prevent file from growing indefinitely
        if (logs.length > 50) logs.pop();
        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
        return newLog;
    } catch (error) {
        console.error('Error writing backup log:', error);
        return null;
    }
}

// GET /api/backup/history - Get backup history
router.get('/history', (req, res) => {
    try {
        const logs = getBackupLogs();
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching backup history:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch backup history' });
    }
});

// POST /api/backup/run - Trigger a system backup
router.post('/run', (req, res) => {
    // Return immediately to not block the request, as backup could take some time
    // But since the user wants immediate feedback if possible, we can wait.
    // Let's run it and wait, but send a reasonable timeout if needed.
    // Usually DB backups on small DBs are fast. Let's just wait for it.
    
    console.log('[API] Triggering system backup...');
    
    exec(`node "${SCRIPT_PATH}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('[API] Backup failed:', error.message);
            const log = addBackupLog('Fail', error.message || 'Backup script failed to execute');
            // We only send response if we didn't send one yet (we could make it fully async, but let's wait)
            // Actually it's better to respond when it's done for simplicity
            return res.status(500).json({ success: false, error: 'Backup failed', log });
        }
        
        console.log('[API] Backup succeeded:\n', stdout);
        const log = addBackupLog('Success', 'Full system backup completed successfully');
        res.json({ success: true, message: 'Backup completed successfully', log });
    });
});

module.exports = router;
