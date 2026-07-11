require('dotenv').config();
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const { sendAssignmentWhatsApp, sendPaymentWhatsApp } = require('./whatsappService');

// ============================================
// EMPLOYEE NOTIFICATION SERVICE
// Uses Resend HTTP API for email (Railway blocks SMTP)
// + WhatsApp for instant mobile notifications
// ============================================

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'KASHTEC <onboarding@resend.dev>';
const APP_URL = process.env.APP_URL || 'https://khashtec-construction-system-production-e7b5.up.railway.app';

let smtpTransporter = null;

function getSmtpTransporter() {
    if (smtpTransporter) return smtpTransporter;

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
        return null;
    }

    smtpTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });

    return smtpTransporter;
}

if (RESEND_API_KEY) {
    console.log('✅ Employee email service configured (Resend HTTP API + WhatsApp)');
    console.log(`📧 Employee EMAIL_FROM is set to: "${EMAIL_FROM}"`);
} else {
    console.warn('⚠️ RESEND_API_KEY not set — Employee emails will use SMTP fallback if configured, otherwise WhatsApp only');
}

/**
 * Send email via Resend HTTP API (no SMTP needed)
 */
async function sendViaResend(to, subject, html) {
    if (!RESEND_API_KEY) {
        console.warn('⚠️ No Resend API key configured; skipping email send.');
        return null;
    }

    const recipients = Array.isArray(to) ? to : [to];
    console.log(`📧 Sending email via Resend to: ${recipients.join(', ')}`);

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: EMAIL_FROM,
            to: recipients,
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

async function sendViaSmtp(to, subject, html) {
    const transporter = getSmtpTransporter();
    if (!transporter) return null;

    const info = await transporter.sendMail({
        from: EMAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html
    });

    return info;
}

async function sendEmail(to, subject, html) {
    const resendResult = await sendViaResend(to, subject, html);
    if (resendResult) return resendResult;

    return sendViaSmtp(to, subject, html);
}

/**
 * Build the HTML email template for assignments
 */
function buildAssignmentEmailHTML(details) {
    const logoUrl = `${APP_URL}/images/khashtec%20logo.png`;

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
            <a href="${APP_URL}" style="background-color:#1a5276;color:#ffffff;padding:12px 25px;text-decoration:none;border-radius:4px;font-size:14px;font-weight:bold;display:inline-block;box-shadow:0 2px 4px rgba(26,82,118,0.3);">View Details in System</a>
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
 * Send an assignment notification (email + WhatsApp)
 */
async function sendAssignmentNotification(toEmail, details) {
    if (!toEmail) return false;

    let emailSent = false;
    let whatsAppSent = false;

    // Send email via Resend
    try {
        const subject = `New Assignment Notification | KASHTEC`;
        const html = buildAssignmentEmailHTML(details);
        const result = await sendEmail(toEmail, subject, html);
        if (result) {
            console.log(`✅ Assignment email sent via Resend to ${toEmail}`);
            emailSent = true;
        }
    } catch (error) {
        console.error(`⚠️ Assignment email failed:`, error.message);
    }

    // Send WhatsApp
    try {
        whatsAppSent = await sendAssignmentWhatsApp(toEmail, details);
    } catch (error) {
        console.error(`⚠️ Assignment WhatsApp failed:`, error.message);
    }

    return emailSent || whatsAppSent;
}

/**
 * Build the HTML email template for payment notifications
 */
function buildPaymentEmailHTML(details) {
    const logoUrl = `${APP_URL}/images/khashtec%20logo.png`;

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
            <a href="${APP_URL}" style="background-color:#1a5276;color:#ffffff;padding:12px 25px;text-decoration:none;border-radius:4px;font-size:14px;font-weight:bold;display:inline-block;box-shadow:0 2px 4px rgba(26,82,118,0.3);">Log in to System</a>
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
 * Send a payment notification (email + WhatsApp)
 */
async function sendPaymentNotification(toEmail, details) {
    if (!toEmail) return false;

    let emailSent = false;
    let whatsAppSent = false;

    // Send email via Resend
    try {
        const subject = `Payment Notification | KASHTEC`;
        const html = buildPaymentEmailHTML(details);
        const result = await sendEmail(toEmail, subject, html);
        if (result) {
            console.log(`✅ Payment email sent via Resend to ${toEmail}`);
            emailSent = true;
        }
    } catch (error) {
        console.error(`⚠️ Payment email failed:`, error.message);
    }

    // Send WhatsApp
    try {
        whatsAppSent = await sendPaymentWhatsApp(toEmail, details);
    } catch (error) {
        console.error(`⚠️ Payment WhatsApp failed:`, error.message);
    }

    return emailSent || whatsAppSent;
}

module.exports = { sendAssignmentNotification, sendPaymentNotification };
