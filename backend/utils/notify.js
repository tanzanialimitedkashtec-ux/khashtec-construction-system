var db = require('../../database/config/database');
const { sendGenericWhatsApp } = require('../services/whatsappService');

async function notify(title, message, type = 'info', targetRole = 'system', sentBy = 'System') {
    try {
        // We set both category and recipients to the targetRole to ensure it satisfies
        // the strict role-based filtering in backend/routes/notifications.js
        await db.execute(
            'INSERT INTO notifications (title, message, type, category, recipients, recipient_type, is_read, sent_by) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
            [title, message, type, targetRole.toLowerCase(), targetRole, targetRole === 'system' ? 'all' : 'role', sentBy]
        );

        // Send WhatsApp notification in the background (non-blocking)
        // We use the targetRole (e.g. 'HR', 'Finance', or a specific email/name if provided)
        // to look up the phone number and send the message.
        if (targetRole !== 'system' && targetRole !== 'all') {
             sendGenericWhatsApp(targetRole, title, message).catch(err => {
                 console.error('WhatsApp notify background error:', err.message);
             });
        }
    } catch (e) {
        console.error('Notify error:', e.message);
    }
}

module.exports = notify;
