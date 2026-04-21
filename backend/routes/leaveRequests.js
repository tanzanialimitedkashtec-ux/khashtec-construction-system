const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

console.log('🚀 Leave requests routes module loaded successfully');

// Test endpoint to verify leave requests API is working
router.get('/test', (req, res) => {
    console.log('🧪 Leave requests test endpoint accessed');
    res.json({ 
        message: 'Leave requests API is working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Get all leave requests
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching leave requests...');
        
        const [leaveRequests] = await db.execute(`
            SELECT * FROM leave_requests 
            ORDER BY created_at DESC
        `);
        
        console.log('✅ Leave requests fetched:', leaveRequests.length);
        res.json(leaveRequests);
        
    } catch (error) {
        console.error('❌ Error fetching leave requests:', error);
        res.status(500).json({ error: 'Failed to fetch leave requests' });
    }
});

// Get leave request by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('📋 Fetching leave request:', id);
        
        const [leaveRequests] = await db.execute(`
            SELECT * FROM leave_requests WHERE id = ?
        `, [id]);
        
        if (leaveRequests.length === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
        }
        
        console.log('✅ Leave request fetched successfully');
        res.json(leaveRequests[0]);
        
    } catch (error) {
        console.error('❌ Error fetching leave request:', error);
        res.status(500).json({ error: 'Failed to fetch leave request' });
    }
});

// Get leave requests by employee
router.get('/employee/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        console.log('📋 Fetching leave requests for employee:', employeeId);
        
        const [leaveRequests] = await db.execute(`
            SELECT * FROM leave_requests 
            WHERE employee_id = ?
            ORDER BY created_at DESC
        `, [employeeId]);
        
        console.log('✅ Employee leave requests fetched:', leaveRequests.length);
        res.json(leaveRequests);
        
    } catch (error) {
        console.error('❌ Error fetching employee leave requests:', error);
        res.status(500).json({ error: 'Failed to fetch employee leave requests' });
    }
});

// Get leave requests by date range
router.get('/date-range/:startDate/:endDate', async (req, res) => {
    try {
        const { startDate, endDate } = req.params;
        console.log('📋 Fetching leave requests from', startDate, 'to', endDate);
        
        const [leaveRequests] = await db.execute(`
            SELECT * FROM leave_requests 
            WHERE start_date >= ? AND end_date <= ?
            ORDER BY start_date ASC
        `, [startDate, endDate]);
        
        console.log('✅ Date range leave requests fetched:', leaveRequests.length);
        res.json(leaveRequests);
        
    } catch (error) {
        console.error('❌ Error fetching date range leave requests:', error);
        res.status(500).json({ error: 'Failed to fetch date range leave requests' });
    }
});

// Create new leave request
router.post('/', async (req, res) => {
    try {
        console.log('📝 POST /api/leave-requests accessed - Creating new leave request...');
        console.log('📊 Request body:', req.body);
        console.log('📊 Request headers:', req.headers);
        console.log('📊 Request URL:', req.originalUrl);
        
        const {
            employee: employee_id,
            employee_name,
            leaveType: leave_type,
            startDate: start_date,
            endDate: end_date,
            daysRequested: days_requested,
            reasonForLeave: reason_for_leave,
            approvedBy,
            rejectionReason
        } = req.body;
        
        // Validate required fields
        if (!employee_id || !employee_name || !leaveType || !startDate || !endDate || !daysRequested || !reasonForLeave) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['employee', 'employee_name', 'leaveType', 'startDate', 'endDate', 'daysRequested', 'reasonForLeave'],
                received: { employee_id, employee_name, leaveType, startDate, endDate, daysRequested, reasonForLeave }
            });
        }
        
        // Validate leave type
        const validLeaveTypes = ['annual', 'sick', 'maternity', 'paternity', 'compassionate', 'study', 'unpaid'];
        if (!validLeaveTypes.includes(leaveType)) {
            console.log('❌ Invalid leave type:', leaveType);
            return res.status(400).json({
                error: 'Invalid leave type',
                details: `Leave type "${leaveType}" is not valid`,
                validOptions: validLeaveTypes
            });
        }
        
        // Check for overlapping leave requests
        const [overlapping] = await db.execute(`
            SELECT COUNT(*) as count FROM leave_requests 
            WHERE employee_id = ? AND 
                  ((start_date <= ? AND end_date >= ?) OR 
                   (start_date <= ? AND end_date >= ?))
                  AND approval_status != 'rejected'
        `, [employee_id, startDate, startDate, endDate, endDate]);
        
        if (overlapping[0].count > 0) {
            console.log('❌ Overlapping leave request detected');
            return res.status(409).json({
                error: 'Overlapping leave request',
                details: 'Employee already has leave approved for this period',
                overlapping_count: overlapping[0].count
            });
        }
        
        // Insert new leave request
        const result = await db.execute(`
            INSERT INTO leave_requests (
                employee_id, employee_name, leave_type, start_date, end_date,
                days_requested, reason_for_leave, approval_status, approved_by,
                approved_date, rejection_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            employee_id,
            employee_name || 'Unknown Employee',
            leaveType,
            startDate,
            endDate,
            daysRequested,
            reasonForLeave,
            'pending', // approval_status
            approvedBy || null,
            null, // approved_date
            rejectionReason || null
        ]);
        
        // Handle different result formats from db.execute()
        const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;
        console.log('✅ Leave request created successfully:', result);
        console.log('✅ Insert ID:', insertId);
        
        // Verify the data was actually inserted
        try {
            const [verification] = await db.execute(
                'SELECT * FROM leave_requests WHERE id = ?',
                [insertId]
            );
            console.log('🔍 Verification - Retrieved leave request:', verification);
            console.log('🔍 Verification - Leave request exists:', verification && verification.length > 0);
        } catch (verifyError) {
            console.error('❌ Verification error:', verifyError);
        }
        
        res.status(201).json({
            message: 'Leave request created successfully',
            leave_request_id: insertId,
            data: {
                employee_id,
                employee_name,
                leave_type: leaveType,
                start_date: startDate,
                end_date: endDate,
                days_requested: daysRequested,
                reason_for_leave: reasonForLeave,
                approval_status: 'pending',
                approved_by: approvedBy,
                created_at: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating leave request:', error);
        res.status(500).json({ 
            error: 'Failed to create leave request',
            details: error.message
        });
    }
});

// Update leave request (approve/reject)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            approval_status,
            approved_by,
            approved_date,
            rejection_reason
        } = req.body;
        
        console.log('📝 Updating leave request:', id);
        console.log('📊 Update data:', { approval_status, approved_by, approved_date, rejection_reason });
        
        // Validate approval status
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(approval_status)) {
            return res.status(400).json({
                error: 'Invalid approval status',
                validOptions: validStatuses
            });
        }
        
        const [result] = await db.execute(`
            UPDATE leave_requests SET
                approval_status = ?, approved_by = ?, approved_date = ?, rejection_reason = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [approval_status, approved_by, approved_date, rejection_reason, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
        }
        
        console.log('✅ Leave request updated successfully');
        res.json({ 
            message: 'Leave request updated successfully',
            approval_status,
            updated_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error updating leave request:', error);
        res.status(500).json({ error: 'Failed to update leave request' });
    }
});

// Delete leave request
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🗑️ Deleting leave request:', id);
        
        const [result] = await db.execute(
            'DELETE FROM leave_requests WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
        }
        
        console.log('✅ Leave request deleted successfully');
        res.json({ message: 'Leave request deleted successfully' });
        
    } catch (error) {
        console.error('❌ Error deleting leave request:', error);
        res.status(500).json({ error: 'Failed to delete leave request' });
    }
});

// Get leave requests summary
router.get('/summary', async (req, res) => {
    try {
        console.log('📊 Generating leave requests summary...');
        
        const [summary] = await db.execute(`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_requests,
                COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_requests,
                COUNT(CASE WHEN approval_status = 'rejected' THEN 1 END) as rejected_requests,
                COUNT(CASE WHEN leave_type = 'annual' THEN 1 END) as annual_leave,
                COUNT(CASE WHEN leave_type = 'sick' THEN 1 END) as sick_leave,
                COUNT(CASE WHEN leave_type = 'maternity' THEN 1 END) as maternity_leave,
                COUNT(CASE WHEN leave_type = 'paternity' THEN 1 END) as paternity_leave,
                SUM(days_requested) as total_days_requested
            FROM leave_requests
        `);
        
        console.log('✅ Leave requests summary generated:', summary[0]);
        res.json(summary[0]);
        
    } catch (error) {
        console.error('❌ Error generating leave requests summary:', error);
        res.status(500).json({ error: 'Failed to generate leave requests summary' });
    }
});

module.exports = router;
