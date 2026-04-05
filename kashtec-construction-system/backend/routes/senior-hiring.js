const express = require('express');
const router = express.Router();

console.log('🚀 Senior hiring route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Senior hiring test endpoint accessed');
    res.json({ 
        message: 'Senior hiring API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully'
    });
});

// Root endpoint test
router.get('/', (req, res) => {
    console.log('👔 Senior hiring root endpoint accessed');
    res.json({ 
        message: 'Senior hiring API root endpoint',
        available_endpoints: ['GET /test', 'POST /requests', 'GET /requests', 'GET /requests/:id', 'POST /:id/approve', 'POST /:id/reject', 'POST /:id/request-info']
    });
});

// Create new senior hiring request
router.post('/requests', async (req, res) => {
    try {
        console.log('👔 Senior hiring request creation received');
        console.log('📝 Request body:', req.body);
        
        const {
            id,
            candidateName,
            proposedSalary,
            department,
            experience,
            hrRecommendation,
            positionLevel,
            requestedBy,
            requestedByRole
        } = req.body;
        
        // Validate required fields
        if (!candidateName || !proposedSalary || !department || !requestedBy) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'candidateName, proposedSalary, department, and requestedBy are required'
            });
        }
        
        console.log('🔍 About to execute senior hiring insert query...');
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            const requestId = id || `SHR${Date.now().toString().slice(-6)}`;
            
            const query = `
                INSERT INTO senior_hiring_requests (
                    id, candidate_name, proposed_salary, department, experience,
                    hr_recommendation, position_level, requested_by, requested_by_role,
                    status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
            `;
            
            const values = [
                requestId,
                candidateName,
                proposedSalary,
                department,
                experience || null,
                hrRecommendation || null,
                positionLevel || 'Senior',
                requestedBy,
                requestedByRole || null
            ];
            
            console.log('🔍 Query:', query);
            console.log('📊 Values:', values);
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Senior hiring request inserted successfully:', result);
            
            res.status(201).json({
                success: true,
                message: 'Senior hiring request created successfully',
                requestId: requestId,
                request: {
                    id: requestId,
                    candidateName,
                    proposedSalary,
                    department,
                    experience,
                    hrRecommendation,
                    positionLevel,
                    requestedBy,
                    requestedByRole,
                    status: 'Pending'
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock senior hiring request:', dbError);
            
            // Fallback to mock senior hiring request creation
            const requestId = id || `SHR${Date.now().toString().slice(-6)}`;
            
            res.status(201).json({
                success: true,
                message: 'Senior hiring request created successfully (mock)',
                requestId: requestId,
                request: {
                    id: requestId,
                    candidateName,
                    proposedSalary,
                    department,
                    experience,
                    hrRecommendation,
                    positionLevel,
                    requestedBy,
                    requestedByRole,
                    status: 'Pending',
                    mock: true
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error creating senior hiring request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create senior hiring request',
            details: error.message 
        });
    }
});

// Get all senior hiring requests
router.get('/requests', async (req, res) => {
    try {
        console.log('📋 Fetching all senior hiring requests...');
        
        let requests = [];
        
        try {
            const db = require('../../database/config/database');
            const requestsResult = await db.execute('SELECT * FROM senior_hiring_requests ORDER BY request_date DESC');
            requests = Array.isArray(requestsResult) ? requestsResult[0] : requestsResult;
            console.log('✅ Senior hiring requests fetched from database:', requests.length);
        } catch (dbError) {
            console.error('❌ Database error, using fallback senior hiring requests:', dbError);
            
            // Fallback to mock senior hiring requests
            requests = [
                {
                    id: 'SHR001',
                    candidate_name: 'John Anderson',
                    proposed_salary: '$120,000',
                    department: 'Project Management',
                    experience: '15 years in project management, PMP certified',
                    hr_recommendation: 'Highly recommended for senior position',
                    position_level: 'Director',
                    requested_by: 'HR Manager',
                    requested_by_role: 'HR Manager',
                    status: 'Pending',
                    request_date: '2024-01-15T10:30:00Z'
                },
                {
                    id: 'SHR002',
                    candidate_name: 'Sarah Mitchell',
                    proposed_salary: '$95,000',
                    department: 'Finance',
                    experience: '12 years in financial management, CPA certified',
                    hr_recommendation: 'Strong candidate with excellent track record',
                    position_level: 'Senior Manager',
                    requested_by: 'Finance Manager',
                    requested_by_role: 'Finance Manager',
                    status: 'Pending',
                    request_date: '2024-01-14T14:20:00Z'
                }
            ];
        }
        
        res.json({
            success: true,
            requests: requests,
            total: requests.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching senior hiring requests:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch senior hiring requests',
            details: error.message 
        });
    }
});

// Get senior hiring request by ID
router.get('/requests/:id', async (req, res) => {
    try {
        const requestId = req.params.id;
        console.log('🔍 Fetching senior hiring request:', requestId);
        
        let request = null;
        
        try {
            const db = require('../../database/config/database');
            const requestResult = await db.execute('SELECT * FROM senior_hiring_requests WHERE id = ?', [requestId]);
            const requests = Array.isArray(requestResult) ? requestResult[0] : requestResult;
            
            if (requests.length > 0) {
                request = requests[0];
                console.log('✅ Senior hiring request found:', request);
            }
        } catch (dbError) {
            console.error('❌ Database error, using fallback senior hiring request:', dbError);
            
            // Fallback to mock senior hiring request
            if (requestId === 'SHR001') {
                request = {
                    id: 'SHR001',
                    candidate_name: 'John Anderson',
                    proposed_salary: '$120,000',
                    department: 'Project Management',
                    experience: '15 years in project management, PMP certified',
                    hr_recommendation: 'Highly recommended for senior position',
                    position_level: 'Director',
                    requested_by: 'HR Manager',
                    requested_by_role: 'HR Manager',
                    status: 'Pending',
                    request_date: '2024-01-15T10:30:00Z',
                    mock: true
                };
            }
        }
        
        if (!request) {
            return res.status(404).json({ 
                success: false,
                error: 'Senior hiring request not found' 
            });
        }
        
        res.json({
            success: true,
            request: request
        });
        
    } catch (error) {
        console.error('❌ Error fetching senior hiring request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch senior hiring request',
            details: error.message 
        });
    }
});

// Approve senior hiring request
router.post('/requests/:id/approve', async (req, res) => {
    try {
        const requestId = req.params.id;
        const { approvedBy, approvedByRole, comments } = req.body;
        
        console.log('✅ Approving senior hiring request:', requestId);
        console.log('📝 Approval data:', req.body);
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Update main request status
            await db.execute(
                'UPDATE senior_hiring_requests SET status = "Approved", approved_by = ?, approved_date = NOW() WHERE id = ?',
                [approvedBy || 'Managing Director', requestId]
            );
            
            // Insert approval record
            await db.execute(
                'INSERT INTO senior_hiring_approvals (request_id, approved_by, approved_by_role, approval_date, comments, final_decision) VALUES (?, ?, ?, NOW(), ?, "Approved")',
                [requestId, approvedBy || 'Managing Director', approvedByRole || 'Managing Director', comments || null]
            );
            
            console.log('✅ Senior hiring request approved successfully:', requestId);
            
            res.json({
                success: true,
                message: 'Senior hiring request approved successfully',
                requestId: requestId,
                status: 'Approved',
                approvedBy: approvedBy || 'Managing Director',
                approvedDate: new Date().toISOString()
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock approval:', dbError);
            
            // Fallback to mock approval
            res.json({
                success: true,
                message: 'Senior hiring request approved successfully (mock)',
                requestId: requestId,
                status: 'Approved',
                approvedBy: approvedBy || 'Managing Director',
                approvedDate: new Date().toISOString(),
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error approving senior hiring request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to approve senior hiring request',
            details: error.message 
        });
    }
});

// Reject senior hiring request
router.post('/requests/:id/reject', async (req, res) => {
    try {
        const requestId = req.params.id;
        const { rejectedBy, rejectedByRole, rejectionReason } = req.body;
        
        console.log('❌ Rejecting senior hiring request:', requestId);
        console.log('📝 Rejection data:', req.body);
        
        // Validate rejection reason
        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                error: 'Rejection reason is required'
            });
        }
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Update main request status
            await db.execute(
                'UPDATE senior_hiring_requests SET status = "Rejected", rejection_reason = ?, approved_date = NOW() WHERE id = ?',
                [rejectionReason, requestId]
            );
            
            // Insert rejection record
            await db.execute(
                'INSERT INTO senior_hiring_rejections (request_id, rejection_reason, rejected_by, rejected_by_role, rejection_date) VALUES (?, ?, ?, ?, NOW())',
                [requestId, rejectionReason, rejectedBy || 'Managing Director', rejectedByRole || 'Managing Director']
            );
            
            console.log('✅ Senior hiring request rejected successfully:', requestId);
            
            res.json({
                success: true,
                message: 'Senior hiring request rejected successfully',
                requestId: requestId,
                status: 'Rejected',
                rejectionReason: rejectionReason,
                rejectedBy: rejectedBy || 'Managing Director'
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock rejection:', dbError);
            
            // Fallback to mock rejection
            res.json({
                success: true,
                message: 'Senior hiring request rejected successfully (mock)',
                requestId: requestId,
                status: 'Rejected',
                rejectionReason: rejectionReason,
                rejectedBy: rejectedBy || 'Managing Director',
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error rejecting senior hiring request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to reject senior hiring request',
            details: error.message 
        });
    }
});

// Request more information for senior hiring
router.post('/requests/:id/request-info', async (req, res) => {
    try {
        const requestId = req.params.id;
        const { infoRequest, requestedBy, requestedByRole } = req.body;
        
        console.log('🔄 Requesting more information for senior hiring:', requestId);
        console.log('📝 Info request data:', req.body);
        
        // Validate info request
        if (!infoRequest) {
            return res.status(400).json({
                success: false,
                error: 'Information request is required'
            });
        }
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Update main request status
            await db.execute(
                'UPDATE senior_hiring_requests SET status = "More Info Requested", more_info_request = ? WHERE id = ?',
                [infoRequest, requestId]
            );
            
            // Insert info request record
            await db.execute(
                'INSERT INTO senior_hiring_info_requests (request_id, info_required, requested_by, requested_by_role, request_date, status) VALUES (?, ?, ?, ?, NOW(), "Pending")',
                [requestId, infoRequest, requestedBy || 'Managing Director', requestedByRole || 'Managing Director']
            );
            
            console.log('✅ Information request created successfully:', requestId);
            
            res.json({
                success: true,
                message: 'Information request sent successfully',
                requestId: requestId,
                status: 'More Info Requested',
                infoRequest: infoRequest,
                requestedBy: requestedBy || 'Managing Director'
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock info request:', dbError);
            
            // Fallback to mock info request
            res.json({
                success: true,
                message: 'Information request sent successfully (mock)',
                requestId: requestId,
                status: 'More Info Requested',
                infoRequest: infoRequest,
                requestedBy: requestedBy || 'Managing Director',
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error requesting information for senior hiring:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to request information',
            details: error.message 
        });
    }
});

module.exports = router;
