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

module.exports = router;
