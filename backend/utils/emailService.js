const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

/**
 * Sends an email notification to the assigned worker
 * @param {string} toEmail - Recipient email address
 * @param {Array<{label: string, value: string}>} details - Assignment details
 */
async function sendAssignmentNotification(toEmail, details) {
    if (!toEmail) return;
    try {
        let rowsHtml = '';
        if (Array.isArray(details)) {
            details.forEach(d => {
                rowsHtml += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${d.label}:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${d.value || '-'}</td></tr>`;
            });
        }
        
        await emailTransporter.sendMail({
            from: `"KASHTEC System" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `New Assignment Notification`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2196F3;">New Task/Project Assignment</h2>
                    <p>You have been assigned to a new task or project.</p>
                    <table style="width: 100%; max-width: 500px; border-collapse: collapse; margin-top: 10px;">
                        ${rowsHtml}
                    </table>
                    <p style="margin-top: 20px;">Please log into the KASHTEC Construction Management System to view the full details.</p>
                </div>
            `
        });
        console.log(`Email notification sent to ${toEmail}`);
    } catch (error) {
        console.error('Failed to send assignment notification:', error);
    }
}

module.exports = {
    sendAssignmentNotification
};
