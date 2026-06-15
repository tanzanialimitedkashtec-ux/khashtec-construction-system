// M-Pesa Tanzania (Vodacom) - B2C Payment Integration
// Uses Vodacom M-Pesa Open API for Business-to-Customer transfers
// Docs: https://openapiportal.m-pesa.com/

var MPESA_API_KEY = process.env.MPESA_API_KEY || '';
var MPESA_PUBLIC_KEY = process.env.MPESA_PUBLIC_KEY || '';
var MPESA_SERVICE_PROVIDER = process.env.MPESA_SERVICE_PROVIDER || '';
var MPESA_ENV = process.env.MPESA_ENV || 'sandbox';

var BASE_URL = MPESA_ENV === 'production'
    ? 'https://openapi.m-pesa.com'
    : 'https://openapi.m-pesa.com/sandbox';

var SESSION_URL = BASE_URL + '/ipg/v2/vodacomTZN/getSession/';
var B2C_URL = BASE_URL + '/ipg/v2/vodacomTZN/b2cPayment/';

function isConfigured() {
    return !!(MPESA_API_KEY && MPESA_PUBLIC_KEY && MPESA_SERVICE_PROVIDER);
}

// Encrypt API key with public key (RSA) to get session token
async function getSessionToken() {
    var crypto = require('crypto');
    var publicKeyPem = '-----BEGIN PUBLIC KEY-----\n' + MPESA_PUBLIC_KEY + '\n-----END PUBLIC KEY-----';
    var encrypted = crypto.publicEncrypt(
        { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
        Buffer.from(MPESA_API_KEY)
    );
    var bearerToken = encrypted.toString('base64');

    var res = await fetch(SESSION_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + bearerToken,
            'Origin': '*'
        }
    });
    var data = await res.json();
    if (data.output_SessionID) {
        return data.output_SessionID;
    }
    throw new Error('M-Pesa session failed: ' + JSON.stringify(data));
}

// B2C: Send money to employee M-Pesa wallet
async function sendPayment(phoneNumber, amount, reference) {
    if (!isConfigured()) {
        return {
            success: true,
            simulated: true,
            transactionId: 'SIM-MPESA-' + Date.now(),
            message: 'M-Pesa payment simulated (API credentials not configured)',
            amount: amount,
            phoneNumber: phoneNumber
        };
    }

    try {
        var sessionToken = await getSessionToken();
        var crypto = require('crypto');
        var publicKeyPem = '-----BEGIN PUBLIC KEY-----\n' + MPESA_PUBLIC_KEY + '\n-----END PUBLIC KEY-----';
        var encrypted = crypto.publicEncrypt(
            { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
            Buffer.from(sessionToken)
        );
        var securityToken = encrypted.toString('base64');

        var txRef = reference || 'SAL-' + Date.now();
        var phone = String(phoneNumber).replace(/\s+/g, '').replace(/^\+/, '');
        if (phone.startsWith('0')) phone = '255' + phone.slice(1);
        if (!phone.startsWith('255')) phone = '255' + phone;

        var payload = {
            input_Amount: String(Math.round(amount)),
            input_Country: 'TZN',
            input_Currency: 'TZS',
            input_CustomerMSISDN: phone,
            input_ServiceProviderCode: MPESA_SERVICE_PROVIDER,
            input_ThirdPartyConversationID: txRef,
            input_TransactionReference: txRef,
            input_PaymentItemsDesc: 'Salary Payment'
        };

        var res = await fetch(B2C_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + securityToken,
                'Origin': '*'
            },
            body: JSON.stringify(payload)
        });
        var data = await res.json();

        if (data.output_ResponseCode === 'INS-0') {
            return {
                success: true,
                simulated: false,
                transactionId: data.output_TransactionID || txRef,
                conversationId: data.output_ConversationID,
                message: 'M-Pesa payment sent successfully',
                amount: amount,
                phoneNumber: phone
            };
        }
        return {
            success: false,
            simulated: false,
            error: data.output_ResponseDesc || 'M-Pesa payment failed',
            responseCode: data.output_ResponseCode,
            amount: amount,
            phoneNumber: phone
        };
    } catch (err) {
        return {
            success: false,
            simulated: false,
            error: 'M-Pesa API error: ' + err.message,
            amount: amount,
            phoneNumber: phoneNumber
        };
    }
}

module.exports = { sendPayment, isConfigured };
