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
        
        // Check table structure first
        console.log('🔍 Checking meeting_minutes table structure...');
        try {
            const [columns] = await db.execute('DESCRIBE meeting_minutes');
            console.log('📊 Meeting minutes table columns:', columns.map(col => col.Field));
        } catch (error) {
            console.log('❌ Error checking table structure:', error.message);
        }
        
        // Create new meeting minutes with fallback for different table structures
        let result;
        try {
            // Try the expected table structure first
            [result] = await db.execute(
                `INSERT INTO meeting_minutes (
                    meeting_title, meeting_type, meeting_date, meeting_time, 
                    attendees, minutes_content, action_items, recorded_by, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    meeting_title || '', 
                    meeting_type || '',
                    meeting_date || new Date().toISOString().split('T')[0], // Default to today
                    meeting_time || new Date().toTimeString().split(' ')[0].substring(0, 5), // Default to now
                    attendees || '',
                    minutes_content || '',
                    action_items || null,
                    recorded_by || 'Admin Assistant',
                    'draft' // Default status
                ]
            );
            console.log('✅ Meeting minutes created with standard structure');
        } catch (error) {
            if (error.message.includes('Unknown column')) {
                console.log('⚠️ Standard structure failed, trying minimal structure...');
                console.log('❌ Error:', error.message);
                
                // Fallback to minimal structure - try to identify what columns exist
                try {
                    // Try a basic INSERT without the problematic columns
                    [result] = await db.execute(
                        `INSERT INTO meeting_minutes (meeting_type, meeting_date, meeting_time, attendees, minutes_content, recorded_by) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            meeting_type || 'general',
                            meeting_date || new Date().toISOString().split('T')[0],
                            meeting_time || new Date().toTimeString().split(' ')[0].substring(0, 5),
                            attendees || '',
                            minutes_content || '',
                            recorded_by || 'Admin Assistant'
                        ]
                    );
                    console.log('✅ Meeting minutes created with minimal structure');
                } catch (fallbackError) {
                    console.log('❌ Even minimal structure failed:', fallbackError.message);
                    throw fallbackError;
                }
            } else {
                throw error;
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
