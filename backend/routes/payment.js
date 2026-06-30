const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// ===== PAYMENT MANAGEMENT =====

// Generate unique tracking number
function generateTrackingNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PAY-${timestamp}-${random}`;
}

async function resolveUserId({ userId, email, name }) {
    const parsedId = Number.isFinite(Number(userId)) ? parseInt(userId, 10) : null;

    if (parsedId) {
        const existing = await db.execute('SELECT id FROM users WHERE id = ? LIMIT 1', [parsedId]);
        if (Array.isArray(existing) && existing.length > 0) {
            return parsedId;
        }
    }

    if (email) {
        const rows = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
        if (Array.isArray(rows) && rows.length > 0) {
            return rows[0].id;
        }
    }

    if (name) {
        const rows = await db.execute('SELECT id FROM users WHERE name = ? LIMIT 1', [name]);
        if (Array.isArray(rows) && rows.length > 0) {
            return rows[0].id;
        }
    }

    const managingDirector = await db.execute("SELECT id FROM users WHERE role = 'Managing Director' ORDER BY id ASC LIMIT 1");
    if (Array.isArray(managingDirector) && managingDirector.length > 0) {
        return managingDirector[0].id;
    }

    const anyUser = await db.execute('SELECT id FROM users ORDER BY id ASC LIMIT 1');
    if (Array.isArray(anyUser) && anyUser.length > 0) {
        return anyUser[0].id;
    }

    return null;
}

function mapUrgencyToPriority(urgency) {
    if (urgency === 'low') return 'Low';
    if (urgency === 'high') return 'High';
    if (urgency === 'urgent') return 'Urgent';
    return 'Medium';
}

async function createNotification({ title, message, type, recipientId, senderId, relatedType, relatedId, priority, category }) {
    await db.execute(
        `
            INSERT INTO notifications (
                title, message, type, recipient_id, sender_id, related_type, related_id, priority, category, recipients, recipient_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            title,
            message,
            type,
            recipientId || null,
            senderId || null,
            relatedType || null,
            relatedId || null,
            priority || 'Medium',
            category || 'finance',
            category || 'finance',
            'role'
        ]
    );
}

// POST - Create new payment request
router.post('/', async (req, res) => {
    console.log('💳 POST /api/payment accessed');
    console.log('📊 Request body:', req.body);
    
    const {
        employeeId,
        employeeName,
        employeeEmail,
        employeePhone,
        amount,
        currency = 'TZS',
        description,
        notes,
        paymentType = 'salary',
        urgency = 'normal',
        paymentMethod = 'bank_transfer',
        expectedPaymentDate,
        department,
        projectCode,
        workOrderNumber,
        approvedBy,
        submittedBy,
        submittedByEmail,
        submittedByName
    } = req.body;
    
    // Validate required fields
    if (!employeeId || !employeeName || !amount || !description) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['employeeId', 'employeeName', 'amount', 'description']
        });
    }
    
    // Validate amount
    if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({
            error: 'Invalid amount',
            message: 'Amount must be a positive number'
        });
    }
    
    // Validate currency
    if (!['TZS', 'USD'].includes(currency)) {
        return res.status(400).json({
            error: 'Invalid currency',
            message: 'Currency must be TZS or USD'
        });
    }
    
    try {
        const submittedByUserId = await resolveUserId({
            userId: submittedBy,
            email: submittedByEmail,
            name: submittedByName
        });

        if (!submittedByUserId) {
            return res.status(400).json({
                error: 'Missing or invalid submitter information',
                required: ['submittedBy (user id) or submittedByEmail or submittedByName']
            });
        }

        const approvedByUserId = approvedBy
            ? await resolveUserId({ userId: approvedBy })
            : null;

        const trackingNumber = generateTrackingNumber();
        const submittedDate = new Date().toISOString().split('T')[0];
        
        // Auto-calculate equivalent amount if currency conversion is needed
        let equivalentAmount = parseFloat(amount);
        let exchangeRate = 1.0;
        
        if (currency === 'USD') {
            // Default exchange rate (can be made dynamic)
            exchangeRate = 2500; // 1 USD = 2500 TZS
            equivalentAmount = parseFloat(amount) * exchangeRate;
        }
        
        // Insert payment request
        const result = await db.execute(`
            INSERT INTO payment_requests (
                tracking_number, employee_id, employee_name, employee_email, employee_phone,
                amount, currency, equivalent_amount_tzs, exchange_rate, description, notes,
                payment_type, urgency, payment_method, expected_payment_date, department,
                project_code, work_order_number, status, approved_by, submitted_by, submitted_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            trackingNumber, employeeId, employeeName, employeeEmail, employeePhone,
            amount, currency, equivalentAmount, exchangeRate, description, notes,
            paymentType, urgency, paymentMethod, expectedPaymentDate || null, department,
            projectCode || null, workOrderNumber || null, 'pending_finance_approval', approvedByUserId || null, submittedByUserId, submittedDate
        ]);
        
        console.log('✅ Payment request created successfully:', { trackingNumber, id: result.insertId });
        
        // Create notification for finance department
        try {
            const financeUser = await db.execute("SELECT id FROM users WHERE role = 'Finance Manager' ORDER BY id ASC LIMIT 1");
            const financeRecipientId = Array.isArray(financeUser) && financeUser.length > 0 ? financeUser[0].id : null;

            await createNotification({
                title: 'New Payment Request',
                message: `Payment request ${trackingNumber} for ${employeeName} (${currency} ${amount}) requires approval`,
                type: 'Info',
                recipientId: financeRecipientId,
                senderId: submittedByUserId,
                relatedType: 'payment_request',
                relatedId: result.insertId,
                priority: mapUrgencyToPriority(urgency)
            });
        } catch (notificationError) {
            console.error('❌ Failed to create finance notification for payment request:', notificationError.message);
        }
        
        res.json({
            success: true,
            message: 'Payment request created successfully',
            data: {
                id: result.insertId,
                trackingNumber,
                amount,
                currency,
                equivalentAmount,
                status: 'pending_finance_approval',
                submittedDate
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating payment request:', error);
        res.status(500).json({
            error: 'Failed to create payment request',
            details: error.message
        });
    }
});

// PUT - Update payment status (Finance approval/rejection)
router.put('/:id/status', async (req, res) => {
    console.log(`💳 PUT /api/payment/${req.params.id}/status accessed`);
    console.log(`💳 Request body:`, JSON.stringify(req.body));
    
    const { id } = req.params;
    const { status, approvedBy, notes, paymentReference, actualAmount, actualCurrency } = req.body;
    
    // Validate status
    const validStatuses = ['pending_finance_approval', 'approved', 'rejected', 'processed', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            error: 'Invalid status',
            validStatuses
        });
    }
    
    try {
        // Resolve the approver user ID - be flexible
        let approvedByUserId = null;
        try {
            approvedByUserId = await resolveUserId({ userId: approvedBy });
        } catch (resolveErr) {
            console.warn('⚠️ Could not resolve approvedBy user, continuing without:', resolveErr.message);
        }

        // If we could not resolve the user, use a sensible default
        if (!approvedByUserId) {
            // Try to find any managing director or admin user
            try {
                const fallbackUser = await db.execute(
                    "SELECT id FROM users ORDER BY id ASC LIMIT 1"
                );
                if (Array.isArray(fallbackUser) && fallbackUser.length > 0) {
                    approvedByUserId = fallbackUser[0].id;
                    console.log(`⚠️ Using fallback approver user id: ${approvedByUserId}`);
                }
            } catch (fallbackErr) {
                console.warn('⚠️ Could not find any fallback user:', fallbackErr.message);
            }
        }

        // Get current payment request
        let currentPayment;
        try {
            currentPayment = await db.execute(
                'SELECT * FROM payment_requests WHERE id = ?',
                [id]
            );
        } catch (selectErr) {
            console.error('❌ Error selecting payment request:', selectErr.message);
            return res.status(500).json({
                error: 'Failed to find payment request',
                details: selectErr.message
            });
        }
        
        if (!currentPayment || currentPayment.length === 0) {
            return res.status(404).json({
                error: 'Payment request not found'
            });
        }
        
        // Ensure optional columns exist (they might be missing on older DB schemas)
        try {
            const columnsToEnsure = [
                { name: 'finance_notes', def: 'TEXT' },
                { name: 'payment_reference', def: 'VARCHAR(100)' },
                { name: 'actual_amount', def: 'DECIMAL(15,2)' },
                { name: 'actual_currency', def: "VARCHAR(10)" },
                { name: 'approved_date', def: 'DATE' },
                { name: 'approved_by', def: 'INT' }
            ];
            for (const col of columnsToEnsure) {
                try {
                    await db.execute(`ALTER TABLE payment_requests ADD COLUMN ${col.name} ${col.def}`);
                    console.log(`  Added missing column: ${col.name}`);
                } catch (alterErr) {
                    // Column already exists or other non-critical error - ignore
                }
            }
        } catch (ensureErr) {
            console.warn('⚠️ Could not ensure columns:', ensureErr.message);
        }

        // Update payment status - use a simple query first
        try {
            if (approvedByUserId) {
                await db.execute(`
                    UPDATE payment_requests SET 
                        status = ?, 
                        approved_by = ?, 
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [status, approvedByUserId, id]);
            } else {
                await db.execute(`
                    UPDATE payment_requests SET 
                        status = ?, 
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [status, id]);
            }
        } catch (updateErr) {
            console.error('❌ Error updating payment status:', updateErr.message);
            return res.status(500).json({
                error: 'Failed to update payment status in database',
                details: updateErr.message
            });
        }

        // Try to update optional fields separately (non-critical)
        try {
            if (notes) {
                await db.execute('UPDATE payment_requests SET finance_notes = ? WHERE id = ?', [notes, id]);
            }
            if (paymentReference) {
                await db.execute('UPDATE payment_requests SET payment_reference = ? WHERE id = ?', [paymentReference, id]);
            }
        } catch (optionalErr) {
            console.warn('⚠️ Could not update optional payment fields:', optionalErr.message);
        }
        
        // Try to log to payment history (non-critical)
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS payment_requests_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    payment_id INT NOT NULL,
                    status VARCHAR(50) NOT NULL,
                    changed_by INT,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_payment_id (payment_id)
                )
            `);

            await db.execute(`
                INSERT INTO payment_requests_history (
                    payment_id, status, changed_by, notes
                ) VALUES (?, ?, ?, ?)
            `, [
                id, status, approvedByUserId || 0, notes || null
            ]);
        } catch (historyErr) {
            console.warn('⚠️ Could not log payment history:', historyErr.message);
        }
        
        // Create notification (non-critical)
        try {
            let notificationTitle = '';
            let notificationMessage = '';
            
            if (status === 'approved') {
                notificationTitle = 'Payment Request Approved';
                notificationMessage = `Payment request ${currentPayment[0].tracking_number} has been approved`;
            } else if (status === 'rejected') {
                notificationTitle = 'Payment Request Rejected';
                notificationMessage = `Payment request ${currentPayment[0].tracking_number} has been rejected`;
            } else if (status === 'processed') {
                notificationTitle = 'Payment Processed';
                notificationMessage = `Payment request ${currentPayment[0].tracking_number} has been processed`;
            }
            
            if (notificationTitle) {
                const notificationType = status === 'approved'
                    ? 'Success'
                    : status === 'rejected'
                        ? 'Error'
                        : 'Info';

                await createNotification({
                    title: notificationTitle,
                    message: notificationMessage,
                    type: notificationType,
                    recipientId: currentPayment[0].submitted_by,
                    senderId: approvedByUserId,
                    relatedType: 'payment_request',
                    relatedId: id,
                    priority: 'Medium'
                });
            }
        } catch (notificationError) {
            console.warn('⚠️ Failed to create payment update notification:', notificationError.message);
        }
        
        console.log(`✅ Payment ${id} status updated to:`, status);
        
        res.json({
            success: true,
            message: `Payment status updated to ${status}`,
            data: {
                id,
                status,
                trackingNumber: currentPayment[0].tracking_number
            }
        });
        
    } catch (error) {
        console.error('❌ Error updating payment status:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to update payment status',
            details: error.message
        });
    }
});

// GET - Retrieve all payment requests
router.get('/', async (req, res) => {
    console.log('💳 GET /api/payment accessed');
    
    try {
        const { status, employeeId, department, currency, page = 1, limit = 50 } = req.query;
        
        let query = `
            SELECT pr.*, 
                   u.name as submitted_by_name,
                   u.email as submitted_by_email
            FROM payment_requests pr
            LEFT JOIN users u ON pr.submitted_by = u.id
            WHERE 1=1
        `;
        const params = [];
        
        // Add filters
        if (status) {
            query += ' AND pr.status = ?';
            params.push(status);
        }
        if (employeeId) {
            query += ' AND pr.employee_id = ?';
            params.push(employeeId);
        }
        if (department) {
            query += ' AND pr.department = ?';
            params.push(department);
        }
        if (currency) {
            query += ' AND pr.currency = ?';
            params.push(currency);
        }
        
        query += ' ORDER BY pr.created_at DESC';
        
        // Add pagination
        const limitNum = parseInt(limit) || 50;
        const pageNum = parseInt(page) || 1;
        const offsetNum = (pageNum - 1) * limitNum;
        
        query += ' LIMIT ' + limitNum + ' OFFSET ' + offsetNum;
        
        const payments = await db.execute(query, params);
        
        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM payment_requests WHERE 1=1';
        const countParams = [];
        
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }
        if (employeeId) {
            countQuery += ' AND employee_id = ?';
            countParams.push(employeeId);
        }
        if (department) {
            countQuery += ' AND department = ?';
            countParams.push(department);
        }
        if (currency) {
            countQuery += ' AND currency = ?';
            countParams.push(currency);
        }
        
        const countResult = await db.execute(countQuery, countParams);
        const total = countResult[0]?.total || 0;
        
        console.log('✅ Retrieved payment requests:', payments.length);
        
        res.json({
            success: true,
            data: payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('❌ Error retrieving payment requests:', error);
        res.status(500).json({
            error: 'Failed to retrieve payment requests',
            details: error.message
        });
    }
});

// GET - Get employees for payment selection
router.get('/employees', async (req, res) => {
    console.log('💳 GET /api/payment/employees accessed');
    
    try {
        const { department, active = true } = req.query;
        
        let query = `
            SELECT e.id, e.employee_id, e.position, e.department, e.salary,
                   e.status, e.hire_date, e.department as department_name,
                   ed.full_name as name, ed.gmail as email, ed.phone
            FROM employees e
            LEFT JOIN employee_details ed ON e.id = ed.employee_id
            WHERE 1=1
        `;
        const params = [];
        
        if (active === 'true') {
            query += ' AND e.status = ?';
            params.push('active');
        }
        
        if (department) {
            query += ' AND e.department = ?';
            params.push(department);
        }
        
        query += ' ORDER BY ed.full_name LIMIT 100';
        
        const employees = await db.execute(query, params);
        
        console.log('✅ Retrieved employees for payment:', employees.length);
        
        res.json({
            success: true,
            data: employees
        });
        
    } catch (error) {
        console.error('❌ Error retrieving employees:', error);
        res.status(500).json({
            error: 'Failed to retrieve employees',
            details: error.message
        });
    }
});

// GET - Retrieve specific payment request
router.get('/:id', async (req, res, next) => {
    console.log(`💳 GET /api/payment/${req.params.id} accessed`);

    const reservedPaths = new Set(['stats']);
    if (reservedPaths.has(req.params.id)) {
        return next();
    }
    
    try {
        const { id } = req.params;
        
        const payment = await db.execute(`
            SELECT pr.*, 
                   u.name as submitted_by_name,
                   u.email as submitted_by_email,
                   u2.name as approved_by_name,
                   u2.email as approved_by_email
            FROM payment_requests pr
            LEFT JOIN users u ON pr.submitted_by = u.id
            LEFT JOIN users u2 ON pr.approved_by = u2.id
            WHERE pr.id = ?
        `, [id]);
        
        if (payment.length === 0) {
            return res.status(404).json({
                error: 'Payment request not found'
            });
        }
        
        // Get payment history
        const history = await db.execute(`
            SELECT * FROM payment_requests_history 
            WHERE payment_id = ? 
            ORDER BY created_at DESC
        `, [id]);
        
        console.log('✅ Retrieved payment request:', payment[0].tracking_number);
        
        res.json({
            success: true,
            data: payment[0],
            history
        });
        
    } catch (error) {
        console.error('❌ Error retrieving payment request:', error);
        res.status(500).json({
            error: 'Failed to retrieve payment request',
            details: error.message
        });
    }
});

// GET - Get payment statistics
router.get('/stats', async (req, res) => {
    console.log('💳 GET /api/payment/stats accessed');
    
    try {
        // Get payment statistics
        const stats = await db.execute(`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'pending_finance_approval' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
                COUNT(CASE WHEN status = 'processed' THEN 1 END) as processed,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
                SUM(CASE WHEN currency = 'TZS' THEN amount ELSE 0 END) as total_tzs,
                SUM(CASE WHEN currency = 'USD' THEN amount ELSE 0 END) as total_usd,
                SUM(equivalent_amount_tzs) as total_equivalent_tzs
            FROM payment_requests
            WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
        `);
        
        // Get monthly trend
        const monthlyTrend = await db.execute(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as requests,
                SUM(equivalent_amount_tzs) as total_amount
            FROM payment_requests
            WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        `);
        
        // Get department breakdown
        const departmentBreakdown = await db.execute(`
            SELECT 
                department,
                COUNT(*) as requests,
                SUM(equivalent_amount_tzs) as total_amount
            FROM payment_requests
            WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
            GROUP BY department
            ORDER BY total_amount DESC
        `);
        
        console.log('✅ Retrieved payment statistics');
        
        res.json({
            success: true,
            data: {
                stats: stats[0] || {},
                monthlyTrend,
                departmentBreakdown
            }
        });
        
    } catch (error) {
        console.error('❌ Error retrieving payment statistics:', error);
        res.status(500).json({
            error: 'Failed to retrieve payment statistics',
            details: error.message
        });
    }
});

module.exports = router;
