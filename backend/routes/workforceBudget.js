const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

console.log('?? Workforce budget routes loaded with database connection');

// Test GET route
router.get('/test', (req, res) => {
    console.log('?? GET /api/workforce-budget/test accessed');
    res.json({ 
        message: 'Workforce budget API test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// Main GET route - fetch all workforce budgets
router.get('/', async (req, res) => {
    console.log('📝 GET /api/workforce-budget accessed');
    try {
        const rows = await db.execute(`
            SELECT 
                id,
                department,
                budget_period,
                total_proposed,
                salaries_wages,
                employee_benefits,
                recruitment_costs,
                training_development,
                travel_transport,
                miscellaneous,
                justification,
                submitted_by,
                submitted_by_role,
                submission_date,
                submission_date AS start_date,
                approved_date AS end_date,
                status,
                approved_by,
                approved_date,
                rejection_reason,
                modification_request,
                current_headcount
            FROM workforce_budgets 
            ORDER BY submission_date DESC
        `);
        
        // Ensure we always return an array
        const budgetsArray = Array.isArray(rows) ? rows : [rows];
        console.log('📊 Returning workforce budgets array:', budgetsArray.length, 'items');
        res.json(budgetsArray);
    } catch (error) {
        console.error('Error fetching workforce budgets:', error);
        res.status(500).json({ error: 'Failed to fetch workforce budgets' });
    }
});


// GET by ID route - fetch specific workforce budget
router.get('/:id', async (req, res) => {
    console.log('?? GET /api/workforce-budget/:id accessed with id:', req.params.id);
    try {
        const rows = await db.execute(`
            SELECT 
                id, 
                department, 
                budget_period, 
                total_proposed as total_budget, 
                salaries_wages, 
                training_development, 
                employee_benefits, 
                recruitment_costs, 
                travel_transport,
                miscellaneous,
                status, 
                submission_date,
                approved_by, 
                approved_date as approval_date, 
                justification,
                current_headcount
            FROM workforce_budgets 
            WHERE id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Workforce budget not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching workforce budget:', error);
        res.status(500).json({ error: 'Failed to fetch workforce budget' });
    }
});

// POST create new budget
router.post('/', async (req, res) => {
    console.log(' Creating new workforce budget...');
    console.log(' Request body:', req.body);
    
    try {
        const {
            department,
            total_budget,
            salaries_wages,
            training_development,
            employee_benefits,
            recruitment_costs,
            travel_transport,
            miscellaneous,
            justification,
            submitted_by,
            budget_period
        } = req.body;
        
        // Validate required fields
        const isMissing = (val) => val === undefined || val === null || val === '';
        if (isMissing(department) || isMissing(total_budget) || isMissing(salaries_wages) || isMissing(training_development) || isMissing(employee_benefits) || isMissing(recruitment_costs)) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['department', 'total_budget', 'salaries_wages', 'training_development', 'employee_benefits', 'recruitment_costs']
            });
        }
        
        // Generate unique budget ID
        const budgetId = `BUD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Insert new budget — store department in its own column and budget_period separately
        const result = await db.execute(`
            INSERT INTO workforce_budgets (
                id, department, budget_period, total_proposed, salaries_wages, training_development,
                employee_benefits, recruitment_costs, travel_transport, miscellaneous, status, submission_date,
                justification, submitted_by, submitted_by_role, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', CURDATE(), ?, ?, ?, NOW(), NOW())
        `, [
            budgetId,
            department,
            budget_period || 'monthly',
            total_budget,
            salaries_wages,
            training_development,
            employee_benefits,
            recruitment_costs,
            travel_transport || 0,
            miscellaneous || 0,
            justification || 'No justification provided',
            submitted_by || 'Finance Manager',
            'Finance Manager'
        ]);
        
        console.log(' Workforce budget created successfully:', budgetId);
        
        res.status(201).json({
            message: 'Workforce budget created successfully',
            budget_id: budgetId,
            budget_period: budget_period || 'monthly',
            total_proposed: total_budget,
            status: 'pending',
            submission_date: new Date().toISOString().split('T')[0]
        });
        
    } catch (error) {
        console.error('Error creating workforce budget:', error);
        res.status(500).json({
            error: 'Failed to create workforce budget',
            details: error.message
        });
    }
});

// POST approve budget
router.post('/:id/approve', async (req, res) => {
    try {
        console.log('✅ Approving workforce budget:', req.params.id);
        const approvedBy = req.body.approved_by || 'Managing Director';
        const approvalDate = new Date().toISOString().split('T')[0];
        
        // Update workforce_budgets table
        const result = await db.execute(`
            UPDATE workforce_budgets 
            SET status = 'Approved', approved_by = ?, approved_date = ?, rejection_reason = NULL, modification_request = NULL
            WHERE id = ?
        `, [approvedBy, approvalDate, req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Workforce budget not found'
            });
        }
        
        console.log('✅ Workforce budget approved successfully');
        
        res.json({
            message: 'Workforce budget approved successfully',
            budget_id: req.params.id,
            status: 'approved',
            approved_by: approvedBy,
            approved_date: approvalDate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error approving workforce budget:', error);
        res.status(500).json({ error: 'Failed to approve workforce budget' });
    }
});

// POST reject budget
router.post('/:id/reject', async (req, res) => {
    try {
        console.log('❌ Rejecting workforce budget:', req.params.id);
        const { rejection_reason } = req.body;
        const rejectedBy = req.body.rejected_by || 'Managing Director';
        const rejectedDate = new Date().toISOString().split('T')[0];
        const reason = rejection_reason || 'Budget does not meet requirements';
        
        // Update main budget status AND store the rejection reason directly
        await db.execute(`
            UPDATE workforce_budgets 
            SET status = 'Rejected', rejection_reason = ?
            WHERE id = ?
        `, [reason, req.params.id]);

        // Also insert into workforce_budget_rejections table if it exists
        try {
            await db.execute(`
                INSERT INTO workforce_budget_rejections 
                (budget_id, rejection_reason, rejected_by, rejection_date)
                VALUES (?, ?, ?, ?)
            `, [req.params.id, reason, rejectedBy, rejectedDate]);
        } catch (tableErr) {
            // Table may not exist — not fatal
            console.warn('workforce_budget_rejections insert skipped:', tableErr.message);
        }
        
        console.log('✅ Workforce budget rejected successfully');
        
        res.json({
            message: 'Workforce budget rejected successfully',
            budget_id: req.params.id,
            status: 'Rejected',
            rejection_reason: reason,
            rejected_by: rejectedBy,
            rejected_date: rejectedDate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error rejecting workforce budget:', error);
        res.status(500).json({ error: 'Failed to reject workforce budget' });
    }
});

// POST modify budget (info request)
router.post('/:id/modify', async (req, res) => {
    try {
        console.log('🔄 Requesting modification for workforce budget:', req.params.id);
        const { modification_request } = req.body;
        const requestedBy = req.body.requested_by || 'Managing Director';
        const requestedDate = new Date().toISOString().split('T')[0];
        const reason = modification_request || 'Please provide additional details';
        
        // Update main budget status AND store the modification_request directly
        await db.execute(`
            UPDATE workforce_budgets 
            SET status = 'Modification Requested', modification_request = ?
            WHERE id = ?
        `, [reason, req.params.id]);

        // Also insert into workforce_budget_modifications table if it exists
        try {
            await db.execute(`
                INSERT INTO workforce_budget_modifications 
                (budget_id, modification_request, requested_by, request_date, status)
                VALUES (?, ?, ?, ?, 'pending')
            `, [req.params.id, reason, requestedBy, requestedDate]);
        } catch (tableErr) {
            // Table may not exist — not fatal
            console.warn('workforce_budget_modifications insert skipped:', tableErr.message);
        }
        
        console.log('✅ Workforce budget modification requested successfully');
        
        res.json({
            message: 'Workforce budget modification requested successfully',
            budget_id: req.params.id,
            status: 'Modification Requested',
            modification_request: reason,
            requested_by: requestedBy,
            requested_date: requestedDate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error requesting modification for workforce budget:', error);
        res.status(500).json({ error: 'Failed to request modification for workforce budget' });
    }
});

module.exports = router;
