const express = require('express');
const router = express.Router();

console.log('🚀 Schedule meetings route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Schedule meetings test endpoint accessed');
    res.json({ 
        message: 'Schedule meetings API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully'
    });
});

// Root endpoint test
router.get('/', (req, res) => {
    console.log('📅 Schedule meetings root endpoint accessed');
    res.json({ 
        message: 'Schedule meetings API root endpoint',
        available_endpoints: ['GET /test', 'POST /', 'GET /all', 'GET /upcoming', 'GET /:id', 'PUT /:id', 'DELETE /:id']
    });
});

// Create new meeting
router.post('/', async (req, res) => {
    try {
        console.log('📅 Meeting creation request received');
        console.log('📝 Request body:', req.body);
        
        const {
            id,
            title,
            type,
            date,
            startTime,
            endTime,
            location,
            department,
            attendees,
            description,
            projector,
            whiteboard,
            refreshments,
            parking,
            createdBy
        } = req.body;
        
        // Validate required fields
        if (!title || !type || !date || !startTime || !endTime || !department) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'title, type, date, startTime, endTime, and department are required'
            });
        }
        
        console.log('🔍 About to execute meeting insert query...');
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Map frontend fields to database fields
            const query = `
                INSERT INTO schedule_meetings (
                    meeting_title, meeting_type, meeting_date, start_time, end_time,
                    location, organizing_department, expected_attendees, meeting_description,
                    projector_required, whiteboard_required, refreshments_required, 
                    parking_required, status, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?)
            `;
            
            const values = [
                title,
                type,
                date,
                startTime,
                endTime,
                location || null,
                department,
                parseInt(attendees) || 1,
                description || null,
                projector || false,
                whiteboard || false,
                refreshments || false,
                parking || false,
                createdBy || null
            ];
            
            console.log('🔍 Query:', query);
            console.log('📊 Values:', values);
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Meeting inserted successfully:', result);
            
            res.status(201).json({
                success: true,
                message: 'Meeting scheduled successfully',
                meetingId: result.insertId,
                meeting: {
                    id: result.insertId,
                    title,
                    type,
                    date,
                    startTime,
                    endTime,
                    location,
                    department,
                    attendees: parseInt(attendees) || 1,
                    description,
                    status: 'Scheduled'
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock meeting:', dbError);
            
            // Fallback to mock meeting creation
            const meetingId = `MTG${Date.now().toString().slice(-6)}`;
            
            res.status(201).json({
                success: true,
                message: 'Meeting scheduled successfully (mock)',
                meetingId,
                meeting: {
                    id: meetingId,
                    title,
                    type,
                    date,
                    startTime,
                    endTime,
                    location,
                    department,
                    attendees: parseInt(attendees) || 1,
                    description,
                    status: 'Scheduled',
                    mock: true
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error creating meeting:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to schedule meeting',
            details: error.message 
        });
    }
});

// Get all meetings
router.get('/all', async (req, res) => {
    try {
        console.log('📋 Fetching all meetings...');
        
        let meetings = [];
        
        try {
            const db = require('../../database/config/database');
            const meetingsResult = await db.execute('SELECT * FROM schedule_meetings ORDER BY meeting_date DESC');
            meetings = Array.isArray(meetingsResult) ? meetingsResult[0] : meetingsResult;
            console.log('✅ Meetings fetched from database:', meetings.length);
        } catch (dbError) {
            console.error('❌ Database error, using fallback meetings:', dbError);
            
            // Fallback to mock meetings
            meetings = [
                {
                    id: 1,
                    meeting_title: 'Project Kickoff Meeting',
                    meeting_type: 'Project Planning',
                    meeting_date: '2024-01-15',
                    start_time: '09:00',
                    end_time: '10:30',
                    location: 'Conference Room A',
                    organizing_department: 'PROJECT',
                    expected_attendees: 8,
                    meeting_description: 'Initial project planning session',
                    status: 'Scheduled'
                },
                {
                    id: 2,
                    meeting_title: 'Safety Review',
                    meeting_type: 'Safety Meeting',
                    meeting_date: '2024-01-16',
                    start_time: '14:00',
                    end_time: '15:30',
                    location: 'Training Room',
                    organizing_department: 'HSE',
                    expected_attendees: 12,
                    meeting_description: 'Monthly safety review and updates',
                    status: 'Scheduled'
                }
            ];
        }
        
        res.json({
            success: true,
            meetings: meetings,
            total: meetings.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching meetings:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch meetings',
            details: error.message 
        });
    }
});

// Get upcoming meetings
router.get('/upcoming', async (req, res) => {
    try {
        console.log('📅 Fetching upcoming meetings...');
        
        let meetings = [];
        
        try {
            const db = require('../../database/config/database');
            const meetingsResult = await db.execute(
                'SELECT * FROM schedule_meetings WHERE meeting_date >= CURDATE() ORDER BY meeting_date ASC'
            );
            meetings = Array.isArray(meetingsResult) ? meetingsResult[0] : meetingsResult;
            console.log('✅ Upcoming meetings fetched from database:', meetings.length);
        } catch (dbError) {
            console.error('❌ Database error, using fallback upcoming meetings:', dbError);
            
            // Fallback to mock upcoming meetings
            meetings = [
                {
                    id: 1,
                    meeting_title: 'Project Kickoff Meeting',
                    meeting_type: 'Project Planning',
                    meeting_date: '2024-01-15',
                    start_time: '09:00',
                    end_time: '10:30',
                    location: 'Conference Room A',
                    organizing_department: 'PROJECT',
                    expected_attendees: 8,
                    status: 'Scheduled'
                }
            ];
        }
        
        res.json({
            success: true,
            meetings: meetings,
            total: meetings.length
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

// Get meeting by ID
router.get('/:id', async (req, res) => {
    try {
        const meetingId = req.params.id;
        console.log('🔍 Fetching meeting:', meetingId);
        
        let meeting = null;
        
        try {
            const db = require('../../database/config/database');
            const meetingResult = await db.execute('SELECT * FROM schedule_meetings WHERE id = ?', [meetingId]);
            const meetings = Array.isArray(meetingResult) ? meetingResult[0] : meetingResult;
            
            if (meetings.length > 0) {
                meeting = meetings[0];
                console.log('✅ Meeting found:', meeting);
            }
        } catch (dbError) {
            console.error('❌ Database error, using fallback meeting:', dbError);
            
            // Fallback to mock meeting
            if (meetingId === '1') {
                meeting = {
                    id: 1,
                    meeting_title: 'Project Kickoff Meeting',
                    meeting_type: 'Project Planning',
                    meeting_date: '2024-01-15',
                    start_time: '09:00',
                    end_time: '10:30',
                    location: 'Conference Room A',
                    organizing_department: 'PROJECT',
                    expected_attendees: 8,
                    meeting_description: 'Initial project planning session',
                    status: 'Scheduled',
                    mock: true
                };
            }
        }
        
        if (!meeting) {
            return res.status(404).json({ 
                success: false,
                error: 'Meeting not found' 
            });
        }
        
        res.json({
            success: true,
            meeting: meeting
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

// Update meeting
router.put('/:id', async (req, res) => {
    try {
        const meetingId = req.params.id;
        const updateData = req.body;
        
        console.log('🔄 Updating meeting:', meetingId);
        console.log('📝 Update data:', updateData);
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Build dynamic update query
            const updateFields = [];
            const updateValues = [];
            
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined && key !== 'id') {
                    updateFields.push(`${key} = ?`);
                    updateValues.push(updateData[key]);
                }
            });
            
            if (updateFields.length === 0) {
                return res.status(400).json({ 
                    success: false,
                    error: 'No valid fields to update' 
                });
            }
            
            updateFields.push('updated_at = NOW()');
            updateValues.push(meetingId);
            
            const updateQuery = `UPDATE schedule_meetings SET ${updateFields.join(', ')} WHERE id = ?`;
            
            console.log('🔍 Update query:', updateQuery);
            console.log('📊 Update values:', updateValues);
            
            const resultResult = await db.execute(updateQuery, updateValues);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Meeting updated successfully:', result);
            
            res.json({
                success: true,
                message: 'Meeting updated successfully',
                affected_rows: result.affectedRows
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock update:', dbError);
            
            // Fallback to mock update
            res.json({
                success: true,
                message: 'Meeting updated successfully (mock)',
                affected_rows: 1,
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error updating meeting:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update meeting',
            details: error.message 
        });
    }
});

// Delete meeting
router.delete('/:id', async (req, res) => {
    try {
        const meetingId = req.params.id;
        console.log('🗑️ Deleting meeting:', meetingId);
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            const resultResult = await db.execute('DELETE FROM schedule_meetings WHERE id = ?', [meetingId]);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Meeting not found' 
                });
            }
            
            console.log('✅ Meeting deleted successfully:', result);
            
            res.json({
                success: true,
                message: 'Meeting deleted successfully',
                affected_rows: result.affectedRows
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock delete:', dbError);
            
            // Fallback to mock delete
            res.json({
                success: true,
                message: 'Meeting deleted successfully (mock)',
                affected_rows: 1,
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error deleting meeting:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete meeting',
            details: error.message 
        });
    }
});

module.exports = router;
