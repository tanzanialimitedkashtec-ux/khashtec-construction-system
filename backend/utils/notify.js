var db = require('../../database/config/database');

async function notify(title, message, type = 'info', targetRole = 'system', sentBy = 'System') {
    try {
        // We set both category and recipients to the targetRole to ensure it satisfies
        // the strict role-based filtering in backend/routes/notifications.js
        await db.execute(
            'INSERT INTO notifications (title, message, type, category, recipients, recipient_type, is_read, sent_by) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
            [title, message, type, targetRole.toLowerCase(), targetRole, targetRole === 'system' ? 'all' : 'role', sentBy]
        );
    } catch (e) {
        console.error('Notify error:', e.message);
    }
}

module.exports = notify;
