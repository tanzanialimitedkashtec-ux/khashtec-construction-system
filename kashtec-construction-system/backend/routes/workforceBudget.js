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
            SELECT id, department, total_budget, salaries_wages, training_development, 
                   employee_benefits, recruitment_costs, status, submission_date,
                   approved_by, approval_date, justification
            FROM workforce_budgets 
            ORDER BY submission_date DESC
        `);
        
        res.json(rows);
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
            SELECT id, department, total_budget, salaries_wages, training_development, 
                   employee_benefits, recruitment_costs, status, submission_date,
                   approved_by, approval_date, justification
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

// POST approve budget
router.post('/:id/approve', async (req, res) => {
    try {
        console.log('✅ Approving workforce budget:', req.params.id);
        const approvedBy = req.body.approved_by || 'Managing Director';
        const approvalDate = new Date().toISOString().split('T')[0];
        
        // Update workforce_budgets table
        const result = await db.execute(`
            UPDATE workforce_budgets 
            SET status = 'approved', approved_by = ?, approval_date = ?
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
        
        // Insert into workforce_budget_rejections table
        await db.execute(`
            INSERT INTO workforce_budget_rejections 
            (budget_id, rejection_reason, rejected_by, rejected_date)
            VALUES (?, ?, ?, ?)
        `, [req.params.id, rejection_reason || 'Budget does not meet requirements', rejectedBy, rejectedDate]);
        
        // Update main budget status
        await db.execute(`
            UPDATE workforce_budgets 
            SET status = 'rejected'
            WHERE id = ?
        `, [req.params.id]);
        
        console.log('✅ Workforce budget rejected successfully');
        
        res.json({
            message: 'Workforce budget rejected successfully',
            budget_id: req.params.id,
            status: 'rejected',
            rejection_reason: rejection_reason || 'Budget does not meet requirements',
            rejected_by: rejectedBy,
            rejected_date: rejectedDate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error rejecting workforce budget:', error);
        res.status(500).json({ error: 'Failed to reject workforce budget' });
    }
});

// POST modify budget
router.post('/:id/modify', async (req, res) => {
    try {
        console.log('🔄 Requesting modification for workforce budget:', req.params.id);
        const { modification_request } = req.body;
        const requestedBy = req.body.requested_by || 'Managing Director';
        const requestedDate = new Date().toISOString().split('T')[0];
        
        // Insert into workforce_budget_modifications table
        await db.execute(`
            INSERT INTO workforce_budget_modifications 
            (budget_id, modification_request, requested_by, requested_date, status)
            VALUES (?, ?, ?, ?, 'pending')
        `, [req.params.id, modification_request || 'Please provide additional details', requestedBy, requestedDate]);
        
        // Update main budget status
        await db.execute(`
            UPDATE workforce_budgets 
            SET status = 'modification_requested'
            WHERE id = ?
        `, [req.params.id]);
        
        console.log('✅ Workforce budget modification requested successfully');
        
        res.json({
            message: 'Workforce budget modification requested successfully',
            budget_id: req.params.id,
            status: 'modification_requested',
            modification_request: modification_request || 'Please provide additional details',
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
