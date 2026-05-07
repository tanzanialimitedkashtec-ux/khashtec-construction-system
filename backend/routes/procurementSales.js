const express = require('express');
const router = express.Router();
const db = require('../src/config/database');

// Get all procurement sales records
router.get('/', async (req, res) => {
    try {
        const [procurementSales] = await db.execute(`
            SELECT ps.*, u.full_name as submitted_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            ORDER BY ps.created_at DESC
        `);
        
        res.json({
            success: true,
            data: procurementSales
        });
    } catch (error) {
        console.error('Error fetching procurement sales:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch procurement sales'
        });
    }
});

// Get procurement sales by status
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        
        const [procurementSales] = await db.execute(`
            SELECT ps.*, u.full_name as submitted_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            WHERE ps.status = ?
            ORDER BY ps.created_at DESC
        `, [status]);
        
        res.json({
            success: true,
            data: procurementSales
        });
    } catch (error) {
        console.error('Error fetching procurement sales by status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch procurement sales by status'
        });
    }
});

// Create new procurement sale request
router.post('/', async (req, res) => {
    try {
        const {
            requestTitle,
            procurementType,
            itemDescription,
            quantity,
            unitPrice,
            totalBudget,
            purpose,
            urgencyLevel,
            expectedDeliveryDate,
            supplierRequirements,
            technicalSpecifications,
            budgetAllocation,
            department,
            requestedBy,
            requestedByRole,
            justification,
            approvalRequirements
        } = req.body;

        // Validate required fields
        if (!requestTitle || !procurementType || !itemDescription || !quantity || !totalBudget || !purpose || !department) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: requestTitle, procurementType, itemDescription, quantity, totalBudget, purpose, department'
            });
        }

        // Get user ID from role name
        const [userRows] = await db.execute(
            'SELECT id FROM users WHERE role = ? LIMIT 1',
            [requestedByRole]
        );

        if (userRows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user role'
            });
        }

        const userId = userRows[0].id;

        const [result] = await db.execute(`
            INSERT INTO procurement_sales (
                request_title, procurement_type, item_description, quantity, 
                unit_price, total_budget, purpose, urgency_level, 
                expected_delivery_date, supplier_requirements, technical_specifications,
                budget_allocation, department, requested_by, requested_by_role,
                justification, approval_requirements, status, submitted_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, NOW())
        `, [
            requestTitle,
            procurementType,
            itemDescription,
            quantity,
            unitPrice || 0,
            totalBudget,
            purpose,
            urgencyLevel || 'Normal',
            expectedDeliveryDate || null,
            supplierRequirements || null,
            technicalSpecifications || null,
            budgetAllocation || null,
            department,
            requestedBy,
            requestedByRole,
            justification || null,
            approvalRequirements || 'Standard',
            userId
        ]);

        // Get the created procurement sale request
        const [newRequest] = await db.execute(`
            SELECT ps.*, u.full_name as submitted_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            WHERE ps.id = ?
        `, [result.insertId]);

        // Create notification for Finance and Procurement departments
        await db.execute(`
            INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
            VALUES (?, ?, 'info', 'High', NULL, NOW())
        `, [
            'New Procurement Sale Request',
            `${requestedByRole} submitted procurement request: ${requestTitle} (Budget: ${totalBudget})`
        ]);

        res.json({
            success: true,
            data: newRequest[0]
        });
    } catch (error) {
        console.error('Error creating procurement sale request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create procurement sale request'
        });
    }
});

// Update procurement sale status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reviewedBy, reviewedByRole, reviewComments, approvedBudget, rejectionReason } = req.body;

        if (!['Pending', 'Under Review', 'Approved', 'Rejected', 'Procurement In Progress', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        // Get reviewer user ID
        const [reviewerRows] = await db.execute(
            'SELECT id FROM users WHERE role = ? LIMIT 1',
            [reviewedByRole]
        );

        if (reviewerRows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid reviewer role'
            });
        }

        const reviewerId = reviewerRows[0].id;

        // Update procurement sale request
        const [result] = await db.execute(`
            UPDATE procurement_sales 
            SET status = ?, reviewed_by = ?, reviewed_date = NOW(), 
                review_comments = ?, approved_budget = ?, rejection_reason = ?, 
                updated_by = ?, updated_at = NOW()
            WHERE id = ?
        `, [
            status, 
            reviewerId, 
            reviewComments || null, 
            approvedBudget || null, 
            rejectionReason || null, 
            reviewerId, 
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Procurement sale request not found'
            });
        }

        // Get updated request
        const [updatedRequest] = await db.execute(`
            SELECT ps.*, u.full_name as submitted_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            WHERE ps.id = ?
        `, [id]);

        // Create notification for the requester
        const requesterId = updatedRequest[0].submitted_by;
        await db.execute(`
            INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
            VALUES (?, ?, 'info', 'Medium', ?, NOW())
        `, [
            `Procurement Request ${status}`,
            `Your procurement request "${updatedRequest[0].request_title}" has been ${status.toLowerCase()}`
        ], [requesterId]);

        res.json({
            success: true,
            data: updatedRequest[0]
        });
    } catch (error) {
        console.error('Error updating procurement sale status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update procurement sale status'
        });
    }
});

// Get procurement sales summary
router.get('/summary', async (req, res) => {
    try {
        const [summary] = await db.execute(`
            SELECT 
                COUNT(*) as total_requests,
                SUM(total_budget) as total_budget_value,
                SUM(CASE WHEN status = 'Approved' THEN total_budget ELSE 0 END) as approved_budget,
                SUM(CASE WHEN status = 'Completed' THEN total_budget ELSE 0 END) as completed_budget,
                COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'Under Review' THEN 1 END) as under_review_count,
                COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_count,
                COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_count,
                COUNT(CASE WHEN urgency_level = 'High' THEN 1 END) as high_urgency_count,
                COUNT(CASE WHEN urgency_level = 'Medium' THEN 1 END) as medium_urgency_count,
                COUNT(CASE WHEN urgency_level = 'Low' THEN 1 END) as low_urgency_count
            FROM procurement_sales
        `);

        res.json({
            success: true,
            data: summary[0]
        });
    } catch (error) {
        console.error('Error fetching procurement sales summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch procurement sales summary'
        });
    }
});

// Get procurement sales by department
router.get('/department/:department', async (req, res) => {
    try {
        const { department } = req.params;
        
        const [procurementSales] = await db.execute(`
            SELECT ps.*, u.full_name as submitted_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            WHERE ps.department = ?
            ORDER BY ps.created_at DESC
        `, [department]);
        
        res.json({
            success: true,
            data: procurementSales
        });
    } catch (error) {
        console.error('Error fetching procurement sales by department:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch procurement sales by department'
        });
    }
});

// Delete procurement sale request
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute('DELETE FROM procurement_sales WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Procurement sale request not found'
            });
        }

        res.json({
            success: true,
            message: 'Procurement sale request deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting procurement sale request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete procurement sale request'
        });
    }
});

module.exports = router;
