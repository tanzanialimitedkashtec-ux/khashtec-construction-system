const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Test endpoint to verify API is working
router.get('/test', (req, res) => {
    console.log('🧪 Schedule Meetings API test endpoint accessed');
    res.json({ 
        message: 'Schedule Meetings API is working!',
        timestamp: new Date().toISOString(),
        route: '/api/schedule-meetings/test'
    });
});

// Root test endpoint
router.get('/', (req, res) => {
    console.log('🧪 Schedule Meetings API root endpoint accessed');
    res.json({ 
        message: 'Schedule Meetings API root is working!',
        timestamp: new Date().toISOString(),
        route: '/api/schedule-meetings/'
    });
});

// POST - Create new scheduled meeting (simplified version)
router.post('/', async (req, res) => {
    try {
        console.log('📅 Creating new scheduled meeting...');
        console.log('📝 Request body:', req.body);
        
        const {
            meeting_title,
            meeting_type,
            meeting_date,
            start_time,
            end_time,
            location,
            organizing_department,
            expected_attendees,
            meeting_description,
            projector_required,
            whiteboard_required,
            refreshments_required,
            parking_required,
            created_by
        } = req.body;
        
        // Validate required fields
        if (!meeting_title || !meeting_type || !meeting_date || !start_time || !end_time || !organizing_department) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required_fields: ['meeting_title', 'meeting_type', 'meeting_date', 'start_time', 'end_time', 'organizing_department']
            });
        }
        
        // Insert new meeting with safe parameter handling
        const queryResult = await db.execute(`
            INSERT INTO schedule_meetings (
                meeting_title,
                meeting_type,
                meeting_date,
                start_time,
                end_time,
                location,
                organizing_department,
                expected_attendees,
                meeting_description,
                projector_required,
                whiteboard_required,
                refreshments_required,
                parking_required,
                status,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?)
        `, [
            meeting_title,
            meeting_type,
            meeting_date,
            start_time,
            end_time,
            location || null,
            organizing_department,
            expected_attendees || 1,
            meeting_description || null,
            projector_required || false,
            whiteboard_required || false,
            refreshments_required || false,
            parking_required || false,
            created_by || null
        ]);
        
        const result = Array.isArray(queryResult) ? queryResult[0] : queryResult;
        console.log(`✅ Meeting created successfully with ID: ${result.insertId}`);
        
        res.status(201).json({
            success: true,
            message: 'Meeting scheduled successfully',
            meeting_id: result.insertId,
            meeting_title: meeting_title,
            meeting_type: meeting_type,
            meeting_date: meeting_date,
            start_time: start_time,
            end_time: end_time,
            status: 'Scheduled'
        });
        
    } catch (error) {
        console.error('❌ Error creating scheduled meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to schedule meeting',
            details: error.message
        });
    }
});

module.exports = router;
