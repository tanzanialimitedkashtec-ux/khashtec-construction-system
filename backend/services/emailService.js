require('dotenv').config();

// ============================================
// RESEND HTTP EMAIL SERVICE
// Railway blocks ALL outbound SMTP ports (25, 465, 587).
// Resend uses HTTPS API calls instead — works perfectly on Railway.
// Free tier: 100 emails/day, 3000/month
// ============================================

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'KASHTEC <onboarding@resend.dev>';
const EMAIL_RECIPIENT = process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER || 'tanzanialimitedkashtec@gmail.com';

// Verify on startup
if (RESEND_API_KEY) {
    console.log('✅ Email service configured (Resend HTTP API)');
} else {
    console.warn('⚠️ RESEND_API_KEY not set — Invoice emails will be skipped. Get a free key at https://resend.com');
}

/**
 * Send email via Resend HTTP API (no SMTP needed)
 */
async function sendViaResend(to, subject, html) {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: EMAIL_FROM,
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            html: html
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Resend API error: ${data.message || JSON.stringify(data)}`);
    }

    return data;
}

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
    // Assuming the date format should match the frontend: DD MMMM YYYY
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const statusColor = getStatusColor(status);
    const statusText = getStatusText(status);

    let actionTitle, actionMessage;
    switch (actionType) {
        case 'created':
            actionTitle = 'New Invoice Created';
            actionMessage = 'A new invoice has been created and is awaiting approval.';
            break;
        case 'approved':
            actionTitle = 'Invoice Approved';
            actionMessage = 'This invoice has been approved and marked as completed.';
            break;
        case 'rejected':
            actionTitle = 'Invoice Rejected';
            actionMessage = rejection_reason
                ? `This invoice has been rejected. Reason: ${rejection_reason}`
                : 'This invoice has been rejected.';
            break;
        default:
            actionTitle = 'Invoice Update';
            actionMessage = 'An invoice has been updated.';
    }

    const appUrl = process.env.APP_URL || 'https://khashtec-construction-system-production-e7b5.up.railway.app';
    const logoUrl = `${appUrl}/images/khashtec%20logo.png`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KASHTEC Invoice Notification</title>
</head>
<body style="margin:0;padding:20px;background-color:#f0f2f5;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:350px;border:1px solid #1a5276;border-radius:8px;padding:15px;background:#fdfdfd;font-family:Georgia,serif;box-shadow:0 2px 5px rgba(0,0,0,0.05);margin:20px auto;">
        <div style="text-align:center;border-bottom:1px solid #1a5276;padding-bottom:10px;margin-bottom:10px;">
            <img src="${logoUrl}" alt="Khashtec logo" style="display:block;margin:0 auto 5px;max-height:40px;width:auto;">
            <h3 style="margin:0;color:#1a5276;font-size:16px;">KASHTEC TANZANIA LIMITED</h3>
            <p style="margin:2px 0;color:#666;font-size:11px;">Construction Management System</p>
            <h4 style="margin:5px 0 0;color:#2c3e50;font-size:14px;">INVOICE</h4>
        </div>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:10px;font-size:12px;">
            <tr>
                <td><strong>Invoice #:</strong> ${invoice_number || 'N/A'}</td>
                <td style="text-align:right;"><strong>Date:</strong> ${dateStr}</td>
            </tr>
        </table>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:10px;font-size:12px;">
            <tr>
                <td><strong>Bill To:</strong> ${vendor_name || 'N/A'}</td>
                <td style="text-align:right;"><strong>Due Date:</strong> ${due_date || 'N/A'}</td>
            </tr>
        </table>

        <table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:12px;">
            <thead>
                <tr style="background:#1a5276;color:white;">
                    <th style="padding:6px;text-align:left;border:1px solid #1a5276;">Desc.</th>
                    <th style="padding:6px;text-align:right;border:1px solid #1a5276;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding:6px;border:1px solid #ddd;">${description || 'N/A'}</td>
                    <td style="padding:6px;text-align:right;border:1px solid #ddd;">TZS ${formatTZS(amount)}</td>
                </tr>
            </tbody>
        </table>

        <div style="text-align:right;border-top:1px solid #1a5276;padding-top:8px;margin-top:8px;">
            <strong style="font-size:14px;color:#1a5276;">Total: TZS ${formatTZS(amount)}</strong>
        </div>

        <div style="text-align:center;margin-top:12px;padding-top:10px;border-top:1px dashed #ccc;color:#888;font-size:11px;">
            <p style="margin:2px 0;">Status: <strong style="color:${statusColor};">${statusText}</strong> | Priority: <strong>${priority || 'Medium'}</strong></p>
            <p style="margin:2px 0;">Invoice ID: ${work_id || 'N/A'}</p>
            
            <div style="margin-top:15px;padding-top:10px;border-top:1px solid #eee;">
                <p style="margin:0 0 4px 0;color:#1a5276;font-weight:bold;font-size:12px;">${actionTitle}</p>
                <p style="margin:0;color:#666;">${actionMessage}</p>
            </div>
        </div>
    </div>
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
    if (!RESEND_API_KEY) {
        console.warn('⚠️ Skipping invoice email — RESEND_API_KEY not configured');
        return false;
    }

    const recipient = EMAIL_RECIPIENT;

    let subjectPrefix;
    switch (actionType) {
        case 'created':  subjectPrefix = '📝 New Invoice Created'; break;
        case 'approved': subjectPrefix = '✅ Invoice Approved'; break;
        case 'rejected': subjectPrefix = '❌ Invoice Rejected'; break;
        default:         subjectPrefix = '📋 Invoice Update'; break;
    }

    const subject = `${subjectPrefix} — ${invoiceData.invoice_number || 'N/A'} | TZS ${formatTZS(invoiceData.amount)} | KASHTEC`;
    const html = buildInvoiceEmailHTML(invoiceData, actionType);

    try {
        const result = await sendViaResend(recipient, subject, html);
        console.log(`✅ Invoice email sent (${actionType}): ${result.id} → ${recipient}`);
        return true;
    } catch (error) {
        console.error(`⚠️ Failed to send invoice email (${actionType}):`, error.message);
        // Don't throw — email failure should not block invoice processing
        return false;
    }
}

/**
 * Build the branded HTML email template for expenses
 */
function buildExpenseEmailHTML(expenseData, actionType) {
    const {
        id,
        category,
        amount,
        description,
        department,
        submittedBy,
        status
    } = expenseData;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const statusColor = getStatusColor(status);
    const statusText = getStatusText(status);

    let actionTitle, actionMessage;
    switch (actionType) {
        case 'created':
            actionTitle = 'New Expense Submitted';
            actionMessage = 'A new expense has been submitted and is awaiting approval.';
            break;
        case 'confirmed':
            actionTitle = 'Expense Confirmed';
            actionMessage = 'This expense has been confirmed and approved for payment.';
            break;
        default:
            actionTitle = 'Expense Update';
            actionMessage = 'An expense record has been updated.';
    }

    const appUrl = process.env.APP_URL || 'https://khashtec-construction-system-production-e7b5.up.railway.app';
    const logoUrl = `${appUrl}/images/khashtec%20logo.png`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KASHTEC Expense Notification</title>
</head>
<body style="margin:0;padding:20px;background-color:#f0f2f5;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:350px;border:1px solid #1a5276;border-radius:8px;padding:15px;background:#fdfdfd;font-family:Georgia,serif;box-shadow:0 2px 5px rgba(0,0,0,0.05);margin:20px auto;">
        <div style="text-align:center;border-bottom:1px solid #1a5276;padding-bottom:10px;margin-bottom:10px;">
            <img src="${logoUrl}" alt="Khashtec logo" style="display:block;margin:0 auto 5px;max-height:40px;width:auto;">
            <h3 style="margin:0;color:#1a5276;font-size:16px;">KASHTEC TANZANIA LIMITED</h3>
            <p style="margin:2px 0;color:#666;font-size:11px;">Construction Management System</p>
            <h4 style="margin:5px 0 0;color:#2c3e50;font-size:14px;">EXPENSE REPORT</h4>
        </div>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:10px;font-size:12px;">
            <tr>
                <td><strong>Expense ID:</strong> ${id || 'N/A'}</td>
                <td style="text-align:right;"><strong>Date:</strong> ${dateStr}</td>
            </tr>
        </table>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:10px;font-size:12px;">
            <tr>
                <td><strong>Department:</strong> ${department || 'N/A'}</td>
                <td style="text-align:right;"><strong>Submitted By:</strong> ${submittedBy || 'Employee'}</td>
            </tr>
        </table>

        <table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:12px;">
            <thead>
                <tr style="background:#1a5276;color:white;">
                    <th style="padding:6px;text-align:left;border:1px solid #1a5276;">Category</th>
                    <th style="padding:6px;text-align:left;border:1px solid #1a5276;">Description</th>
                    <th style="padding:6px;text-align:right;border:1px solid #1a5276;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding:6px;border:1px solid #ddd;">${category || 'N/A'}</td>
                    <td style="padding:6px;border:1px solid #ddd;">${description || 'N/A'}</td>
                    <td style="padding:6px;text-align:right;border:1px solid #ddd;">TZS ${formatTZS(amount)}</td>
                </tr>
            </tbody>
        </table>

        <div style="text-align:right;border-top:1px solid #1a5276;padding-top:8px;margin-top:8px;">
            <strong style="font-size:14px;color:#1a5276;">Total: TZS ${formatTZS(amount)}</strong>
        </div>

        <div style="text-align:center;margin-top:12px;padding-top:10px;border-top:1px dashed #ccc;color:#888;font-size:11px;">
            <p style="margin:2px 0;">Status: <strong style="color:${statusColor};">${statusText}</strong></p>
            
            <div style="margin-top:15px;padding-top:10px;border-top:1px solid #eee;">
                <p style="margin:0 0 4px 0;color:#1a5276;font-weight:bold;font-size:12px;">${actionTitle}</p>
                <p style="margin:0;color:#666;">${actionMessage}</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Send an expense notification email
 * @param {Object} expenseData - The expense details (id, category, amount, description, department, submittedBy, status)
 * @param {string} actionType - 'created' or 'confirmed'
 * @returns {Promise<boolean>} - true if sent successfully, false otherwise
 */
async function sendExpenseEmail(expenseData, actionType) {
    if (!RESEND_API_KEY) {
        console.warn('⚠️ Skipping expense email — RESEND_API_KEY not configured');
        return false;
    }

    const recipient = EMAIL_RECIPIENT;

    let subjectPrefix;
    switch (actionType) {
        case 'created':   subjectPrefix = '📝 New Expense Submitted'; break;
        case 'confirmed': subjectPrefix = '✅ Expense Confirmed'; break;
        default:          subjectPrefix = '📋 Expense Update'; break;
    }

    const subject = `${subjectPrefix} — ${expenseData.category || 'N/A'} | TZS ${formatTZS(expenseData.amount)} | KASHTEC`;
    const html = buildExpenseEmailHTML(expenseData, actionType);

    try {
        const result = await sendViaResend(recipient, subject, html);
        console.log(`✅ Expense email sent (${actionType}): ${result.id} → ${recipient}`);
        return true;
    } catch (error) {
        console.error(`⚠️ Failed to send expense email (${actionType}):`, error.message);
        return false;
    }
}

module.exports = { sendInvoiceEmail, sendExpenseEmail };
