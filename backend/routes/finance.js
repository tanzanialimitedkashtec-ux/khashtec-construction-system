const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../../database/config/database');
var notify = require('../utils/notify');
const upload = require('../middleware/upload');
const { sendInvoiceEmail, sendExpenseEmail } = require('../services/emailService');

console.log('🚀 Finance routes loaded with database connection');

async function resolveUserId(preferredRole) {
    try {
        if (preferredRole) {
            const roleRows = await db.execute('SELECT id FROM users WHERE role = ? LIMIT 1', [preferredRole]);
            if (Array.isArray(roleRows) && roleRows.length > 0) return roleRows[0].id;
        }
        const anyRows = await db.execute('SELECT id FROM users ORDER BY id ASC LIMIT 1');
        if (Array.isArray(anyRows) && anyRows.length > 0) return anyRows[0].id;
    } catch (_) {}
    return null;
}

function sqlSumRow(rows, keyCandidates = ['sum', 'total']) {
    if (!Array.isArray(rows) || rows.length === 0) return 0;
    for (const k of keyCandidates) {
        if (rows[0][k] != null) return parseFloat(rows[0][k]) || 0;
    }
    return 0;
}

// Test GET route
router.get('/test', (req, res) => {
    console.log('🧪 GET /api/finance/test accessed');
    res.json({ 
        message: 'Finance API test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// Diagnostic email test route (uses Resend HTTP API — SMTP is blocked on Railway)
router.get('/test-email', async (req, res) => {
    console.log('🧪 GET /api/finance/test-email accessed');
    try {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (!RESEND_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'RESEND_API_KEY not set. Get a free key at https://resend.com',
                hasKey: false
            });
        }

        const recipient = process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER || 'tanzanialimitedkashtec@gmail.com';
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM || 'KASHTEC <onboarding@resend.dev>',
                to: [recipient],
                subject: '🧪 KASHTEC Test Email — Resend API Working',
                html: '<h2>✅ Email service is working!</h2><p>This test email was sent via Resend HTTP API from your KASHTEC Construction System on Railway.</p>'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || JSON.stringify(data));
        }

        res.json({
            success: true,
            message: 'Email sent successfully via Resend API',
            id: data.id,
            recipient: recipient,
            method: 'Resend HTTP API (not SMTP)'
        });
    } catch (error) {
        console.error('Diagnostic email error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            hasKey: !!process.env.RESEND_API_KEY
        });
    }
});

// ===== BUDGET MANAGEMENT =====

// POST - Create department budget (records request in finance_work)
router.post('/budget', async (req, res) => {
    console.log('📝 POST /api/finance/budget accessed');
    console.log('📊 Request body:', req.body);
    const {
        department,
        period,
        startDate,
        endDate,
        salaries,
        supplies,
        equipment,
        training,
        travel,
        misc,
        totalBudget,
        justification,
        createdBy = 'Finance Manager'
    } = req.body;

    if (!department || !period || !startDate || !endDate || !totalBudget || !justification) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['department', 'period', 'startDate', 'endDate', 'totalBudget', 'justification']
        });
    }

    try {
        const workTitle = `${department} Budget - ${period}`;
        const workDesc = `Budget for ${department} department (${period})\n\nBudget Items:\n• Salaries & Wages: TZS ${Number(salaries || 0)}\n• Office Supplies: TZS ${Number(supplies || 0)}\n• Equipment & Tools: TZS ${Number(equipment || 0)}\n• Training & Development: TZS ${Number(training || 0)}\n• Travel & Transport: TZS ${Number(travel || 0)}\n• Miscellaneous: TZS ${Number(misc || 0)}\n\nTotal Budget: TZS ${Number(totalBudget)}\n\nJustification: ${justification}\n\nPeriod: ${startDate} to ${endDate}`;

        const result = await db.execute(
            `INSERT INTO finance_work 
             (department_code, work_type, work_title, work_description, amount, vendor_name, invoice_number, status, priority, submitted_by, submitted_date, assigned_to, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                department,
                'Budget Management',
                workTitle,
                workDesc,
                Number(totalBudget) || 0,
                null,
                null,
                'Pending',
                'High',
                createdBy,
                new Date().toISOString().slice(0, 10),
                'Finance Manager',
                endDate
            ]
        );

        notify('Budget Created', department + ' budget for ' + period + ': TZS ' + Number(totalBudget).toLocaleString(), 'info');
        res.status(201).json({
            message: 'Budget created successfully',
            work_id: result.insertId,
            department,
            total_budget: Number(totalBudget) || 0,
            period,
            status: 'Pending'
        });
    } catch (error) {
        console.error('Error creating budget:', error);
        res.status(500).json({ error: 'Failed to create budget' });
    }
});

// GET - Fetch all budgets
router.get('/budgets', async (req, res) => {
    console.log('📝 GET /api/finance/budgets accessed');
    try {
        const rows = await db.execute(`
            SELECT id,
                   department_code AS department,
                   work_title,
                   work_description,
                   amount,
                   status,
                   submitted_date AS start_date,
                   due_date AS end_date
            FROM finance_work 
            WHERE work_type IN ('Budget Management','Budget Creation','Budget')
            ORDER BY submitted_date DESC, id DESC
            LIMIT 200
        `);
        res.json(Array.isArray(rows) ? rows : []);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
});

// ===== EXPENSE MANAGEMENT =====

// Ensure receipt columns exist on financial_transactions
(async () => {
    try {
        await db.execute(`ALTER TABLE financial_transactions ADD COLUMN receipt_file VARCHAR(500) DEFAULT NULL`);
        console.log('✅ Added receipt_file column to financial_transactions');
    } catch (e) {
        if (!e.message || !e.message.includes('Duplicate column')) {
            console.log('ℹ️ receipt_file column check:', e.message);
        }
    }
    try {
        await db.execute(`ALTER TABLE financial_transactions ADD COLUMN receipt_data LONGTEXT DEFAULT NULL`);
        console.log('✅ Added receipt_data column to financial_transactions');
    } catch (e) {
        if (!e.message || !e.message.includes('Duplicate column')) {
            console.log('ℹ️ receipt_data column check:', e.message);
        }
    }
    try {
        await db.execute(`ALTER TABLE financial_transactions ADD COLUMN receipt_mimetype VARCHAR(100) DEFAULT NULL`);
        console.log('✅ Added receipt_mimetype column to financial_transactions');
    } catch (e) {
        if (!e.message || !e.message.includes('Duplicate column')) {
            console.log('ℹ️ receipt_mimetype column check:', e.message);
        }
    }
})();

// POST - Submit new expense (with optional receipt file upload)
router.post('/expense', upload.single('receipt'), async (req, res) => {
    console.log('📝 POST /api/finance/expense accessed');
    console.log('📊 Request body:', req.body);
    const {
        category,
        amount,
        description,
        department,
        submittedBy = 'Employee'
    } = req.body;

    if (!category || !amount || !description || !department) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['category', 'amount', 'description', 'department']
        });
    }

    // Get uploaded receipt file path and read content for database storage
    const receiptFile = req.file ? '/uploads/' + req.file.filename : null;
    let receiptData = null;
    let receiptMimetype = null;
    if (req.file) {
        try {
            const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
            receiptData = fs.readFileSync(filePath).toString('base64');
            receiptMimetype = req.file.mimetype || 'application/octet-stream';
        } catch (readErr) {
            console.log('⚠️ Could not read receipt file for DB storage:', readErr.message);
        }
    }

    try {
        const submitterId = await resolveUserId('Finance Manager');

        const workRes = await db.execute(
            `INSERT INTO finance_work 
             (department_code, work_type, work_title, work_description, amount, vendor_name, invoice_number, status, priority, submitted_by, submitted_date, assigned_to, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                department,
                'Expense Control',
                `Expense - ${category}`,
                `Expense request for ${category}. Description: ${description}. Amount: TZS ${Number(amount)}`,
                Number(amount) || 0,
                null,
                null,
                'Pending',
                'Medium',
                submittedBy,
                new Date().toISOString().slice(0, 10),
                'Finance Manager',
                new Date().toISOString().slice(0, 10)
            ]
        );

        const txRes = await db.execute(
            `INSERT INTO financial_transactions (type, category, description, amount, date, created_by, status, receipt_file, receipt_data, receipt_mimetype)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'Expense',
                category,
                description,
                Number(amount) || 0,
                new Date().toISOString().slice(0, 10),
                submitterId,
                'Pending',
                receiptFile,
                receiptData,
                receiptMimetype
            ]
        );

        // Send email notification for new expense
        sendExpenseEmail({
            id: txRes.insertId,
            category,
            amount: Number(amount) || 0,
            description,
            department,
            submittedBy,
            status: 'Pending'
        }, 'created').catch(err => console.error('Expense email error:', err.message));

        notify('Expense Submitted', category + ' expense: TZS ' + Number(amount).toLocaleString() + ' - ' + description, 'info');
        res.status(201).json({
            message: 'Expense submitted successfully',
            transaction_id: txRes.insertId,
            work_id: workRes.insertId,
            category,
            amount: Number(amount) || 0,
            status: 'Pending',
            receipt_file: receiptFile
        });
    } catch (error) {
        console.error('Error submitting expense:', error);
        res.status(500).json({ error: 'Failed to submit expense' });
    }
});

// PUT - Confirm expense
router.put('/expense/:id/confirm', async (req, res) => {
    console.log('✅ PUT /api/finance/expense/:id/confirm accessed with id:', req.params.id);
    try {
        const id = req.params.id;
        const result = await db.execute(
            `UPDATE financial_transactions SET status = 'Approved', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND type = 'Expense'`,
            [id]
        );
        const workRes = await db.execute(
            `UPDATE finance_work SET status = 'Completed', completion_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE work_type = 'Expense Control' AND amount = (SELECT amount FROM financial_transactions WHERE id = ?) AND status = 'Pending'`,
            [id]
        ).catch(() => ({ affectedRows: 0 }));
        if (!result.affectedRows && !workRes.affectedRows) {
            return res.status(404).json({ error: 'Expense not found or already confirmed' });
        }

        // Send confirmation email with expense details
        try {
            const rows = await db.execute(
                `SELECT id, category, amount, description, status FROM financial_transactions WHERE id = ?`, [id]
            );
            if (rows.length > 0) {
                sendExpenseEmail({
                    id: rows[0].id,
                    category: rows[0].category,
                    amount: rows[0].amount,
                    description: rows[0].description,
                    department: 'Finance',
                    submittedBy: 'Finance Manager',
                    status: 'Approved'
                }, 'confirmed').catch(err => console.error('Expense confirm email error:', err.message));
            }
        } catch (emailErr) {
            console.error('Could not fetch expense for email:', emailErr.message);
        }

        // Create notification for expense approval (Finance only)
        try {
            const expRow = await db.execute(`SELECT category, amount, description FROM financial_transactions WHERE id = ?`, [id]);
            const expInfo = expRow && expRow.length > 0 ? expRow[0] : {};
            await db.execute(`
                INSERT INTO notifications (title, message, type, priority, recipient_type, recipients, sent_by, status, category, is_read, created_at)
                VALUES (?, ?, 'success', 'Medium', 'role', 'finance', 'Finance Manager', 'sent', 'finance', 0, NOW())
            `, [
                'Expense Approved: ' + (expInfo.category || 'EXP-' + id),
                `Expense #${id} (${expInfo.category || 'N/A'}) for TZS ${expInfo.amount || 0} has been approved. Description: ${expInfo.description || 'N/A'}`
            ]);
        } catch (notifErr) { console.log('⚠️ Expense approval notification:', notifErr.message); }


        console.log('  ✅ Expense confirmed: id=' + id + ', tx_updated=' + result.affectedRows + ', work_updated=' + (workRes.affectedRows || 0));
        res.json({
            message: 'Expense confirmed successfully',
            transaction_updated: Boolean(result.affectedRows),
            work_updated: Boolean(workRes.affectedRows),
            id,
            status: 'Approved'
        });
    } catch (error) {
        console.error('❌ Error confirming expense:', error);
        res.status(500).json({ error: 'Failed to confirm expense' });
    }
});

// GET - Fetch expenses (with optional status filter)
router.get('/expenses', async (req, res) => {
    console.log('📝 GET /api/finance/expenses accessed');
    try {
        const { status } = req.query;
        let query = `SELECT id, date, category, description, amount, status, receipt_file, created_at
            FROM financial_transactions
            WHERE type = 'Expense'`;
        const params = [];
        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }
        query += ` ORDER BY created_at DESC LIMIT 500`;
        const rows = await db.execute(query, params);
        console.log('  📋 Expenses loaded:', rows.length, 'records' + (status ? ' (status=' + status + ')' : ''));
        res.json(rows);
    } catch (error) {
        console.error('❌ Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// GET - Serve receipt file from database (persists across deployments)
router.get('/receipt/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await db.execute(
            `SELECT receipt_data, receipt_mimetype, receipt_file FROM financial_transactions WHERE id = ? LIMIT 1`,
            [id]
        );
        const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
        
        if (!row || !row.receipt_data) {
            // Fallback: try to serve from disk if receipt_file path exists
            if (row && row.receipt_file) {
                const filePath = path.join(process.cwd(), row.receipt_file.replace(/^\//, ''));
                if (fs.existsSync(filePath)) {
                    return res.sendFile(filePath);
                }
            }
            return res.status(404).json({ error: 'Receipt not found', message: 'No receipt file stored for this expense' });
        }
        
        const buffer = Buffer.from(row.receipt_data, 'base64');
        const mimetype = row.receipt_mimetype || 'application/pdf';
        res.setHeader('Content-Type', mimetype);
        res.setHeader('Content-Disposition', 'inline; filename="receipt-' + id + '"');
        res.send(buffer);
    } catch (error) {
        console.error('❌ Error serving receipt:', error.message);
        res.status(500).json({ error: 'Failed to serve receipt file' });
    }
});

// GET - Expense overview stats (real data)
router.get('/expense-overview', async (req, res) => {
    console.log('📊 GET /api/finance/expense-overview accessed');
    try {
        const totalExpRows = await db.execute(`SELECT SUM(amount) as total FROM financial_transactions WHERE type = 'Expense'`);
        const approvedExpRows = await db.execute(`SELECT SUM(amount) as total FROM financial_transactions WHERE type = 'Expense' AND status = 'Approved'`);
        const pendingRows = await db.execute(`SELECT COUNT(*) as count FROM financial_transactions WHERE type = 'Expense' AND status = 'Pending'`);
        const pendingAmtRows = await db.execute(`SELECT SUM(amount) as total FROM financial_transactions WHERE type = 'Expense' AND status = 'Pending'`);
        const budgetRows = await db.execute(`SELECT SUM(total_proposed) as total FROM workforce_budgets WHERE status = 'Approved'`);
        const monthExpRows = await db.execute(`SELECT SUM(amount) as total FROM financial_transactions WHERE type = 'Expense' AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())`);

        const totalExpenses = Number(totalExpRows[0]?.total) || 0;
        const approvedExpenses = Number(approvedExpRows[0]?.total) || 0;
        const pendingCount = Number(pendingRows[0]?.count) || 0;
        const pendingAmount = Number(pendingAmtRows[0]?.total) || 0;
        const monthlyBudget = Number(budgetRows[0]?.total) || 0;
        const monthExpenses = Number(monthExpRows[0]?.total) || 0;
        const remaining = monthlyBudget > 0 ? monthlyBudget - monthExpenses : 0;
        const usedPercent = monthlyBudget > 0 ? Math.round((monthExpenses / monthlyBudget) * 100) : 0;

        console.log('  📊 Expense overview: total=' + totalExpenses + ', monthly=' + monthExpenses + ', budget=' + monthlyBudget + ', pending=' + pendingCount);
        res.json({
            success: true,
            monthlyBudget,
            monthExpenses,
            remaining,
            usedPercent,
            totalExpenses,
            approvedExpenses,
            pendingCount,
            pendingAmount
        });
    } catch (error) {
        console.error('❌ Error fetching expense overview:', error);
        res.status(500).json({ error: 'Failed to fetch expense overview' });
    }
});

// ===== INVOICE PROCESSING =====

// POST - Create new invoice
router.post('/invoice', async (req, res) => {
    console.log('📝 POST /api/finance/invoice accessed');
    const {
        vendor_name,
        invoice_number,
        amount,
        description,
        category,
        due_date,
        priority = 'Medium',
        submittedBy = 'Finance Manager'
    } = req.body;

    if (!vendor_name || !invoice_number || !amount || !description || !due_date) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['vendor_name', 'invoice_number', 'amount', 'description', 'due_date']
        });
    }

    try {
        const workTitle = `Invoice ${invoice_number} - ${category || 'General'}`;
        const result = await db.execute(
            `INSERT INTO finance_work 
             (department_code, work_type, work_title, work_description, amount, vendor_name, invoice_number, status, priority, submitted_by, submitted_date, assigned_to, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'FINANCE',
                'Invoice Processing',
                workTitle,
                description,
                Number(amount) || 0,
                vendor_name,
                invoice_number,
                'Pending',
                priority,
                submittedBy,
                new Date().toISOString().slice(0, 10),
                'Finance Manager',
                due_date
            ]
        );

        console.log('✅ Invoice created:', invoice_number);

        // Send email notification (fire-and-forget)
        sendInvoiceEmail({
            invoice_number,
            vendor_name,
            amount: Number(amount) || 0,
            description,
            category: category || 'General',
            priority,
            due_date,
            status: 'Pending',
            work_id: result.insertId
        }, 'created').catch(err => console.error('⚠️ Email send error:', err.message));

        notify('New Invoice', invoice_number + ' from ' + vendor_name + ': TZS ' + Number(amount).toLocaleString(), 'info');
        res.status(201).json({
            message: 'Invoice created successfully',
            work_id: result.insertId,
            invoice_number,
            vendor_name,
            amount: Number(amount) || 0,
            status: 'Pending'
        });
    } catch (error) {
        console.error('❌ Error creating invoice:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

// GET - Fetch all invoices
router.get('/invoices', async (req, res) => {
    console.log('📝 GET /api/finance/invoices accessed');
    try {
        const rows = await db.execute(`
            SELECT id, work_title, work_description, amount, vendor_name, invoice_number,
                   status, priority, submitted_by, submitted_date, due_date
            FROM finance_work 
            WHERE work_type = 'Invoice Processing'
            ORDER BY submitted_date DESC, id DESC
            LIMIT 200
        `).catch(() => []);
        res.json(Array.isArray(rows) ? rows : []);
    } catch (error) {
        console.error('❌ Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// PUT - Approve invoice (MD only)
router.put('/invoice/:id/approve', async (req, res) => {
    const { id } = req.params;
    console.log('📝 PUT /api/finance/invoice/' + id + '/approve accessed');
    try {
        // Fetch invoice details before updating for the email
        const invoiceRows = await db.execute(
            `SELECT invoice_number, vendor_name, amount, work_description, priority, due_date FROM finance_work WHERE id = ? AND work_type = 'Invoice Processing'`,
            [id]
        ).catch(() => []);
        const inv = Array.isArray(invoiceRows) && invoiceRows.length > 0 ? invoiceRows[0] : {};

        await db.execute(
            `UPDATE finance_work SET status = 'Completed', completion_date = NOW() WHERE id = ? AND work_type = 'Invoice Processing'`,
            [id]
        );
        console.log('✅ Invoice ' + id + ' approved');

        // Send approval email notification (fire-and-forget)
        sendInvoiceEmail({
            invoice_number: inv.invoice_number || 'N/A',
            vendor_name: inv.vendor_name || 'N/A',
            amount: Number(inv.amount) || 0,
            description: inv.work_description || '',
            priority: inv.priority || 'Medium',
            due_date: inv.due_date || 'N/A',
            status: 'Completed',
            work_id: id
        }, 'approved').catch(err => console.error('⚠️ Email send error:', err.message));

        res.json({ message: 'Invoice approved successfully', id, status: 'Completed' });
    } catch (error) {
        console.error('❌ Error approving invoice:', error);
        res.status(500).json({ error: 'Failed to approve invoice' });
    }
});

// PUT - Reject invoice (MD only)
router.put('/invoice/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body || {};
    console.log('📝 PUT /api/finance/invoice/' + id + '/reject accessed');
    try {
        // Fetch invoice details before updating for the email
        const invoiceRows = await db.execute(
            `SELECT invoice_number, vendor_name, amount, work_description, priority, due_date FROM finance_work WHERE id = ? AND work_type = 'Invoice Processing'`,
            [id]
        ).catch(() => []);
        const inv = Array.isArray(invoiceRows) && invoiceRows.length > 0 ? invoiceRows[0] : {};

        const description = reason ? ` | Rejection reason: ${reason}` : '';
        await db.execute(
            `UPDATE finance_work SET status = 'Rejected', work_description = CONCAT(COALESCE(work_description,''), ?) WHERE id = ? AND work_type = 'Invoice Processing'`,
            [description, id]
        );
        console.log('✅ Invoice ' + id + ' rejected');

        // Send rejection email notification (fire-and-forget)
        sendInvoiceEmail({
            invoice_number: inv.invoice_number || 'N/A',
            vendor_name: inv.vendor_name || 'N/A',
            amount: Number(inv.amount) || 0,
            description: inv.work_description || '',
            priority: inv.priority || 'Medium',
            due_date: inv.due_date || 'N/A',
            status: 'Rejected',
            work_id: id,
            rejection_reason: reason || ''
        }, 'rejected').catch(err => console.error('⚠️ Email send error:', err.message));

        res.json({ message: 'Invoice rejected', id, status: 'Rejected' });
    } catch (error) {
        console.error('❌ Error rejecting invoice:', error);
        res.status(500).json({ error: 'Failed to reject invoice' });
    }
});

// ===== PAYROLL PROCESSING =====
// Moved to /api/payroll routes. This endpoint intentionally omitted to avoid duplication.

// Salary structure management is handled in /api/payroll

// ===== FINANCIAL REPORTS =====

// GET - Generate financial summary
router.get('/summary', async (req, res) => {
    console.log('📝 GET /api/finance/summary accessed');
    try {
        const revenueRows = await db.execute(`SELECT SUM(amount) as total FROM financial_transactions WHERE type = 'Income' OR type = 'sale'`);
        const expenseRows = await db.execute(`SELECT SUM(amount) as total FROM financial_transactions WHERE type = 'Expense'`);
        const totalRevenue = sqlSumRow(revenueRows, ['total']);
        const totalExpenses = sqlSumRow(expenseRows, ['total']);
        const netProfit = totalRevenue - totalExpenses;
        const cashBalance = netProfit;

        const pendingExpensesRows = await db.execute(
            `SELECT COUNT(*) as total FROM financial_transactions WHERE type = 'Expense' AND status = 'Pending'`
        );
        const pendingExpenses = sqlSumRow(pendingExpensesRows, ['total']);

        res.json({
            total_revenue: totalRevenue,
            total_expenses: totalExpenses,
            net_profit: netProfit,
            cash_balance: cashBalance,
            pending_expenses: pendingExpenses,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating financial summary:', error);
        res.status(500).json({ error: 'Failed to generate financial summary' });
    }
});

// GET - Fetch all financial transactions (primary endpoint for financial table)
router.get('/transactions', async (req, res) => {
    console.log('📊 GET /api/finance/transactions accessed');
    try {
        const records = await db.execute(`
            SELECT id, type, category, amount, description, date, status, created_by, created_at
            FROM financial_transactions
            ORDER BY date DESC
            LIMIT 500
        `);

        const transformed = (Array.isArray(records) ? records : []).map(r => ({
            id: `FT-${r.id}`,
            type: String(r.type || '').toLowerCase(),
            category: r.category || 'Other',
            amount: Number(r.amount) || 0,
            description: r.description || '',
            date: r.date ? (typeof r.date === 'string' ? r.date : new Date(r.date).toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10),
            status: (r.status || 'pending').toLowerCase(),
            reference: '',
            account: 'General Account',
            department: 'General'
        }));

        res.json(transformed);
    } catch (error) {
        console.error('❌ Error fetching financial transactions:', error);
        res.status(500).json({ 
            error: 'Failed to fetch financial transactions',
            message: error.message 
        });
    }
});

// GET - Fetch all financial records for reporting dashboard
router.get('/records', async (req, res) => {
    console.log('📊 GET /api/finance/records accessed');
    try {
        const records = await db.execute(`
            SELECT id, type, category, amount, description, date, status, created_by, created_at
            FROM financial_transactions
            ORDER BY date DESC
            LIMIT 500
        `);

        const transformed = (Array.isArray(records) ? records : []).map(r => ({
            id: `FT-${r.id}`,
            type: String(r.type || '').toLowerCase(),
            category: r.category || 'Other',
            amount: Number(r.amount) || 0,
            description: r.description || '',
            date: r.date ? (typeof r.date === 'string' ? r.date : new Date(r.date).toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10),
            status: r.status || 'Pending',
            reference: '',
            account: 'General Account',
            department: 'General'
        }));

        res.json(transformed);
    } catch (error) {
        console.error('❌ Error fetching financial records:', error);
        res.status(500).json({ 
            error: 'Failed to fetch financial records',
            message: error.message 
        });
    }
});

// ===== FINANCIAL REPORTS =====
router.get('/report/income-statement', async (req, res) => {
    try {
        const { from, to } = req.query;
        const now = new Date();
        const start = from || new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
        const end = to || new Date().toISOString().slice(0, 10);

        const revenue = await db.execute(
            `SELECT COALESCE(category,'Other') as category, SUM(amount) as total 
             FROM financial_transactions 
             WHERE (type = 'Income' OR type = 'sale') AND date BETWEEN ? AND ?
             GROUP BY COALESCE(category,'Other')`,
            [start, end]
        ).catch(e => { console.error('Revenue query error:', e.message); return []; });
        const expenses = await db.execute(
            `SELECT COALESCE(category,'Other') as category, SUM(amount) as total 
             FROM financial_transactions 
             WHERE type = 'Expense' AND date BETWEEN ? AND ?
             GROUP BY COALESCE(category,'Other')`,
            [start, end]
        ).catch(e => { console.error('Expenses query error:', e.message); return []; });

        const revenueArr = Array.isArray(revenue) ? revenue : [];
        const expensesArr = Array.isArray(expenses) ? expenses : [];

        // Include salary expenses from payroll_records + employee_payments
        const payrollRows = await db.execute(
            `SELECT SUM(net_payment) as sum FROM payroll_records WHERE payment_date BETWEEN ? AND ?`,
            [start, end]
        ).catch(() => []);
        const empPayRows = await db.execute(
            `SELECT SUM(amount) as sum FROM employee_payments WHERE payment_date BETWEEN ? AND ?`,
            [start, end]
        ).catch(() => []);
        const salaryExpense = sqlSumRow(payrollRows, ['sum']) + sqlSumRow(empPayRows, ['sum']);

        if (salaryExpense > 0) {
            const hasSalaryCategory = expensesArr.some(e => (e.category || '').toLowerCase() === 'salaries');
            if (!hasSalaryCategory) {
                expensesArr.push({ category: 'Salaries', total: salaryExpense });
            }
        }

        const totalRevenue = revenueArr.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
        const totalExpenses = expensesArr.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
        const netProfit = totalRevenue - totalExpenses;

        res.json({
            period: { from: start, to: end },
            revenue: revenueArr,
            expenses: expensesArr,
            totals: { totalRevenue, totalExpenses, netProfit }
        });
    } catch (error) {
        console.error('❌ Error generating income statement:', error);
        res.status(500).json({ error: 'Failed to generate income statement' });
    }
});

router.get('/report/balance-sheet', async (req, res) => {
    try {
        const asOf = req.query.asOf || new Date().toISOString().slice(0, 10);
        const revRows = await db.execute(`SELECT SUM(amount) as sum FROM financial_transactions WHERE (type='Income' OR type='sale') AND date <= ?`, [asOf]).catch(() => []);
        const expRows = await db.execute(`SELECT SUM(amount) as sum FROM financial_transactions WHERE type='Expense' AND date <= ?`, [asOf]).catch(() => []);
        const cash = sqlSumRow(revRows, ['sum']) - sqlSumRow(expRows, ['sum']);

        const receivableRows = await db.execute(
            `SELECT SUM(amount) as sum FROM payment_requests WHERE status IN ('approved','processed') AND (paid_date IS NULL OR paid_date > ?)`,
            [asOf]
        ).catch(() => []);
        const accountsReceivable = sqlSumRow(receivableRows, ['sum']);

        const payableRows = await db.execute(
            `SELECT SUM(amount) as sum FROM payment_requests WHERE status IN ('approved','processed') AND expected_payment_date <= ? AND (paid_date IS NULL OR paid_date > ?)`,
            [asOf, asOf]
        ).catch(() => []);
        const accountsPayable = sqlSumRow(payableRows, ['sum']);

        const taxRows = await db.execute(
            `SELECT SUM(total_amount) as sum FROM tax_payments WHERE payment_status IN ('Pending','Overdue') AND (due_date IS NULL OR due_date >= ?)`,
            [asOf]
        ).catch(() => []);
        const taxLiabilities = sqlSumRow(taxRows, ['sum']);

        const assets = cash + accountsReceivable;
        const liabilities = accountsPayable + taxLiabilities;
        const equity = assets - liabilities;

        res.json({
            asOf,
            assets: {
                cash_bank: cash,
                accounts_receivable: accountsReceivable,
                total_assets: assets
            },
            liabilities: {
                accounts_payable: accountsPayable,
                tax_liabilities: taxLiabilities,
                total_liabilities: liabilities
            },
            equity: {
                total_equity: equity
            }
        });
    } catch (error) {
        console.error('❌ Error generating balance sheet:', error);
        res.status(500).json({ error: 'Failed to generate balance sheet' });
    }
});

router.get('/report/cash-flow', async (req, res) => {
    try {
        const { from, to } = req.query;
        const now = new Date();
        const start = from || new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
        const end = to || new Date().toISOString().slice(0, 10);

        const cashFromCustomersRows = await db.execute(
            `SELECT SUM(amount) as sum FROM financial_transactions WHERE (type='Income' OR type='sale') AND date BETWEEN ? AND ?`,
            [start, end]
        ).catch(() => []);
        const cashPaidToSuppliersRows = await db.execute(
            `SELECT SUM(amount) as sum FROM financial_transactions WHERE type='Expense' AND date BETWEEN ? AND ?`,
            [start, end]
        ).catch(() => []);
        const salariesRows = await db.execute(
            `SELECT SUM(net_payment) as sum FROM payroll_records WHERE payment_date BETWEEN ? AND ?`,
            [start, end]
        ).catch(() => []);
        const empPayCashRows = await db.execute(
            `SELECT SUM(amount) as sum FROM employee_payments WHERE payment_date BETWEEN ? AND ?`,
            [start, end]
        ).catch(() => []);

        const cashFromCustomers = sqlSumRow(cashFromCustomersRows, ['sum']);
        const cashPaidToSuppliers = sqlSumRow(cashPaidToSuppliersRows, ['sum']);
        const salariesPaid = sqlSumRow(salariesRows, ['sum']) + sqlSumRow(empPayCashRows, ['sum']);

        const netOperatingCash = cashFromCustomers - cashPaidToSuppliers - salariesPaid;

        res.json({
            period: { from: start, to: end },
            operating: {
                cash_from_customers: cashFromCustomers,
                cash_paid_to_suppliers: cashPaidToSuppliers,
                salaries_paid: salariesPaid,
                net_operating_cash: netOperatingCash
            }
        });
    } catch (error) {
        console.error('❌ Error generating cash flow:', error);
        res.status(500).json({ error: 'Failed to generate cash flow' });
    }
});

router.get('/report/budget-vs-actual', async (req, res) => {
    try {
        const { period } = req.query;
        let budgets = [];
        if (period) {
            budgets = await db.execute(
                `SELECT department AS budget_period, total_proposed FROM workforce_budgets WHERE department = ?`,
                [period]
            ).catch(() => []);
        } else {
            budgets = await db.execute(
                `SELECT department AS budget_period, total_proposed FROM workforce_budgets ORDER BY submission_date DESC LIMIT 2`
            ).catch(() => []);
        }
        budgets = Array.isArray(budgets) ? budgets : [];

        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
        const end = new Date().toISOString().slice(0, 10);
        const actualRows = await db.execute(
            `SELECT SUM(amount) as sum FROM financial_transactions WHERE type='Expense' AND date BETWEEN ? AND ?`,
            [start, end]
        ).catch(() => []);
        const actual = sqlSumRow(actualRows, ['sum']);

        res.json({
            period: period || `${now.getFullYear()}`,
            budgets,
            actual
        });
    } catch (error) {
        console.error('❌ Error generating budget vs actual:', error);
        res.status(500).json({ error: 'Failed to generate budget vs actual' });
    }
});

module.exports = router;
