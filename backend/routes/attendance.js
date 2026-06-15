const express = require('express');
const router = express.Router();

var notify = require('../utils/notify');
console.log('Attendance route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Attendance test endpoint accessed');
    res.json({ 
        message: 'Attendance API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully',
        debug: 'Attendance routes are loaded and responding'
    });
});

// Helper to parse DB result rows
function extractRows(result) {
    if (Array.isArray(result) && Array.isArray(result[0])) {
        return result[0];
    }
    if (Array.isArray(result)) {
        return result;
    }
    if (result && result.rows) {
        return result.rows;
    }
    return [];
}

// Migrate attendance table from old schema to new schema if needed
let migrationDone = false;
async function migrateAttendanceTable(db) {
    if (migrationDone) return;
    try {
        // db.execute() already unwraps [rows] from mysql2, so no destructuring needed
        const columns = await db.execute(`SHOW COLUMNS FROM attendance`);
        const columnNames = (Array.isArray(columns) ? columns : []).map(c => c.Field);
        console.log('📋 Current attendance table columns:', columnNames);
        
        if (columnNames.includes('date') && !columnNames.includes('attendance_date')) {
            await db.execute(`ALTER TABLE attendance CHANGE COLUMN \`date\` attendance_date DATE NOT NULL`);
        }
        if (columnNames.includes('check_in') && !columnNames.includes('check_in_time')) {
            await db.execute(`ALTER TABLE attendance CHANGE COLUMN check_in check_in_time TIME NULL`);
        }
        if (columnNames.includes('check_out') && !columnNames.includes('check_out_time')) {
            await db.execute(`ALTER TABLE attendance CHANGE COLUMN check_out check_out_time TIME NULL`);
        }
        if (columnNames.includes('status') && !columnNames.includes('attendance_status')) {
            await db.execute(`ALTER TABLE attendance CHANGE COLUMN status attendance_status VARCHAR(50) NOT NULL DEFAULT 'present'`);
        }
        if (!columnNames.includes('employee_name')) {
            await db.execute(`ALTER TABLE attendance ADD COLUMN employee_name VARCHAR(255) NOT NULL DEFAULT '' AFTER employee_id`);
        }
        if (!columnNames.includes('department')) {
            await db.execute(`ALTER TABLE attendance ADD COLUMN department VARCHAR(100) NULL AFTER attendance_status`);
        }
        if (!columnNames.includes('marked_by')) {
            await db.execute(`ALTER TABLE attendance ADD COLUMN marked_by VARCHAR(255) NULL AFTER notes`);
        }
        if (!columnNames.includes('marked_by_role')) {
            await db.execute(`ALTER TABLE attendance ADD COLUMN marked_by_role VARCHAR(100) NULL AFTER marked_by`);
        }
        migrationDone = true;
    } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE' || (error.message && error.message.includes("doesn't exist"))) {
            console.log('📋 Attendance table does not exist yet, will be created');
            migrationDone = true;
        } else {
            console.error('⚠️ Attendance migration error:', error.message, error.code, error.stack);
        }
    }
}

// Root endpoint - handle query parameters
router.get('/', async (req, res) => {
    try {
        const { employeeId, date, status, startDate, endDate } = req.query;
        const db = require('../../database/config/database');
        await migrateAttendanceTable(db);

        // Ensure attendance table exists with correct schema
        await db.execute(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id VARCHAR(50) NOT NULL,
                employee_name VARCHAR(255) NOT NULL,
                attendance_date DATE NOT NULL,
                check_in_time TIME NULL,
                check_out_time TIME NULL,
                attendance_status ENUM('present', 'absent', 'late', 'sick', 'annual', 'permission') NOT NULL,
                department VARCHAR(100) NULL,
                notes TEXT,
                marked_by VARCHAR(255),
                marked_by_role VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_employee_id (employee_id),
                INDEX idx_attendance_date (attendance_date),
                INDEX idx_attendance_status (attendance_status)
            )
        `);

        let query = 'SELECT * FROM attendance';
        const conditions = [];
        const params = [];

        if (employeeId) {
            conditions.push('employee_id = ?');
            params.push(employeeId);
        }
        if (date) {
            conditions.push('attendance_date = ?');
            params.push(date);
        }
        if (status) {
            conditions.push('attendance_status = ?');
            params.push(status);
        }
        if (startDate && endDate) {
            conditions.push('attendance_date BETWEEN ? AND ?');
            params.push(startDate, endDate);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY attendance_date DESC, check_in_time DESC';

        const attendanceResult = await db.execute(query, params);
        const attendance = extractRows(attendanceResult);

        res.json({
            success: true,
            attendance: attendance,
            total: attendance.length
        });
    } catch (error) {
        console.error('❌ Error fetching attendance records:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch attendance records',
            details: error.message 
        });
    }
});

// Get all attendance records
router.get('/all', async (req, res) => {
    try {
        const { employeeId, date, status, startDate, endDate } = req.query;
        const db = require('../../database/config/database');
        await migrateAttendanceTable(db);

        let query = 'SELECT * FROM attendance';
        const conditions = [];
        const params = [];

        if (employeeId) {
            conditions.push('employee_id = ?');
            params.push(employeeId);
        }
        if (date) {
            conditions.push('attendance_date = ?');
            params.push(date);
        }
        if (status) {
            conditions.push('attendance_status = ?');
            params.push(status);
        }
        if (startDate && endDate) {
            conditions.push('attendance_date BETWEEN ? AND ?');
            params.push(startDate, endDate);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY attendance_date DESC, check_in_time DESC';

        const attendanceResult = await db.execute(query, params);
        const attendance = extractRows(attendanceResult);

        res.json({
            success: true,
            attendance: attendance,
            total: attendance.length
        });
    } catch (error) {
        console.error('❌ Error fetching attendance records:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch attendance records',
            details: error.message 
        });
    }
});

// Create new attendance record
router.post('/', async (req, res) => {
    try {
        console.log('📝 Attendance creation request received');
        console.log('📝 Request body:', req.body);

        // Accept both frontend naming (snake_case) and legacy camelCase
        const employee_id = req.body.employee_id || req.body.employeeId;
        const employee_name = req.body.employee_name || req.body.employeeName;
        const attendance_date = req.body.attendance_date || req.body.date;
        const check_in_time = req.body.check_in_time || req.body.checkIn || null;
        const check_out_time = req.body.check_out_time || req.body.checkOut || null;
        const attendance_status = req.body.attendance_status || req.body.status || 'present';
        const department = req.body.department || null;
        const notes = req.body.notes || null;
        const marked_by = req.body.marked_by || null;
        const marked_by_role = req.body.marked_by_role || null;

        // Validate required fields
        if (!employee_id || !employee_name || !attendance_date || !attendance_status) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'employee_id, employee_name, attendance_date, and attendance_status are required'
            });
        }

        const db = require('../../database/config/database');
        await migrateAttendanceTable(db);

        const query = `
            INSERT INTO attendance (
                employee_id, employee_name, attendance_date, check_in_time, check_out_time,
                attendance_status, department, notes, marked_by, marked_by_role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                check_in_time = VALUES(check_in_time),
                check_out_time = VALUES(check_out_time),
                attendance_status = VALUES(attendance_status),
                department = VALUES(department),
                notes = VALUES(notes),
                marked_by = VALUES(marked_by),
                marked_by_role = VALUES(marked_by_role)
        `;

        const values = [
            employee_id,
            employee_name,
            attendance_date,
            check_in_time || null,
            check_out_time || null,
            attendance_status,
            department,
            notes,
            marked_by,
            marked_by_role
        ];

        const resultResult = await db.execute(query, values);
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;

        console.log('✅ Attendance record saved successfully:', result);

        notify('Attendance Marked', employee_name + ' - ' + attendance_status + ' on ' + attendance_date, 'info');
        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            attendanceId: result.insertId,
            attendance: {
                id: result.insertId,
                employee_id,
                employee_name,
                attendance_date,
                check_in_time,
                check_out_time,
                attendance_status,
                department,
                notes,
                marked_by,
                marked_by_role
            }
        });
    } catch (error) {
        console.error('❌ Error creating attendance record:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create attendance record',
            details: error.message 
        });
    }
});

// Get attendance record by ID
router.get('/:id', async (req, res) => {
    try {
        const attendanceId = req.params.id;
        const db = require('../../database/config/database');

        const attendanceResult = await db.execute('SELECT * FROM attendance WHERE id = ?', [attendanceId]);
        const rows = extractRows(attendanceResult);

        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Attendance record not found' 
            });
        }

        res.json({
            success: true,
            attendance: rows[0]
        });
    } catch (error) {
        console.error('❌ Error fetching attendance record:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch attendance record',
            details: error.message 
        });
    }
});

// Update attendance record
router.put('/:id', async (req, res) => {
    try {
        const attendanceId = req.params.id;
        const updateData = req.body;
        const db = require('../../database/config/database');

        const allowedFields = [
            'employee_id', 'employee_name', 'attendance_date',
            'check_in_time', 'check_out_time', 'attendance_status',
            'department', 'notes', 'marked_by', 'marked_by_role'
        ];

        const updateFields = [];
        const updateValues = [];

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                updateValues.push(updateData[field]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ 
                success: false,
                error: 'No valid fields to update' 
            });
        }

        updateValues.push(attendanceId);
        const updateQuery = `UPDATE attendance SET ${updateFields.join(', ')} WHERE id = ?`;

        const resultResult = await db.execute(updateQuery, updateValues);
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;

        res.json({
            success: true,
            message: 'Attendance record updated successfully',
            affected_rows: result.affectedRows
        });
    } catch (error) {
        console.error('❌ Error updating attendance record:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update attendance record',
            details: error.message 
        });
    }
});

// Delete attendance record
router.delete('/:id', async (req, res) => {
    try {
        const attendanceId = req.params.id;
        const db = require('../../database/config/database');

        const resultResult = await db.execute('DELETE FROM attendance WHERE id = ?', [attendanceId]);
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Attendance record not found'
            });
        }

        res.json({
            success: true,
            message: 'Attendance record deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting attendance record:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete attendance record',
            details: error.message 
        });
    }
});

// Get attendance by employee ID
router.get('/employee/:employeeId', async (req, res) => {
    try {
        const employeeId = req.params.employeeId;
        const db = require('../../database/config/database');

        const attendanceResult = await db.execute(
            'SELECT * FROM attendance WHERE employee_id = ? ORDER BY attendance_date DESC',
            [employeeId]
        );
        const attendance = extractRows(attendanceResult);

        res.json({
            success: true,
            attendance: attendance,
            total: attendance.length
        });
    } catch (error) {
        console.error('❌ Error fetching employee attendance:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch employee attendance',
            details: error.message 
        });
    }
});

// Get attendance by date
router.get('/date/:date', async (req, res) => {
    try {
        const date = req.params.date;
        const db = require('../../database/config/database');

        const attendanceResult = await db.execute(
            'SELECT * FROM attendance WHERE attendance_date = ? ORDER BY check_in_time ASC',
            [date]
        );
        const attendance = extractRows(attendanceResult);

        res.json({
            success: true,
            attendance: attendance,
            total: attendance.length
        });
    } catch (error) {
        console.error('❌ Error fetching date attendance:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch date attendance',
            details: error.message 
        });
    }
});

// Helper function to calculate hours worked
function calculateHours(checkIn, checkOut) {
    try {
        const [inHour, inMin] = checkIn.split(':').map(Number);
        const [outHour, outMin] = checkOut.split(':').map(Number);
        
        const inMinutes = inHour * 60 + inMin;
        const outMinutes = outHour * 60 + outMin;
        
        return Math.round((outMinutes - inMinutes) / 60 * 100) / 100;
    } catch (error) {
        console.error('❌ Error calculating hours:', error);
        return null;
    }
}

module.exports = router;
