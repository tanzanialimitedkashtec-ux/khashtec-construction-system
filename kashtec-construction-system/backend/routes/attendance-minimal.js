const express = require('express');
const router = express.Router();

console.log('🚀 Minimal attendance routes loaded');

// Test GET route
router.get('/test', (req, res) => {
    console.log('🧪 GET /api/attendance/test accessed');
    res.json({ 
        message: 'Attendance API test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// Test POST route
router.post('/test', (req, res) => {
    console.log('📝 POST /api/attendance/test accessed');
    console.log('📊 Request body:', req.body);
    res.json({ 
        message: 'Attendance POST test working!',
        received: req.body,
        timestamp: new Date().toISOString()
    });
});

// Main POST route
router.post('/', (req, res) => {
    console.log('📝 POST /api/attendance accessed');
    res.json({ 
        message: 'Attendance main endpoint working!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
