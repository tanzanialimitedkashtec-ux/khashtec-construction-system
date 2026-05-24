const express = require('express');
const router = express.Router();

console.log('📦 Procurement Sales route file loading...');

let db;
try {
    db = require('../../database/config/database');
    console.log('✅ Procurement Sales database module loaded');
} catch (error) {
    console.error('❌ Procurement Sales database module failed to load:', error.message);
}

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

// Ensure the procurement_sales table exists on startup
async function ensureTables() {
    if (!db) return;
    try {
        console.log('🔄 Ensuring procurement_sales table exists...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS procurement_sales (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_title VARCHAR(255) NOT NULL,
                procurement_type VARCHAR(50) NOT NULL,
                item_description TEXT NOT NULL,
                quantity INT NOT NULL,
                unit_price DECIMAL(12,2) DEFAULT 0,
                total_budget DECIMAL(12,2) NOT NULL,
                purpose TEXT NOT NULL,
                urgency_level VARCHAR(50) DEFAULT 'Normal',
                expected_delivery_date DATE NULL,
                supplier_requirements TEXT NULL,
                technical_specifications TEXT NULL,
                budget_allocation VARCHAR(100) NULL,
                department VARCHAR(100) NOT NULL,
                requested_by VARCHAR(255) NOT NULL,
                requested_by_role VARCHAR(100) NOT NULL,
                justification TEXT NULL,
                approval_requirements VARCHAR(50) DEFAULT 'Standard',
                status VARCHAR(50) DEFAULT 'Pending',
                reviewed_by INT NULL,
                reviewed_date TIMESTAMP NULL,
                review_comments TEXT NULL,
                approved_budget DECIMAL(12,2) NULL,
                rejection_reason TEXT NULL,
                submitted_by INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL,
                updated_by INT NULL
            )
        `);
        console.log('✅ procurement_sales table ensured');
    } catch (err) {
        console.error('⚠️ Error ensuring procurement_sales table:', err.message);
    }
}

// Call ensureTables on load (non-blocking)
ensureTables().catch(e => console.error('ensureTables error:', e.message));

// Helper: extract rows from db.execute result (handles both array and direct result)
function getRows(result) {
    if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
        return result[0]; // [rows, fields] format
    }
    return result; // already rows
}

// Helper: extract result header from db.execute (for INSERT/UPDATE/DELETE)
function getResultHeader(result) {
    if (Array.isArray(result) && result.length > 0 && !Array.isArray(result[0])) {
        return result[0]; // [ResultSetHeader, fields] format
    }
    return result; // already ResultSetHeader
}

// Get all procurement sales records
router.get('/', async (req, res) => {
    try {
        if (!db) {
            return res.json({ success: true, data: [] });
        }
        console.log('📋 GET /api/procurement-sales — fetching from database');
        const rawResult = await db.execute(`
            SELECT ps.*, u.name as submitted_by_name, ru.name as reviewed_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            LEFT JOIN users ru ON ps.reviewed_by = ru.id
            ORDER BY ps.created_at DESC
        `);
        const procurementSales = getRows(rawResult);
        console.log('📋 GET /api/procurement-sales — returned', Array.isArray(procurementSales) ? procurementSales.length : 0, 'records');
        
        res.json({
            success: true,
            data: Array.isArray(procurementSales) ? procurementSales : []
        });
    } catch (error) {
        console.error('❌ Error fetching procurement sales:', error.message);
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
        const rawResult = await db.execute(`
            SELECT ps.*, u.name as submitted_by_name, ru.name as reviewed_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            LEFT JOIN users ru ON ps.reviewed_by = ru.id
            WHERE ps.status = ?
            ORDER BY ps.created_at DESC
        `, [status]);
        const procurementSales = getRows(rawResult);
        
        res.json({
            success: true,
            data: Array.isArray(procurementSales) ? procurementSales : []
        });
    } catch (error) {
        console.error('Error fetching procurement sales by status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch procurement sales by status: ' + error.message
        });
    }
});

// Create new procurement sale request
router.post('/', async (req, res) => {
    console.log('🚀 POST /api/procurement-sales called');
    console.log('📥 Request body:', JSON.stringify(req.body));
    try {
        if (!db) {
            return res.status(503).json({
                success: false,
                error: 'Database not available. Please try again later.'
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

        console.log('🔍 Field check:', {
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

        // Resolve user ID
        let userId = req.body.userId ? parseInt(req.body.userId, 10) : null;
        console.log('🔍 Initial userId from body:', userId);

        try {
            const mappedRole = requestedByRole ? (ROLE_MAP[requestedByRole] || requestedByRole) : null;
            console.log('🔍 Role mapping:', requestedByRole, '->', mappedRole);

            if (!userId && mappedRole) {
                const roleRows = getRows(await db.execute(
                    'SELECT id FROM users WHERE role = ? LIMIT 1',
                    [mappedRole]
                ));
                if (Array.isArray(roleRows) && roleRows.length > 0) {
                    userId = roleRows[0].id;
                    console.log('✅ Found user by role:', mappedRole, '→ ID:', userId);
                }
            }

            if (!userId && requestedBy) {
                const nameRows = getRows(await db.execute(
                    'SELECT id FROM users WHERE name = ? LIMIT 1',
                    [requestedBy]
                ));
                if (Array.isArray(nameRows) && nameRows.length > 0) {
                    userId = nameRows[0].id;
                    console.log('✅ Found user by name:', requestedBy, '→ ID:', userId);
                }
            }

            if (!userId) {
                const anyRows = getRows(await db.execute(
                    'SELECT id FROM users ORDER BY id LIMIT 1'
                ));
                if (Array.isArray(anyRows) && anyRows.length > 0) {
                    userId = anyRows[0].id;
                    console.log('✅ Using first available user → ID:', userId);
                }
            }
        } catch (userError) {
            console.error('⚠️ User lookup error (non-fatal):', userError.message);
        }

        if (!userId) {
            userId = 1;
            console.log('⚠️ Final fallback → userId = 1');
        }
        console.log('🔍 Final userId for INSERT:', userId);

        // Ensure table exists before inserting
        await ensureTables();

        console.log('💾 Executing INSERT...');
        const insertResult = await db.execute(`
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
            parseInt(quantity, 10) || 0,
            parseFloat(unitPrice) || 0,
            parseFloat(totalBudget) || 0,
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
        const resultHeader = getResultHeader(insertResult);
        console.log('✅ INSERT result:', JSON.stringify(resultHeader));

        // Get the created record
        let newRecord = null;
        try {
            const insertId = resultHeader.insertId;
            if (insertId) {
                const newRows = getRows(await db.execute(`
                    SELECT ps.*, u.name as submitted_by_name
                    FROM procurement_sales ps
                    LEFT JOIN users u ON ps.submitted_by = u.id
                    WHERE ps.id = ?
                `, [insertId]));
                newRecord = Array.isArray(newRows) && newRows.length > 0 ? newRows[0] : null;
            }
        } catch (fetchError) {
            console.error('⚠️ Fetch new record error (non-fatal):', fetchError.message);
        }

        // Create notification (non-fatal)
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

        console.log('✅ POST /api/procurement-sales — SUCCESS');
        res.json({
            success: true,
            data: newRecord || { id: resultHeader.insertId, request_title: requestTitle, status: 'Pending' }
        });
    } catch (error) {
        console.error('❌ POST /api/procurement-sales ERROR:', error.message);
        console.error('❌ Stack:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Failed to create procurement sale: ' + error.message
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

        // Resolve reviewer user ID
        const mappedReviewerRole = reviewedByRole ? (ROLE_MAP[reviewedByRole] || reviewedByRole) : null;
        let reviewerId = null;
        try {
            if (mappedReviewerRole) {
                const reviewerRows = getRows(await db.execute(
                    'SELECT id FROM users WHERE role = ? LIMIT 1',
                    [mappedReviewerRole]
                ));
                if (Array.isArray(reviewerRows) && reviewerRows.length > 0) {
                    reviewerId = reviewerRows[0].id;
                }
            }
            if (!reviewerId) {
                const anyRows = getRows(await db.execute('SELECT id FROM users ORDER BY id LIMIT 1'));
                reviewerId = (Array.isArray(anyRows) && anyRows.length > 0) ? anyRows[0].id : 1;
            }
        } catch (e) {
            reviewerId = 1;
        }

        const updateResult = await db.execute(`
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
        const result = getResultHeader(updateResult);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Procurement sale request not found'
            });
        }

        // Get updated request
        const updatedRows = getRows(await db.execute(`
            SELECT ps.*, u.name as submitted_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            WHERE ps.id = ?
        `, [id]));
        const updatedRequest = Array.isArray(updatedRows) && updatedRows.length > 0 ? updatedRows[0] : null;

        // Create notification (non-fatal)
        try {
            const requesterId = updatedRequest ? updatedRequest.submitted_by : reviewerId;
            await db.execute(`
                INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
                VALUES (?, ?, 'info', 'Medium', ?, NOW())
            `, [
                `Procurement Request ${status}`,
                `Your procurement request "${updatedRequest ? updatedRequest.request_title : id}" has been ${status.toLowerCase()}`,
                requesterId
            ]);
        } catch (notifError) {
            console.error('⚠️ Notification insert failed (non-fatal):', notifError.message);
        }

        res.json({
            success: true,
            data: updatedRequest || { id, status }
        });
    } catch (error) {
        console.error('Error updating procurement sale status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update procurement sale status: ' + error.message
        });
    }
});

// Get procurement sales summary
router.get('/summary', async (req, res) => {
    try {
        const rawResult = await db.execute(`
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
        const summary = getRows(rawResult);

        res.json({
            success: true,
            data: Array.isArray(summary) && summary.length > 0 ? summary[0] : {}
        });
    } catch (error) {
        console.error('Error fetching procurement sales summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch procurement sales summary: ' + error.message
        });
    }
});

// Get procurement sales by department
router.get('/department/:department', async (req, res) => {
    try {
        const { department } = req.params;
        
        const rawResult = await db.execute(`
            SELECT ps.*, u.name as submitted_by_name, ru.name as reviewed_by_name
            FROM procurement_sales ps
            LEFT JOIN users u ON ps.submitted_by = u.id
            LEFT JOIN users ru ON ps.reviewed_by = ru.id
            WHERE ps.department = ?
            ORDER BY ps.created_at DESC
        `, [department]);
        const procurementSales = getRows(rawResult);
        
        res.json({
            success: true,
            data: Array.isArray(procurementSales) ? procurementSales : []
        });
    } catch (error) {
        console.error('Error fetching procurement sales by department:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch procurement sales by department: ' + error.message
        });
    }
});

// Delete procurement sale request
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deleteResult = await db.execute('DELETE FROM procurement_sales WHERE id = ?', [id]);
        const result = getResultHeader(deleteResult);

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
            error: 'Failed to delete procurement sale request: ' + error.message
        });
    }
});

module.exports = router;
