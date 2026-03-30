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
    res.json({ 
        message: 'Policies main endpoint working!',
        timestamp: new Date().toISOString(),
        policies: [
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
        ]
    });
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

module.exports = router;
