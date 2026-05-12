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
        submittedBy
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            trackingNumber, employeeId, employeeName, employeeEmail, employeePhone,
            amount, currency, equivalentAmount, exchangeRate, description, notes,
            paymentType, urgency, paymentMethod, expectedPaymentDate || null, department,
            projectCode || null, workOrderNumber || null, 'pending_finance_approval', approvedBy || null, submittedBy, submittedDate
        ]);
        
        console.log('✅ Payment request created successfully:', { trackingNumber, id: result.insertId });
        
        // Create notification for finance department
        await db.execute(`
            INSERT INTO notifications (
                title, message, type, recipient_role, reference_id, reference_type, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            'New Payment Request',
            `Payment request ${trackingNumber} for ${employeeName} (${currency} ${amount}) requires your approval`,
            'payment_approval',
            'finance',
            result.insertId,
            'payment_request',
            new Date().toISOString()
        ]);
        
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

// GET - Retrieve specific payment request
router.get('/:id', async (req, res) => {
    console.log(`💳 GET /api/payment/${req.params.id} accessed`);
    
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
            SELECT * FROM payment_history 
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

// PUT - Update payment status (Finance approval/rejection)
router.put('/:id/status', async (req, res) => {
    console.log(`💳 PUT /api/payment/${req.params.id}/status accessed`);
    
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
        // Get current payment request
        const currentPayment = await db.execute(
            'SELECT * FROM payment_requests WHERE id = ?',
            [id]
        );
        
        if (currentPayment.length === 0) {
            return res.status(404).json({
                error: 'Payment request not found'
            });
        }
        
        // Update payment status
        await db.execute(`
            UPDATE payment_requests SET 
                status = ?, 
                approved_by = ?, 
                approved_date = ?,
                finance_notes = ?,
                payment_reference = ?,
                actual_amount = ?,
                actual_currency = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            status, 
            approvedBy, 
            new Date().toISOString().split('T')[0],
            notes || null,
            paymentReference || null,
            actualAmount || null,
            actualCurrency || null,
            id
        ]);
        
        // Add to payment history
        await db.execute(`
            INSERT INTO payment_history (
                payment_id, status, changed_by, notes, created_at
            ) VALUES (?, ?, ?, ?, ?)
        `, [
            id, status, approvedBy, notes, new Date().toISOString()
        ]);
        
        // Create notification
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
            await db.execute(`
                INSERT INTO notifications (
                    title, message, type, recipient_role, reference_id, reference_type, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                notificationTitle,
                notificationMessage,
                'payment_update',
                currentPayment[0].submitted_by,
                id,
                'payment_request',
                new Date().toISOString()
            ]);
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
        res.status(500).json({
            error: 'Failed to update payment status',
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

// GET - Get employees for payment selection
router.get('/employees', async (req, res) => {
    console.log('💳 GET /api/payment/employees accessed');
    
    try {
        const { department, active = true } = req.query;
        
        let query = `
            SELECT e.id, e.name, e.email, e.phone, e.department, e.position, e.salary,
                   e.status, e.hire_date, d.name as department_name
            FROM employees e
            LEFT JOIN departments d ON e.department = d.code
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
        
        query += ' ORDER BY e.name LIMIT 100';
        
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

module.exports = router;
