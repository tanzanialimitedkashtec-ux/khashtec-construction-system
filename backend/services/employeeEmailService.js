require('dotenv').config();
const nodemailer = require('nodemailer');

// ============================================
// NODEMAILER EMAIL SERVICE (For Employees)
// Bypasses Resend domain restrictions.
// Uses Gmail App Passwords to send to ANY email.
// ============================================

const GMAIL_USER = process.env.GMAIL_USER || 'tanzanialimitedkashtec@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
    },
    // Force IPv4 — Railway and many cloud hosts lack IPv6 connectivity
    family: 4,
    tls: {
        rejectUnauthorized: false
    }
});

// Verify on startup
if (GMAIL_APP_PASSWORD) {
    transporter.verify(function(error, success) {
        if (error) {
            console.error('❌ Nodemailer configuration error:', error.message);
        } else {
            console.log('✅ Employee email service configured (Nodemailer)');
        }
    });
} else {
    console.warn('⚠️ GMAIL_APP_PASSWORD not set — Employee emails will fail.');
}

/**
 * Build the HTML email template for assignments
 */
function buildAssignmentEmailHTML(details) {
    const appUrl = process.env.APP_URL || 'https://khashtec-construction-system-production-e7b5.up.railway.app';
    const logoUrl = `${appUrl}/images/khashtec%20logo.png`;

    let employeeName = '';
    let rowsHtml = '';
    
    if (Array.isArray(details)) {
        details.forEach(d => {
            if (d.label === 'Employee Name' || d.label === 'Employee') {
                employeeName = d.value;
            }
            rowsHtml += `<tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #1a5276; width: 40%;">${d.label}:</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${d.value || '-'}</td></tr>`;
        });
    }

    const greeting = employeeName ? `Dear ${employeeName},` : 'Hello,';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KASHTEC Assignment Notification</title>
</head>
<body style="margin:0;padding:20px;background-color:#f4f7f6;font-family:Arial,sans-serif;">
    <div style="max-width:450px;border-top:4px solid #1a5276;border-radius:8px;padding:25px;background:#ffffff;box-shadow:0 4px 10px rgba(0,0,0,0.05);margin:20px auto;">
        <div style="text-align:center;border-bottom:1px solid #eee;padding-bottom:15px;margin-bottom:20px;">
            <img src="${logoUrl}" alt="Khashtec logo" style="display:block;margin:0 auto 10px;max-height:50px;width:auto;">
            <h3 style="margin:0;color:#1a5276;font-size:18px;text-transform:uppercase;letter-spacing:1px;">KASHTEC TANZANIA LIMITED</h3>
            <p style="margin:4px 0;color:#7f8c8d;font-size:12px;">Construction Management System</p>
        </div>
        
        <h4 style="margin:0 0 15px;color:#2c3e50;font-size:16px;text-align:center;background:#e8f4f8;padding:10px;border-radius:4px;">📋 NEW ASSIGNMENT</h4>
        
        <p style="font-size:14px;color:#34495e;margin-bottom:15px;">${greeting}</p>
        <p style="font-size:14px;color:#34495e;line-height:1.5;margin-bottom:20px;">You have been assigned to a new task or project. Here are the details:</p>
        
        <table style="width:100%;border-collapse:collapse;margin:15px 0;font-size:13px;background:#f9fbfb;border-radius:6px;overflow:hidden;">
            ${rowsHtml}
        </table>

        <div style="text-align:center;margin:30px 0 15px;">
            <a href="${appUrl}" style="background-color:#1a5276;color:#ffffff;padding:12px 25px;text-decoration:none;border-radius:4px;font-size:14px;font-weight:bold;display:inline-block;box-shadow:0 2px 4px rgba(26,82,118,0.3);">View Details in System</a>
        </div>

        <div style="text-align:center;margin-top:25px;padding-top:15px;border-top:1px solid #eee;color:#95a5a6;font-size:11px;">
            <p style="margin:4px 0;">This is an automated message. Please do not reply directly to this email.</p>
            <p style="margin:4px 0;">&copy; ${new Date().getFullYear()} KASHTEC Tanzania Limited.</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Send an assignment notification email to an employee
 */
async function sendAssignmentNotification(toEmail, details) {
    if (!GMAIL_APP_PASSWORD) {
        console.warn('⚠️ Skipping assignment email — GMAIL_APP_PASSWORD not configured');
        return false;
    }

    if (!toEmail) return false;

    const subject = `New Assignment Notification | KASHTEC`;
    const html = buildAssignmentEmailHTML(details);

    try {
        const info = await transporter.sendMail({
            from: `"KASHTEC System" <${GMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            html: html
        });
        console.log(`✅ Assignment email sent via Nodemailer to ${toEmail} (ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error(`⚠️ Failed to send assignment email:`, error.message);
        return false;
    }
}

/**
 * Build the HTML email template for payment notifications
 */
function buildPaymentEmailHTML(details) {
    const appUrl = process.env.APP_URL || 'https://khashtec-construction-system-production-e7b5.up.railway.app';
    const logoUrl = `${appUrl}/images/khashtec%20logo.png`;

    let employeeName = '';
    let rowsHtml = '';
    let paymentStatus = 'Processed';
    
    if (Array.isArray(details)) {
        details.forEach(d => {
            if (d.label === 'Employee Name' || d.label === 'Employee') {
                employeeName = d.value;
            }
            if (d.label === 'Status') {
                paymentStatus = d.value;
            }
            rowsHtml += `<tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #1a5276; width: 40%;">${d.label}:</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${d.value || '-'}</td></tr>`;
        });
    }

    const greeting = employeeName ? `Dear ${employeeName},` : 'Hello,';
    const statusColor = paymentStatus.toLowerCase() === 'failed' ? '#e74c3c' : '#27ae60';
    const headerBg = paymentStatus.toLowerCase() === 'failed' ? '#fdedec' : '#eafaf1';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KASHTEC Payment Notification</title>
</head>
<body style="margin:0;padding:20px;background-color:#f4f7f6;font-family:Arial,sans-serif;">
    <div style="max-width:450px;border-top:4px solid #1a5276;border-radius:8px;padding:25px;background:#ffffff;box-shadow:0 4px 10px rgba(0,0,0,0.05);margin:20px auto;">
        <div style="text-align:center;border-bottom:1px solid #eee;padding-bottom:15px;margin-bottom:20px;">
            <img src="${logoUrl}" alt="Khashtec logo" style="display:block;margin:0 auto 10px;max-height:50px;width:auto;">
            <h3 style="margin:0;color:#1a5276;font-size:18px;text-transform:uppercase;letter-spacing:1px;">KASHTEC TANZANIA LIMITED</h3>
            <p style="margin:4px 0;color:#7f8c8d;font-size:12px;">Construction Management System</p>
        </div>
        
        <h4 style="margin:0 0 15px;color:${statusColor};font-size:16px;text-align:center;background:${headerBg};padding:10px;border-radius:4px;">💰 PAYMENT UPDATE</h4>
        
        <p style="font-size:14px;color:#34495e;margin-bottom:15px;">${greeting}</p>
        <p style="font-size:14px;color:#34495e;line-height:1.5;margin-bottom:20px;">A payment record has been generated for you. Please see the details below:</p>
        
        <table style="width:100%;border-collapse:collapse;margin:15px 0;font-size:13px;background:#f9fbfb;border-radius:6px;overflow:hidden;">
            ${rowsHtml}
        </table>

        <div style="text-align:center;margin:30px 0 15px;">
            <a href="${appUrl}" style="background-color:#1a5276;color:#ffffff;padding:12px 25px;text-decoration:none;border-radius:4px;font-size:14px;font-weight:bold;display:inline-block;box-shadow:0 2px 4px rgba(26,82,118,0.3);">Log in to System</a>
        </div>

        <div style="text-align:center;margin-top:25px;padding-top:15px;border-top:1px solid #eee;color:#95a5a6;font-size:11px;">
            <p style="margin:4px 0;">This is an automated message. Please do not reply directly to this email.</p>
            <p style="margin:4px 0;">&copy; ${new Date().getFullYear()} KASHTEC Tanzania Limited.</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Send a payment notification email to an employee
 */
async function sendPaymentNotification(toEmail, details) {
    if (!GMAIL_APP_PASSWORD) {
        console.warn('⚠️ Skipping payment email — GMAIL_APP_PASSWORD not configured');
        return false;
    }

    if (!toEmail) return false;

    const subject = `Payment Notification | KASHTEC`;
    const html = buildPaymentEmailHTML(details);

    try {
        const info = await transporter.sendMail({
            from: `"KASHTEC System" <${GMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            html: html
        });
        console.log(`✅ Payment email sent via Nodemailer to ${toEmail} (ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error(`⚠️ Failed to send payment email:`, error.message);
        return false;
    }
}

module.exports = { sendAssignmentNotification, sendPaymentNotification };
