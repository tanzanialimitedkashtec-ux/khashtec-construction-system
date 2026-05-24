const express = require('express');
const router = express.Router();

const db = require('../../database/config/database');

// Map short frontend role codes to full role names used in the users table
const ROLE_MAP = {
    'MD': 'Managing Director',
    'ADMIN': 'Managing Director',
    'HR': 'HR Manager',
    'FINANCE': 'Finance Manager',
    'PM': 'Project Manager',
    'RE': 'Real Estate Manager',
    'HSE': 'HSE Manager',
    'OPERATIONS': 'Office Assistant',
    'Managing Director': 'Managing Director',
    'HR Manager': 'HR Manager',
    'Finance Manager': 'Finance Manager',
    'Project Manager': 'Project Manager',
    'Real Estate Manager': 'Real Estate Manager',
    'HSE Manager': 'HSE Manager',
    'Office Assistant': 'Office Assistant',
    'Worker': 'Worker',
    'Customer': 'Customer'
};

// Get all procurement sales records
router.get('/', async (req, res) => {
    try {
        console.log('📋 GET /api/procurement-sales — fetching records from database');
        const procurementSales = await db.execute(`
            SELECT ps.*, u.name as submitted_by_name, ru.name as reviewed_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            LEFT JOIN users ru ON ps.reviewed_by = ru.id
            ORDER BY ps.created_at DESC
        `);
        console.log('📋 GET /api/procurement-sales — returned', procurementSales.length, 'records');
        
        res.json({
            success: true,
            data: procurementSales
        });
    } catch (error) {
        console.error('Error fetching procurement sales:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch procurement sales: ' + error.message
        });
    }
});

// Get procurement sales by status
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        
        const procurementSales = await db.execute(`
            SELECT ps.*, u.name as submitted_by_name, ru.name as reviewed_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            LEFT JOIN users ru ON ps.reviewed_by = ru.id
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
    console.log('🚀 POST /api/procurement-sales called');
    console.log('📥 Request body:', JSON.stringify(req.body));
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

        // Debug logging to see what fields are received
        console.log('📥 Received procurement sale request body:', req.body);
        console.log('🔍 Field values:', {
            requestTitle: typeof requestTitle,
            procurementType: typeof procurementType,
            itemDescription: typeof itemDescription,
            quantity: typeof quantity,
            totalBudget: typeof totalBudget,
            purpose: typeof purpose,
            department: typeof department
        });
        console.log('🔍 Field existence check:', {
            requestTitle: !!requestTitle,
            procurementType: !!procurementType,
            itemDescription: !!itemDescription,
            quantity: !!quantity,
            totalBudget: !!totalBudget,
            purpose: !!purpose,
            department: !!department
        });

        // Validate required fields
        if (!requestTitle || !procurementType || !itemDescription || !quantity || !totalBudget || !purpose || !department) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: requestTitle, procurementType, itemDescription, quantity, totalBudget, purpose, department'
            });
        }

        // Get user ID from request input or role name - use fallback to any existing user when needed
        let userId = req.body.userId ? parseInt(req.body.userId, 10) : null;
        console.log('🔍 Initial userId from request body:', userId);

        try {
            // Map short role codes to full role names used in the users table
            const mappedRole = requestedByRole ? (ROLE_MAP[requestedByRole] || requestedByRole) : null;
            console.log('🔍 Role mapping:', requestedByRole, '->', mappedRole);

            if (!userId && mappedRole) {
                const roleRows = await db.execute(
                    'SELECT id FROM users WHERE role = ? LIMIT 1',
                    [mappedRole]
                );
                if (roleRows.length > 0) {
                    userId = roleRows[0].id;
                    console.log('✅ Found user by role:', mappedRole, 'ID:', userId);
                } else {
                    console.log('⚠️ No user found with role:', mappedRole);
                }
            }

            if (!userId && requestedBy) {
                const nameRows = await db.execute(
                    'SELECT id FROM users WHERE name = ? LIMIT 1',
                    [requestedBy]
                );
                if (nameRows.length > 0) {
                    userId = nameRows[0].id;
                    console.log('✅ Found user by name:', requestedBy, 'ID:', userId);
                } else {
                    console.log('⚠️ No user found with name:', requestedBy);
                }
            }

            if (!userId) {
                const anyUserRows = await db.execute(
                    'SELECT id FROM users ORDER BY id LIMIT 1'
                );
                if (anyUserRows.length > 0) {
                    userId = anyUserRows[0].id;
                    console.log('✅ Falling back to first available user ID:', userId);
                }
            }
        } catch (userError) {
            console.error('⚠️ Error during user lookup for submitted_by:', userError.message);
        }

        // Final fallback: use userId 1 (admin) when all lookups fail
        if (!userId) {
            userId = 1;
            console.log('⚠️ Using default user ID 1 as final fallback');
        }
        console.log('🔍 Final resolved userId:', userId);

        console.log('💾 About to execute INSERT with userId:', userId);
            
        const result = await db.execute(`
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
            requestedBy || 'Unknown',
            requestedByRole || 'Employee',
            justification || null,
            approvalRequirements || 'Standard',
            userId
        ]);
        console.log('✅ INSERT result:', JSON.stringify(result));

        // Get the created procurement sale request
        const insertId = result.insertId;
        const newRequest = await db.execute(`
            SELECT ps.*, u.name as submitted_by_name, ru.name as reviewed_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            LEFT JOIN users ru ON ps.reviewed_by = ru.id
            WHERE ps.id = ?
        `, [insertId]);
        console.log('✅ Fetched new record, rows:', newRequest.length);

        // Create notification for Finance and Procurement departments
        try {
            await db.execute(`
                INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
                VALUES (?, ?, 'info', 'Medium', ?, NOW())
            `, [
                'New Procurement Sale Request',
                `${requestedByRole || 'User'} submitted procurement request: ${requestTitle} (Budget: ${totalBudget})`,
                userId
            ]);
        } catch (notifError) {
            console.error('⚠️ Notification insert failed (non-fatal):', notifError.message);
        }

        res.json({
            success: true,
            data: newRequest[0] || result
        });
    } catch (error) {
        console.error('Error creating procurement sale request:', error);
        console.error('Error stack:', error.stack);
        console.error('Request body:', req.body);
        res.status(500).json({
            success: false,
            error: 'Failed to create procurement sale request: ' + error.message
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

        // Get reviewer user ID — map short codes to full role names
        const mappedReviewerRole = reviewedByRole ? (ROLE_MAP[reviewedByRole] || reviewedByRole) : null;
        let reviewerId = null;
        if (mappedReviewerRole) {
            const reviewerRows = await db.execute(
                'SELECT id FROM users WHERE role = ? LIMIT 1',
                [mappedReviewerRole]
            );
            if (reviewerRows.length > 0) {
                reviewerId = reviewerRows[0].id;
            }
        }
        if (!reviewerId) {
            const anyRows = await db.execute('SELECT id FROM users ORDER BY id LIMIT 1');
            reviewerId = anyRows.length > 0 ? anyRows[0].id : 1;
        }

        // Update procurement sale request
        const result = await db.execute(`
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
        const updatedRequest = await db.execute(`
            SELECT ps.*, u.name as submitted_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            WHERE ps.id = ?
        `, [id]);

        // Create notification for the requester
        try {
            const requesterId = updatedRequest[0] ? updatedRequest[0].submitted_by : reviewerId;
            await db.execute(`
                INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
                VALUES (?, ?, 'info', 'Medium', ?, NOW())
            `, [
                `Procurement Request ${status}`,
                `Your procurement request "${updatedRequest[0] ? updatedRequest[0].request_title : id}" has been ${status.toLowerCase()}`,
                requesterId
            ]);
        } catch (notifError) {
            console.error('⚠️ Notification insert failed (non-fatal):', notifError.message);
        }

        res.json({
            success: true,
            data: updatedRequest[0] || { id, status }
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
        const summary = await db.execute(`
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
        
        const procurementSales = await db.execute(`
            SELECT ps.*, u.name as submitted_by_name, ru.name as reviewed_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            LEFT JOIN users ru ON ps.reviewed_by = ru.id
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

        const result = await db.execute('DELETE FROM procurement_sales WHERE id = ?', [id]);

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
