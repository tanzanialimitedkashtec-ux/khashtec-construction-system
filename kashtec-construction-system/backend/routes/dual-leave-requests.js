const express = require('express');
const router = express.Router();

console.log('🚀 Dual leave requests route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Dual leave requests test endpoint accessed');
    res.json({ 
        message: 'Dual leave requests API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully'
    });
});

// Root endpoint test
router.get('/', (req, res) => {
    console.log('📝 Dual leave requests root endpoint accessed');
    res.json({ 
        message: 'Dual leave requests API root endpoint',
        available_endpoints: ['GET /test', 'POST /requests', 'GET /requests', 'GET /requests/:id', 'PUT /requests/:id/approve', 'PUT /requests/:id/reject']
    });
});

// Create new dual leave request (for both HR and Manager approval)
router.post('/requests', async (req, res) => {
    try {
        console.log('📝 Dual leave request creation received');
        console.log('📝 Request body:', req.body);
        
        const {
            employeeId,
            employeeName,
            leaveType,
            startDate,
            endDate,
            reason,
            totalDays,
            requestedBy,
            department,
            managerApprovalRequired,
            hrApprovalRequired
        } = req.body;
        
        // Validate required fields
        if (!employeeId || !employeeName || !leaveType || !startDate || !endDate || !department) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'employeeId, employeeName, leaveType, startDate, endDate, and department are required'
            });
        }
        
        console.log('🔍 About to execute dual leave request insert query...');
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            const query = `
                INSERT INTO dual_leave_requests (
                    employee_id, employee_name, leave_type, start_date, end_date,
                    reason, total_days, requested_by, department, manager_approval_required,
                    hr_approval_required, manager_status, hr_status, overall_status, 
                    request_date, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pending', 'Pending', CURDATE(), NOW())
            `;
            
            const values = [
                employeeId,
                employeeName,
                leaveType,
                startDate,
                endDate,
                reason || null,
                parseInt(totalDays) || 1,
                requestedBy || employeeName,
                department,
                managerApprovalRequired || true,
                hrApprovalRequired || true
            ];
            
            console.log('🔍 Query:', query);
            console.log('📊 Values:', values);
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Dual leave request inserted successfully:', result);
            
            res.status(201).json({
                success: true,
                message: 'Dual leave request created successfully',
                requestId: result.insertId,
                request: {
                    id: result.insertId,
                    employeeId,
                    employeeName,
                    leaveType,
                    startDate,
                    endDate,
                    reason,
                    totalDays: parseInt(totalDays) || 1,
                    requestedBy: requestedBy || employeeName,
                    department,
                    managerApprovalRequired: managerApprovalRequired || true,
                    hrApprovalRequired: hrApprovalRequired || true,
                    managerStatus: 'Pending',
                    hrStatus: 'Pending',
                    overallStatus: 'Pending'
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock dual leave request:', dbError);
            
            // Fallback to mock dual leave request creation
            const requestId = `DLR${Date.now().toString().slice(-6)}`;
            
            res.status(201).json({
                success: true,
                message: 'Dual leave request created successfully (mock)',
                requestId: requestId,
                request: {
                    id: requestId,
                    employeeId,
                    employeeName,
                    leaveType,
                    startDate,
                    endDate,
                    reason,
                    totalDays: parseInt(totalDays) || 1,
                    requestedBy: requestedBy || employeeName,
                    department,
                    managerApprovalRequired: managerApprovalRequired || true,
                    hrApprovalRequired: hrApprovalRequired || true,
                    managerStatus: 'Pending',
                    hrStatus: 'Pending',
                    overallStatus: 'Pending',
                    mock: true
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error creating dual leave request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create dual leave request',
            details: error.message 
        });
    }
});

// Get all dual leave requests
router.get('/requests', async (req, res) => {
    try {
        console.log('📋 Fetching all dual leave requests...');
        
        const { status, department, employeeId, overallStatus } = req.query;
        
        let requests = [];
        
        try {
            const db = require('../../database/config/database');
            
            let query = 'SELECT * FROM dual_leave_requests';
            const params = [];
            
            if (status) {
                query += ' WHERE (manager_status = ? OR hr_status = ?)';
                params.push(status, status);
            }
            
            if (department) {
                query += status ? ' AND department = ?' : ' WHERE department = ?';
                params.push(department);
            }
            
            if (employeeId) {
                query += (status || department) ? ' AND employee_id = ?' : ' WHERE employee_id = ?';
                params.push(employeeId);
            }
            
            if (overallStatus) {
                query += (status || department || employeeId) ? ' AND overall_status = ?' : ' WHERE overall_status = ?';
                params.push(overallStatus);
            }
            
            query += ' ORDER BY request_date DESC';
            
            const requestsResult = await db.execute(query, params);
            requests = Array.isArray(requestsResult) ? requestsResult[0] : requestsResult;
            console.log('✅ Dual leave requests fetched from database:', requests.length);
        } catch (dbError) {
            console.error('❌ Database error, using fallback dual leave requests:', dbError);
            
            // Fallback to mock dual leave requests
            requests = [
                {
                    id: 1,
                    employee_id: 'EMP001',
                    employee_name: 'John Doe',
                    leave_type: 'Annual Leave',
                    start_date: '2024-01-20',
                    end_date: '2024-01-24',
                    reason: 'Family vacation',
                    total_days: 5,
                    requested_by: 'John Doe',
                    department: 'Project Management',
                    manager_approval_required: true,
                    hr_approval_required: true,
                    manager_status: 'Pending',
                    hr_status: 'Pending',
                    overall_status: 'Pending',
                    request_date: '2024-01-15'
                },
                {
                    id: 2,
                    employee_id: 'EMP002',
                    employee_name: 'Jane Smith',
                    leave_type: 'Sick Leave',
                    start_date: '2024-01-18',
                    end_date: '2024-01-19',
                    reason: 'Medical appointment',
                    total_days: 2,
                    requested_by: 'Jane Smith',
                    department: 'Finance',
                    manager_approval_required: true,
                    hr_approval_required: false,
                    manager_status: 'Approved',
                    hr_status: 'N/A',
                    overall_status: 'Approved',
                    request_date: '2024-01-17'
                },
                {
                    id: 3,
                    employee_id: 'EMP003',
                    employee_name: 'Mike Johnson',
                    leave_type: 'Personal Leave',
                    start_date: '2024-01-25',
                    end_date: '2024-01-26',
                    reason: 'Personal matters',
                    total_days: 2,
                    requested_by: 'Mike Johnson',
                    department: 'HR',
                    manager_approval_required: true,
                    hr_approval_required: true,
                    manager_status: 'Rejected',
                    hr_status: 'Pending',
                    overall_status: 'Rejected',
                    request_date: '2024-01-16'
                }
            ];
        }
        
        res.json({
            success: true,
            requests: requests,
            total: requests.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching dual leave requests:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch dual leave requests',
            details: error.message 
        });
    }
});

// Get dual leave request by ID
router.get('/requests/:id', async (req, res) => {
    try {
        const requestId = req.params.id;
        console.log('🔍 Fetching dual leave request:', requestId);
        
        let request = null;
        
        try {
            const db = require('../../database/config/database');
            const requestResult = await db.execute('SELECT * FROM dual_leave_requests WHERE id = ?', [requestId]);
            const requests = Array.isArray(requestResult) ? requestResult[0] : requestResult;
            
            if (requests.length > 0) {
                request = requests[0];
                console.log('✅ Dual leave request found:', request);
            }
        } catch (dbError) {
            console.error('❌ Database error, using fallback dual leave request:', dbError);
            
            // Fallback to mock dual leave request
            if (requestId === '1') {
                request = {
                    id: 1,
                    employee_id: 'EMP001',
                    employee_name: 'John Doe',
                    leave_type: 'Annual Leave',
                    start_date: '2024-01-20',
                    end_date: '2024-01-24',
                    reason: 'Family vacation',
                    total_days: 5,
                    requested_by: 'John Doe',
                    department: 'Project Management',
                    manager_approval_required: true,
                    hr_approval_required: true,
                    manager_status: 'Pending',
                    hr_status: 'Pending',
                    overall_status: 'Pending',
                    request_date: '2024-01-15',
                    mock: true
                };
            }
        }
        
        if (!request) {
            return res.status(404).json({ 
                success: false,
                error: 'Dual leave request not found' 
            });
        }
        
        res.json({
            success: true,
            request: request
        });
        
    } catch (error) {
        console.error('❌ Error fetching dual leave request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch dual leave request',
            details: error.message 
        });
    }
});

// Approve dual leave request (Manager or HR)
router.put('/requests/:id/approve', async (req, res) => {
    try {
        const requestId = req.params.id;
        const { approvedBy, approvedByRole, approvedDate, comments, approvalType } = req.body;
        
        console.log('✅ Approving dual leave request:', requestId);
        console.log('📝 Approval data:', req.body);
        
        // Validate approval type
        if (!approvalType || !['manager', 'hr'].includes(approvalType)) {
            return res.status(400).json({
                success: false,
                error: 'Valid approval type (manager or hr) is required'
            });
        }
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Update the appropriate approval status
            const statusField = approvalType === 'manager' ? 'manager_status' : 'hr_status';
            const approverField = approvalType === 'manager' ? 'manager_approved_by' : 'hr_approved_by';
            const dateField = approvalType === 'manager' ? 'manager_approved_date' : 'hr_approved_date';
            
            const query = `
                UPDATE dual_leave_requests 
                SET ${statusField} = 'Approved', ${approverField} = ?, ${dateField} = ?, comments = ?
                WHERE id = ?
            `;
            
            const values = [
                approvedBy || `${approvalType === 'manager' ? 'Department Manager' : 'HR Manager'}`,
                approvedDate || new Date().toISOString().split('T')[0],
                comments || null,
                requestId
            ];
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Dual leave request not found' 
                });
            }
            
            // Check if both approvals are complete and update overall status
            const statusCheckResult = await db.execute(
                'SELECT manager_status, hr_status, manager_approval_required, hr_approval_required FROM dual_leave_requests WHERE id = ?',
                [requestId]
            );
            const statusCheck = Array.isArray(statusCheckResult) ? statusCheckResult[0] : statusCheckResult;
            
            if (statusCheck.length > 0) {
                const request = statusCheck[0];
                let overallStatus = 'Pending';
                
                if ((!request.manager_approval_required || request.manager_status === 'Approved') &&
                    (!request.hr_approval_required || request.hr_status === 'Approved')) {
                    overallStatus = 'Approved';
                } else if (request.manager_status === 'Rejected' || request.hr_status === 'Rejected') {
                    overallStatus = 'Rejected';
                }
                
                await db.execute(
                    'UPDATE dual_leave_requests SET overall_status = ? WHERE id = ?',
                    [overallStatus, requestId]
                );
                
                console.log('✅ Dual leave request approved successfully:', result);
                
                res.json({
                    success: true,
                    message: `Dual leave request approved by ${approvalType}`,
                    requestId: requestId,
                    approvalType: approvalType,
                    overallStatus: overallStatus,
                    approvedBy: approvedBy || `${approvalType === 'manager' ? 'Department Manager' : 'HR Manager'}`,
                    approvedDate: approvedDate || new Date().toISOString().split('T')[0]
                });
            }
            
        } catch (dbError) {
            console.error('❌ Database error, using mock approval:', dbError);
            
            // Fallback to mock approval
            res.json({
                success: true,
                message: `Dual leave request approved by ${approvalType} (mock)`,
                requestId: requestId,
                approvalType: approvalType,
                overallStatus: 'Pending',
                approvedBy: approvedBy || `${approvalType === 'manager' ? 'Department Manager' : 'HR Manager'}`,
                approvedDate: approvedDate || new Date().toISOString().split('T')[0],
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error approving dual leave request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to approve dual leave request',
            details: error.message 
        });
    }
});

// Reject dual leave request (Manager or HR)
router.put('/requests/:id/reject', async (req, res) => {
    try {
        const requestId = req.params.id;
        const { rejectedBy, rejectedByRole, rejectionReason, rejectedDate, rejectionType } = req.body;
        
        console.log('❌ Rejecting dual leave request:', requestId);
        console.log('📝 Rejection data:', req.body);
        
        // Validate rejection type and reason
        if (!rejectionType || !['manager', 'hr'].includes(rejectionType)) {
            return res.status(400).json({
                success: false,
                error: 'Valid rejection type (manager or hr) is required'
            });
        }
        
        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                error: 'Rejection reason is required'
            });
        }
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Update the appropriate rejection status
            const statusField = rejectionType === 'manager' ? 'manager_status' : 'hr_status';
            const rejecterField = rejectionType === 'manager' ? 'manager_rejected_by' : 'hr_rejected_by';
            const dateField = rejectionType === 'manager' ? 'manager_rejected_date' : 'hr_rejected_date';
            const reasonField = rejectionType === 'manager' ? 'manager_rejection_reason' : 'hr_rejection_reason';
            
            const query = `
                UPDATE dual_leave_requests 
                SET ${statusField} = 'Rejected', ${rejecterField} = ?, ${dateField} = ?, ${reasonField} = ?, overall_status = 'Rejected'
                WHERE id = ?
            `;
            
            const values = [
                rejectedBy || `${rejectionType === 'manager' ? 'Department Manager' : 'HR Manager'}`,
                rejectedDate || new Date().toISOString().split('T')[0],
                rejectionReason,
                requestId
            ];
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Dual leave request not found' 
                });
            }
            
            console.log('✅ Dual leave request rejected successfully:', result);
            
            res.json({
                success: true,
                message: `Dual leave request rejected by ${rejectionType}`,
                requestId: requestId,
                rejectionType: rejectionType,
                overallStatus: 'Rejected',
                rejectedBy: rejectedBy || `${rejectionType === 'manager' ? 'Department Manager' : 'HR Manager'}`,
                rejectionReason: rejectionReason,
                rejectedDate: rejectedDate || new Date().toISOString().split('T')[0]
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock rejection:', dbError);
            
            // Fallback to mock rejection
            res.json({
                success: true,
                message: `Dual leave request rejected by ${rejectionType} (mock)`,
                requestId: requestId,
                rejectionType: rejectionType,
                overallStatus: 'Rejected',
                rejectedBy: rejectedBy || `${rejectionType === 'manager' ? 'Department Manager' : 'HR Manager'}`,
                rejectionReason: rejectionReason,
                rejectedDate: rejectedDate || new Date().toISOString().split('T')[0],
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error rejecting dual leave request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to reject dual leave request',
            details: error.message 
        });
    }
});

module.exports = router;
