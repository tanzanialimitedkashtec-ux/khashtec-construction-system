const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

console.log('🚀 Senior hiring routes loaded with database connection');

// Test GET route
router.get('/test', (req, res) => {
    console.log('🧪 GET /api/senior-hiring/test accessed');
    res.json({ 
        message: 'Senior hiring API test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// Main GET route - fetch pending senior hiring requests
router.get('/', async (req, res) => {
    console.log('📝 GET /api/senior-hiring accessed');
    try {
        const connection = await db.getConnection();
        
        // Fetch pending senior hiring requests from senior_hiring_approval table
        const [rows] = await connection.query(`
            SELECT id, candidate_name, position, department, proposed_salary, experience, 
                   hr_recommendation, status, request_date, approval_date, approved_by
            FROM senior_hiring_approval 
            WHERE status = 'pending'
            ORDER BY request_date DESC
        `);
        
        connection.release();
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching senior hiring requests:', error);
        res.status(500).json({ error: 'Failed to fetch senior hiring requests' });
    }
});

// GET by ID route - fetch specific senior hiring request
router.get('/:id', async (req, res) => {
    console.log('📝 GET /api/senior-hiring/:id accessed with id:', req.params.id);
    try {
        const connection = await db.getConnection();
        
        const [rows] = await connection.query(`
            SELECT id, candidate_name, position, department, proposed_salary, experience, 
                   hr_recommendation, status, request_date, approval_date, approved_by
            FROM senior_hiring_approval 
            WHERE id = ?
        `, [req.params.id]);
        
        connection.release();
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Senior hiring request not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching senior hiring request:', error);
        res.status(500).json({ error: 'Failed to fetch senior hiring request' });
    }
});

// Approve senior hiring request
router.post('/:id/approve', async (req, res) => {
    console.log('✅ Approving senior hiring request:', req.params.id);
    try {
        const connection = await db.getConnection();
        const approvedBy = req.body.approved_by || 'Managing Director';
        const approvalDate = new Date().toISOString().split('T')[0];
        
        // Update the senior_hiring_approval table
        const [result] = await connection.query(`
            UPDATE senior_hiring_approval 
            SET status = 'approved', approval_date = ?, approved_by = ?
            WHERE id = ?
        `, [approvalDate, approvedBy, req.params.id]);
        
        if (result.affectedRows === 0) {
            connection.release();
            return res.status(404).json({ error: 'Senior hiring request not found' });
        }
        
        connection.release();
        
        res.json({
            message: 'Senior hiring request approved successfully',
            request_id: req.params.id,
            status: 'approved',
            approved_by: approvedBy,
            approved_date: approvalDate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error approving senior hiring request:', error);
        res.status(500).json({ error: 'Failed to approve senior hiring request' });
    }
});

// Request more information
router.post('/:id/request-info', async (req, res) => {
    console.log('🔄 Requesting more info for senior hiring request:', req.params.id);
    try {
        const connection = await db.getConnection();
        const { info_request } = req.body;
        const requestedBy = req.body.requested_by || 'Managing Director';
        const requestedDate = new Date().toISOString().split('T')[0];
        
        // Insert into senior_hiring_info_request table
        const [result] = await connection.query(`
            INSERT INTO senior_hiring_info_request 
            (hiring_request_id, info_request, requested_by, requested_date, status)
            VALUES (?, ?, ?, ?, 'pending')
        `, [req.params.id, info_request || 'Please provide additional information', requestedBy, requestedDate]);
        
        // Update the main request status
        await connection.query(`
            UPDATE senior_hiring_approval 
            SET status = 'info_requested'
            WHERE id = ?
        `, [req.params.id]);
        
        connection.release();
        
        res.json({
            message: 'Information requested successfully',
            request_id: req.params.id,
            status: 'info_requested',
            info_request: info_request || 'Please provide additional information',
            requested_by: requestedBy,
            requested_date: requestedDate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error requesting more info:', error);
        res.status(500).json({ error: 'Failed to request more information' });
    }
});

// Reject senior hiring request
router.post('/:id/reject', async (req, res) => {
    console.log('❌ Rejecting senior hiring request:', req.params.id);
    try {
        const connection = await db.getConnection();
        const { rejection_reason } = req.body;
        const rejectedBy = req.body.rejected_by || 'Managing Director';
        const rejectedDate = new Date().toISOString().split('T')[0];
        
        // Insert into senior_hiring_rejection table
        const [result] = await connection.query(`
            INSERT INTO senior_hiring_rejection 
            (hiring_request_id, rejection_reason, rejected_by, rejected_date)
            VALUES (?, ?, ?, ?)
        `, [req.params.id, rejection_reason || 'Candidate does not meet requirements', rejectedBy, rejectedDate]);
        
        // Update the main request status
        await connection.query(`
            UPDATE senior_hiring_approval 
            SET status = 'rejected'
            WHERE id = ?
        `, [req.params.id]);
        
        connection.release();
        
        res.json({
            message: 'Senior hiring request rejected successfully',
            request_id: req.params.id,
            status: 'rejected',
            rejection_reason: rejection_reason || 'Candidate does not meet requirements',
            rejected_by: rejectedBy,
            rejected_date: rejectedDate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error rejecting senior hiring request:', error);
        res.status(500).json({ error: 'Failed to reject senior hiring request' });
    }
});

module.exports = router;
