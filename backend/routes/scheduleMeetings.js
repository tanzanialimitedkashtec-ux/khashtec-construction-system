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

// Test database connection
router.get('/test-db', async (req, res) => {
    try {
        console.log('🔍 Testing schedule meetings database connection...');
        const resultResult = await db.execute('SELECT 1 as test');
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        console.log('✅ Database connection successful:', result);
        res.json({ 
            message: 'Schedule meetings database connection successful',
            result: result
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        res.status(500).json({ 
            error: 'Database connection failed',
            details: error.message 
        });
    }
});

// Test schedule_meetings table existence
router.get('/test-table', async (req, res) => {
    try {
        console.log('🔍 Testing schedule_meetings table existence...');
        const resultResult = await db.execute('SHOW TABLES LIKE "schedule_meetings"');
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        console.log('✅ Schedule meetings table check result:', result);
        res.json({ 
            message: 'Schedule meetings table check successful',
            exists: result.length > 0,
            result: result
        });
    } catch (error) {
        console.error('❌ Schedule meetings table check failed:', error);
        res.status(500).json({ 
            error: 'Schedule meetings table check failed',
            details: error.message 
        });
    }
});

// GET all scheduled meetings
router.get('/all', async (req, res) => {
    try {
        console.log('📅 Fetching all scheduled meetings...');
        const meetingsResult = await db.execute(`
            SELECT 
                id,
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
                created_by,
                created_at
            FROM schedule_meetings 
            ORDER BY meeting_date ASC, start_time ASC
        `);
        const meetings = Array.isArray(meetingsResult) ? meetingsResult[0] : meetingsResult;
        
        console.log(`✅ Found ${meetings.length} scheduled meetings`);
        res.json({
            success: true,
            count: meetings.length,
            meetings: meetings
        });
    } catch (error) {
        console.error('❌ Error fetching scheduled meetings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch scheduled meetings',
            details: error.message
        });
    }
});

// GET upcoming meetings (future dates)
router.get('/upcoming', async (req, res) => {
    try {
        console.log('📅 Fetching upcoming meetings...');
        const [meetings] = await db.execute(`
            SELECT 
                id,
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
                created_by,
                created_at,
                updated_at
            FROM schedule_meetings 
            WHERE meeting_date >= CURDATE()
            ORDER BY meeting_date ASC, start_time ASC
        `);
        
        console.log(`✅ Found ${meetings.length} upcoming meetings`);
        res.json({
            success: true,
            count: meetings.length,
            meetings: meetings
        });
    } catch (error) {
        console.error('❌ Error fetching upcoming meetings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch upcoming meetings',
            details: error.message
        });
    }
});

// GET meetings by department
router.get('/department/:department', async (req, res) => {
    try {
        const { department } = req.params;
        console.log(`📅 Fetching meetings for department: ${department}`);
        
        const [meetings] = await db.execute(`
            SELECT 
                id,
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
                created_by,
                created_at,
                updated_at
            FROM schedule_meetings 
            WHERE organizing_department = ?
            ORDER BY meeting_date ASC, start_time ASC
        `, [department]);
        
        console.log(`✅ Found ${meetings.length} meetings for ${department} department`);
        res.json({
            success: true,
            count: meetings.length,
            department: department,
            meetings: meetings
        });
    } catch (error) {
        console.error('❌ Error fetching department meetings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch department meetings',
            details: error.message
        });
    }
});

// GET single meeting by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📅 Fetching meeting with ID: ${id}`);
        
        const [meetings] = await db.execute(`
            SELECT 
                id,
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
                created_by,
                created_at,
                updated_at
            FROM schedule_meetings 
            WHERE id = ?
        `, [id]);
        
        if (meetings.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found',
                details: `No meeting found with ID: ${id}`
            });
        }
        
        console.log(`✅ Found meeting: ${meetings[0].meeting_title}`);
        res.json({
            success: true,
            meeting: meetings[0]
        });
    } catch (error) {
        console.error('❌ Error fetching meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch meeting',
            details: error.message
        });
    }
});

// POST - Create new scheduled meeting
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
        
        // Insert new meeting
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
            parseInt(created_by) || null
        ]);
        
        const result = Array.isArray(queryResult) ? queryResult[0] : queryResult;
        console.log(`✅ Meeting created successfully with ID: ${result.insertId}`);
        
        // Fetch the created meeting to return complete data
        const createdMeetingResult = await db.execute(`
            SELECT 
                id,
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
                created_by,
                created_at
            FROM schedule_meetings 
            WHERE id = ?
        `, [result.insertId]);
        
        const createdMeeting = Array.isArray(createdMeetingResult) ? createdMeetingResult[0] : createdMeetingResult;
        
        res.status(201).json({
            success: true,
            message: 'Meeting scheduled successfully',
            meeting: createdMeeting
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

// PUT - Update existing meeting
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📅 Updating meeting with ID: ${id}`);
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
            status
        } = req.body;
        
        // Check if meeting exists
        const [existing] = await db.execute('SELECT id FROM schedule_meetings WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found',
                details: `No meeting found with ID: ${id}`
            });
        }
        
        // Update meeting
        const [result] = await db.execute(`
            UPDATE schedule_meetings SET
                meeting_title = ?,
                meeting_type = ?,
                meeting_date = ?,
                start_time = ?,
                end_time = ?,
                location = ?,
                organizing_department = ?,
                expected_attendees = ?,
                meeting_description = ?,
                projector_required = ?,
                whiteboard_required = ?,
                refreshments_required = ?,
                parking_required = ?,
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
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
            status || 'Scheduled',
            id
        ]);
        
        console.log(`✅ Meeting updated successfully`);
        
        // Fetch the updated meeting
        const [updatedMeeting] = await db.execute(`
            SELECT 
                id,
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
                created_by,
                created_at,
                updated_at
            FROM schedule_meetings 
            WHERE id = ?
        `, [id]);
        
        res.json({
            success: true,
            message: 'Meeting updated successfully',
            meeting: updatedMeeting[0]
        });
        
    } catch (error) {
        console.error('❌ Error updating meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update meeting',
            details: error.message
        });
    }
});

// DELETE - Cancel/Delete meeting
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📅 Deleting meeting with ID: ${id}`);
        
        // Check if meeting exists
        const [existing] = await db.execute('SELECT id, meeting_title FROM schedule_meetings WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found',
                details: `No meeting found with ID: ${id}`
            });
        }
        
        // Delete meeting
        const [result] = await db.execute('DELETE FROM schedule_meetings WHERE id = ?', [id]);
        
        console.log(`✅ Meeting "${existing[0].meeting_title}" deleted successfully`);
        
        res.json({
            success: true,
            message: 'Meeting deleted successfully',
            deleted_meeting: existing[0]
        });
        
    } catch (error) {
        console.error('❌ Error deleting meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete meeting',
            details: error.message
        });
    }
});

// PATCH - Update meeting status only
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        console.log(`📅 Updating meeting ${id} status to: ${status}`);
        
        // Validate status
        const validStatuses = ['Scheduled', 'Confirmed', 'Cancelled', 'Completed', 'Postponed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status',
                valid_statuses: validStatuses
            });
        }
        
        // Check if meeting exists
        const [existing] = await db.execute('SELECT id FROM schedule_meetings WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found',
                details: `No meeting found with ID: ${id}`
            });
        }
        
        // Update status
        const [result] = await db.execute(`
            UPDATE schedule_meetings 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [status, id]);
        
        console.log(`✅ Meeting status updated successfully`);
        
        res.json({
            success: true,
            message: 'Meeting status updated successfully',
            meeting_id: parseInt(id),
            new_status: status
        });
        
    } catch (error) {
        console.error('❌ Error updating meeting status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update meeting status',
            details: error.message
        });
    }
});

module.exports = router;
