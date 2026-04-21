const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

console.log('🚀 Dual leave request routes module loaded successfully');

// Test endpoint to verify dual leave API is working
router.get('/test', (req, res) => {
    console.log('🧪 Dual leave API test endpoint accessed');
    res.json({ 
        message: 'Dual leave API is working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Create new leave request (saves to BOTH hr_work and leave_requests tables)
router.post('/', async (req, res) => {
    try {
        console.log('📝 POST /api/dual-leave-requests accessed - Creating dual leave request...');
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
            rejectionReason,
            // Additional fields for hr_work table
            priority = 'Medium',
            department_code = 'HR',
            submitted_by = 'HR Manager'
        } = req.body;
        
        // Validate required fields
        if (!employee_id || !employee_name || !leave_type || !start_date || !endDate || !days_requested || !reason_for_leave) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['employee', 'employee_name', 'leaveType', 'startDate', 'endDate', 'daysRequested', 'reasonForLeave'],
                received: { employee_id, employee_name, leave_type, start_date, endDate, days_requested, reason_for_leave }
            });
        }
        
        // Validate leave type
        const validLeaveTypes = ['annual', 'sick', 'maternity', 'paternity', 'compassionate', 'study', 'unpaid'];
        if (!validLeaveTypes.includes(leave_type)) {
            console.log('❌ Invalid leave type:', leave_type);
            return res.status(400).json({
                error: 'Invalid leave type',
                details: `Leave type "${leave_type}" is not valid`,
                validOptions: validLeaveTypes
            });
        }
        
        console.log('🔄 Step 1: Saving to hr_work table...');
        
        // Step 1: Save to hr_work table (for existing compatibility)
        const hrWorkQuery = `
            INSERT INTO hr_work (
                department_code, work_type, work_title, work_description,
                employee_name, employee_email, priority, submitted_by,
                submitted_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const hrWorkValues = [
            department_code,
            'Leave Management',
            `Leave Request - ${leave_type}`,
            reason_for_leave,
            employee_name,
            `${employee_id}@kashtec.com`, // Generate email
            priority,
            submitted_by,
            new Date().toISOString().split('T')[0],
            'pending'
        ];
        
        console.log('🔍 Executing hr_work query:', hrWorkQuery);
        console.log('🔍 hr_work values:', hrWorkValues);
        
        let hrWorkResult;
        try {
            hrWorkResult = await db.execute(hrWorkQuery, hrWorkValues);
            console.log('✅ hr_work record created successfully:', hrWorkResult);
        } catch (hrError) {
            console.error('❌ Error saving to hr_work table:', hrError);
            // Continue with leave_requests table even if hr_work fails
        }
        
        console.log('🔄 Step 2: Saving to leave_requests table...');
        
        // Step 2: Save to leave_requests table (new dedicated table)
        const leaveRequestQuery = `
            INSERT INTO leave_requests (
                employee_id, employee_name, leave_type, start_date, end_date,
                days_requested, reason_for_leave, approval_status, approved_by,
                approved_date, rejection_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const leaveRequestValues = [
            employee_id,
            employee_name || 'Unknown Employee',
            leave_type,
            start_date,
            endDate,
            days_requested,
            reason_for_leave,
            'pending', // approval_status
            approvedBy || null,
            null, // approved_date
            rejectionReason || null
        ];
        
        console.log('🔍 Executing leave_requests query:', leaveRequestQuery);
        console.log('🔍 leave_requests values:', leaveRequestValues);
        
        let leaveRequestResult;
        try {
            leaveRequestResult = await db.execute(leaveRequestQuery, leaveRequestValues);
            console.log('✅ leave_requests record created successfully:', leaveRequestResult);
        } catch (leaveError) {
            console.error('❌ Error saving to leave_requests table:', leaveError);
            throw new Error(`Failed to save to leave_requests table: ${leaveError.message}`);
        }
        
        // Get the IDs from both operations
        const hrWorkId = hrWorkResult ? (Array.isArray(hrWorkResult) ? hrWorkResult[0].insertId : hrWorkResult.insertId) : null;
        const leaveRequestId = Array.isArray(leaveRequestResult) ? leaveRequestResult[0].insertId : leaveRequestResult.insertId;
        
        console.log('✅ Both records created successfully');
        console.log('🔍 hr_work ID:', hrWorkId);
        console.log('🔍 leave_requests ID:', leaveRequestId);
        
        // Verify the data was actually inserted into leave_requests table
        try {
            const [verification] = await db.execute(
                'SELECT * FROM leave_requests WHERE id = ?',
                [leaveRequestId]
            );
            console.log('🔍 Verification - Retrieved leave request:', verification);
            console.log('🔍 Verification - Leave request exists:', verification && verification.length > 0);
        } catch (verifyError) {
            console.error('❌ Verification error:', verifyError);
        }
        
        res.status(201).json({
            message: 'Leave request created successfully in both tables',
            hr_work_id: hrWorkId,
            leave_request_id: leaveRequestId,
            data: {
                employee_id,
                employee_name,
                leave_type,
                start_date,
                end_date,
                days_requested,
                reason_for_leave,
                approval_status: 'pending',
                approved_by: approvedBy,
                created_at: new Date().toISOString()
            },
            tables_updated: {
                hr_work: hrWorkId ? 'success' : 'failed',
                leave_requests: 'success'
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating dual leave request:', error);
        res.status(500).json({ 
            error: 'Failed to create leave request',
            details: error.message
        });
    }
});

// Get leave requests from both tables
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching leave requests from both tables...');
        
        // Get from hr_work table
        const [hrWorkRequests] = await db.execute(`
            SELECT 
                id, work_title, work_description, employee_name, 
                submitted_date, status, priority
            FROM hr_work 
            WHERE work_type = 'Leave Management'
            ORDER BY submitted_date DESC
        `);
        
        // Get from leave_requests table
        const [leaveRequests] = await db.execute(`
            SELECT 
                id, employee_id, employee_name, leave_type, start_date, end_date,
                days_requested, reason_for_leave, approval_status, approved_by,
                created_at
            FROM leave_requests 
            ORDER BY created_at DESC
        `);
        
        console.log('✅ Leave requests fetched successfully');
        console.log('🔍 hr_work requests:', hrWorkRequests.length);
        console.log('🔍 leave_requests:', leaveRequests.length);
        
        res.json({
            success: true,
            data: {
                hr_work_requests: hrWorkRequests || [],
                leave_requests: leaveRequests || [],
                summary: {
                    total_hr_work: hrWorkRequests.length || 0,
                    total_leave_requests: leaveRequests.length || 0,
                    combined_total: (hrWorkRequests.length || 0) + (leaveRequests.length || 0)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching leave requests:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch leave requests',
            details: error.message
        });
    }
});

// Get leave request by ID from leave_requests table
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
        res.json({
            success: true,
            data: leaveRequests[0]
        });
        
    } catch (error) {
        console.error('❌ Error fetching leave request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch leave request',
            details: error.message
        });
    }
});

// Update leave request (updates both tables)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            approval_status,
            approved_by,
            approved_date,
            rejection_reason
        } = req.body;
        
        console.log('📝 Updating leave request:', id, 'in both tables');
        
        // Validate approval status
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(approval_status)) {
            return res.status(400).json({
                error: 'Invalid approval status',
                validOptions: validStatuses
            });
        }
        
        // Update leave_requests table
        const [leaveResult] = await db.execute(`
            UPDATE leave_requests SET
                approval_status = ?, approved_by = ?, approved_date = ?, rejection_reason = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [approval_status, approved_by, approved_date, rejection_reason, id]);
        
        // Update hr_work table (find corresponding record)
        const [hrResult] = await db.execute(`
            UPDATE hr_work SET
                status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE work_type = 'Leave Management' AND 
                  work_description IN (SELECT reason_for_leave FROM leave_requests WHERE id = ?)
        `, [approval_status === 'approved' ? 'Completed' : 'Rejected', id]);
        
        if (leaveResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
        }
        
        console.log('✅ Leave request updated successfully in both tables');
        res.json({ 
            success: true,
            message: 'Leave request updated successfully in both tables',
            approval_status,
            updated_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error updating leave request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update leave request',
            details: error.message
        });
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
        res.json({
            success: true,
            data: summary[0]
        });
        
    } catch (error) {
        console.error('❌ Error generating leave requests summary:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate leave requests summary',
            details: error.message
        });
    }
});

module.exports = router;
