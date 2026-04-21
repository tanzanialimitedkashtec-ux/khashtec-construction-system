const express = require('express');
const router = express.Router();

console.log('🚀 Policies route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Policies test endpoint accessed');
    res.json({ 
        message: 'Policies API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully'
    });
});

// Root endpoint - return all policies (main endpoint)
router.get('/', async (req, res) => {
    console.log('?? Policies main endpoint accessed - fetching all policies');
    try {
        // Mock policies data for now
        const policies = [
            {
                id: 'digital-recruitment',
                title: 'Digital Recruitment Policy',
                category: 'HR',
                status: 'pending',
                submitted_by: 'HR Manager',
                submitted_date: '2026-04-15',
                description: 'Policy for digital recruitment processes and procedures'
            },
            {
                id: 'safety-protocols',
                title: 'Workplace Safety Protocols',
                category: 'HSE',
                status: 'pending',
                submitted_by: 'HSE Manager',
                submitted_date: '2026-04-14',
                description: 'Updated safety protocols for construction sites'
            }
        ];
        
        console.log('?? Policies data returned:', policies.length, 'items');
        res.json(policies);
    } catch (error) {
        console.error('?? Error fetching policies:', error);
        res.status(500).json({ error: 'Failed to fetch policies' });
    }
});

// Get all policies
router.get('/all', async (req, res) => {
    try {
        console.log('📋 Fetching all policies...');
        
        const { status, category, submittedBy } = req.query;
        
        let policies = [];
        
        try {
            const db = require('../../database/config/database');
            
            let query = 'SELECT * FROM policies';
            const params = [];
            
            if (status) {
                query += ' WHERE status = ?';
                params.push(status);
            }
            
            if (category) {
                query += status ? ' AND category = ?' : ' WHERE category = ?';
                params.push(category);
            }
            
            if (submittedBy) {
                query += (status || category) ? ' AND submitted_by = ?' : ' WHERE submitted_by = ?';
                params.push(submittedBy);
            }
            
            query += ' ORDER BY submission_date DESC';
            
            const policiesResult = await db.execute(query, params);
            policies = Array.isArray(policiesResult) ? policiesResult[0] : policiesResult;
            console.log('✅ Policies fetched from database:', policies.length);
        } catch (dbError) {
            console.error('❌ Database error, using fallback policies:', dbError);
            
            // Fallback to mock policies
            policies = [
                {
                    id: 'POL001',
                    title: 'Employee Code of Conduct',
                    description: 'Guidelines for employee behavior and workplace ethics',
                    submitted_by: 'HR Manager',
                    submitted_by_role: 'HR Manager',
                    submission_date: '2024-01-15',
                    impact: 'High',
                    status: 'Approved',
                    approved_by: 'Managing Director',
                    approved_date: '2024-01-18'
                },
                {
                    id: 'POL002',
                    title: 'Health and Safety Policy',
                    description: 'Comprehensive safety guidelines for all construction sites',
                    submitted_by: 'HSE Manager',
                    submitted_by_role: 'HSE Manager',
                    submission_date: '2024-01-16',
                    impact: 'Critical',
                    status: 'Pending',
                    approved_by: null,
                    approved_date: null
                },
                {
                    id: 'POL003',
                    title: 'Remote Work Policy',
                    description: 'Guidelines for remote work and flexible arrangements',
                    submitted_by: 'HR Manager',
                    submitted_by_role: 'HR Manager',
                    submission_date: '2024-01-14',
                    impact: 'Medium',
                    status: 'Revision Requested',
                    approved_by: null,
                    approved_date: null
                }
            ];
        }
        
        res.json({
            success: true,
            policies: policies,
            total: policies.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching policies:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch policies',
            details: error.message 
        });
    }
});

// Create new policy
router.post('/', async (req, res) => {
    try {
        console.log('📝 Policy creation request received');
        console.log('📝 Request body:', req.body);
        
        const {
            id,
            title,
            description,
            submittedBy,
            submittedByRole,
            impact,
            category
        } = req.body;
        
        // Validate required fields
        if (!title || !description || !submittedBy) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'title, description, and submittedBy are required'
            });
        }
        
        console.log('🔍 About to execute policy insert query...');
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            const policyId = id || `POL${Date.now().toString().slice(-6)}`;
            
            const query = `
                INSERT INTO policies (
                    id, title, description, submitted_by, submitted_by_role,
                    submission_date, impact, status, category, created_at
                ) VALUES (?, ?, ?, ?, ?, CURDATE(), ?, 'Pending', ?, NOW())
            `;
            
            const values = [
                policyId,
                title,
                description,
                submittedBy,
                submittedByRole || null,
                impact || 'Medium',
                category || 'General'
            ];
            
            console.log('🔍 Query:', query);
            console.log('📊 Values:', values);
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Policy inserted successfully:', result);
            
            res.status(201).json({
                success: true,
                message: 'Policy created successfully',
                policyId: policyId,
                policy: {
                    id: policyId,
                    title,
                    description,
                    submittedBy,
                    submittedByRole,
                    impact: impact || 'Medium',
                    category: category || 'General',
                    status: 'Pending'
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock policy:', dbError);
            
            // Fallback to mock policy creation
            const policyId = id || `POL${Date.now().toString().slice(-6)}`;
            
            res.status(201).json({
                success: true,
                message: 'Policy created successfully (mock)',
                policyId: policyId,
                policy: {
                    id: policyId,
                    title,
                    description,
                    submittedBy,
                    submittedByRole,
                    impact: impact || 'Medium',
                    category: category || 'General',
                    status: 'Pending',
                    mock: true
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error creating policy:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create policy',
            details: error.message 
        });
    }
});

// Get policy by ID
router.get('/:id', async (req, res) => {
    try {
        const policyId = req.params.id;
        console.log('🔍 Fetching policy:', policyId);
        
        let policy = null;
        
        try {
            const db = require('../../database/config/database');
            const policyResult = await db.execute('SELECT * FROM policies WHERE id = ?', [policyId]);
            const policies = Array.isArray(policyResult) ? policyResult[0] : policyResult;
            
            if (policies.length > 0) {
                policy = policies[0];
                console.log('✅ Policy found:', policy);
            }
        } catch (dbError) {
            console.error('❌ Database error, using fallback policy:', dbError);
            
            // Fallback to mock policy
            if (policyId === 'POL001') {
                policy = {
                    id: 'POL001',
                    title: 'Employee Code of Conduct',
                    description: 'Guidelines for employee behavior and workplace ethics',
                    submitted_by: 'HR Manager',
                    submitted_by_role: 'HR Manager',
                    submission_date: '2024-01-15',
                    impact: 'High',
                    status: 'Approved',
                    approved_by: 'Managing Director',
                    approved_date: '2024-01-18',
                    mock: true
                };
            }
        }
        
        if (!policy) {
            return res.status(404).json({ 
                success: false,
                error: 'Policy not found' 
            });
        }
        
        res.json({
            success: true,
            policy: policy
        });
        
    } catch (error) {
        console.error('❌ Error fetching policy:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch policy',
            details: error.message 
        });
    }
});

// Approve policy
router.post('/:id/approve', async (req, res) => {
    try {
        const policyId = req.params.id;
        const { approvedBy, approvedByRole, comments } = req.body;
        
        console.log('✅ Approving policy:', policyId);
        console.log('📝 Approval data:', req.body);
        
        // Validate required fields
        if (!approvedBy) {
            return res.status(400).json({
                success: false,
                error: 'Approved by is required'
            });
        }
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Update policy status
            const updateResult = await db.execute(
                'UPDATE policies SET status = "Approved", approved_by = ?, approved_date = CURDATE() WHERE id = ?',
                [approvedBy || 'Managing Director', policyId]
            );
            
            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Policy not found' 
                });
            }
            
            // Insert approval record if the table exists
            try {
                await db.execute(
                    'INSERT INTO policy_approvals (policy_id, approved_by, approved_by_role, approval_date, comments) VALUES (?, ?, ?, CURDATE(), ?)',
                    [policyId, approvedBy, approvedByRole || 'Managing Director', comments || null]
                );
            } catch (approvalError) {
                console.log('⚠️ Policy approvals table may not exist:', approvalError.message);
            }
            
            console.log('✅ Policy approved successfully:', policyId);
            
            res.json({
                success: true,
                message: 'Policy approved successfully',
                policyId: policyId,
                status: 'Approved',
                approvedBy: approvedBy,
                approvedDate: new Date().toISOString().split('T')[0]
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock approval:', dbError);
            
            // Fallback to mock approval
            res.json({
                success: true,
                message: 'Policy approved successfully (mock)',
                policyId: policyId,
                status: 'Approved',
                approvedBy: approvedBy,
                approvedDate: new Date().toISOString().split('T')[0],
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error approving policy:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to approve policy',
            details: error.message 
        });
    }
});

// Request revision
router.post('/:id/revision', async (req, res) => {
    try {
        const policyId = req.params.id;
        const { revisionRequest, requestedBy, requestedByRole } = req.body;
        
        console.log('🔄 Requesting revision for policy:', policyId);
        console.log('📝 Revision request data:', req.body);
        
        // Validate revision request
        if (!revisionRequest) {
            return res.status(400).json({
                success: false,
                error: 'Revision request is required'
            });
        }
        
        // Validate required fields
        if (!requestedBy) {
            return res.status(400).json({
                success: false,
                error: 'Requested by is required'
            });
        }
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Update policy status
            const updateResult = await db.execute(
                'UPDATE policies SET status = "Revision Requested", revision_request = ? WHERE id = ?',
                [revisionRequest, policyId]
            );
            
            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Policy not found' 
                });
            }
            
            // Insert revision record if the table exists
            try {
                await db.execute(
                    'INSERT INTO policy_revisions (policy_id, revision_request, requested_by, requested_by_role, request_date, status) VALUES (?, ?, ?, ?, CURDATE(), "Pending")',
                    [policyId, revisionRequest, requestedBy, requestedByRole || 'Managing Director']
                );
            } catch (revisionError) {
                console.log('⚠️ Policy revisions table may not exist:', revisionError.message);
            }
            
            console.log('✅ Policy revision requested successfully:', policyId);
            
            res.json({
                success: true,
                message: 'Policy revision requested successfully',
                policyId: policyId,
                status: 'Revision Requested',
                revisionRequest: revisionRequest,
                requestedBy: requestedBy
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock revision request:', dbError);
            
            // Fallback to mock revision request
            res.json({
                success: true,
                message: 'Policy revision requested successfully (mock)',
                policyId: policyId,
                status: 'Revision Requested',
                revisionRequest: revisionRequest,
                requestedBy: requestedBy,
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error requesting policy revision:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to request policy revision',
            details: error.message 
        });
    }
});

// Reject policy
router.post('/:id/reject', async (req, res) => {
    try {
        const policyId = req.params.id;
        const { rejectedBy, rejectedByRole, rejectionReason } = req.body;
        
        console.log('❌ Rejecting policy:', policyId);
        console.log('📝 Rejection data:', req.body);
        
        // Validate rejection reason
        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                error: 'Rejection reason is required'
            });
        }
        
        // Validate required fields
        if (!rejectedBy) {
            return res.status(400).json({
                success: false,
                error: 'Rejected by is required'
            });
        }
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Update policy status
            const updateResult = await db.execute(
                'UPDATE policies SET status = "Rejected", rejection_reason = ?, approved_date = CURDATE() WHERE id = ?',
                [rejectionReason, policyId]
            );
            
            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Policy not found' 
                });
            }
            
            // Insert rejection record if the table exists
            try {
                await db.execute(
                    'INSERT INTO policy_rejections (policy_id, rejection_reason, rejected_by, rejected_by_role, rejection_date) VALUES (?, ?, ?, ?, CURDATE())',
                    [policyId, rejectionReason, rejectedBy, rejectedByRole || 'Managing Director']
                );
            } catch (rejectionError) {
                console.log('⚠️ Policy rejections table may not exist:', rejectionError.message);
            }
            
            console.log('✅ Policy rejected successfully:', policyId);
            
            res.json({
                success: true,
                message: 'Policy rejected successfully',
                policyId: policyId,
                status: 'Rejected',
                rejectionReason: rejectionReason,
                rejectedBy: rejectedBy,
                rejectedDate: new Date().toISOString().split('T')[0]
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock rejection:', dbError);
            
            // Fallback to mock rejection
            res.json({
                success: true,
                message: 'Policy rejected successfully (mock)',
                policyId: policyId,
                status: 'Rejected',
                rejectionReason: rejectionReason,
                rejectedBy: rejectedBy,
                rejectedDate: new Date().toISOString().split('T')[0],
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error rejecting policy:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to reject policy',
            details: error.message 
        });
    }
});

module.exports = router;
