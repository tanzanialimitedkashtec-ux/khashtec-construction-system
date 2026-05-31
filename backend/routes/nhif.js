const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all NHIF records
router.get('/', async (req, res) => {
    try {
        const nhifRecords = await db.execute(`
            SELECT n.*, e.full_name as employee_name, e.employee_id
            FROM nhif_contributions n
            LEFT JOIN employees e ON n.employee_id = e.id
            ORDER BY n.contribution_month DESC
        `);
        
        res.json({
            success: true,
            data: nhifRecords
        });
    } catch (error) {
        console.error('Error fetching NHIF records:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch NHIF records'
        });
    }
});

// Get NHIF records by employee
router.get('/employee/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        const nhifRecords = await db.execute(`
            SELECT n.*, e.full_name as employee_name, e.employee_id
            FROM nhif_contributions n
            LEFT JOIN employees e ON n.employee_id = e.id
            WHERE n.employee_id = ?
            ORDER BY n.contribution_month DESC
        `, [employeeId]);
        
        res.json({
            success: true,
            data: nhifRecords
        });
    } catch (error) {
        console.error('Error fetching employee NHIF records:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch employee NHIF records'
        });
    }
});

// Create new NHIF contribution
router.post('/', async (req, res) => {
    try {
        const {
            employeeId,
            contributionMonth,
            employeeContribution,
            employerContribution,
            totalContribution,
            paymentStatus,
            paymentDate,
            receiptNumber,
            submittedBy
        } = req.body;

        // Validate required fields
        if (!employeeId || !contributionMonth || !employeeContribution || !employerContribution) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: employeeId, contributionMonth, employeeContribution, employerContribution'
            });
        }

        // Format contribution month (append -01 to make it a valid DATE format for MySQL)
        let formattedMonth = contributionMonth;
        if (contributionMonth && contributionMonth.length === 7) {
            formattedMonth = `${contributionMonth}-01`;
        }

        // Validate that submittedBy is a valid integer for the FOREIGN KEY users(id) relation
        const submittedById = (submittedBy && !isNaN(parseInt(submittedBy, 10))) ? parseInt(submittedBy, 10) : null;

        // Calculate total if not provided
        const total = totalContribution || (parseFloat(employeeContribution) + parseFloat(employerContribution));

        const result = await db.execute(`
            INSERT INTO nhif_contributions (
                employee_id, contribution_month, employee_contribution, 
                employer_contribution, total_contribution, payment_status, 
                payment_date, receipt_number, submitted_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            employeeId,
            formattedMonth,
            employeeContribution,
            employerContribution,
            total,
            paymentStatus || 'Pending',
            paymentDate || null,
            receiptNumber || null,
            submittedById
        ]);

        // Get the created NHIF record
        const newRecord = await db.execute(`
            SELECT n.*, e.full_name as employee_name, e.employee_id
            FROM nhif_contributions n
            LEFT JOIN employees e ON n.employee_id = e.id
            WHERE n.id = ?
        `, [result.insertId]);

        // Create notification for Finance department
        try {
            await db.execute(`
                INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
                VALUES (?, ?, 'info', 'Medium', NULL, NOW())
            `, [
                'New NHIF Contribution Recorded',
                `NHIF contribution of ${total} recorded for employee ID: ${employeeId}`
            ]);
        } catch (notifErr) {
            console.error('Error creating notification:', notifErr);
        }

        res.json({
            success: true,
            data: newRecord[0]
        });
    } catch (error) {
        console.error('Error creating NHIF contribution:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create NHIF contribution'
        });
    }
});

// Update NHIF contribution payment status
router.put('/:id/payment', async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus, paymentDate, receiptNumber, updatedBy } = req.body;

        if (!['Pending', 'Paid', 'Overdue'].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment status'
            });
        }

        const updatedById = (updatedBy && !isNaN(parseInt(updatedBy, 10))) ? parseInt(updatedBy, 10) : null;

        const result = await db.execute(`
            UPDATE nhif_contributions 
            SET payment_status = ?, payment_date = ?, receipt_number = ?, 
                updated_by = ?, updated_at = NOW()
            WHERE id = ?
        `, [paymentStatus, paymentDate || null, receiptNumber || null, updatedById, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'NHIF record not found'
            });
        }

        // Get updated record
        const updatedRecord = await db.execute(`
            SELECT n.*, e.full_name as employee_name, e.employee_id
            FROM nhif_contributions n
            LEFT JOIN employees e ON n.employee_id = e.id
            WHERE n.id = ?
        `, [id]);

        res.json({
            success: true,
            data: updatedRecord[0]
        });
    } catch (error) {
        console.error('Error updating NHIF payment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update NHIF payment'
        });
    }
});

// Get NHIF summary
router.get('/summary', async (req, res) => {
    try {
        const summary = await db.execute(`
            SELECT 
                COUNT(*) as total_contributions,
                COALESCE(SUM(total_contribution), 0) as total_amount,
                COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN total_contribution ELSE 0 END), 0) as paid_amount,
                COALESCE(SUM(CASE WHEN payment_status = 'Pending' THEN total_contribution ELSE 0 END), 0) as pending_amount,
                COALESCE(SUM(CASE WHEN payment_status = 'Overdue' THEN total_contribution ELSE 0 END), 0) as overdue_amount,
                COUNT(CASE WHEN payment_status = 'Paid' THEN 1 END) as paid_count,
                COUNT(CASE WHEN payment_status = 'Pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN payment_status = 'Overdue' THEN 1 END) as overdue_count
            FROM nhif_contributions
        `);

        res.json({
            success: true,
            data: summary[0]
        });
    } catch (error) {
        console.error('Error fetching NHIF summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch NHIF summary'
        });
    }
});

// Delete NHIF record
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.execute('DELETE FROM nhif_contributions WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'NHIF record not found'
            });
        }

        res.json({
            success: true,
            message: 'NHIF record deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting NHIF record:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete NHIF record'
        });
    }
});

module.exports = router;
