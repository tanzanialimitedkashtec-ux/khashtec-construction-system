const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

console.log('🚀 Workforce budget routes loaded with database connection');

// Test GET route
router.get('/test', async (req, res) => {
    console.log('🧪 GET /api/workforce-budget/test accessed');
    try {
        const connection = await db.getConnection();
        await connection.query('SELECT 1');
        connection.release();
        res.json({ 
            message: 'Workforce budget API test endpoint working!',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Database connection failed', 
            error: error.message 
        });
    }
});

// Main GET route - fetch pending budget requests
router.get('/', async (req, res) => {
    console.log('📝 GET /api/workforce-budget accessed');
    try {
        const connection = await db.getConnection();
        
        const [rows] = await connection.query(`
            SELECT id, department, budget_amount, requested_amount, status, 
                   request_date, approval_date, requested_by, approved_by
            FROM workforce_budget 
            WHERE status IN ('pending', 'approved', 'rejected')
            ORDER BY request_date DESC
        `);
        
        connection.release();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching workforce budget requests:', error);
        res.status(500).json({ error: 'Failed to fetch workforce budget requests' });
    }
});

// GET by ID route
router.get('/:id', async (req, res) => {
    console.log('📝 GET /api/workforce-budget/:id accessed with id:', req.params.id);
    try {
        const connection = await db.getConnection();
        
        const [rows] = await connection.query(`
            SELECT * FROM workforce_budget WHERE id = ?
        `, [req.params.id]);
        
        connection.release();
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Workforce budget request not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching workforce budget request:', error);
        res.status(500).json({ error: 'Failed to fetch workforce budget request' });
    }
});

// Approve budget request
router.post('/:id/approve', async (req, res) => {
    console.log('✅ Approving workforce budget request:', req.params.id);
    try {
        const connection = await db.getConnection();
        const approvedBy = req.body.approved_by || 'Managing Director';
        const approvalDate = new Date().toISOString().split('T')[0];
        
        // Update main workforce_budget table
        const [result] = await connection.query(`
            UPDATE workforce_budget 
            SET status = 'approved', approval_date = ?, approved_by = ?
            WHERE id = ?
        `, [approvalDate, approvedBy, req.params.id]);
        
        if (result.affectedRows === 0) {
            connection.release();
            return res.status(404).json({ error: 'Workforce budget request not found' });
        }
        
        // Insert into workforce_budget_approvals table
        await connection.query(`
            INSERT INTO workforce_budget_approvals 
            (budget_request_id, approved_by, approval_date, notes, status)
            VALUES (?, ?, ?, ?, 'approved')
        `, [req.params.id, approvedBy, approvalDate, req.body.notes || '']);
        
        connection.release();
        
        res.json({
            message: 'Workforce budget request approved successfully',
            request_id: req.params.id,
            status: 'approved',
            approved_by: approvedBy,
            approved_date: approvalDate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error approving workforce budget request:', error);
        res.status(500).json({ error: 'Failed to approve workforce budget request' });
    }
});

// Request budget modification
router.post('/:id/modify', async (req, res) => {
    console.log('🔄 Requesting modification for workforce budget:', req.params.id);
    try {
        const connection = await db.getConnection();
        const requestedBy = req.body.requested_by || 'Managing Director';
        const requestDate = new Date().toISOString().split('T')[0];
        
        // Update main workforce_budget table
        const [result] = await connection.query(`
            UPDATE workforce_budget 
            SET status = 'modification_requested'
            WHERE id = ?
        `, [req.params.id]);
        
        if (result.affectedRows === 0) {
            connection.release();
            return res.status(404).json({ error: 'Workforce budget request not found' });
        }
        
        // Insert into workforce_budget_modifications table
        await connection.query(`
            INSERT INTO workforce_budget_modifications 
            (budget_request_id, requested_by, request_date, modification_details, status)
            VALUES (?, ?, ?, ?, 'pending')
        `, [req.params.id, requestedBy, requestDate, req.body.modification_details || '']);
        
        connection.release();
        
        res.json({
            message: 'Budget modification requested successfully',
            request_id: req.params.id,
            status: 'modification_requested',
            requested_by: requestedBy,
            request_date: requestDate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error requesting budget modification:', error);
        res.status(500).json({ error: 'Failed to request budget modification' });
    }
});

// Reject budget request
router.post('/:id/reject', async (req, res) => {
    console.log('❌ Rejecting workforce budget request:', req.params.id);
    try {
        const connection = await db.getConnection();
        const rejectedBy = req.body.rejected_by || 'Managing Director';
        const rejectionDate = new Date().toISOString().split('T')[0];
        
        // Update main workforce_budget table
        const [result] = await connection.query(`
            UPDATE workforce_budget 
            SET status = 'rejected'
            WHERE id = ?
        `, [req.params.id]);
        
        if (result.affectedRows === 0) {
            connection.release();
            return res.status(404).json({ error: 'Workforce budget request not found' });
        }
        
        // Insert into workforce_budget_reject table
        await connection.query(`
            INSERT INTO workforce_budget_reject 
            (budget_request_id, rejected_by, rejection_date, rejection_reason, status)
            VALUES (?, ?, ?, ?, 'rejected')
        `, [req.params.id, rejectedBy, rejectionDate, req.body.rejection_reason || '']);
        
        connection.release();
        
        res.json({
            message: 'Workforce budget request rejected successfully',
            request_id: req.params.id,
            status: 'rejected',
            rejected_by: rejectedBy,
            rejection_date: rejectionDate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error rejecting workforce budget request:', error);
        res.status(500).json({ error: 'Failed to reject workforce budget request' });
    }
});

module.exports = router;
