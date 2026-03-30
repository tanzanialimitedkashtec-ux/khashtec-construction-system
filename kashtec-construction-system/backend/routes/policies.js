const express = require('express');
const router = express.Router();

console.log('🚀 Simple policies routes loaded');

// Test GET route
router.get('/test', (req, res) => {
    console.log('🧪 GET /api/policies/test accessed');
    res.json({ 
        message: 'Policies API test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// Main GET route
router.get('/', (req, res) => {
    console.log('📝 GET /api/policies accessed');
    res.json([
        {
            id: 1,
            title: 'Test Policy 1',
            category: 'HR',
            status: 'active',
            created_date: '2026-03-30'
        },
        {
            id: 2,
            title: 'Test Policy 2', 
            category: 'Safety',
            status: 'draft',
            created_date: '2026-03-30'
        }
    ]);
});

// GET by ID route
router.get('/:id', (req, res) => {
    console.log('📝 GET /api/policies/:id accessed with id:', req.params.id);
    res.json({ 
        message: 'Policy by ID endpoint working!',
        id: req.params.id,
        timestamp: new Date().toISOString()
    });
});

// Approve policy
router.post('/:id/approve', (req, res) => {
    console.log('✅ Approving policy:', req.params.id);
    res.json({
        message: 'Policy approved successfully',
        policy_id: req.params.id,
        status: 'approved',
        approved_by: 'HR Manager',
        approved_date: new Date().toISOString(),
        timestamp: new Date().toISOString()
    });
});

// Request revision
router.post('/:id/revision', (req, res) => {
    console.log('🔄 Requesting revision for policy:', req.params.id);
    const { revision_notes } = req.body;
    res.json({
        message: 'Policy revision requested successfully',
        policy_id: req.params.id,
        status: 'revision_requested',
        revision_notes: revision_notes || 'Please review and update this policy',
        requested_by: 'HR Manager',
        requested_date: new Date().toISOString(),
        timestamp: new Date().toISOString()
    });
});

// Reject policy
router.post('/:id/reject', (req, res) => {
    console.log('❌ Rejecting policy:', req.params.id);
    const { rejection_reason } = req.body;
    res.json({
        message: 'Policy rejected successfully',
        policy_id: req.params.id,
        status: 'rejected',
        rejection_reason: rejection_reason || 'Policy does not meet requirements',
        rejected_by: 'HR Manager',
        rejected_date: new Date().toISOString(),
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
