const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');
const FinanceEmailService = require('../services/email-service');

console.log('🚀 Finance routes loaded with database connection');

// Initialize email service
const emailService = new FinanceEmailService();

// Helper function to get finance recipients
async function getFinanceRecipients(connection) {
    try {
        const [users] = await connection.query(`
            SELECT email, CONCAT(first_name, ' ', last_name) as name 
            FROM users 
            WHERE role = 'finance_manager' OR department = 'Finance' OR role = 'admin'
            AND email IS NOT NULL AND email != ''
        `);
        return users.map(user => ({
            email: user.email,
            name: user.name || 'Finance Manager'
        }));
    } catch (error) {
        console.error('Error fetching finance recipients:', error);
        // Fallback to default recipient
        return [{
            email: process.env.SMTP_USER || 'finance@kashtec.com',
            name: 'Finance Manager'
        }];
    }
}

// Test GET route
router.get('/test', (req, res) => {
    console.log('🧪 GET /api/finance/test accessed');
    res.json({ 
        message: 'Finance API test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// ===== BUDGET MANAGEMENT =====

// POST - Create department budget
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
    
    // Validate required fields
    if (!department || !period || !startDate || !endDate || !totalBudget || !justification) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['department', 'period', 'startDate', 'endDate', 'totalBudget', 'justification']
        });
    }
    
    try {
        const connection = await db.getConnection();
        
        // Insert budget into finance_work table
        const [result] = await connection.query(`
            INSERT INTO finance_work 
            (work_type, work_title, work_description, department, priority, due_date, 
             assigned_to, submitted_by, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            'Budget Creation',
            `${department} Budget - ${period}`,
            `Budget for ${department} department (${period})\n\nBudget Items:\n• Salaries & Wages: TZS ${salaries?.toLocaleString() || 0}\n• Office Supplies: TZS ${supplies?.toLocaleString() || 0}\n• Equipment & Tools: TZS ${equipment?.toLocaleString() || 0}\n• Training & Development: TZS ${training?.toLocaleString() || 0}\n• Travel & Transport: TZS ${travel?.toLocaleString() || 0}\n• Miscellaneous: TZS ${misc?.toLocaleString() || 0}\n\nTotal Budget: TZS ${totalBudget?.toLocaleString() || 0}\n\nJustification: ${justification}\n\nPeriod: ${startDate} to ${endDate}`,
            department,
            'High',
            endDate,
            'Finance Manager',
            createdBy,
            'pending',
            new Date().toISOString(),
            new Date().toISOString()
        ]);
        
        // Insert budget details into financial_transactions table
        const budgetId = `BUD-${Date.now()}`;
        await connection.query(`
            INSERT INTO financial_transactions 
            (transaction_id, transaction_type, category, amount, department, description, 
             transaction_date, status, reference_id, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            budgetId,
            'budget_allocation',
            department,
            totalBudget,
            department,
            `Budget allocation for ${department} (${period})`,
            startDate,
            'approved',
            result.insertId.toString(),
            createdBy,
            new Date().toISOString()
        ]);
        
        connection.release();
        
        console.log('✅ Budget created successfully:', { budgetId, department, totalBudget });
        
        // Send email notifications to finance managers
        try {
            const financeRecipients = await getFinanceRecipients(connection);
            const emailCount = await emailService.notifyBudgetCreation({
                department,
                period,
                totalBudget,
                startDate,
                endDate,
                justification,
                createdBy
            }, financeRecipients);
            console.log(`📧 Email notifications sent: ${emailCount}`);
        } catch (emailError) {
            console.error('❌ Failed to send email notifications:', emailError.message);
        }
        
        res.status(201).json({
            message: 'Budget created successfully',
            budget_id: budgetId,
            work_id: result.insertId,
            department,
            total_budget: totalBudget,
            period,
            status: 'pending'
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
        const connection = await db.getConnection();
        
        const [rows] = await connection.query(`
            SELECT id, work_type, work_title, work_description, department, priority, 
                   due_date, status, created_at, updated_at
            FROM finance_work 
            WHERE work_type = 'Budget Creation'
            ORDER BY created_at DESC
        `);
        
        connection.release();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
});

// ===== EXPENSE MANAGEMENT =====

// POST - Submit new expense
router.post('/expense', async (req, res) => {
    console.log('📝 POST /api/finance/expense accessed');
    console.log('📊 Request body:', req.body);
    
    const {
        category,
        amount,
        description,
        department,
        submittedBy = 'Employee',
        receiptFile
    } = req.body;
    
    // Validate required fields
    if (!category || !amount || !description || !department) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['category', 'amount', 'description', 'department']
        });
    }
    
    try {
        const connection = await db.getConnection();
        
        // Insert expense request into finance_work table
        const [result] = await connection.query(`
            INSERT INTO finance_work 
            (work_type, work_title, work_description, department, priority, due_date, 
             assigned_to, submitted_by, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            'Expense Request',
            `Expense - ${category}`,
            `Expense request for ${category}\n\nDescription: ${description}\nAmount: TZS ${amount?.toLocaleString() || 0}\nDepartment: ${department}\nSubmitted by: ${submittedBy}\n${receiptFile ? 'Receipt attached' : 'No receipt'}`,
            department,
            'Medium',
            new Date().toISOString().split('T')[0],
            'Finance Manager',
            submittedBy,
            'pending',
            new Date().toISOString(),
            new Date().toISOString()
        ]);
        
        // Insert expense transaction into financial_transactions table
        const expenseId = `EXP-${Date.now()}`;
        await connection.query(`
            INSERT INTO financial_transactions 
            (transaction_id, transaction_type, category, amount, department, description, 
             transaction_date, status, reference_id, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            expenseId,
            'expense',
            category,
            amount,
            department,
            description,
            new Date().toISOString().split('T')[0],
            'pending',
            result.insertId.toString(),
            submittedBy,
            new Date().toISOString()
        ]);
        
        connection.release();
        
        console.log('✅ Expense submitted successfully:', { expenseId, category, amount });
        
        // Send email notifications to finance managers
        try {
            const financeRecipients = await getFinanceRecipients(connection);
            const emailCount = await emailService.notifyExpenseSubmission({
                category,
                amount,
                description,
                department,
                submittedBy
            }, financeRecipients);
            console.log(`📧 Email notifications sent: ${emailCount}`);
        } catch (emailError) {
            console.error('❌ Failed to send email notifications:', emailError.message);
        }
        
        res.status(201).json({
            message: 'Expense submitted successfully',
            expense_id: expenseId,
            work_id: result.insertId,
            category,
            amount,
            status: 'pending'
        });
    } catch (error) {
        console.error('Error submitting expense:', error);
        res.status(500).json({ error: 'Failed to submit expense' });
    }
});

// PUT - Approve expense
router.put('/expense/:id/approve', async (req, res) => {
    console.log('✅ PUT /api/finance/expense/:id/approve accessed with id:', req.params.id);
    try {
        const connection = await db.getConnection();
        const { approvedBy = 'Finance Manager' } = req.body;
        
        // Update finance_work status
        const [workResult] = await connection.query(`
            UPDATE finance_work 
            SET status = 'approved', updated_at = ?
            WHERE id = ?
        `, [new Date().toISOString(), req.params.id]);
        
        // Update financial_transactions status
        const [transResult] = await connection.query(`
            UPDATE financial_transactions 
            SET status = 'approved', approved_by = ?, approved_date = ?
            WHERE reference_id = ?
        `, [approvedBy, new Date().toISOString().split('T')[0], req.params.id]);
        
        connection.release();
        
        if (workResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        // Send email notifications for expense approval
        try {
            // Get expense details for email
            const [expenseDetails] = await connection.query(`
                SELECT fw.work_description, fw.department, ft.amount, ft.category, fw.submitted_by
                FROM finance_work fw
                LEFT JOIN financial_transactions ft ON fw.id = CAST(ft.reference_id AS UNSIGNED)
                WHERE fw.id = ?
            `, [req.params.id]);
            
            if (expenseDetails.length > 0) {
                const expenseData = expenseDetails[0];
                const financeRecipients = await getFinanceRecipients(connection);
                const emailCount = await emailService.notifyExpenseApproval({
                    category: expenseData.category,
                    amount: expenseData.amount,
                    department: expenseData.department,
                    description: expenseData.work_description
                }, financeRecipients);
                console.log(`📧 Email notifications sent: ${emailCount}`);
            }
        } catch (emailError) {
            console.error('❌ Failed to send email notifications:', emailError.message);
        }
        
        res.json({
            message: 'Expense approved successfully',
            expense_id: req.params.id,
            status: 'approved',
            approved_by: approvedBy
        });
    } catch (error) {
        console.error('Error approving expense:', error);
        res.status(500).json({ error: 'Failed to approve expense' });
    }
});

// PUT - Reject expense
router.put('/expense/:id/reject', async (req, res) => {
    console.log('❌ PUT /api/finance/expense/:id/reject accessed with id:', req.params.id);
    try {
        const connection = await db.getConnection();
        const { rejectedBy = 'Finance Manager', rejectionReason } = req.body;
        
        // Update finance_work status
        const [workResult] = await connection.query(`
            UPDATE finance_work 
            SET status = 'rejected', updated_at = ?
            WHERE id = ?
        `, [new Date().toISOString(), req.params.id]);
        
        // Update financial_transactions status
        const [transResult] = await connection.query(`
            UPDATE financial_transactions 
            SET status = 'rejected', rejected_by = ?, rejection_reason = ?, rejected_date = ?
            WHERE reference_id = ?
        `, [rejectedBy, rejectionReason || 'Rejected', new Date().toISOString().split('T')[0], req.params.id]);
        
        connection.release();
        
        if (workResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        // Send email notifications for expense rejection
        try {
            // Get expense details for email
            const [expenseDetails] = await connection.query(`
                SELECT fw.work_description, fw.department, ft.amount, ft.category, fw.submitted_by
                FROM finance_work fw
                LEFT JOIN financial_transactions ft ON fw.id = CAST(ft.reference_id AS UNSIGNED)
                WHERE fw.id = ?
            `, [req.params.id]);
            
            if (expenseDetails.length > 0) {
                const expenseData = expenseDetails[0];
                const financeRecipients = await getFinanceRecipients(connection);
                const emailCount = await emailService.notifyExpenseRejection({
                    category: expenseData.category,
                    amount: expenseData.amount,
                    department: expenseData.department,
                    description: expenseData.work_description,
                    rejectionReason: rejectionReason
                }, financeRecipients);
                console.log(`📧 Email notifications sent: ${emailCount}`);
            }
        } catch (emailError) {
            console.error('❌ Failed to send email notifications:', emailError.message);
        }
        
        res.json({
            message: 'Expense rejected successfully',
            expense_id: req.params.id,
            status: 'rejected',
            rejected_by: rejectedBy
        });
    } catch (error) {
        console.error('Error rejecting expense:', error);
        res.status(500).json({ error: 'Failed to reject expense' });
    }
});

// GET - Fetch expenses
router.get('/expenses', async (req, res) => {
    console.log('📝 GET /api/finance/expenses accessed');
    try {
        const connection = await db.getConnection();
        
        const [rows] = await connection.query(`
            SELECT fw.id, fw.work_type, fw.work_title, fw.work_description, fw.department, 
                   fw.status, fw.created_at, ft.transaction_id, ft.amount, ft.category
            FROM finance_work fw
            LEFT JOIN financial_transactions ft ON fw.id = CAST(ft.reference_id AS UNSIGNED)
            WHERE fw.work_type = 'Expense Request'
            ORDER BY fw.created_at DESC
        `);
        
        connection.release();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// ===== PAYROLL PROCESSING =====

// POST - Process payroll
router.post('/payroll', async (req, res) => {
    console.log('📝 POST /api/finance/payroll accessed');
    console.log('📊 Request body:', req.body);
    
    const {
        payrollMonth,
        paymentDate,
        payrollType = 'regular',
        totalEmployees,
        totalGrossPay,
        totalDeductions,
        netPayment,
        processedBy = 'Finance Manager'
    } = req.body;
    
    // Validate required fields
    if (!payrollMonth || !paymentDate || !totalEmployees || !totalGrossPay || !netPayment) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['payrollMonth', 'paymentDate', 'totalEmployees', 'totalGrossPay', 'netPayment']
        });
    }
    
    try {
        const connection = await db.getConnection();
        
        // Insert payroll processing into finance_work table
        const [result] = await connection.query(`
            INSERT INTO finance_work 
            (work_type, work_title, work_description, department, priority, due_date, 
             assigned_to, submitted_by, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            'Payroll Processing',
            `Payroll - ${payrollMonth}`,
            `Payroll processing for ${payrollMonth}\n\nPayroll Type: ${payrollType}\nTotal Employees: ${totalEmployees}\nTotal Gross Pay: TZS ${totalGrossPay?.toLocaleString() || 0}\nTotal Deductions: TZS ${totalDeductions?.toLocaleString() || 0}\nNet Payment: TZS ${netPayment?.toLocaleString() || 0}\nPayment Date: ${paymentDate}\nProcessed by: ${processedBy}`,
            'Finance',
            'High',
            paymentDate,
            'Finance Manager',
            processedBy,
            'processed',
            new Date().toISOString(),
            new Date().toISOString()
        ]);
        
        // Insert payroll transaction into financial_transactions table
        const payrollId = `PAY-${Date.now()}`;
        await connection.query(`
            INSERT INTO financial_transactions 
            (transaction_id, transaction_type, category, amount, department, description, 
             transaction_date, status, reference_id, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            payrollId,
            'payroll',
            payrollType,
            netPayment,
            'Finance',
            `Payroll processing for ${payrollMonth} (${totalEmployees} employees)`,
            paymentDate,
            'processed',
            result.insertId.toString(),
            processedBy,
            new Date().toISOString()
        ]);
        
        connection.release();
        
        console.log('✅ Payroll processed successfully:', { payrollId, payrollMonth, netPayment });
        
        // Send email notifications to finance managers
        try {
            const financeRecipients = await getFinanceRecipients(connection);
            const emailCount = await emailService.notifyPayrollProcessing({
                payrollMonth,
                paymentDate,
                payrollType,
                totalEmployees,
                totalGrossPay,
                totalDeductions,
                netPayment,
                processedBy
            }, financeRecipients);
            console.log(`📧 Email notifications sent: ${emailCount}`);
        } catch (emailError) {
            console.error('❌ Failed to send email notifications:', emailError.message);
        }
        
        res.status(201).json({
            message: 'Payroll processed successfully',
            payroll_id: payrollId,
            work_id: result.insertId,
            payroll_month: payrollMonth,
            net_payment: netPayment,
            status: 'processed'
        });
    } catch (error) {
        console.error('Error processing payroll:', error);
        res.status(500).json({ error: 'Failed to process payroll' });
    }
});

// POST - Save salary structure
router.post('/salary-structure', async (req, res) => {
    console.log('📝 POST /api/finance/salary-structure accessed');
    console.log('📊 Request body:', req.body);
    
    const {
        employeeId,
        basicSalary,
        housingAllowance,
        transportAllowance,
        medicalAllowance,
        otherAllowances,
        grossSalary,
        approvedBy = 'Finance Manager'
    } = req.body;
    
    // Validate required fields
    if (!employeeId || !basicSalary || !grossSalary) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['employeeId', 'basicSalary', 'grossSalary']
        });
    }
    
    try {
        const connection = await db.getConnection();
        
        // Insert salary structure into finance_work table
        const [result] = await connection.query(`
            INSERT INTO finance_work 
            (work_type, work_title, work_description, department, priority, due_date, 
             assigned_to, submitted_by, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            'Salary Structure',
            `Salary Structure - ${employeeId}`,
            `Salary structure approval for employee ${employeeId}\n\nSalary Breakdown:\n• Basic Salary: TZS ${basicSalary?.toLocaleString() || 0}\n• Housing Allowance: TZS ${housingAllowance?.toLocaleString() || 0}\n• Transport Allowance: TZS ${transportAllowance?.toLocaleString() || 0}\n• Medical Allowance: TZS ${medicalAllowance?.toLocaleString() || 0}\n• Other Allowances: TZS ${otherAllowances?.toLocaleString() || 0}\n\nGross Monthly Salary: TZS ${grossSalary?.toLocaleString() || 0}\n\nApproved by: ${approvedBy}`,
            'Finance',
            'High',
            new Date().toISOString().split('T')[0],
            'Finance Manager',
            approvedBy,
            'approved',
            new Date().toISOString(),
            new Date().toISOString()
        ]);
        
        connection.release();
        
        console.log('✅ Salary structure saved successfully:', { employeeId, grossSalary });
        
        res.status(201).json({
            message: 'Salary structure saved successfully',
            work_id: result.insertId,
            employee_id: employeeId,
            gross_salary: grossSalary,
            status: 'approved'
        });
    } catch (error) {
        console.error('Error saving salary structure:', error);
        res.status(500).json({ error: 'Failed to save salary structure' });
    }
});

// ===== FINANCIAL REPORTS =====

// GET - Generate financial summary
router.get('/summary', async (req, res) => {
    console.log('📝 GET /api/finance/summary accessed');
    try {
        const connection = await db.getConnection();
        
        // Get total expenses
        const [expenseRows] = await connection.query(`
            SELECT SUM(amount) as total_expenses FROM financial_transactions 
            WHERE transaction_type = 'expense' AND status = 'approved'
        `);
        
        // Get total budget allocations
        const [budgetRows] = await connection.query(`
            SELECT SUM(amount) as total_budget FROM financial_transactions 
            WHERE transaction_type = 'budget_allocation' AND status = 'approved'
        `);
        
        // Get total payroll
        const [payrollRows] = await connection.query(`
            SELECT SUM(amount) as total_payroll FROM financial_transactions 
            WHERE transaction_type = 'payroll' AND status = 'processed'
        `);
        
        // Get pending expenses
        const [pendingRows] = await connection.query(`
            SELECT COUNT(*) as pending_count FROM finance_work 
            WHERE work_type = 'Expense Request' AND status = 'pending'
        `);
        
        connection.release();
        
        res.json({
            total_expenses: expenseRows[0].total_expenses || 0,
            total_budget: budgetRows[0].total_budget || 0,
            total_payroll: payrollRows[0].total_payroll || 0,
            pending_expenses: pendingRows[0].pending_count || 0,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating financial summary:', error);
        res.status(500).json({ error: 'Failed to generate financial summary' });
    }
});

// ===== EMAIL NOTIFICATION TESTING =====

// POST - Test email configuration
router.post('/test-email', async (req, res) => {
    console.log('📧 POST /api/finance/test-email accessed');
    try {
        const success = await emailService.testEmailConfiguration();
        
        if (success) {
            res.json({
                message: 'Test email sent successfully',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                error: 'Failed to send test email'
            });
        }
    } catch (error) {
        console.error('Error testing email configuration:', error);
        res.status(500).json({ error: 'Failed to test email configuration' });
    }
});

// POST - Send custom email notification
router.post('/send-notification', async (req, res) => {
    console.log('📧 POST /api/finance/send-notification accessed');
    console.log('📝 Request body:', req.body);
    
    const {
        recipientEmail,
        recipientName,
        subject,
        activityType,
        activityDetails,
        amount,
        department,
        priority = 'normal'
    } = req.body;
    
    // Validate required fields
    if (!recipientEmail || !subject || !activityType) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['recipientEmail', 'subject', 'activityType']
        });
    }
    
    try {
        const success = await emailService.sendFinanceNotification({
            recipientEmail,
            recipientName: recipientName || 'Finance Manager',
            subject,
            activityType,
            activityDetails,
            amount,
            department,
            priority
        });
        
        if (success) {
            res.json({
                message: 'Email notification sent successfully',
                recipient: recipientEmail,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                error: 'Failed to send email notification'
            });
        }
    } catch (error) {
        console.error('Error sending custom notification:', error);
        res.status(500).json({ error: 'Failed to send email notification' });
    }
});

module.exports = router;
