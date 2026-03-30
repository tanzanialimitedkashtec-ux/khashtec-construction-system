const express = require('express');
const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
    console.log('🧪 Simple attendance test accessed');
    res.json({ 
        message: 'Simple attendance test working!',
        timestamp: new Date().toISOString(),
        routes_loaded: true
    });
});

// Simple POST route
router.post('/test', (req, res) => {
    console.log('📝 Simple attendance POST test accessed');
    console.log('📊 Request body:', req.body);
    res.json({ 
        message: 'Simple attendance POST test working!',
        timestamp: new Date().toISOString(),
        received_data: req.body
    });
});

module.exports = router;
