const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

console.log('🚀 Attendance routes module loaded successfully');

// Test endpoint to verify attendance API is working
router.get('/test', (req, res) => {
    console.log('🧪 Attendance test endpoint accessed');
    res.json({ 
        message: 'Attendance API is working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Create attendance table endpoint
router.post('/create-table', async (req, res) => {
    try {
        console.log('🔨 Creating attendance table...');
        
        // Create attendance table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS attendance (
              id INT AUTO_INCREMENT PRIMARY KEY,
              employee_id VARCHAR(50) NOT NULL,
              employee_name VARCHAR(255) NOT NULL,
              attendance_date DATE NOT NULL,
              check_in_time TIME NULL,
              check_out_time TIME NULL,
              attendance_status ENUM('present', 'absent', 'late', 'sick', 'annual', 'permission') NOT NULL,
              notes TEXT NULL,
              marked_by VARCHAR(255) NOT NULL,
              marked_by_role VARCHAR(100) DEFAULT 'HR Manager',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_employee_id (employee_id),
              INDEX idx_attendance_date (attendance_date),
              INDEX idx_attendance_status (attendance_status),
              INDEX idx_marked_by (marked_by),
              UNIQUE KEY unique_employee_date (employee_id, attendance_date)
            )
        `);
        
        console.log('✅ Attendance table created successfully');
        
        // Insert sample data
        await db.execute(`
            INSERT IGNORE INTO attendance (
              employee_id, employee_name, attendance_date, check_in_time, check_out_time, 
              attendance_status, notes, marked_by, marked_by_role
            ) VALUES
            ('emp001', 'John Doe', CURDATE(), '08:00:00', '17:00:00', 'present', 'Regular work day', 'HR Manager', 'HR Manager'),
            ('emp002', 'Jane Smith', CURDATE(), '08:30:00', '17:00:00', 'late', 'Traffic delay', 'HR Manager', 'HR Manager'),
            ('emp003', 'Mike Johnson', CURDATE(), NULL, NULL, 'sick', 'Fever and headache', 'HR Manager', 'HR Manager'),
            ('emp004', 'Sarah Wilson', CURDATE(), '08:00:00', '16:00:00', 'permission', 'Left early for personal appointment', 'HR Manager', 'HR Manager')
        `);
        
        console.log('✅ Sample attendance data inserted');
        
        // Verify table was created
        const [verify] = await db.execute('DESCRIBE attendance');
        console.log('🔍 Attendance table structure:', verify);
        
        res.json({
            message: 'Attendance table created successfully',
            table_structure: verify,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error creating attendance table:', error);
        res.status(500).json({ 
            error: 'Failed to create attendance table',
            details: error.message
        });
    }
});

// Test database connection
router.get('/test-db', async (req, res) => {
    try {
        console.log('🔍 Testing attendance database connection...');
        const [result] = await db.execute('SELECT 1 as test');
        console.log('✅ Database connection successful:', result);
        res.json({ 
            message: 'Database connection successful',
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

// Get all attendance records
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching attendance records...');
        
        const [attendance] = await db.execute(`
            SELECT * FROM attendance 
            ORDER BY attendance_date DESC, employee_name ASC
        `);
        
        console.log('✅ Attendance records fetched:', attendance.length);
        res.json(attendance);
        
    } catch (error) {
        console.error('❌ Error fetching attendance records:', error);
        res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
});

// Get attendance by date
router.get('/date/:date', async (req, res) => {
    try {
        const { date } = req.params;
        console.log('📋 Fetching attendance for date:', date);
        
        const [attendance] = await db.execute(`
            SELECT * FROM attendance 
            WHERE attendance_date = ?
            ORDER BY employee_name ASC
        `, [date]);
        
        console.log('✅ Attendance records for date fetched:', attendance.length);
        res.json(attendance);
        
    } catch (error) {
        console.error('❌ Error fetching attendance by date:', error);
        res.status(500).json({ error: 'Failed to fetch attendance by date' });
    }
});

// Get attendance by employee
router.get('/employee/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        console.log('📋 Fetching attendance for employee:', employeeId);
        
        const [attendance] = await db.execute(`
            SELECT * FROM attendance 
            WHERE employee_id = ?
            ORDER BY attendance_date DESC
        `, [employeeId]);
        
        console.log('✅ Employee attendance records fetched:', attendance.length);
        res.json(attendance);
        
    } catch (error) {
        console.error('❌ Error fetching employee attendance:', error);
        res.status(500).json({ error: 'Failed to fetch employee attendance' });
    }
});

// Create new attendance record
router.post('/', async (req, res) => {
    try {
        console.log('📝 POST /api/attendance accessed - Creating new attendance record...');
        console.log('📊 Request body:', req.body);
        console.log('📊 Request headers:', req.headers);
        console.log('📊 Request URL:', req.originalUrl);
        
        const {
            date: attendance_date,
            employee: employee_id,
            employee_name,
            checkIn: check_in_time,
            checkOut: check_out_time,
            status: attendance_status,
            notes,
            markedBy: marked_by,
            markedByRole: marked_by_role = 'HR Manager'
        } = req.body;
        
        // Validate required fields
        if (!attendance_date || !employee_id || !attendance_status) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['date', 'employee', 'status'],
                received: { attendance_date, employee_id, attendance_status }
            });
        }
        
        // Check if attendance already exists for this employee on this date
        const [existing] = await db.execute(
            'SELECT id FROM attendance WHERE employee_id = ? AND attendance_date = ?',
            [employee_id, attendance_date]
        );
        
        if (existing && existing.length > 0) {
            console.log('❌ Attendance already exists for this employee on this date');
            return res.status(409).json({ 
                error: 'Attendance already exists for this employee on this date',
                existing_id: existing[0].id
            });
        }
        
        // Insert new attendance record
        const result = await db.execute(`
            INSERT INTO attendance (
                employee_id, employee_name, attendance_date, check_in_time, check_out_time,
                attendance_status, notes, marked_by, marked_by_role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            employee_id,
            employee_name || 'Unknown Employee',
            attendance_date,
            check_in_time || null,
            check_out_time || null,
            attendance_status,
            notes || null,
            marked_by || 'HR Manager',
            marked_by_role
        ]);
        
        // Handle different result formats from db.execute()
        const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;
        console.log('✅ Attendance record created successfully:', result);
        console.log('✅ Insert ID:', insertId);
        
        // Verify the data was actually inserted
        try {
            const [verification] = await db.execute(
                'SELECT * FROM attendance WHERE id = ?',
                [insertId]
            );
            console.log('🔍 Verification - Retrieved attendance:', verification);
            console.log('🔍 Verification - Attendance exists:', verification && verification.length > 0);
        } catch (verifyError) {
            console.error('❌ Verification error:', verifyError);
        }
        
        res.status(201).json({
            message: 'Attendance record created successfully',
            attendance_id: insertId,
            data: {
                employee_id,
                employee_name,
                attendance_date,
                check_in_time,
                check_out_time,
                attendance_status,
                notes,
                marked_by,
                marked_by_role
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating attendance record:', error);
        res.status(500).json({ 
            error: 'Failed to create attendance record',
            details: error.message
        });
    }
});

// Update attendance record
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            employee_name,
            check_in_time,
            check_out_time,
            attendance_status,
            notes
        } = req.body;
        
        console.log('📝 Updating attendance record:', id);
        
        const [result] = await db.execute(`
            UPDATE attendance SET
                employee_name = ?, check_in_time = ?, check_out_time = ?,
                attendance_status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [employee_name, check_in_time, check_out_time, attendance_status, notes, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }
        
        console.log('✅ Attendance record updated successfully');
        res.json({ message: 'Attendance record updated successfully' });
        
    } catch (error) {
        console.error('❌ Error updating attendance record:', error);
        res.status(500).json({ error: 'Failed to update attendance record' });
    }
});

// Delete attendance record
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🗑️ Deleting attendance record:', id);
        
        const [result] = await db.execute(
            'DELETE FROM attendance WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }
        
        console.log('✅ Attendance record deleted successfully');
        res.json({ message: 'Attendance record deleted successfully' });
        
    } catch (error) {
        console.error('❌ Error deleting attendance record:', error);
        res.status(500).json({ error: 'Failed to delete attendance record' });
    }
});

// Get attendance summary for a specific date
router.get('/summary/:date', async (req, res) => {
    try {
        const { date } = req.params;
        console.log('📊 Generating attendance summary for date:', date);
        
        const [summary] = await db.execute(`
            SELECT 
                COUNT(*) as total_employees,
                COUNT(CASE WHEN attendance_status = 'present' THEN 1 END) as present,
                COUNT(CASE WHEN attendance_status = 'absent' THEN 1 END) as absent,
                COUNT(CASE WHEN attendance_status = 'late' THEN 1 END) as late,
                COUNT(CASE WHEN attendance_status IN ('sick', 'annual', 'permission') THEN 1 END) as on_leave
            FROM attendance 
            WHERE attendance_date = ?
        `, [date]);
        
        console.log('✅ Attendance summary generated:', summary[0]);
        res.json(summary[0]);
        
    } catch (error) {
        console.error('❌ Error generating attendance summary:', error);
        res.status(500).json({ error: 'Failed to generate attendance summary' });
    }
});

module.exports = router;
