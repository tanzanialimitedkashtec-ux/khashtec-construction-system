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
        
        // Check table structure first and build dynamic INSERT
        console.log('🔍 Checking meeting_minutes table structure...');
        let tableColumns = [];
        try {
            const [columns] = await db.execute('DESCRIBE meeting_minutes');
            tableColumns = columns.map(col => col.Field);
            console.log('📊 Meeting minutes table columns:', tableColumns);
        } catch (error) {
            console.log('❌ Error checking table structure:', error.message);
            console.log('🔄 Trying alternative table structure detection...');
            
            // Fallback: Try SHOW COLUMNS
            try {
                const [columns] = await db.execute('SHOW COLUMNS FROM meeting_minutes');
                tableColumns = columns.map(col => col.Field);
                console.log('📊 Meeting minutes table columns (SHOW COLUMNS):', tableColumns);
            } catch (showError) {
                console.log('❌ SHOW COLUMNS also failed:', showError.message);
                console.log('🔄 Using predefined minimal column set as last resort...');
                tableColumns = ['id', 'meeting_type', 'meeting_date', 'meeting_time', 'attendees', 'minutes_content', 'recorded_by'];
            }
        }
        
        // Build dynamic INSERT based on available columns
        const availableColumns = tableColumns;
        const insertData = {};
        
        // Map data to available columns
        if (availableColumns.includes('meeting_title')) {
            insertData.meeting_title = meeting_title || '';
        }
        if (availableColumns.includes('meeting_type')) {
            insertData.meeting_type = meeting_type || 'general';
        }
        if (availableColumns.includes('meeting_date')) {
            insertData.meeting_date = meeting_date || new Date().toISOString().split('T')[0];
        }
        if (availableColumns.includes('meeting_time')) {
            insertData.meeting_time = meeting_time || new Date().toTimeString().split(' ')[0].substring(0, 5);
        }
        if (availableColumns.includes('attendees')) {
            insertData.attendees = attendees || '';
        }
        if (availableColumns.includes('minutes_content')) {
            insertData.minutes_content = minutes_content || '';
        }
        if (availableColumns.includes('action_items')) {
            insertData.action_items = action_items || null;
        }
        if (availableColumns.includes('recorded_by')) {
            insertData.recorded_by = recorded_by || 'Admin Assistant';
        }
        if (availableColumns.includes('status')) {
            insertData.status = 'draft';
        }
        
        console.log('🔧 Insert data mapped to columns:', insertData);
        
        // Build dynamic INSERT query
        const columns = Object.keys(insertData);
        const values = Object.values(insertData);
        const placeholders = values.map(() => '?').join(', ');
        
        if (columns.length === 0) {
            throw new Error('No valid columns found for meeting_minutes table');
        }
        
        const insertQuery = `INSERT INTO meeting_minutes (${columns.join(', ')}) VALUES (${placeholders})`;
        console.log('📝 Dynamic INSERT query:', insertQuery);
        console.log('📝 Values:', values);
        
        let result;
        try {
            [result] = await db.execute(insertQuery, values);
            console.log('✅ Meeting minutes created successfully with dynamic structure');
        } catch (dynamicError) {
            console.log('❌ Dynamic INSERT failed:', dynamicError.message);
            console.log('🔄 Trying fallback INSERT strategies...');
            
            // Fallback 1: Try minimal columns only
            try {
                const minimalQuery = `INSERT INTO meeting_minutes (meeting_type, meeting_date, meeting_time, attendees, minutes_content, recorded_by) VALUES (?, ?, ?, ?, ?, ?)`;
                const minimalValues = [
                    meeting_type || 'general',
                    meeting_date || new Date().toISOString().split('T')[0],
                    meeting_time || new Date().toTimeString().split(' ')[0].substring(0, 5),
                    attendees || '',
                    minutes_content || '',
                    recorded_by || 'Admin Assistant'
                ];
                console.log('📝 Fallback 1 - Minimal INSERT query:', minimalQuery);
                [result] = await db.execute(minimalQuery, minimalValues);
                console.log('✅ Meeting minutes created with minimal structure');
            } catch (minimalError) {
                console.log('❌ Minimal INSERT failed:', minimalError.message);
                
                // Fallback 2: Try absolute basic columns
                try {
                    const basicQuery = `INSERT INTO meeting_minutes (meeting_type, meeting_date, attendees, minutes_content) VALUES (?, ?, ?, ?)`;
                    const basicValues = [
                        meeting_type || 'general',
                        meeting_date || new Date().toISOString().split('T')[0],
                        attendees || '',
                        minutes_content || ''
                    ];
                    console.log('📝 Fallback 2 - Basic INSERT query:', basicQuery);
                    [result] = await db.execute(basicQuery, basicValues);
                    console.log('✅ Meeting minutes created with basic structure');
                } catch (basicError) {
                    console.log('❌ Basic INSERT failed:', basicError.message);
                    throw new Error(`All INSERT strategies failed. Last error: ${basicError.message}`);
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
