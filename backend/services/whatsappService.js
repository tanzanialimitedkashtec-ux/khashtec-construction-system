require('dotenv').config();
const db = require('../../database/config/database');

// ============================================
// WHATSAPP NOTIFICATION SERVICE
// Uses CallMeBot API (free) or Meta WhatsApp Cloud API
// Railway blocks SMTP — WhatsApp works via HTTP!
// ============================================

// CallMeBot: Free, no setup needed beyond one-time phone activation
// Meta API: Official, requires Business account setup
const WHATSAPP_PROVIDER = process.env.WHATSAPP_PROVIDER || 'callmebot'; // 'callmebot' or 'meta'
const WHATSAPP_META_TOKEN = process.env.WHATSAPP_META_TOKEN || '';
const WHATSAPP_META_PHONE_ID = process.env.WHATSAPP_META_PHONE_ID || '';
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || '';
const APP_URL = process.env.APP_URL || 'https://khashtec-construction-system-production-e7b5.up.railway.app';

// Startup check
if (WHATSAPP_PROVIDER === 'meta' && WHATSAPP_META_TOKEN) {
    console.log('✅ WhatsApp service configured (Meta Cloud API)');
} else if (CALLMEBOT_API_KEY) {
    console.log('✅ WhatsApp service configured (CallMeBot)');
} else {
    console.log('ℹ️ WhatsApp notifications available — set CALLMEBOT_API_KEY or WHATSAPP_META_TOKEN to enable');
}

/**
 * Format phone number to international format for WhatsApp
 * Handles Tanzanian numbers: 0712345678 -> 255712345678
 */
function formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Remove leading + if present
    if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
    
    // Tanzanian numbers: add 255 country code
    if (cleaned.startsWith('0') && cleaned.length >= 9) {
        cleaned = '255' + cleaned.substring(1);
    }
    
    // Validate: must be digits only, 10-15 chars
    if (!/^\d{10,15}$/.test(cleaned)) return null;
    
    return cleaned;
}

/**
 * Look up an employee's phone number from the database
 * Checks: employee_details.phone -> users.phone
 */
async function getEmployeePhone(identifier) {
    if (!identifier) return null;
    
    try {
        // Try by email first (most common identifier)
        let [rows] = await db.execute(
            `SELECT ed.phone as detail_phone, u.phone as user_phone, ed.full_name
             FROM employee_details ed
             LEFT JOIN employees e ON ed.employee_id = e.id
             LEFT JOIN users u ON e.user_id = u.id
             WHERE ed.gmail = ? OR u.email = ?
             LIMIT 1`,
            [identifier, identifier]
        );
        
        if (rows && rows.length > 0) {
            const phone = rows[0].detail_phone || rows[0].user_phone;
            return { phone: formatPhoneNumber(phone), name: rows[0].full_name };
        }
        
        // Try by employee name
        [rows] = await db.execute(
            `SELECT ed.phone as detail_phone, u.phone as user_phone, ed.full_name
             FROM employee_details ed
             LEFT JOIN employees e ON ed.employee_id = e.id
             LEFT JOIN users u ON e.user_id = u.id
             WHERE ed.full_name LIKE ? OR u.name LIKE ?
             LIMIT 1`,
            [`%${identifier}%`, `%${identifier}%`]
        );
        
        if (rows && rows.length > 0) {
            const phone = rows[0].detail_phone || rows[0].user_phone;
            return { phone: formatPhoneNumber(phone), name: rows[0].full_name };
        }
    } catch (e) {
        console.error('📱 WhatsApp phone lookup error:', e.message);
    }
    
    return null;
}

/**
 * Send WhatsApp message via CallMeBot (free)
 * One-time setup: User sends "I allow callmebot to send me messages" to +34 644 71 98 46
 */
async function sendViaCallMeBot(phone, message) {
    const apiKey = CALLMEBOT_API_KEY;
    if (!apiKey) throw new Error('CALLMEBOT_API_KEY not configured');
    
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`CallMeBot error: ${response.status} ${response.statusText}`);
    }
    return { success: true, provider: 'callmebot' };
}

/**
 * Send WhatsApp message via Meta Cloud API
 */
async function sendViaMeta(phone, message) {
    if (!WHATSAPP_META_TOKEN || !WHATSAPP_META_PHONE_ID) {
        throw new Error('Meta WhatsApp API not configured');
    }
    
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_META_PHONE_ID}/messages`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${WHATSAPP_META_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: { body: message }
        })
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Meta API error: ${data.error?.message || JSON.stringify(data)}`);
    }
    return { success: true, provider: 'meta', messageId: data.messages?.[0]?.id };
}

/**
 * Send a WhatsApp message (auto-selects provider)
 */
async function sendWhatsApp(phone, message) {
    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone) {
        console.warn('📱 WhatsApp: Invalid phone number:', phone);
        return false;
    }
    
    try {
        let result;
        if (WHATSAPP_PROVIDER === 'meta' && WHATSAPP_META_TOKEN) {
            result = await sendViaMeta(formattedPhone, message);
        } else if (CALLMEBOT_API_KEY) {
            result = await sendViaCallMeBot(formattedPhone, message);
        } else {
            console.log(`📱 WhatsApp (dry run) to ${formattedPhone}: ${message.substring(0, 80)}...`);
            return true; // Dry run — no provider configured
        }
        console.log(`✅ WhatsApp sent to ${formattedPhone} via ${result.provider}`);
        return true;
    } catch (error) {
        console.error(`⚠️ WhatsApp send failed to ${formattedPhone}:`, error.message);
        return false;
    }
}

// ============================================
// NOTIFICATION MESSAGE BUILDERS
// Clean, emoji-formatted WhatsApp messages
// ============================================

function buildAssignmentMessage(details) {
    let name = '', lines = [];
    if (Array.isArray(details)) {
        details.forEach(d => {
            if (d.label === 'Employee Name' || d.label === 'Employee') name = d.value;
            lines.push(`▪️ ${d.label}: ${d.value || '-'}`);
        });
    }
    return `📋 *KASHTEC — NEW ASSIGNMENT*\n\nHello ${name || 'Team Member'},\n\nYou have been assigned to a new task/project:\n\n${lines.join('\n')}\n\n🔗 View details: ${APP_URL}\n\n_KASHTEC Tanzania Limited_`;
}

function buildPaymentMessage(details) {
    let name = '', amount = '', status = '';
    if (Array.isArray(details)) {
        details.forEach(d => {
            if (d.label === 'Employee Name' || d.label === 'Employee') name = d.value;
            if (d.label === 'Amount' || d.label === 'Net Pay') amount = d.value;
            if (d.label === 'Status') status = d.value;
        });
    }
    const emoji = status.toLowerCase() === 'failed' ? '❌' : '💰';
    return `${emoji} *KASHTEC — PAYMENT UPDATE*\n\nHello ${name || 'Team Member'},\n\nYour payment has been processed:\n${amount ? `💵 Amount: ${amount}\n` : ''}${status ? `📊 Status: ${status}\n` : ''}\n🔗 View details: ${APP_URL}\n\n_KASHTEC Tanzania Limited_`;
}

function buildRegistrationMessage(name) {
    return `🎉 *KASHTEC — WELCOME!*\n\nHello ${name},\n\nYour account has been successfully registered in the KASHTEC Construction Management System.\n\n🔗 Login: ${APP_URL}\n\n_KASHTEC Tanzania Limited_`;
}

function buildSuspensionMessage(name, reason) {
    return `⚠️ *KASHTEC — ACCOUNT SUSPENDED*\n\nHello ${name},\n\nYour account has been suspended.\n${reason ? `📝 Reason: ${reason}\n` : ''}\nPlease contact HR for more information.\n\n_KASHTEC Tanzania Limited_`;
}

function buildPromotionMessage(name, newPosition, department) {
    return `🎊 *KASHTEC — CONGRATULATIONS!*\n\nHello ${name},\n\nYou have been promoted!\n${newPosition ? `📌 New Position: ${newPosition}\n` : ''}${department ? `🏢 Department: ${department}\n` : ''}\n🔗 View details: ${APP_URL}\n\n_KASHTEC Tanzania Limited_`;
}

function buildClaimMessage(name, claimType, amount) {
    return `📄 *KASHTEC — CLAIM UPDATE*\n\nHello ${name},\n\nYour claim has been processed:\n${claimType ? `📋 Type: ${claimType}\n` : ''}${amount ? `💵 Amount: ${amount}\n` : ''}\n🔗 View details: ${APP_URL}\n\n_KASHTEC Tanzania Limited_`;
}

function buildGenericMessage(title, message) {
    return `🔔 *KASHTEC — ${(title || 'NOTIFICATION').toUpperCase()}*\n\n${message || ''}\n\n🔗 ${APP_URL}\n\n_KASHTEC Tanzania Limited_`;
}

// ============================================
// HIGH-LEVEL NOTIFICATION FUNCTIONS
// Auto-detect phone from email/name
// ============================================

/**
 * Send assignment WhatsApp notification
 * @param {string} emailOrName - Employee email or name to look up phone
 * @param {Array} details - Array of {label, value} pairs
 */
async function sendAssignmentWhatsApp(emailOrName, details) {
    const employee = await getEmployeePhone(emailOrName);
    if (!employee || !employee.phone) {
        console.log(`📱 WhatsApp: No phone found for ${emailOrName}`);
        return false;
    }
    return sendWhatsApp(employee.phone, buildAssignmentMessage(details));
}

/**
 * Send payment WhatsApp notification
 */
async function sendPaymentWhatsApp(emailOrName, details) {
    const employee = await getEmployeePhone(emailOrName);
    if (!employee || !employee.phone) {
        console.log(`📱 WhatsApp: No phone found for ${emailOrName}`);
        return false;
    }
    return sendWhatsApp(employee.phone, buildPaymentMessage(details));
}

/**
 * Send registration WhatsApp notification
 */
async function sendRegistrationWhatsApp(phoneOrEmail, name) {
    let phone = formatPhoneNumber(phoneOrEmail);
    if (!phone) {
        const employee = await getEmployeePhone(phoneOrEmail);
        if (employee && employee.phone) phone = employee.phone;
    }
    if (!phone) return false;
    return sendWhatsApp(phone, buildRegistrationMessage(name || 'Team Member'));
}

/**
 * Send suspension WhatsApp notification
 */
async function sendSuspensionWhatsApp(emailOrName, reason) {
    const employee = await getEmployeePhone(emailOrName);
    if (!employee || !employee.phone) return false;
    return sendWhatsApp(employee.phone, buildSuspensionMessage(employee.name || emailOrName, reason));
}

/**
 * Send promotion WhatsApp notification
 */
async function sendPromotionWhatsApp(emailOrName, newPosition, department) {
    const employee = await getEmployeePhone(emailOrName);
    if (!employee || !employee.phone) return false;
    return sendWhatsApp(employee.phone, buildPromotionMessage(employee.name || emailOrName, newPosition, department));
}

/**
 * Send claim WhatsApp notification
 */
async function sendClaimWhatsApp(emailOrName, claimType, amount) {
    const employee = await getEmployeePhone(emailOrName);
    if (!employee || !employee.phone) return false;
    return sendWhatsApp(employee.phone, buildClaimMessage(employee.name || emailOrName, claimType, amount));
}

/**
 * Send a generic WhatsApp notification to a phone number or email
 */
async function sendGenericWhatsApp(phoneOrEmail, title, message) {
    let phone = formatPhoneNumber(phoneOrEmail);
    if (!phone) {
        const employee = await getEmployeePhone(phoneOrEmail);
        if (employee && employee.phone) phone = employee.phone;
    }
    if (!phone) return false;
    return sendWhatsApp(phone, buildGenericMessage(title, message));
}

/**
 * Send WhatsApp to a direct phone number (no lookup)
 */
async function sendDirectWhatsApp(phone, message) {
    return sendWhatsApp(phone, message);
}

module.exports = {
    sendWhatsApp,
    sendDirectWhatsApp,
    sendAssignmentWhatsApp,
    sendPaymentWhatsApp,
    sendRegistrationWhatsApp,
    sendSuspensionWhatsApp,
    sendPromotionWhatsApp,
    sendClaimWhatsApp,
    sendGenericWhatsApp,
    formatPhoneNumber,
    getEmployeePhone,
    buildAssignmentMessage,
    buildPaymentMessage,
    buildRegistrationMessage,
    buildGenericMessage
};
