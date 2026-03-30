const express = require('express');
const router = express.Router();

console.log('🚀 Simple workforce budget routes loaded');

// Test GET route
router.get('/test', (req, res) => {
    console.log('🧪 GET /api/workforce-budget/test accessed');
    res.json({ 
        message: 'Workforce budget API test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// Main GET route
router.get('/', (req, res) => {
    console.log('📝 GET /api/workforce-budget accessed');
    res.json([
        {
            id: 1,
            department: 'IT',
            budget_amount: 500000,
            requested_amount: 450000,
            status: 'approved',
            request_date: '2026-03-30',
            approval_date: '2026-03-30'
        },
        {
            id: 2,
            department: 'Construction',
            budget_amount: 1000000,
            requested_amount: 950000,
            status: 'pending',
            request_date: '2026-03-29',
            approval_date: null
        }
    ]);
});

// GET by ID route
router.get('/:id', (req, res) => {
    console.log('📝 GET /api/workforce-budget/:id accessed with id:', req.params.id);
    res.json({ 
        message: 'Workforce budget by ID endpoint working!',
        id: req.params.id,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
