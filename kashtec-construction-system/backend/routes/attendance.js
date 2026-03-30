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
    console.log('📊 POST /api/attendance/test accessed');
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
    console.log('📊 Request body:', req.body);
    
    const {
        employee_id,
        employee_name,
        date,
        check_in,
        check_out,
        status = 'present'
    } = req.body;
    
    // Validate required fields
    if (!employee_id || !employee_name || !date || !check_in) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['employee_id', 'employee_name', 'date', 'check_in'],
            received: { employee_id, employee_name, date, check_in }
        });
    }
    
    // Simulate saving attendance
    const attendanceRecord = {
        id: Math.floor(Math.random() * 1000) + 1,
        employee_id,
        employee_name,
        date,
        check_in,
        check_out: check_out || null,
        status,
        hours_worked: check_out ? calculateHours(check_in, check_out) : null,
        created_at: new Date().toISOString()
    };
    
    console.log('✅ Attendance saved successfully:', attendanceRecord);
    
    res.status(201).json({
        message: 'Attendance saved successfully',
        attendance: attendanceRecord
    });
});

// Helper function to calculate hours worked
function calculateHours(checkIn, checkOut) {
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    
    return Math.round((outMinutes - inMinutes) / 60 * 100) / 100;
}

// Main GET route
router.get('/', (req, res) => {
    console.log('📝 GET /api/attendance accessed');
    res.json([
        {
            id: 1,
            employee_id: 'EMP001',
            employee_name: 'John Doe',
            date: '2026-03-30',
            check_in: '08:00',
            check_out: '17:00',
            status: 'present',
            hours_worked: 9
        },
        {
            id: 2,
            employee_id: 'EMP002',
            employee_name: 'Jane Smith',
            date: '2026-03-30',
            check_in: '08:30',
            check_out: '17:30',
            status: 'present',
            hours_worked: 9
        }
    ]);
});

module.exports = router;
