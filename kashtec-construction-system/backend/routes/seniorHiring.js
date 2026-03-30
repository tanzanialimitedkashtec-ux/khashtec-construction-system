const express = require('express');
const router = express.Router();

console.log('🚀 Simple senior hiring routes loaded');

// Test GET route
router.get('/test', (req, res) => {
    console.log('🧪 GET /api/senior-hiring/test accessed');
    res.json({ 
        message: 'Senior hiring API test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// Main GET route
router.get('/', (req, res) => {
    console.log('📝 GET /api/senior-hiring accessed');
    res.json([
        {
            id: 1,
            candidate_name: 'John Doe',
            position: 'Senior Developer',
            department: 'IT',
            status: 'pending',
            request_date: '2026-03-30',
            approval_date: null
        },
        {
            id: 2,
            candidate_name: 'Jane Smith',
            position: 'Project Manager',
            department: 'Projects',
            status: 'approved',
            request_date: '2026-03-29',
            approval_date: '2026-03-30'
        }
    ]);
});

// GET by ID route
router.get('/:id', (req, res) => {
    console.log('📝 GET /api/senior-hiring/:id accessed with id:', req.params.id);
    res.json({ 
        message: 'Senior hiring request by ID endpoint working!',
        id: req.params.id,
        timestamp: new Date().toISOString()
    });
});

// Approve senior hiring request
router.post('/:id/approve', (req, res) => {
    console.log('✅ Approving senior hiring request:', req.params.id);
    res.json({
        message: 'Senior hiring request approved successfully',
        request_id: req.params.id,
        status: 'approved',
        approved_by: 'HR Manager',
        approved_date: new Date().toISOString(),
        timestamp: new Date().toISOString()
    });
});

// Request more information
router.post('/:id/request-info', (req, res) => {
    console.log('🔄 Requesting more info for senior hiring request:', req.params.id);
    const { info_request } = req.body;
    res.json({
        message: 'Information requested successfully',
        request_id: req.params.id,
        status: 'info_requested',
        info_request: info_request || 'Please provide additional information',
        requested_by: 'HR Manager',
        requested_date: new Date().toISOString(),
        timestamp: new Date().toISOString()
    });
});

// Reject senior hiring request
router.post('/:id/reject', (req, res) => {
    console.log('❌ Rejecting senior hiring request:', req.params.id);
    const { rejection_reason } = req.body;
    res.json({
        message: 'Senior hiring request rejected successfully',
        request_id: req.params.id,
        status: 'rejected',
        rejection_reason: rejection_reason || 'Candidate does not meet requirements',
        rejected_by: 'HR Manager',
        rejected_date: new Date().toISOString(),
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
