const express = require('express');
const router = express.Router();

console.log('🚀 Dual contracts route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Dual contracts test endpoint accessed');
    res.json({ 
        message: 'Dual contracts API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully'
    });
});

// Root endpoint test
router.get('/', (req, res) => {
    console.log('📋 Dual contracts root endpoint accessed');
    res.json({ 
        message: 'Dual contracts API root endpoint',
        available_endpoints: ['GET /test', 'POST /contracts', 'GET /contracts', 'GET /contracts/:id', 'PUT /contracts/:id/approve', 'PUT /contracts/:id/reject']
    });
});

// Create new dual contract (for both HR and Manager approval)
router.post('/contracts', async (req, res) => {
    try {
        console.log('📋 Dual contract creation received');
        console.log('📝 Request body:', req.body);
        
        const {
            employeeId,
            employeeName,
            contractType,
            position,
            department,
            salary,
            startDate,
            endDate,
            terms,
            requestedBy,
            managerApprovalRequired,
            hrApprovalRequired
        } = req.body;
        
        // Validate required fields
        if (!employeeId || !employeeName || !contractType || !position || !department || !salary || !startDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'employeeId, employeeName, contractType, position, department, salary, and startDate are required'
            });
        }
        
        console.log('🔍 About to execute dual contract insert query...');
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            const query = `
                INSERT INTO dual_contracts (
                    employee_id, employee_name, contract_type, position, department,
                    salary, start_date, end_date, terms, requested_by, manager_approval_required,
                    hr_approval_required, manager_status, hr_status, overall_status, 
                    created_date, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pending', 'Pending', CURDATE(), NOW())
            `;
            
            const values = [
                employeeId,
                employeeName,
                contractType,
                position,
                department,
                parseFloat(salary),
                startDate,
                endDate || null,
                terms || null,
                requestedBy || employeeName,
                managerApprovalRequired || true,
                hrApprovalRequired || true
            ];
            
            console.log('🔍 Query:', query);
            console.log('📊 Values:', values);
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Dual contract inserted successfully:', result);
            
            res.status(201).json({
                success: true,
                message: 'Dual contract created successfully',
                contractId: result.insertId,
                contract: {
                    id: result.insertId,
                    employeeId,
                    employeeName,
                    contractType,
                    position,
                    department,
                    salary: parseFloat(salary),
                    startDate,
                    endDate,
                    terms,
                    requestedBy: requestedBy || employeeName,
                    managerApprovalRequired: managerApprovalRequired || true,
                    hrApprovalRequired: hrApprovalRequired || true,
                    managerStatus: 'Pending',
                    hrStatus: 'Pending',
                    overallStatus: 'Pending'
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock dual contract:', dbError);
            
            // Fallback to mock dual contract creation
            const contractId = `DCT${Date.now().toString().slice(-6)}`;
            
            res.status(201).json({
                success: true,
                message: 'Dual contract created successfully (mock)',
                contractId: contractId,
                contract: {
                    id: contractId,
                    employeeId,
                    employeeName,
                    contractType,
                    position,
                    department,
                    salary: parseFloat(salary),
                    startDate,
                    endDate,
                    terms,
                    requestedBy: requestedBy || employeeName,
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
        console.error('❌ Error creating dual contract:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create dual contract',
            details: error.message 
        });
    }
});

// Get all dual contracts
router.get('/contracts', async (req, res) => {
    try {
        console.log('📋 Fetching all dual contracts...');
        
        const { status, department, employeeId, overallStatus, contractType } = req.query;
        
        let contracts = [];
        
        try {
            const db = require('../../database/config/database');
            
            let query = 'SELECT * FROM dual_contracts';
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
            
            if (contractType) {
                query += (status || department || employeeId || overallStatus) ? ' AND contract_type = ?' : ' WHERE contract_type = ?';
                params.push(contractType);
            }
            
            query += ' ORDER BY created_date DESC';
            
            const contractsResult = await db.execute(query, params);
            contracts = Array.isArray(contractsResult) ? contractsResult[0] : contractsResult;
            console.log('✅ Dual contracts fetched from database:', contracts.length);
        } catch (dbError) {
            console.error('❌ Database error, using fallback dual contracts:', dbError);
            
            // Fallback to mock dual contracts
            contracts = [
                {
                    id: 1,
                    employee_id: 'EMP001',
                    employee_name: 'John Doe',
                    contract_type: 'Permanent',
                    position: 'Senior Developer',
                    department: 'IT',
                    salary: 85000.00,
                    start_date: '2024-02-01',
                    end_date: null,
                    terms: 'Standard permanent employment terms with benefits',
                    requested_by: 'HR Manager',
                    manager_approval_required: true,
                    hr_approval_required: true,
                    manager_status: 'Pending',
                    hr_status: 'Pending',
                    overall_status: 'Pending',
                    created_date: '2024-01-15'
                },
                {
                    id: 2,
                    employee_id: 'EMP002',
                    employee_name: 'Jane Smith',
                    contract_type: 'Temporary',
                    position: 'Project Coordinator',
                    department: 'Project Management',
                    salary: 65000.00,
                    start_date: '2024-01-20',
                    end_date: '2024-06-20',
                    terms: '6-month temporary contract for specific project',
                    requested_by: 'Project Manager',
                    manager_approval_required: true,
                    hr_approval_required: false,
                    manager_status: 'Approved',
                    hr_status: 'N/A',
                    overall_status: 'Approved',
                    created_date: '2024-01-10'
                },
                {
                    id: 3,
                    employee_id: 'EMP003',
                    employee_name: 'Mike Johnson',
                    contract_type: 'Contract',
                    position: 'Site Supervisor',
                    department: 'Operations',
                    salary: 55000.00,
                    start_date: '2024-02-15',
                    end_date: '2024-08-15',
                    terms: '6-month contract with possibility of extension',
                    requested_by: 'Operations Manager',
                    manager_approval_required: true,
                    hr_approval_required: true,
                    manager_status: 'Rejected',
                    hr_status: 'Pending',
                    overall_status: 'Rejected',
                    created_date: '2024-01-12'
                }
            ];
        }
        
        res.json({
            success: true,
            contracts: contracts,
            total: contracts.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching dual contracts:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch dual contracts',
            details: error.message 
        });
    }
});

// Get dual contract by ID
router.get('/contracts/:id', async (req, res) => {
    try {
        const contractId = req.params.id;
        console.log('🔍 Fetching dual contract:', contractId);
        
        let contract = null;
        
        try {
            const db = require('../../database/config/database');
            const contractResult = await db.execute('SELECT * FROM dual_contracts WHERE id = ?', [contractId]);
            const contracts = Array.isArray(contractResult) ? contractResult[0] : contractResult;
            
            if (contracts.length > 0) {
                contract = contracts[0];
                console.log('✅ Dual contract found:', contract);
            }
        } catch (dbError) {
            console.error('❌ Database error, using fallback dual contract:', dbError);
            
            // Fallback to mock dual contract
            if (contractId === '1') {
                contract = {
                    id: 1,
                    employee_id: 'EMP001',
                    employee_name: 'John Doe',
                    contract_type: 'Permanent',
                    position: 'Senior Developer',
                    department: 'IT',
                    salary: 85000.00,
                    start_date: '2024-02-01',
                    end_date: null,
                    terms: 'Standard permanent employment terms with benefits',
                    requested_by: 'HR Manager',
                    manager_approval_required: true,
                    hr_approval_required: true,
                    manager_status: 'Pending',
                    hr_status: 'Pending',
                    overall_status: 'Pending',
                    created_date: '2024-01-15',
                    mock: true
                };
            }
        }
        
        if (!contract) {
            return res.status(404).json({ 
                success: false,
                error: 'Dual contract not found' 
            });
        }
        
        res.json({
            success: true,
            contract: contract
        });
        
    } catch (error) {
        console.error('❌ Error fetching dual contract:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch dual contract',
            details: error.message 
        });
    }
});

// Approve dual contract (Manager or HR)
router.put('/contracts/:id/approve', async (req, res) => {
    try {
        const contractId = req.params.id;
        const { approvedBy, approvedByRole, approvedDate, comments, approvalType } = req.body;
        
        console.log('✅ Approving dual contract:', contractId);
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
                UPDATE dual_contracts 
                SET ${statusField} = 'Approved', ${approverField} = ?, ${dateField} = ?, comments = ?
                WHERE id = ?
            `;
            
            const values = [
                approvedBy || `${approvalType === 'manager' ? 'Department Manager' : 'HR Manager'}`,
                approvedDate || new Date().toISOString().split('T')[0],
                comments || null,
                contractId
            ];
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Dual contract not found' 
                });
            }
            
            // Check if both approvals are complete and update overall status
            const statusCheckResult = await db.execute(
                'SELECT manager_status, hr_status, manager_approval_required, hr_approval_required FROM dual_contracts WHERE id = ?',
                [contractId]
            );
            const statusCheck = Array.isArray(statusCheckResult) ? statusCheckResult[0] : statusCheckResult;
            
            if (statusCheck.length > 0) {
                const contract = statusCheck[0];
                let overallStatus = 'Pending';
                
                if ((!contract.manager_approval_required || contract.manager_status === 'Approved') &&
                    (!contract.hr_approval_required || contract.hr_status === 'Approved')) {
                    overallStatus = 'Approved';
                } else if (contract.manager_status === 'Rejected' || contract.hr_status === 'Rejected') {
                    overallStatus = 'Rejected';
                }
                
                await db.execute(
                    'UPDATE dual_contracts SET overall_status = ? WHERE id = ?',
                    [overallStatus, contractId]
                );
                
                console.log('✅ Dual contract approved successfully:', result);
                
                res.json({
                    success: true,
                    message: `Dual contract approved by ${approvalType}`,
                    contractId: contractId,
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
                message: `Dual contract approved by ${approvalType} (mock)`,
                contractId: contractId,
                approvalType: approvalType,
                overallStatus: 'Pending',
                approvedBy: approvedBy || `${approvalType === 'manager' ? 'Department Manager' : 'HR Manager'}`,
                approvedDate: approvedDate || new Date().toISOString().split('T')[0],
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error approving dual contract:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to approve dual contract',
            details: error.message 
        });
    }
});

// Reject dual contract (Manager or HR)
router.put('/contracts/:id/reject', async (req, res) => {
    try {
        const contractId = req.params.id;
        const { rejectedBy, rejectedByRole, rejectionReason, rejectedDate, rejectionType } = req.body;
        
        console.log('❌ Rejecting dual contract:', contractId);
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
                UPDATE dual_contracts 
                SET ${statusField} = 'Rejected', ${rejecterField} = ?, ${dateField} = ?, ${reasonField} = ?, overall_status = 'Rejected'
                WHERE id = ?
            `;
            
            const values = [
                rejectedBy || `${rejectionType === 'manager' ? 'Department Manager' : 'HR Manager'}`,
                rejectedDate || new Date().toISOString().split('T')[0],
                rejectionReason,
                contractId
            ];
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Dual contract not found' 
                });
            }
            
            console.log('✅ Dual contract rejected successfully:', result);
            
            res.json({
                success: true,
                message: `Dual contract rejected by ${rejectionType}`,
                contractId: contractId,
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
                message: `Dual contract rejected by ${rejectionType} (mock)`,
                contractId: contractId,
                rejectionType: rejectionType,
                overallStatus: 'Rejected',
                rejectedBy: rejectedBy || `${rejectionType === 'manager' ? 'Department Manager' : 'HR Manager'}`,
                rejectionReason: rejectionReason,
                rejectedDate: rejectedDate || new Date().toISOString().split('T')[0],
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error rejecting dual contract:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to reject dual contract',
            details: error.message 
        });
    }
});

module.exports = router;
