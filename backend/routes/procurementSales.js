const express = require('express');
const router = express.Router();

let db;
try {
    db = require('../src/config/database');
} catch (error) {
    console.error('Database connection error:', error);
    db = null;
}

// Get all procurement sales records
router.get('/', async (req, res) => {
    try {
        if (!db) {
            // Return mock data when database is not available
            const mockData = [
                {
                    id: 1,
                    request_title: 'Office Computers Purchase',
                    procurement_type: 'Goods',
                    item_description: 'High-performance laptops for staff',
                    quantity: 10,
                    unit_price: 2500000.00,
                    total_budget: 25000000.00,
                    purpose: 'Replace outdated office equipment',
                    urgency_level: 'Normal',
                    expected_delivery_date: '2024-02-15',
                    department: 'IT',
                    requested_by: 'John Doe',
                    requested_by_role: 'IT Manager',
                    status: 'Pending',
                    submitted_by_name: 'John Doe',
                    created_at: new Date().toISOString()
                }
            ];
            return res.json({
                success: true,
                data: mockData
            });
        }

        const [procurementSales] = await db.execute(`
            SELECT ps.*, u.name as submitted_by_name, ru.name as reviewed_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            LEFT JOIN users ru ON ps.reviewed_by = ru.id
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
    console.log('📥 Request body:', req.body);
    try {
        if (!db) {
            // Return mock response when database is not available
            const mockResponse = {
                id: Math.floor(Math.random() * 1000) + 1,
                request_title: req.body.requestTitle || 'Mock Request',
                procurement_type: req.body.procurementType || 'Goods',
                item_description: req.body.itemDescription || 'Mock item',
                quantity: req.body.quantity || 1,
                unit_price: req.body.unitPrice || 0,
                total_budget: req.body.totalBudget || 0,
                purpose: req.body.purpose || 'Mock purpose',
                urgency_level: req.body.urgencyLevel || 'Normal',
                expected_delivery_date: req.body.expectedDeliveryDate || null,
                supplier_requirements: req.body.supplierRequirements || null,
                technical_specifications: req.body.technicalSpecifications || null,
                budget_allocation: req.body.budgetAllocation || null,
                department: req.body.department || 'IT',
                requested_by: req.body.requestedBy || 'Mock User',
                requested_by_role: req.body.requestedByRole || 'Manager',
                justification: req.body.justification || null,
                approval_requirements: req.body.approvalRequirements || 'Standard',
                status: 'Pending',
                submitted_by_name: req.body.requestedBy || 'Mock User',
                created_at: new Date().toISOString()
            };
            
            return res.json({
                success: true,
                data: mockResponse
            });
        }

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

        // Get user ID from role name - use fallback if no user found
        let userId = 1; // Default fallback user ID
        if (requestedByRole && db) {
            try {
                const [userRows] = await db.execute(
                    'SELECT id FROM users WHERE role = ? LIMIT 1',
                    [requestedByRole]
                );

                if (userRows.length > 0) {
                    userId = userRows[0].id;
                    console.log('Found user with role:', requestedByRole, 'ID:', userId);
                } else {
                    console.log('No user found with role:', requestedByRole, 'Using default user ID:', userId);
                }
            } catch (userError) {
                console.log('Error looking up user role:', userError.message, 'Using default user ID:', userId);
            }
        } else {
            console.log('Using default user ID:', userId, '(no role provided or no database)');
        }

        try {
            console.log('About to execute INSERT...');
            console.log('Database available:', !!db);
            console.log('Parameters:', {
                requestTitle, procurementType, itemDescription, quantity, 
                unitPrice: unitPrice || 0, totalBudget, purpose, 
                urgencyLevel: urgencyLevel || 'Normal', expectedDeliveryDate, 
                supplierRequirements, technicalSpecifications, budgetAllocation, 
                department, requestedBy, requestedByRole, justification, 
                approvalRequirements: approvalRequirements || 'Standard', userId
            });
            
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
                requestedBy || 'Unknown',
                requestedByRole || 'Employee',
                justification || null,
                approvalRequirements || 'Standard',
                userId
            ]);
            console.log('INSERT result:', result);
            // Get the created procurement sale request
            const [newRequest] = await db.execute(`
                SELECT ps.*, u.name as submitted_by_name, ru.name as reviewed_by_name
                FROM procurement_sales ps
                LEFT JOIN users u ON ps.submitted_by = u.id
                LEFT JOIN users ru ON ps.reviewed_by = ru.id
                WHERE ps.id = ?
            `, [result.insertId]);

        // Create notification for Finance and Procurement departments
        await db.execute(`
            INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
            VALUES (?, ?, 'info', 'Medium', ?, NOW())
        `, [
            'New Procurement Sale Request',
            `${requestedByRole || 'User'} submitted procurement request: ${requestTitle} (Budget: ${totalBudget})`,
            requesterId
        ]);

        res.json({
            success: true,
            data: newRequest[0]
        });
        } catch (dbError) {
            console.error('Database error during INSERT:', dbError);
            return res.status(500).json({
                success: false,
                error: 'Database error: ' + dbError.message
            });
        }
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
            SELECT ps.*, u.name as submitted_by_name
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
