var db = require('../../database/config/database');

async function notify(title, message, type) {
    try {
        await db.execute(
            'INSERT INTO notifications (title, message, type, category, is_read, sent_by) VALUES (?, ?, ?, ?, 0, ?)',
            [title, message, type || 'info', 'system', 'System']
        );
    } catch (e) {
        console.error('Notify error:', e.message);
    }
}

module.exports = notify;
