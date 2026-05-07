const express = require('express');
const router = express.Router();
const db = require('../src/config/database');

// Get all tax records
router.get('/', async (req, res) => {
    try {
        const [taxRecords] = await db.execute(`
            SELECT t.*, u.name as recorded_by_name
            FROM tax_payments t
            LEFT JOIN users u ON t.recorded_by = u.id
            ORDER BY t.payment_date DESC
        `);
        
        res.json({
            success: true,
            data: taxRecords
        });
    } catch (error) {
        console.error('Error fetching tax records:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tax records'
        });
    }
});

// Get tax records by type
router.get('/type/:taxType', async (req, res) => {
    try {
        const { taxType } = req.params;
        
        const [taxRecords] = await db.execute(`
            SELECT t.*, u.name as recorded_by_name
            FROM tax_payments t
            LEFT JOIN users u ON t.recorded_by = u.id
            WHERE t.tax_type = ?
            ORDER BY t.payment_date DESC
        `, [taxType]);
        
        res.json({
            success: true,
            data: taxRecords
        });
    } catch (error) {
        console.error('Error fetching tax records by type:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tax records by type'
        });
    }
});

// Get tax records by status
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        
        const [taxRecords] = await db.execute(`
            SELECT t.*, u.name as recorded_by_name
            FROM tax_payments t
            LEFT JOIN users u ON t.recorded_by = u.id
            WHERE t.payment_status = ?
            ORDER BY t.payment_date DESC
        `, [status]);
        
        res.json({
            success: true,
            data: taxRecords
        });
    } catch (error) {
        console.error('Error fetching tax records by status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tax records by status'
        });
    }
});

// Create new tax payment record
router.post('/', async (req, res) => {
    try {
        const {
            taxType,
            taxPeriod,
            paymentDate,
            dueDate,
            amount,
            paymentMethod,
            paymentReference,
            paymentStatus,
            description,
            department,
            recordedBy,
            recordedByRole,
            attachments,
            penalties,
            interest
        } = req.body;

        // Validate required fields
        if (!taxType || !taxPeriod || !paymentDate || !amount || !department) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: taxType, taxPeriod, paymentDate, amount, department'
            });
        }

        // Get user ID from role name
        const [userRows] = await db.execute(
            'SELECT id FROM users WHERE role = ? LIMIT 1',
            [recordedByRole]
        );

        if (userRows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user role'
            });
        }

        const userId = userRows[0].id;

        // Calculate total amount with penalties and interest
        const totalAmount = parseFloat(amount) + (parseFloat(penalties) || 0) + (parseFloat(interest) || 0);

        const [result] = await db.execute(`
            INSERT INTO tax_payments (
                tax_type, tax_period, payment_date, due_date, amount, penalties, 
                interest, total_amount, payment_method, payment_reference, 
                payment_status, description, department, recorded_by, recorded_by_role,
                attachments, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            taxType,
            taxPeriod,
            paymentDate,
            dueDate || null,
            amount,
            penalties || 0,
            interest || 0,
            totalAmount,
            paymentMethod || 'Bank Transfer',
            paymentReference || null,
            paymentStatus || 'Paid',
            description || null,
            department,
            userId,
            recordedByRole,
            attachments || null
        ]);

        // Get the created tax record
        const [newRecord] = await db.execute(`
            SELECT t.*, u.name as recorded_by_name
            FROM tax_payments t
            LEFT JOIN users u ON t.recorded_by = u.id
            WHERE t.id = ?
        `, [result.insertId]);

        // Create notification for Finance department
        await db.execute(`
            INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
            VALUES (?, ?, 'info', 'High', NULL, NOW())
        `, [
            'New Tax Payment Recorded',
            `${taxType} payment of ${totalAmount} recorded for ${taxPeriod}`
        ]);

        res.json({
            success: true,
            data: newRecord[0]
        });
    } catch (error) {
        console.error('Error creating tax payment record:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create tax payment record'
        });
    }
});

// Update tax payment status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus, paymentDate, paymentMethod, paymentReference, updatedBy, updatedByRole } = req.body;

        if (!['Paid', 'Pending', 'Overdue', 'Cancelled', 'Refunded'].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment status'
            });
        }

        // Get updater user ID
        const [updaterRows] = await db.execute(
            'SELECT id FROM users WHERE role = ? LIMIT 1',
            [updatedByRole]
        );

        if (updaterRows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid updater role'
            });
        }

        const updaterId = updaterRows[0].id;

        // Update tax payment
        const [result] = await db.execute(`
            UPDATE tax_payments 
            SET payment_status = ?, payment_date = ?, payment_method = ?, 
                payment_reference = ?, updated_by = ?, updated_at = NOW()
            WHERE id = ?
        `, [
            paymentStatus, 
            paymentDate || null, 
            paymentMethod || null, 
            paymentReference || null, 
            updaterId, 
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Tax record not found'
            });
        }

        // Get updated record
        const [updatedRecord] = await db.execute(`
            SELECT t.*, u.name as recorded_by_name
            FROM tax_payments t
            LEFT JOIN users u ON t.recorded_by = u.id
            WHERE t.id = ?
        `, [id]);

        res.json({
            success: true,
            data: updatedRecord[0]
        });
    } catch (error) {
        console.error('Error updating tax payment status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update tax payment status'
        });
    }
});

// Get tax summary
router.get('/summary', async (req, res) => {
    try {
        const [summary] = await db.execute(`
            SELECT 
                COUNT(*) as total_payments,
                SUM(total_amount) as total_amount_paid,
                SUM(CASE WHEN payment_status = 'Paid' THEN total_amount ELSE 0 END) as paid_amount,
                SUM(CASE WHEN payment_status = 'Pending' THEN total_amount ELSE 0 END) as pending_amount,
                SUM(CASE WHEN payment_status = 'Overdue' THEN total_amount ELSE 0 END) as overdue_amount,
                SUM(penalties) as total_penalties,
                SUM(interest) as total_interest,
                COUNT(CASE WHEN payment_status = 'Paid' THEN 1 END) as paid_count,
                COUNT(CASE WHEN payment_status = 'Pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN payment_status = 'Overdue' THEN 1 END) as overdue_count,
                COUNT(CASE WHEN tax_type = 'PAYE' THEN 1 END) as paye_count,
                COUNT(CASE WHEN tax_type = 'VAT' THEN 1 END) as vat_count,
                COUNT(CASE WHEN tax_type = 'Corporate Tax' THEN 1 END) as corporate_tax_count,
                COUNT(CASE WHEN tax_type = 'Withholding Tax' THEN 1 END) as withholding_tax_count
            FROM tax_payments
        `);

        res.json({
            success: true,
            data: summary[0]
        });
    } catch (error) {
        console.error('Error fetching tax summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tax summary'
        });
    }
});

// Get tax records by period
router.get('/period/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const [taxRecords] = await db.execute(`
            SELECT t.*, u.name as recorded_by_name
            FROM tax_payments t
            LEFT JOIN users u ON t.recorded_by = u.id
            WHERE t.tax_period = ?
            ORDER BY t.payment_date DESC
        `, [period]);
        
        res.json({
            success: true,
            data: taxRecords
        });
    } catch (error) {
        console.error('Error fetching tax records by period:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tax records by period'
        });
    }
});

// Get upcoming tax payments
router.get('/upcoming', async (req, res) => {
    try {
        const [upcomingPayments] = await db.execute(`
            SELECT t.*, u.name as recorded_by_name
            FROM tax_payments t
            LEFT JOIN users u ON t.recorded_by = u.id
            WHERE t.payment_status IN ('Pending', 'Overdue')
            AND t.due_date >= CURDATE()
            ORDER BY t.due_date ASC
            LIMIT 10
        `);
        
        res.json({
            success: true,
            data: upcomingPayments
        });
    } catch (error) {
        console.error('Error fetching upcoming tax payments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch upcoming tax payments'
        });
    }
});

// Delete tax record
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute('DELETE FROM tax_payments WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Tax record not found'
            });
        }

        res.json({
            success: true,
            message: 'Tax record deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting tax record:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete tax record'
        });
    }
});

module.exports = router;
