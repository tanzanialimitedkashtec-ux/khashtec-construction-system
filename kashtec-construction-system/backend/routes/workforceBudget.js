const express = require('express');
const router = express.Router();
const db = require('../src/config/database');

// Get all workforce budget requests
router.get('/', async (req, res) => {
    try {
        console.log('🔍 Fetching workforce budget requests...');
        console.log('📋 Request URL:', req.url);
        console.log('📝 Request method:', req.method);
        console.log('🌐 Request headers:', req.headers);
        
        // Test database connection first
        console.log('🧪 Testing database connection...');
        const [testResult] = await db.execute('SELECT 1 as test');
        console.log('✅ Database connection test passed:', testResult);
        
        // Check if workforce_budgets table exists
        console.log('🔍 Checking if workforce_budgets table exists...');
        const [tableCheck] = await db.execute('SHOW TABLES LIKE "workforce_budgets"');
        console.log('📊 Table check result:', tableCheck);
        
        if (tableCheck.length === 0) {
            console.log('❌ workforce_budgets table does not exist');
            return res.status(404).json({ 
                error: 'Workforce budget requests table not found',
                details: 'The workforce_budgets table may not have been created during migration'
            });
        }
        
        // Query workforce_budgets table
        console.log('🔍 Querying workforce_budgets table...');
        const [budgets] = await db.execute('SELECT * FROM workforce_budgets ORDER BY submission_date DESC');
        console.log('� Workforce budget requests found:', budgets.length);
        console.log('📊 Budgets data:', budgets);
        
        res.json(budgets);
    } catch (error) {
        console.error('❌ Error fetching workforce budget requests:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({ 
            error: 'Failed to fetch workforce budget requests',
            details: error.message,
            stack: error.stack
        });
    }
});

// Get specific workforce budget request
router.get('/:id', async (req, res) => {
    try {
        console.log('🔍 Fetching workforce budget request:', req.params.id);
        const [budgets] = await db.execute('SELECT * FROM workforce_budgets WHERE id = ?', [req.params.id]);
        
        if (budgets.length === 0) {
                return res.status(404).json({ error: 'Workforce budget request not found' });
        }
        
        res.json(budgets[0]);
    } catch (error) {
        console.error('❌ Error fetching workforce budget request:', error);
        res.status(500).json({ error: 'Failed to fetch workforce budget request' });
    }
});

// Approve workforce budget
router.post('/:id/approve', async (req, res) => {
    try {
        const { approvedBy, comments, approvedAmount } = req.body;
        const budgetId = req.params.id;
        
        console.log('✅ Approving workforce budget:', budgetId, 'by:', approvedBy, 'amount:', approvedAmount);
        
        // Update budget status
        await db.execute(
                'UPDATE workforce_budgets SET status = ?, approved_by = ?, approved_date = CURDATE() WHERE id = ?',
                ['Approved', approvedBy, budgetId]
        );
        
        // Add to approvals table
        await db.execute(
                'INSERT INTO workforce_budget_approvals (budget_id, approved_by, approved_by_role, comments, final_decision, approved_amount) VALUES (?, ?, ?, ?, ?, ?)',
                [budgetId, approvedBy, 'HR Manager', comments, 'Approved', approvedAmount]
        );
        
        // Get budget details for notification
        const [budgets] = await db.execute('SELECT * FROM workforce_budgets WHERE id = ?', [budgetId]);
        const budget = budgets[0];
        
        console.log('📧 Sending approval notification to:', budget.submitted_by);
        
        res.json({ 
                message: 'Workforce budget approved successfully',
                budget: {
                        ...budget,
                        status: 'Approved',
                        approved_by: approvedBy,
                        approved_date: new Date().toISOString().split('T')[0],
                        approved_amount: approvedAmount
                }
        });
    } catch (error) {
        console.error('❌ Error approving workforce budget:', error);
        res.status(500).json({ error: 'Failed to approve workforce budget' });
    }
});

// Reject workforce budget
router.post('/:id/reject', async (req, res) => {
    try {
        const { rejectionReason, rejectedBy } = req.body;
        const budgetId = req.params.id;
        
        console.log('❌ Rejecting workforce budget:', budgetId, 'by:', rejectedBy, 'reason:', rejectionReason);
        
        // Update budget status
        await db.execute(
                'UPDATE workforce_budgets SET status = ?, rejection_reason = ?, approved_by = ? WHERE id = ?',
                ['Rejected', rejectionReason, rejectedBy, budgetId]
        );
        
        // Add to rejections table
        await db.execute(
                'INSERT INTO workforce_budget_rejections (budget_id, rejection_reason, rejected_by, rejected_by_role) VALUES (?, ?, ?, ?)',
                [budgetId, rejectionReason, rejectedBy, 'HR Manager']
        );
        
        // Get budget details for notification
        const [budgets] = await db.execute('SELECT * FROM workforce_budgets WHERE id = ?', [budgetId]);
        const budget = budgets[0];
        
        console.log('📧 Sending rejection notification to:', budget.submitted_by);
        
        res.json({ 
                message: 'Workforce budget rejected successfully',
                budget: {
                        ...budget,
                        status: 'Rejected',
                        rejection_reason: rejectionReason,
                        approved_by: rejectedBy
                }
        });
    } catch (error) {
        console.error('❌ Error rejecting workforce budget:', error);
        res.status(500).json({ error: 'Failed to reject workforce budget' });
    }
});

// Request budget modification
router.post('/:id/modify', async (req, res) => {
    try {
        const { modificationRequest, requestedBy } = req.body;
        const budgetId = req.params.id;
        
        console.log('🔄 Requesting modification for workforce budget:', budgetId, 'by:', requestedBy);
        
        // Update budget status
        await db.execute(
                'UPDATE workforce_budgets SET status = ?, modification_request = ? WHERE id = ?',
                ['Modification Requested', modificationRequest, budgetId]
        );
        
        // Add to modifications table
        await db.execute(
                'INSERT INTO workforce_budget_modifications (budget_id, modification_request, requested_by, requested_by_role) VALUES (?, ?, ?, ?)',
                [budgetId, modificationRequest, requestedBy, 'HR Manager']
        );
        
        // Get budget details for notification
        const [budgets] = await db.execute('SELECT * FROM workforce_budgets WHERE id = ?', [budgetId]);
        const budget = budgets[0];
        
        console.log('📧 Sending modification request notification to:', budget.submitted_by);
        
        res.json({ 
                message: 'Budget modification requested successfully',
                budget: {
                        ...budget,
                        status: 'Modification Requested',
                        modification_request: modificationRequest
                }
        });
    } catch (error) {
        console.error('❌ Error requesting budget modification:', error);
        res.status(500).json({ error: 'Failed to request budget modification' });
    }
});

// Get approval history for a budget
router.get('/:id/approvals', async (req, res) => {
    try {
        console.log('🔍 Fetching approval history for budget:', req.params.id);
        const [approvals] = await db.execute(
                'SELECT * FROM workforce_budget_approvals WHERE budget_id = ? ORDER BY approval_date DESC',
                [req.params.id]
        );
        res.json(approvals);
    } catch (error) {
        console.error('❌ Error fetching approval history:', error);
        res.status(500).json({ error: 'Failed to fetch approval history' });
    }
});

// Get rejection history for a budget
router.get('/:id/rejections', async (req, res) => {
    try {
        console.log('🔍 Fetching rejection history for budget:', req.params.id);
        const [rejections] = await db.execute(
                'SELECT * FROM workforce_budget_rejections WHERE budget_id = ? ORDER BY rejection_date DESC',
                [req.params.id]
        );
        res.json(rejections);
    } catch (error) {
        console.error('❌ Error fetching rejection history:', error);
        res.status(500).json({ error: 'Failed to fetch rejection history' });
    }
});

// Get modification history for a budget
router.get('/:id/modifications', async (req, res) => {
    try {
        console.log('🔍 Fetching modification history for budget:', req.params.id);
        const [modifications] = await db.execute(
                'SELECT * FROM workforce_budget_modifications WHERE budget_id = ? ORDER BY request_date DESC',
                [req.params.id]
        );
        res.json(modifications);
    } catch (error) {
        console.error('❌ Error fetching modification history:', error);
        res.status(500).json({ error: 'Failed to fetch modification history' });
    }
});

module.exports = router;
