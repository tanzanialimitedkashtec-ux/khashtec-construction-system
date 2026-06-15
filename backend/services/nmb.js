// NMB Bank Tanzania - B2C Payment Integration
// Uses NMB Open Banking API for salary disbursements
// Contact NMB Corporate Banking for API access

var NMB_API_KEY = process.env.NMB_API_KEY || '';
var NMB_API_SECRET = process.env.NMB_API_SECRET || '';
var NMB_ACCOUNT_NUMBER = process.env.NMB_ACCOUNT_NUMBER || '';
var NMB_ENV = process.env.NMB_ENV || 'sandbox';

var BASE_URL = NMB_ENV === 'production'
    ? 'https://openbanking.nmbtz.com/api/v1'
    : 'https://sandbox.openbanking.nmbtz.com/api/v1';

function isConfigured() {
    return !!(NMB_API_KEY && NMB_API_SECRET && NMB_ACCOUNT_NUMBER);
}

async function getAccessToken() {
    var res = await fetch(BASE_URL + '/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            apiKey: NMB_API_KEY,
            apiSecret: NMB_API_SECRET
        })
    });
    var data = await res.json();
    if (data.access_token) return data.access_token;
    throw new Error('NMB auth failed: ' + JSON.stringify(data));
}

// Transfer from company NMB account to employee bank account
async function sendPayment(accountNumber, bankName, amount, employeeName, reference) {
    if (!isConfigured()) {
        return {
            success: true,
            simulated: true,
            transactionId: 'SIM-NMB-' + Date.now(),
            message: 'NMB bank transfer simulated (API credentials not configured)',
            amount: amount,
            accountNumber: accountNumber,
            bankName: bankName
        };
    }

    try {
        var token = await getAccessToken();
        var txRef = reference || 'SAL-NMB-' + Date.now();

        var payload = {
            sourceAccount: NMB_ACCOUNT_NUMBER,
            destinationAccount: String(accountNumber),
            destinationBank: bankName || 'NMB',
            amount: Math.round(amount),
            currency: 'TZS',
            reference: txRef,
            narration: 'Salary Payment - ' + (employeeName || 'Employee'),
            beneficiaryName: employeeName || ''
        };

        var res = await fetch(BASE_URL + '/transfers/internal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });
        var data = await res.json();

        if (data.status === 'SUCCESS' || data.statusCode === '00') {
            return {
                success: true,
                simulated: false,
                transactionId: data.transactionId || txRef,
                message: 'NMB transfer completed successfully',
                amount: amount,
                accountNumber: accountNumber,
                bankName: bankName
            };
        }
        return {
            success: false,
            simulated: false,
            error: data.message || data.statusDescription || 'NMB transfer failed',
            amount: amount,
            accountNumber: accountNumber
        };
    } catch (err) {
        return {
            success: false,
            simulated: false,
            error: 'NMB API error: ' + err.message,
            amount: amount,
            accountNumber: accountNumber
        };
    }
}

module.exports = { sendPayment, isConfigured };
