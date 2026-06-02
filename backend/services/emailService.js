const nodemailer = require('nodemailer');
require('dotenv').config();

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'tanzanialimitedkashtec@gmail.com',
        pass: process.env.EMAIL_APP_PASSWORD || ''
    }
});

// Verify connection on startup (non-blocking)
transporter.verify()
    .then(() => console.log('✅ Email service connected successfully (Gmail SMTP)'))
    .catch(err => console.warn('⚠️ Email service not available:', err.message, '— Invoice emails will be skipped.'));

/**
 * Format number as TZS currency
 */
function formatTZS(amount) {
    return Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0 });
}

/**
 * Get status badge color
 */
function getStatusColor(status) {
    switch ((status || '').toLowerCase()) {
        case 'completed':
        case 'approved': return '#27ae60';
        case 'rejected': return '#e74c3c';
        case 'pending':
        default: return '#e67e22';
    }
}

/**
 * Get status display text
 */
function getStatusText(status) {
    switch ((status || '').toLowerCase()) {
        case 'completed': return 'Approved';
        case 'approved': return 'Approved';
        case 'rejected': return 'Rejected';
        case 'pending':
        default: return 'Pending';
    }
}

/**
 * Build the branded HTML email template for invoices
 */
function buildInvoiceEmailHTML(invoiceData, actionType) {
    const {
        invoice_number,
        vendor_name,
        amount,
        description,
        category,
        priority,
        due_date,
        status,
        work_id,
        rejection_reason
    } = invoiceData;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const statusColor = getStatusColor(status);
    const statusText = getStatusText(status);

    let actionTitle, actionMessage, actionColor;
    switch (actionType) {
        case 'created':
            actionTitle = '📝 New Invoice Created';
            actionMessage = 'A new invoice has been created and is awaiting approval.';
            actionColor = '#3498db';
            break;
        case 'approved':
            actionTitle = '✅ Invoice Approved';
            actionMessage = 'This invoice has been approved and marked as completed.';
            actionColor = '#27ae60';
            break;
        case 'rejected':
            actionTitle = '❌ Invoice Rejected';
            actionMessage = rejection_reason
                ? `This invoice has been rejected. Reason: ${rejection_reason}`
                : 'This invoice has been rejected.';
            actionColor = '#e74c3c';
            break;
        default:
            actionTitle = '📋 Invoice Update';
            actionMessage = 'An invoice has been updated.';
            actionColor = '#2c3e50';
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KASHTEC Invoice Notification</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f2f5;padding:30px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#1a5276 0%,#2c3e50 100%);padding:30px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:1px;">KASHTEC TANZANIA LIMITED</h1>
                            <p style="margin:6px 0 0;color:#bdc3c7;font-size:13px;letter-spacing:0.5px;">Construction Management System</p>
                        </td>
                    </tr>

                    <!-- Action Banner -->
                    <tr>
                        <td style="background:${actionColor};padding:15px 40px;text-align:center;">
                            <h2 style="margin:0;color:#ffffff;font-size:18px;">${actionTitle}</h2>
                            <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:13px;">${actionMessage}</p>
                        </td>
                    </tr>

                    <!-- Invoice Details -->
                    <tr>
                        <td style="padding:30px 40px;">
                            
                            <!-- Invoice Header Info -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
                                <tr>
                                    <td style="padding:8px 0;border-bottom:1px solid #ecf0f1;">
                                        <strong style="color:#1a5276;font-size:14px;">Invoice Number:</strong>
                                        <span style="float:right;color:#2c3e50;font-size:14px;font-weight:bold;">${invoice_number || 'N/A'}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;border-bottom:1px solid #ecf0f1;">
                                        <strong style="color:#1a5276;font-size:14px;">Client / Vendor:</strong>
                                        <span style="float:right;color:#2c3e50;font-size:14px;">${vendor_name || 'N/A'}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;border-bottom:1px solid #ecf0f1;">
                                        <strong style="color:#1a5276;font-size:14px;">Category:</strong>
                                        <span style="float:right;color:#2c3e50;font-size:14px;">${category || 'General'}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;border-bottom:1px solid #ecf0f1;">
                                        <strong style="color:#1a5276;font-size:14px;">Due Date:</strong>
                                        <span style="float:right;color:#2c3e50;font-size:14px;">${due_date || 'N/A'}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;border-bottom:1px solid #ecf0f1;">
                                        <strong style="color:#1a5276;font-size:14px;">Priority:</strong>
                                        <span style="float:right;color:#2c3e50;font-size:14px;">${priority || 'Medium'}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;border-bottom:1px solid #ecf0f1;">
                                        <strong style="color:#1a5276;font-size:14px;">Status:</strong>
                                        <span style="float:right;background:${statusColor};color:#fff;padding:3px 12px;border-radius:12px;font-size:12px;font-weight:bold;">${statusText}</span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Description -->
                            <div style="background:#f8f9fa;border-left:4px solid #1a5276;padding:15px;border-radius:0 6px 6px 0;margin-bottom:20px;">
                                <strong style="color:#1a5276;font-size:13px;display:block;margin-bottom:5px;">Description:</strong>
                                <p style="margin:0;color:#555;font-size:14px;line-height:1.5;">${description || 'No description provided'}</p>
                            </div>

                            <!-- Amount Box -->
                            <div style="background:linear-gradient(135deg,#1a5276 0%,#2c3e50 100%);border-radius:8px;padding:20px;text-align:center;margin-bottom:20px;">
                                <p style="margin:0 0 5px;color:#bdc3c7;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Total Amount</p>
                                <p style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">TZS ${formatTZS(amount)}</p>
                            </div>

                            <!-- Meta Info -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f9fa;border-radius:6px;padding:12px;">
                                <tr>
                                    <td style="padding:8px 15px;font-size:12px;color:#888;">
                                        📅 Date: ${dateStr} at ${timeStr}
                                    </td>
                                    <td style="padding:8px 15px;font-size:12px;color:#888;text-align:right;">
                                        🆔 Invoice ID: ${work_id || 'N/A'}
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:2px solid #ecf0f1;">
                            <p style="margin:0 0 5px;color:#1a5276;font-size:14px;font-weight:bold;">Thank you for your business!</p>
                            <p style="margin:0;color:#999;font-size:11px;">KASHTEC Tanzania Limited — Construction Management System</p>
                            <p style="margin:5px 0 0;color:#bbb;font-size:10px;">This is an automated notification. Please do not reply to this email.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

/**
 * Send an invoice notification email
 * @param {Object} invoiceData - The invoice details
 * @param {string} actionType - 'created', 'approved', or 'rejected'
 * @returns {Promise<boolean>} - true if sent successfully, false otherwise
 */
async function sendInvoiceEmail(invoiceData, actionType) {
    const recipient = process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER || 'tanzanialimitedkashtec@gmail.com';

    let subjectPrefix;
    switch (actionType) {
        case 'created':  subjectPrefix = '📝 New Invoice Created'; break;
        case 'approved': subjectPrefix = '✅ Invoice Approved'; break;
        case 'rejected': subjectPrefix = '❌ Invoice Rejected'; break;
        default:         subjectPrefix = '📋 Invoice Update'; break;
    }

    const subject = `${subjectPrefix} — ${invoiceData.invoice_number || 'N/A'} | TZS ${formatTZS(invoiceData.amount)} | KASHTEC`;

    const mailOptions = {
        from: `"KASHTEC Construction System" <${process.env.EMAIL_USER || 'tanzanialimitedkashtec@gmail.com'}>`,
        to: recipient,
        subject: subject,
        html: buildInvoiceEmailHTML(invoiceData, actionType)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Invoice email sent (${actionType}): ${info.messageId} → ${recipient}`);
        return true;
    } catch (error) {
        console.error(`⚠️ Failed to send invoice email (${actionType}):`, error.message);
        // Don't throw — email failure should not block invoice processing
        return false;
    }
}

module.exports = { sendInvoiceEmail };
