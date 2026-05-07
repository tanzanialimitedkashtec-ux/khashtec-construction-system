const express = require('express');
const router = express.Router();
const db = require('../src/config/database');

// Get all senior role records
router.get('/', async (req, res) => {
    try {
        const [seniorRoles] = await db.execute(`
            SELECT sr.*, u.full_name as submitted_by_name, e.full_name as employee_name
            FROM senior_roles sr
            LEFT JOIN users u ON sr.submitted_by = u.id
            LEFT JOIN employees e ON sr.employee_id = e.id
            ORDER BY sr.created_at DESC
        `);
        
        res.json({
            success: true,
            data: seniorRoles
        });
    } catch (error) {
        console.error('Error fetching senior roles:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch senior roles'
        });
    }
});

// Get senior roles by status
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        
        const [seniorRoles] = await db.execute(`
            SELECT sr.*, u.full_name as submitted_by_name, e.full_name as employee_name
            FROM senior_roles sr
            LEFT JOIN users u ON sr.submitted_by = u.id
            LEFT JOIN employees e ON sr.employee_id = e.id
            WHERE sr.status = ?
            ORDER BY sr.created_at DESC
        `, [status]);
        
        res.json({
            success: true,
            data: seniorRoles
        });
    } catch (error) {
        console.error('Error fetching senior roles by status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch senior roles by status'
        });
    }
});

// Create new senior role request
router.post('/', async (req, res) => {
    try {
        const {
            employeeId,
            seniorRoleType,
            proposedTitle,
            department,
            proposedSalary,
            effectiveDate,
            reasonForPromotion,
            responsibilities,
            qualifications,
            experience,
            achievements,
            reportingStructure,
            budgetImpact,
            submittedBy,
            submittedByRole,
            priority,
            attachments
        } = req.body;

        // Validate required fields
        if (!employeeId || !seniorRoleType || !proposedTitle || !department || !proposedSalary || !effectiveDate) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: employeeId, seniorRoleType, proposedTitle, department, proposedSalary, effectiveDate'
            });
        }

        // Get user ID from role name
        const [userRows] = await db.execute(
            'SELECT id FROM users WHERE role = ? LIMIT 1',
            [submittedByRole]
        );

        if (userRows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user role'
            });
        }

        const userId = userRows[0].id;

        const [result] = await db.execute(`
            INSERT INTO senior_roles (
                employee_id, senior_role_type, proposed_title, department, 
                proposed_salary, effective_date, reason_for_promotion, responsibilities,
                qualifications, experience, achievements, reporting_structure, 
                budget_impact, submitted_by, submitted_by_role, priority, 
                status, attachments, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, NOW())
        `, [
            employeeId,
            seniorRoleType,
            proposedTitle,
            department,
            proposedSalary,
            effectiveDate,
            reasonForPromotion || null,
            responsibilities || null,
            qualifications || null,
            experience || null,
            achievements || null,
            reportingStructure || null,
            budgetImpact || null,
            userId,
            submittedByRole,
            priority || 'Normal',
            attachments || null
        ]);

        // Get the created senior role request
        const [newRequest] = await db.execute(`
            SELECT sr.*, u.full_name as submitted_by_name, e.full_name as employee_name
            FROM senior_roles sr
            LEFT JOIN users u ON sr.submitted_by = u.id
            LEFT JOIN employees e ON sr.employee_id = e.id
            WHERE sr.id = ?
        `, [result.insertId]);

        // Create notifications for MD and HR
        await db.execute(`
            INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
            VALUES (?, ?, 'info', 'High', NULL, NOW())
        `, [
            'New Senior Role Request',
            `${submittedByRole} submitted senior role request: ${proposedTitle} for ${newRequest[0].employee_name}`
        ]);

        res.json({
            success: true,
            data: newRequest[0]
        });
    } catch (error) {
        console.error('Error creating senior role request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create senior role request'
        });
    }
});

// Update senior role status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reviewedBy, reviewedByRole, reviewComments, approvedSalary, rejectionReason, finalTitle } = req.body;

        if (!['Pending', 'Under Review', 'Approved', 'Rejected', 'Implemented', 'Cancelled'].includes(status)) {
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

        // Update senior role request
        const [result] = await db.execute(`
            UPDATE senior_roles 
            SET status = ?, reviewed_by = ?, reviewed_date = NOW(), 
                review_comments = ?, approved_salary = ?, rejection_reason = ?,
                final_title = ?, updated_by = ?, updated_at = NOW()
            WHERE id = ?
        `, [
            status, 
            reviewerId, 
            reviewComments || null, 
            approvedSalary || null, 
            rejectionReason || null, 
            finalTitle || null,
            reviewerId, 
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Senior role request not found'
            });
        }

        // Get updated request
        const [updatedRequest] = await db.execute(`
            SELECT sr.*, u.full_name as submitted_by_name, e.full_name as employee_name
            FROM senior_roles sr
            LEFT JOIN users u ON sr.submitted_by = u.id
            LEFT JOIN employees e ON sr.employee_id = e.id
            WHERE sr.id = ?
        `, [id]);

        // If approved, update employee record
        if (status === 'Approved' && approvedSalary && finalTitle) {
            await db.execute(`
                UPDATE employees 
                SET position = ?, salary = ?, updated_at = NOW()
                WHERE id = ?
            `, [finalTitle, approvedSalary, updatedRequest[0].employee_id]);
        }

        // Create notification for the submitter
        const submitterId = updatedRequest[0].submitted_by;
        await db.execute(`
            INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
            VALUES (?, ?, 'info', 'High', ?, NOW())
        `, [
            `Senior Role Request ${status}`,
            `Your senior role request "${updatedRequest[0].proposed_title}" has been ${status.toLowerCase()}`
        ], [submitterId]);

        res.json({
            success: true,
            data: updatedRequest[0]
        });
    } catch (error) {
        console.error('Error updating senior role status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update senior role status'
        });
    }
});

// Send senior role to MD for approval
router.post('/:id/send-to-md', async (req, res) => {
    try {
        const { id } = req.params;
        const { sentBy, sentByRole, message } = req.body;

        // Get sender user ID
        const [senderRows] = await db.execute(
            'SELECT id FROM users WHERE role = ? LIMIT 1',
            [sentByRole]
        );

        if (senderRows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid sender role'
            });
        }

        const senderId = senderRows[0].id;

        // Update senior role status
        const [result] = await db.execute(`
            UPDATE senior_roles 
            SET status = 'Under Review', sent_to_md_by = ?, sent_to_md_date = NOW(), 
                updated_by = ?, updated_at = NOW()
            WHERE id = ?
        `, [senderId, senderId, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Senior role request not found'
            });
        }

        // Get request details
        const [request] = await db.execute(`
            SELECT sr.*, e.full_name as employee_name
            FROM senior_roles sr
            LEFT JOIN employees e ON sr.employee_id = e.id
            WHERE sr.id = ?
        `, [id]);

        // Create notification for MD
        await db.execute(`
            INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
            VALUES (?, ?, 'info', 'High', NULL, NOW())
        `, [
            'Senior Role Request - MD Approval Required',
            `${sentByRole} has sent senior role request "${request[0].proposed_title}" for ${request[0].employee_name} to MD for approval. ${message || ''}`
        ]);

        res.json({
            success: true,
            message: 'Senior role request sent to MD successfully'
        });
    } catch (error) {
        console.error('Error sending senior role to MD:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send senior role to MD'
        });
    }
});

// Get senior roles summary
router.get('/summary', async (req, res) => {
    try {
        const [summary] = await db.execute(`
            SELECT 
                COUNT(*) as total_requests,
                SUM(proposed_salary) as total_proposed_budget,
                SUM(CASE WHEN status = 'Approved' THEN approved_salary ELSE 0 END) as approved_budget,
                COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'Under Review' THEN 1 END) as under_review_count,
                COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_count,
                COUNT(CASE WHEN status = 'Implemented' THEN 1 END) as implemented_count,
                COUNT(CASE WHEN senior_role_type = 'Manager' THEN 1 END) as manager_count,
                COUNT(CASE WHEN senior_role_type = 'Director' THEN 1 END) as director_count,
                COUNT(CASE WHEN senior_role_type = 'Senior Manager' THEN 1 END) as senior_manager_count,
                COUNT(CASE WHEN priority = 'High' THEN 1 END) as high_priority_count,
                COUNT(CASE WHEN priority = 'Medium' THEN 1 END) as medium_priority_count,
                COUNT(CASE WHEN priority = 'Low' THEN 1 END) as low_priority_count
            FROM senior_roles
        `);

        res.json({
            success: true,
            data: summary[0]
        });
    } catch (error) {
        console.error('Error fetching senior roles summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch senior roles summary'
        });
    }
});

// Get senior roles by employee
router.get('/employee/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        const [seniorRoles] = await db.execute(`
            SELECT sr.*, u.full_name as submitted_by_name, e.full_name as employee_name
            FROM senior_roles sr
            LEFT JOIN users u ON sr.submitted_by = u.id
            LEFT JOIN employees e ON sr.employee_id = e.id
            WHERE sr.employee_id = ?
            ORDER BY sr.created_at DESC
        `, [employeeId]);
        
        res.json({
            success: true,
            data: seniorRoles
        });
    } catch (error) {
        console.error('Error fetching senior roles by employee:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch senior roles by employee'
        });
    }
});

// Delete senior role request
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute('DELETE FROM senior_roles WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Senior role request not found'
            });
        }

        res.json({
            success: true,
            message: 'Senior role request deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting senior role request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete senior role request'
        });
    }
});

module.exports = router;
