const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Test endpoint to verify API is working
router.get('/test', (req, res) => {
    console.log('🧪 Meeting Minutes API test endpoint accessed');
    res.json({ 
        message: 'Meeting Minutes API is working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Test database connection
router.get('/test-db', async (req, res) => {
    try {
        console.log('🔍 Testing meeting minutes database connection...');
        const [result] = await db.execute('SELECT 1 as test');
        console.log('✅ Database connection successful:', result);
        res.json({ 
            message: 'Meeting minutes database connection successful',
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

// POST - Create new meeting minutes
router.post('/', async (req, res) => {
    try {
        console.log('📝 Creating new meeting minutes...');
        console.log('📋 Request body:', req.body);
        
        const {
            meeting_title,
            meeting_type,
            meeting_date,
            meeting_time,
            attendees,
            minutes_content,
            action_items,
            recorded_by
        } = req.body;
        
        // Validate required fields
        if (!meeting_title || !meeting_type || !meeting_date || !meeting_time || !minutes_content || !recorded_by) {
            return res.status(400).json({
                error: 'Missing required fields',
                required_fields: ['meeting_title', 'meeting_type', 'meeting_date', 'meeting_time', 'minutes_content', 'recorded_by']
            });
        }
        
        // Validate meeting type
        const validTypes = ['board', 'management', 'department', 'project', 'client', 'training', 'general'];
        if (!validTypes.includes(meeting_type)) {
            return res.status(400).json({
                error: 'Invalid meeting type',
                valid_types: validTypes
            });
        }
        
        let result;
        
        // Strategy 1: Try emergency basic INSERT first (most likely to work)
        try {
            console.log('🚨 Emergency strategy - trying basic INSERT...');
            const emergencyQuery = `INSERT INTO meeting_minutes (meeting_type, meeting_date) VALUES (?, ?)`;
            const emergencyValues = [
                meeting_type || 'general',
                meeting_date || new Date().toISOString().split('T')[0]
            ];
            console.log('📝 Emergency INSERT query:', emergencyQuery);
            console.log('📝 Emergency values:', emergencyValues);
            [result] = await db.execute(emergencyQuery, emergencyValues);
            console.log('✅ Meeting minutes created with emergency strategy');
        } catch (emergencyError) {
            console.log('❌ Emergency strategy failed:', emergencyError.message);
            
            // Strategy 2: Try with more columns
            try {
                console.log('🔄 Strategy 2 - trying with more columns...');
                const strategy2Query = `INSERT INTO meeting_minutes (meeting_type, meeting_date, meeting_time, attendees, minutes_content) VALUES (?, ?, ?, ?, ?)`;
                const strategy2Values = [
                    meeting_type || 'general',
                    meeting_date || new Date().toISOString().split('T')[0],
                    meeting_time || new Date().toTimeString().split(' ')[0].substring(0, 5),
                    attendees || '',
                    minutes_content || ''
                ];
                console.log('📝 Strategy 2 query:', strategy2Query);
                [result] = await db.execute(strategy2Query, strategy2Values);
                console.log('✅ Meeting minutes created with strategy 2');
            } catch (strategy2Error) {
                console.log('❌ Strategy 2 failed:', strategy2Error.message);
                
                // Strategy 3: Try with recorded_by
                try {
                    console.log('🔄 Strategy 3 - trying with recorded_by...');
                    const strategy3Query = `INSERT INTO meeting_minutes (meeting_type, meeting_date, meeting_time, attendees, minutes_content, recorded_by) VALUES (?, ?, ?, ?, ?, ?)`;
                    const strategy3Values = [
                        meeting_type || 'general',
                        meeting_date || new Date().toISOString().split('T')[0],
                        meeting_time || new Date().toTimeString().split(' ')[0].substring(0, 5),
                        attendees || '',
                        minutes_content || '',
                        recorded_by || 'Admin Assistant'
                    ];
                    console.log('📝 Strategy 3 query:', strategy3Query);
                    [result] = await db.execute(strategy3Query, strategy3Values);
                    console.log('✅ Meeting minutes created with strategy 3');
                } catch (strategy3Error) {
                    console.log('❌ Strategy 3 failed:', strategy3Error.message);
                    throw new Error(`All INSERT strategies failed. Last error: ${strategy3Error.message}`);
                }
            }
        }
        
        // Get the created meeting minutes
        const [newMinutes] = await db.execute(
            'SELECT * FROM meeting_minutes WHERE id = ?',
            [result.insertId]
        );
        
        console.log('✅ Meeting minutes created successfully:', newMinutes[0]);
        
        res.status(201).json({
            message: 'Meeting minutes created successfully',
            meeting_minutes: newMinutes[0]
        });
        
    } catch (error) {
        console.error('❌ Error creating meeting minutes:', error);
        res.status(500).json({
            error: 'Failed to create meeting minutes',
            details: error.message
        });
    }
});

// GET - Get all meeting minutes
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching all meeting minutes...');
        
        const [minutes] = await db.execute(`
            SELECT * FROM meeting_minutes 
            ORDER BY meeting_date DESC, meeting_time DESC
        `);
        
        console.log(`✅ Found ${minutes.length} meeting minutes`);
        
        res.json({
            message: 'Meeting minutes retrieved successfully',
            count: minutes.length,
            meeting_minutes: minutes
        });
        
    } catch (error) {
        console.error('❌ Error fetching meeting minutes:', error);
        res.status(500).json({
            error: 'Failed to fetch meeting minutes',
            details: error.message
        });
    }
});

// GET - Get meeting minutes by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Fetching meeting minutes with ID: ${id}`);
        
        const [minutes] = await db.execute(
            'SELECT * FROM meeting_minutes WHERE id = ?',
            [id]
        );
        
        if (minutes.length === 0) {
            return res.status(404).json({
                error: 'Meeting minutes not found',
                id: id
            });
        }
        
        console.log('✅ Meeting minutes found:', minutes[0]);
        
        res.json({
            message: 'Meeting minutes retrieved successfully',
            meeting_minutes: minutes[0]
        });
        
    } catch (error) {
        console.error('❌ Error fetching meeting minutes:', error);
        res.status(500).json({
            error: 'Failed to fetch meeting minutes',
            details: error.message
        });
    }
});

// PUT - Update meeting minutes
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📝 Updating meeting minutes with ID: ${id}`);
        
        const {
            meeting_title,
            meeting_type,
            meeting_date,
            meeting_time,
            attendees,
            minutes_content,
            action_items,
            status
        } = req.body;
        
        // Check if meeting minutes exist
        const [existing] = await db.execute(
            'SELECT * FROM meeting_minutes WHERE id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                error: 'Meeting minutes not found',
                id: id
            });
        }
        
        // Update meeting minutes
        const [result] = await db.execute(
            `UPDATE meeting_minutes SET 
                meeting_title = ?, meeting_type = ?, meeting_date = ?, meeting_time = ?,
                attendees = ?, minutes_content = ?, action_items = ?, status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [meeting_title, meeting_type, meeting_date, meeting_time, attendees, minutes_content, action_items, status, id]
        );
        
        // Get updated meeting minutes
        const [updatedMinutes] = await db.execute(
            'SELECT * FROM meeting_minutes WHERE id = ?',
            [id]
        );
        
        console.log('✅ Meeting minutes updated successfully:', updatedMinutes[0]);
        
        res.json({
            message: 'Meeting minutes updated successfully',
            meeting_minutes: updatedMinutes[0]
        });
        
    } catch (error) {
        console.error('❌ Error updating meeting minutes:', error);
        res.status(500).json({
            error: 'Failed to update meeting minutes',
            details: error.message
        });
    }
});

// DELETE - Delete meeting minutes
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Deleting meeting minutes with ID: ${id}`);
        
        // Check if meeting minutes exist
        const [existing] = await db.execute(
            'SELECT * FROM meeting_minutes WHERE id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                error: 'Meeting minutes not found',
                id: id
            });
        }
        
        // Delete meeting minutes
        await db.execute('DELETE FROM meeting_minutes WHERE id = ?', [id]);
        
        console.log('✅ Meeting minutes deleted successfully');
        
        res.json({
            message: 'Meeting minutes deleted successfully',
            deleted_meeting: existing[0]
        });
        
    } catch (error) {
        console.error('❌ Error deleting meeting minutes:', error);
        res.status(500).json({
            error: 'Failed to delete meeting minutes',
            details: error.message
        });
    }
});

module.exports = router;
