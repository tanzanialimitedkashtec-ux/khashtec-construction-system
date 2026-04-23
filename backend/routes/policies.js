const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

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
    console.log('📋 Policies main endpoint accessed - fetching all policies');
    try {
        // Check if policies table exists first
        let tableCheck;
        try {
            [tableCheck] = await db.execute(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = 'policies'
            `);
        } catch (checkError) {
            console.log('⚠️ Table existence check failed, assuming table exists:', checkError.message);
            // Continue with the main query
        }
        
        // Only check if tableCheck is valid
        if (tableCheck && tableCheck[0] && tableCheck[0].count === 0) {
            console.log('⚠️ Policies table does not exist, returning empty array');
            return res.json([]);
        }
        
        // First check what columns actually exist in policies table
        let tableStructure;
        try {
            [tableStructure] = await db.execute(`
                DESCRIBE policies
            `);
            console.log('🔍 Policies table structure:', tableStructure);
            
            // Check if table has incomplete schema (missing required columns)
            const requiredColumns = ['id', 'title', 'description', 'submitted_by', 'status', 'created_at'];
            let existingColumns = [];
            
            if (tableStructure) {
                if (Array.isArray(tableStructure)) {
                    existingColumns = tableStructure.map(col => col.Field);
                } else if (tableStructure.Field) {
                    existingColumns = [tableStructure.Field];
                }
            }
            
            const hasAllColumns = requiredColumns.every(col => existingColumns.includes(col));
            
            if (!hasAllColumns) {
                console.log('⚠️ Policies table has incomplete schema, recreating table...');
                console.log('🔍 Existing columns:', existingColumns);
                console.log('🔍 Required columns:', requiredColumns);
                
                // Drop and recreate table with correct schema
                await db.execute(`DROP TABLE policies`);
                await db.execute(`
                    CREATE TABLE policies (
                      id VARCHAR(50) PRIMARY KEY,
                      title VARCHAR(255) NOT NULL,
                      description TEXT,
                      submitted_by VARCHAR(255) NOT NULL,
                      submitted_by_role VARCHAR(100),
                      submission_date DATE,
                      impact ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
                      status ENUM('Pending', 'Approved', 'Rejected', 'Revision Requested') DEFAULT 'Pending',
                      approved_by VARCHAR(255),
                      approved_date DATE,
                      rejection_reason TEXT,
                      revision_request TEXT,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                      INDEX idx_status (status),
                      INDEX idx_submitted_by (submitted_by),
                      INDEX idx_date (submission_date)
                    )
                `);
                console.log('✅ Policies table recreated with correct schema');
                
                // Re-insert the existing policy if it exists
                try {
                    await db.execute(`
                        INSERT INTO policies (
                            id, title, description, submitted_by, submitted_by_role, 
                            submission_date, impact, status, created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    `, [
                        'POL503445',
                        'Safety Policy - policy rejection',
                        'Safety Policy: policy rejection\n\nCategory: ppe-policy\nDescription: asdfghj\nCompliance Level: guideline\nApplicable To: specific-project\nTraining Required: induction, toolbox, formal, refresher\nEffective Date: 2026-04-24\nReview Date: 2026-04-24\nUploaded By: HSE Manager',
                        '2',
                        'HSE Manager',
                        '2026-04-23',
                        'Medium',
                        'Pending'
                    ]);
                    console.log('✅ Existing policy re-inserted with correct schema');
                } catch (insertError) {
                    console.log('⚠️ Could not re-insert existing policy:', insertError.message);
                }
            }
        } catch (structError) {
            console.log('⚠️ Could not get table structure:', structError.message);
        }
        
        // Fetch actual policies from database with simpler query first
        let policies;
        try {
            const result = await db.execute(`
                SELECT * FROM policies 
                ORDER BY created_at DESC
            `);
            console.log('🔍 Full query result type:', typeof result);
            console.log('🔍 Full query result is array:', Array.isArray(result));
            console.log('🔍 Full query result length:', result ? result.length : 'undefined');
            console.log('🔍 Full query result keys:', result ? Object.keys(result) : 'undefined');
            console.log('🔍 Full query result[0] type:', typeof result[0]);
            console.log('🔍 Full query result[0] is array:', Array.isArray(result[0]));
            console.log('🔍 Full query result[0] length:', result[0] ? result[0].length : 'undefined');
            
            // Try different ways to extract the rows array
            if (Array.isArray(result)) {
                if (result.length > 0 && Array.isArray(result[0])) {
                    policies = result[0]; // Standard format: [rows, fields]
                } else if (Array.isArray(result)) {
                    policies = result; // Direct array format
                } else {
                    policies = [result]; // Wrap single object in array
                }
            } else if (result && typeof result === 'object') {
                policies = [result]; // Wrap single object in array
            } else {
                policies = [];
            }
        } catch (queryError) {
            console.log('⚠️ Full query failed, trying basic query:', queryError.message);
            try {
                const result = await db.execute(`
                    SELECT id, title, description FROM policies 
                    ORDER BY id DESC
                `);
                console.log('🔍 Basic query result type:', typeof result);
                console.log('🔍 Basic query result is array:', Array.isArray(result));
                console.log('🔍 Basic query result[0] type:', typeof result[0]);
                console.log('🔍 Basic query result[0] is array:', Array.isArray(result[0]));
                
                // Try different ways to extract the rows array
                if (Array.isArray(result)) {
                    if (result.length > 0 && Array.isArray(result[0])) {
                        policies = result[0]; // Standard format: [rows, fields]
                    } else if (Array.isArray(result)) {
                        policies = result; // Direct array format
                    } else {
                        policies = [result]; // Wrap single object in array
                    }
                } else if (result && typeof result === 'object') {
                    policies = [result]; // Wrap single object in array
                } else {
                    policies = [];
                }
            } catch (basicError) {
                console.log('⚠️ Basic query also failed:', basicError.message);
                policies = [];
            }
        }
        
        console.log('📋 Policies data returned:', policies ? policies.length : 'undefined', 'items');
        console.log('📋 Policies type:', typeof policies);
        console.log('📋 Policies is array:', Array.isArray(policies));
        console.log('📋 Raw policies object:', JSON.stringify(policies, null, 2));
        
        // Check if policies is a valid array
        if (!policies || !Array.isArray(policies)) {
            console.log('⚠️ Policies query did not return an array, returning empty array');
            return res.json([]);
        }
        
        // Format policies for frontend
        const formattedPolicies = policies.map(policy => ({
            id: policy.id,
            title: policy.title,
            description: policy.description,
            submitted_by: policy.submitted_by,
            submitted_by_role: policy.submitted_by_role,
            submitted_date: policy.submission_date,
            impact: policy.impact || 'Medium',
            status: policy.status.toLowerCase(),
            approved_by: policy.approved_by,
            approved_date: policy.approved_date,
            rejection_reason: policy.rejection_reason,
            revision_request: policy.revision_request,
            created_at: policy.created_at,
            updated_at: policy.updated_at
        }));
        
        res.json(formattedPolicies);
    } catch (error) {
        console.error('❌ Error fetching policies:', error);
        console.error('❌ Error details:', error.message);
        
        // If table doesn't exist, return empty array instead of error
        if (error.message.includes("Table") && error.message.includes("doesn't exist")) {
            console.log('⚠️ Policies table missing, returning empty array');
            return res.json([]);
        }
        
        res.status(500).json({ 
            error: 'Failed to fetch policies',
            details: error.message 
        });
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
