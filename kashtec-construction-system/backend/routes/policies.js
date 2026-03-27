const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Railway deployment fix - v2024.03.23 - All policies table references fixed

// ===== POLICIES MANAGEMENT =====

// Get all policies
router.get('/', async (req, res) => {
    try {
        console.log('🔍 Fetching all policies...');
        const [policies] = await db.execute('SELECT * FROM policies ORDER BY submission_date DESC');
        console.log('📋 Policies found:', policies.length);
        res.json(policies);
    } catch (error) {
        console.error('❌ Error fetching policies:', error);
        res.status(500).json({ error: 'Failed to fetch policies' });
    }
});

// Get policy by ID
router.get('/:id', async (req, res) => {
    try {
        console.log('🔍 Fetching policy:', req.params.id);
        const [policies] = await db.execute('SELECT * FROM policies WHERE id = ?', [req.params.id]);
        
        if (policies.length === 0) {
                return res.status(404).json({ error: 'Policy not found' });
        }
        
        res.json(policies[0]);
    } catch (error) {
        console.error('❌ Error fetching policy:', error);
        res.status(500).json({ error: 'Failed to fetch policy' });
    }
});

// Approve policy
router.post('/:id/approve', async (req, res) => {
    try {
        console.log('🔍 Policy approval request received');
        console.log('📋 Request headers:', req.headers);
        console.log('📝 Request body:', req.body);
        console.log('📂 Policy ID parameter:', req.params.id);
        
        const { approvedBy } = req.body;
        const policyId = req.params.id;
        
        console.log('✅ Approving policy:', policyId, 'by:', approvedBy);
        
        // Validate input
        if (!policyId || !approvedBy) {
            console.log('❌ Validation failed - missing policy ID or approvedBy');
            return res.status(400).json({ 
                error: 'Missing policy ID or approvedBy field',
                received: { policyId, approvedBy }
            });
        }
        
        // Check if policy exists and is pending
        let existingPolicies;
        try {
            [existingPolicies] = await db.execute('SELECT * FROM policies WHERE id = ?', [policyId]);
        } catch (error) {
            console.error('❌ Database error checking policy:', error);
            return res.status(500).json({ 
                error: 'Database error while checking policy',
                details: error.message
            });
        }
        
        if (!existingPolicies || existingPolicies.length === 0) {
            console.log('❌ Policy not found:', policyId);
            return res.status(404).json({ 
                error: 'Policy not found',
                policyId: policyId
            });
        }
        
        const policy = existingPolicies[0];
        console.log('📋 Current policy status:', policy.status);
        
        if (policy.status !== 'Pending') {
            console.log('❌ Policy already processed:', policy.status);
            return res.status(400).json({ 
                error: 'Policy is not in pending status',
                currentStatus: policy.status,
                policyId: policyId
            });
        }
        
        console.log('✅ Validation passed, updating policy status...');
        
        // Update policy status
        let result;
        try {
            [result] = await db.execute(
                'UPDATE policies SET status = ?, approved_by = ?, approved_date = CURDATE() WHERE id = ?',
                ['Approved', approvedBy, policyId]
            );
        } catch (error) {
            console.error('❌ Database error updating policy:', error);
            return res.status(500).json({ 
                error: 'Database error while updating policy',
                details: error.message
            });
        }
        
        console.log('✅ Database update result:', result);
        console.log('📊 Rows affected:', result.affectedRows);
        
        // Get updated policy details for response
        let updatedPolicies;
        try {
            [updatedPolicies] = await db.execute('SELECT * FROM policies WHERE id = ?', [policyId]);
        } catch (error) {
            console.error('❌ Database error fetching updated policy:', error);
            return res.status(500).json({ 
                error: 'Database error while fetching updated policy',
                details: error.message
            });
        }
        
        if (!updatedPolicies || updatedPolicies.length === 0) {
            console.error('❌ Updated policy not found after update:', policyId);
            return res.status(500).json({ 
                error: 'Updated policy not found after update',
                policyId: policyId
            });
        }
        
        const updatedPolicy = updatedPolicies[0];
        
        console.log('📋 Updated policy details:', updatedPolicy);
        
        // Send notification to submitting department
        console.log('📧 Sending approval notification to:', policy.submitted_by);
        
        res.json({ 
            message: 'Policy approved successfully',
            id: updatedPolicy.id,
            policy: {
                ...updatedPolicy,
                status: 'Approved',
                approved_by: approvedBy,
                approved_date: new Date().toISOString().split('T')[0]
            }
        });
        
        console.log('✅ Policy approval completed successfully!');
        
    } catch (error) {
        console.error('❌ Error approving policy:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to approve policy',
            details: error.message 
        });
    }
});

// Reject policy
router.post('/:id/reject', async (req, res) => {
    try {
        console.log('❌ Policy rejection request received');
        console.log('📋 Request headers:', req.headers);
        console.log('📝 Request body:', req.body);
        console.log('📂 Policy ID parameter:', req.params.id);
        
        const { rejectionReason, rejectedBy } = req.body;
        const policyId = req.params.id;
        
        console.log('❌ Rejecting policy:', policyId, 'by:', rejectedBy, 'reason:', rejectionReason);
        
        // Validate input
        if (!policyId || !rejectionReason || !rejectedBy) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing policy ID, rejection reason, or rejectedBy field',
                received: { policyId, rejectionReason, rejectedBy }
            });
        }
        
        // Check if policy exists
        let existingPolicies;
        try {
            [existingPolicies] = await db.execute('SELECT * FROM policies WHERE id = ?', [policyId]);
        } catch (error) {
            console.error('❌ Database error checking policy:', error);
            return res.status(500).json({ 
                error: 'Database error while checking policy',
                details: error.message
            });
        }
        
        if (!existingPolicies || existingPolicies.length === 0) {
            console.log('❌ Policy not found:', policyId);
            return res.status(404).json({ 
                error: 'Policy not found',
                policyId: policyId
            });
        }
        
        const policy = existingPolicies[0];
        console.log('📋 Current policy status:', policy.status);
        
        console.log('✅ Validation passed, rejecting policy...');
        
        // Update policy status
        let result;
        try {
            [result] = await db.execute(
                'UPDATE policies SET status = ?, rejection_reason = ?, approved_by = ? WHERE id = ?',
                ['Rejected', rejectionReason, rejectedBy, policyId]
            );
        } catch (error) {
            console.error('❌ Database error updating policy:', error);
            return res.status(500).json({ 
                error: 'Database error while updating policy',
                details: error.message
            });
        }
        
        console.log('✅ Database update result:', result);
        console.log('📊 Rows affected:', result.affectedRows);
        
        // Add to rejection table
        let rejectionResult;
        try {
            [rejectionResult] = await db.execute(
                'INSERT INTO policy_rejections (policy_id, rejection_reason, rejected_by, rejected_by_role) VALUES (?, ?, ?, ?)',
                [policyId, rejectionReason, rejectedBy, 'Managing Director']
            );
        } catch (error) {
            console.error('❌ Database error adding to rejection table:', error);
            // Don't fail the whole operation if rejection table insert fails
            console.warn('⚠️ Policy was rejected but rejection record failed to save');
        }
        
        console.log('✅ Rejection record created:', rejectionResult);
        console.log('📋 Rejection ID:', rejectionResult.insertId);
        
        // Get updated policy details for response
        let updatedPolicies;
        try {
            [updatedPolicies] = await db.execute('SELECT * FROM policies WHERE id = ?', [policyId]);
        } catch (error) {
            console.error('❌ Database error fetching updated policy:', error);
            return res.status(500).json({ 
                error: 'Database error while fetching updated policy',
                details: error.message
            });
        }
        
        if (!updatedPolicies || updatedPolicies.length === 0) {
            console.error('❌ Updated policy not found after update:', policyId);
            return res.status(500).json({ 
                error: 'Updated policy not found after update',
                policyId: policyId
            });
        }
        
        const updatedPolicy = updatedPolicies[0];
        
        console.log('📋 Updated policy details:', updatedPolicy);
        
        // Send notification to submitting department
        console.log('📧 Sending rejection notification to:', policy.submitted_by);
        
        res.json({ 
            message: 'Policy rejected successfully',
            id: rejectionResult.insertId,
            policy: {
                ...updatedPolicy,
                status: 'Rejected',
                rejection_reason: rejectionReason,
                approved_by: rejectedBy
            }
        });
        
        console.log('✅ Policy rejection completed successfully!');
        
    } catch (error) {
        console.error('❌ Error rejecting policy:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to reject policy',
            details: error.message 
        });
    }
});

// Request revision
router.post('/:id/revision', async (req, res) => {
    try {
        console.log('🔄 Policy revision request received');
        console.log('📋 Request headers:', req.headers);
        console.log('📝 Request body:', req.body);
        console.log('📂 Policy ID parameter:', req.params.id);
        
        const { revisionRequest, requestedBy } = req.body;
        const policyId = req.params.id;
        
        console.log('✅ Requesting revision for policy:', policyId, 'by:', requestedBy);
        
        // Validate input
        if (!policyId || !revisionRequest || !requestedBy) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing policy ID, revision request, or requestedBy field',
                received: { policyId, revisionRequest, requestedBy }
            });
        }
        
        // Check if policy exists
        console.log('🔍 Looking for policy with ID:', policyId);
        console.log('🔍 Policy ID type:', typeof policyId);
        console.log('🔍 Policy ID value:', JSON.stringify(policyId));
        
        let existingPolicies;
        try {
            [existingPolicies] = await db.execute('SELECT * FROM policies WHERE id = ?', [policyId]);
            console.log('📊 Query result:', existingPolicies);
            console.log('📊 Result length:', existingPolicies ? existingPolicies.length : 'undefined/null');
        } catch (error) {
            console.error('❌ Database error checking policy:', error);
            return res.status(500).json({ 
                error: 'Database error while checking policy',
                details: error.message
            });
        }
        
        if (!existingPolicies || existingPolicies.length === 0) {
            console.log('❌ Policy not found:', policyId);
            return res.status(404).json({ 
                error: 'Policy not found',
                policyId: policyId
            });
        }
        
        const policy = existingPolicies[0];
        console.log('📋 Current policy status:', policy.status);
        
        console.log('✅ Validation passed, creating revision request...');
        
        // Update policy status
        const [result] = await db.execute(
            'UPDATE policies SET status = ?, revision_request = ? WHERE id = ?',
            ['Revision Requested', revisionRequest, policyId]
        );
        
        console.log('✅ Database update result:', result);
        console.log('📊 Rows affected:', result.affectedRows);
        
        // Add to revision table
        const [revisionResult] = await db.execute(
            'INSERT INTO policy_revisions (policy_id, revision_request, requested_by, requested_by_role) VALUES (?, ?, ?, ?)',
            [policyId, revisionRequest, requestedBy, 'HR Manager']
        );
        
        console.log('✅ Revision record created:', revisionResult);
        console.log('📋 Revision ID:', revisionResult.insertId);
        
        // Get updated policy details for response
        const [updatedPolicies] = await db.execute('SELECT * FROM policies WHERE id = ?', [policyId]);
        const updatedPolicy = updatedPolicies[0];
        
        console.log('📋 Updated policy details:', updatedPolicy);
        
        // Send notification to submitting department
        console.log('📧 Sending revision notification to:', policy.submitted_by);
        
        res.json({ 
            message: 'Revision requested successfully',
            id: revisionResult.insertId,
            policy: {
                ...updatedPolicy,
                status: 'Revision Requested',
                revision_request: revisionRequest
            }
        });
        
        console.log('✅ Policy revision request completed successfully!');
        
    } catch (error) {
        console.error('❌ Error requesting revision:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to request revision',
            details: error.message 
        });
    }
});

// Get policy revisions
router.get('/:id/revisions', async (req, res) => {
    try {
        console.log('🔍 Fetching revisions for policy:', req.params.id);
        const [revisions] = await db.execute(
                'SELECT * FROM policy_revisions WHERE policy_id = ? ORDER BY request_date DESC',
                [req.params.id]
        );
        res.json(revisions);
    } catch (error) {
        console.error('❌ Error fetching revisions:', error);
        res.status(500).json({ error: 'Failed to fetch revisions' });
    }
});

// Get policy rejections
router.get('/:id/rejections', async (req, res) => {
    try {
        console.log('🔍 Fetching rejections for policy:', req.params.id);
        const [rejections] = await db.execute(
                'SELECT * FROM policy_rejections WHERE policy_id = ? ORDER BY rejection_date DESC',
                [req.params.id]
        );
        res.json(rejections);
    } catch (error) {
        console.error('❌ Error fetching rejections:', error);
        res.status(500).json({ error: 'Failed to fetch rejections' });
    }
});

module.exports = router;

// ===== COMPREHENSIVE DEPARTMENT DATA MANAGEMENT =====

// Get all department data
router.get('/departments/all', async (req, res) => {
    try {
        console.log('🔍 Fetching all department data...');
        
        // Get all departments with their work records
        const departments = {
            hr: await getDepartmentWork('hr_work', 'HR'),
            finance: await getDepartmentWork('finance_work', 'FINANCE'),
            hse: await getDepartmentWork('hse_work', 'HSE'),
            project: await getDepartmentWork('project_work', 'PROJECT'),
            realestate: await getDepartmentWork('realestate_work', 'REALESTATE'),
            admin: await getDepartmentWork('admin_work', 'ADMIN')
        };
        
        // Get senior hiring and workforce budgets
        const [seniorHiring] = await db.execute('SELECT * FROM senior_hiring_requests ORDER BY request_date DESC');
        const [workforceBudgets] = await db.execute('SELECT * FROM workforce_budgets ORDER BY submission_date DESC');
        
        res.json({
            departments,
            seniorHiring,
            workforceBudgets,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error fetching department data:', error);
        res.status(500).json({ error: 'Failed to fetch department data' });
    }
});

// Helper function to get department work
async function getDepartmentWork(tableName, departmentCode) {
    try {
        const [work] = await db.execute(`SELECT * FROM ${tableName} WHERE department_code = ? ORDER BY submitted_date DESC`, [departmentCode]);
        return work;
    } catch (error) {
        console.error(`❌ Error fetching ${departmentCode} work:`, error);
        return [];
    }
}

// ===== HR DEPARTMENT ROUTES =====

// Create HR work record
router.post('/hr/work', async (req, res) => {
    try {
        const {
            work_type, work_title, work_description, employee_name,
            employee_email, project_name, priority, submitted_by, due_date
        } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO hr_work (work_type, work_title, work_description, employee_name,
             employee_email, project_name, priority, submitted_by, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [work_type, work_title, work_description, employee_name,
             employee_email, project_name, priority, submitted_by, due_date]
        );
        
        res.json({
            message: 'HR work record created successfully',
            id: result.insertId,
            data: { id: result.insertId, ...req.body }
        });
    } catch (error) {
        console.error('❌ Error creating HR work:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        
        // Provide specific error information
        let errorMessage = 'Failed to create HR work record';
        let statusCode = 500;
        
        if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = `Database table 'hr_work' does not exist. Please run database migrations.`;
            statusCode = 500;
        } else if (error.code === 'ER_BAD_NULL_ERROR') {
            errorMessage = 'Required field is missing. Please check all required fields are provided.';
            statusCode = 400;
        } else if (error.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Duplicate entry. This record may already exist.';
            statusCode = 409;
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Database connection refused. Please check database server is running.';
            statusCode = 503;
        } else if (error.code === 'ENOTFOUND') {
            errorMessage = 'Database host not found. Please check database configuration.';
            statusCode = 503;
        }
        
        res.status(statusCode).json({ 
            error: errorMessage,
            technical: error.message,
            code: error.code,
            details: {
                sqlState: error.sqlState,
                errno: error.errno
            }
        });
    }
});

// Get HR work records
router.get('/hr/work', async (req, res) => {
    try {
        const [work] = await db.execute('SELECT * FROM hr_work ORDER BY submitted_date DESC');
        res.json(work);
    } catch (error) {
        console.error('❌ Error fetching HR work:', error);
        res.status(500).json({ error: 'Failed to fetch HR work records' });
    }
});

// ===== FINANCE DEPARTMENT ROUTES =====

// Create Finance work record
router.post('/finance/work', async (req, res) => {
    try {
        const {
            work_type, work_title, work_description, amount, vendor_name,
            invoice_number, priority, submitted_by, due_date
        } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO finance_work (work_type, work_title, work_description, amount,
             vendor_name, invoice_number, priority, submitted_by, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [work_type, work_title, work_description, amount, vendor_name,
             invoice_number, priority, submitted_by, due_date]
        );
        
        res.json({
            message: 'Finance work record created successfully',
            id: result.insertId,
            data: { id: result.insertId, ...req.body }
        });
    } catch (error) {
        console.error('❌ Error creating Finance work:', error);
        res.status(500).json({ error: 'Failed to create Finance work record' });
    }
});

// Get Finance work records
router.get('/finance/work', async (req, res) => {
    try {
        const [work] = await db.execute('SELECT * FROM finance_work ORDER BY submitted_date DESC');
        res.json(work);
    } catch (error) {
        console.error('❌ Error fetching Finance work:', error);
        res.status(500).json({ error: 'Failed to fetch Finance work records' });
    }
});

// ===== HSE DEPARTMENT ROUTES =====

// Create HSE work record
router.post('/hse/work', async (req, res) => {
    try {
        const {
            work_type, work_title, work_description, incident_type, severity,
            location, project_name, priority, submitted_by, due_date
        } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO hse_work (work_type, work_title, work_description, incident_type,
             severity, location, project_name, priority, submitted_by, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [work_type, work_title, work_description, incident_type, severity,
             location, project_name, priority, submitted_by, due_date]
        );
        
        res.json({
            message: 'HSE work record created successfully',
            id: result.insertId,
            data: { id: result.insertId, ...req.body }
        });
    } catch (error) {
        console.error('❌ Error creating HSE work:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        
        // Provide specific error information
        let errorMessage = 'Failed to create HSE work record';
        let statusCode = 500;
        
        if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = `Database table 'hse_work' does not exist. Please run database migrations.`;
            statusCode = 500;
        } else if (error.code === 'ER_BAD_NULL_ERROR') {
            errorMessage = 'Required field is missing. Please check all required fields are provided.';
            statusCode = 400;
        } else if (error.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Duplicate entry. This record may already exist.';
            statusCode = 409;
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Database connection refused. Please check database server is running.';
            statusCode = 503;
        } else if (error.code === 'ENOTFOUND') {
            errorMessage = 'Database host not found. Please check database configuration.';
            statusCode = 503;
        }
        
        res.status(statusCode).json({ 
            error: errorMessage,
            technical: error.message,
            code: error.code,
            details: {
                sqlState: error.sqlState,
                errno: error.errno
            }
        });
    }
});

// Get HSE work records
router.get('/hse/work', async (req, res) => {
    try {
        const [work] = await db.execute('SELECT * FROM hse_work ORDER BY submitted_date DESC');
        res.json(work);
    } catch (error) {
        console.error('❌ Error fetching HSE work:', error);
        res.status(500).json({ error: 'Failed to fetch HSE work records' });
    }
});

// ===== PROJECT DEPARTMENT ROUTES =====

// Create Project work record
router.post('/project/work', async (req, res) => {
    try {
        const {
            work_type, work_title, work_description, project_name, client_name,
            project_phase, priority, submitted_by, due_date
        } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO project_work (work_type, work_title, work_description, project_name,
             client_name, project_phase, priority, submitted_by, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [work_type, work_title, work_description, project_name, client_name,
             project_phase, priority, submitted_by, due_date]
        );
        
        res.json({
            message: 'Project work record created successfully',
            id: result.insertId,
            data: { id: result.insertId, ...req.body }
        });
    } catch (error) {
        console.error('❌ Error creating Project work:', error);
        res.status(500).json({ error: 'Failed to create Project work record' });
    }
});

// Get Project work records
router.get('/project/work', async (req, res) => {
    try {
        const [work] = await db.execute('SELECT * FROM project_work ORDER BY submitted_date DESC');
        res.json(work);
    } catch (error) {
        console.error('❌ Error fetching Project work:', error);
        res.status(500).json({ error: 'Failed to fetch Project work records' });
    }
});

// ===== REAL ESTATE DEPARTMENT ROUTES =====

// Create Real Estate work record
router.post('/realestate/work', async (req, res) => {
    try {
        const {
            work_type, work_title, work_description, property_address, property_type,
            client_name, sale_amount, priority, submitted_by, due_date
        } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO realestate_work (work_type, work_title, work_description, property_address,
             property_type, client_name, sale_amount, priority, submitted_by, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [work_type, work_title, work_description, property_address, property_type,
             client_name, sale_amount, priority, submitted_by, due_date]
        );
        
        res.json({
            message: 'Real Estate work record created successfully',
            id: result.insertId,
            data: { id: result.insertId, ...req.body }
        });
    } catch (error) {
        console.error('❌ Error creating Real Estate work:', error);
        res.status(500).json({ error: 'Failed to create Real Estate work record' });
    }
});

// Get Real Estate work records
router.get('/realestate/work', async (req, res) => {
    try {
        const [work] = await db.execute('SELECT * FROM realestate_work ORDER BY submitted_date DESC');
        res.json(work);
    } catch (error) {
        console.error('❌ Error fetching Real Estate work:', error);
        res.status(500).json({ error: 'Failed to fetch Real Estate work records' });
    }
});

// ===== ADMIN DEPARTMENT ROUTES =====

// Create Admin work record
router.post('/admin/work', async (req, res) => {
    try {
        const {
            work_type, work_title, work_description, affected_department,
            deadline, priority, submitted_by, due_date
        } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO admin_work (work_type, work_title, work_description, affected_department,
             deadline, priority, submitted_by, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [work_type, work_title, work_description, affected_department,
             deadline, priority, submitted_by, due_date]
        );
        
        res.json({
            message: 'Admin work record created successfully',
            id: result.insertId,
            data: { id: result.insertId, ...req.body }
        });
    } catch (error) {
        console.error('❌ Error creating Admin work:', error);
        res.status(500).json({ error: 'Failed to create Admin work record' });
    }
});

// Get Admin work records
router.get('/admin/work', async (req, res) => {
    try {
        const [work] = await db.execute('SELECT * FROM admin_work ORDER BY submitted_date DESC');
        res.json(work);
    } catch (error) {
        console.error('❌ Error fetching Admin work:', error);
        res.status(500).json({ error: 'Failed to fetch Admin work records' });
    }
});

// ===== SENIOR HIRING MANAGEMENT =====

// Create senior hiring request
router.post('/senior-hiring', async (req, res) => {
    try {
        const {
            id, candidate_name, proposed_salary, department, experience,
            hr_recommendation, position_level, requested_by, requested_by_role
        } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO senior_hiring_requests (id, candidate_name, proposed_salary, department,
             experience, hr_recommendation, position_level, requested_by, requested_by_role)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, candidate_name, proposed_salary, department, experience,
             hr_recommendation, position_level, requested_by, requested_by_role]
        );
        
        res.json({
            message: 'Senior hiring request created successfully',
            id: result.insertId,
            data: { id, ...req.body }
        });
    } catch (error) {
        console.error('❌ Error creating senior hiring request:', error);
        res.status(500).json({ error: 'Failed to create senior hiring request' });
    }
});

// Get senior hiring requests
router.get('/senior-hiring', async (req, res) => {
    try {
        const [requests] = await db.execute('SELECT * FROM senior_hiring_requests ORDER BY request_date DESC');
        res.json(requests);
    } catch (error) {
        console.error('❌ Error fetching senior hiring requests:', error);
        res.status(500).json({ error: 'Failed to fetch senior hiring requests' });
    }
});

// ===== WORKFORCE BUDGET MANAGEMENT =====

// Create workforce budget
router.post('/workforce-budget', async (req, res) => {
    try {
        const {
            id, budget_period, total_proposed, salaries_wages, training_development,
            employee_benefits, recruitment_costs, submitted_by, submitted_by_role,
            current_headcount, justification
        } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO workforce_budgets (id, budget_period, total_proposed, salaries_wages,
             training_development, employee_benefits, recruitment_costs, submitted_by,
             submitted_by_role, current_headcount, justification)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, budget_period, total_proposed, salaries_wages, training_development,
             employee_benefits, recruitment_costs, submitted_by, submitted_by_role,
             current_headcount, justification]
        );
        
        res.json({
            message: 'Workforce budget created successfully',
            id: result.insertId,
            data: { id, ...req.body }
        });
    } catch (error) {
        console.error('❌ Error creating workforce budget:', error);
        res.status(500).json({ error: 'Failed to create workforce budget' });
    }
});

// Get workforce budgets
router.get('/workforce-budget', async (req, res) => {
    try {
        const [budgets] = await db.execute('SELECT * FROM workforce_budgets ORDER BY submission_date DESC');
        res.json(budgets);
    } catch (error) {
        console.error('❌ Error fetching workforce budgets:', error);
        res.status(500).json({ error: 'Failed to fetch workforce budgets' });
    }
});

// ===== WORK STATUS UPDATES =====

// Update work status for any department
router.put('/work/:tableName/:id/status', async (req, res) => {
    try {
        const { tableName, id } = req.params;
        const { status, assigned_to, completion_date } = req.body;
        
        // Validate table name
        const validTables = ['hr_work', 'finance_work', 'policies', 'project_work', 'realestate_work', 'admin_work'];
        if (!validTables.includes(tableName)) {
            return res.status(400).json({ error: 'Invalid table name' });
        }
        
        const [result] = await db.execute(
            `UPDATE ${tableName} SET status = ?, assigned_to = ?, completion_date = ? WHERE id = ?`,
            [status, assigned_to, completion_date, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Work record not found' });
        }
        
        res.json({
            message: 'Work status updated successfully',
            id: parseInt(id),
            status,
            assigned_to,
            completion_date
        });
    } catch (error) {
        console.error('❌ Error updating work status:', error);
        res.status(500).json({ error: 'Failed to update work status' });
    }
});

// ===== DEPARTMENT STATISTICS =====

// Get department statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = {
            hr: await getDepartmentStats('hr_work'),
            finance: await getDepartmentStats('finance_work'),
            hse: await getDepartmentStats('hse_work'),
            project: await getDepartmentStats('project_work'),
            realestate: await getDepartmentStats('realestate_work'),
            admin: await getDepartmentStats('admin_work'),
            seniorHiring: await getSeniorHiringStats(),
            workforceBudgets: await getWorkforceBudgetStats()
        };
        
        res.json(stats);
    } catch (error) {
        console.error('❌ Error fetching department statistics:', error);
        res.status(500).json({ error: 'Failed to fetch department statistics' });
    }
});

// Helper function to get department statistics
async function getDepartmentStats(tableName) {
    try {
        const [stats] = await db.execute(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inProgress,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
            FROM ${tableName}`
        );
        return stats[0];
    } catch (error) {
        console.error(`❌ Error getting ${tableName} stats:`, error);
        return { total: 0, pending: 0, inProgress: 0, completed: 0, rejected: 0 };
    }
}

// Helper function to get policy statistics
async function getPolicyStats() {
    try {
        const [stats] = await db.execute(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = 'Revision Requested' THEN 1 ELSE 0 END) as revisionRequested
            FROM hse_work`
        );
        return stats[0];
    } catch (error) {
        console.error('❌ Error getting policy stats:', error);
        return { total: 0, pending: 0, approved: 0, rejected: 0, revisionRequested: 0 };
    }
}

// Helper function to get senior hiring statistics
async function getSeniorHiringStats() {
    try {
        const [stats] = await db.execute(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = 'More Info Requested' THEN 1 ELSE 0 END) as moreInfoRequested
            FROM senior_hiring_requests`
        );
        return stats[0];
    } catch (error) {
        console.error('❌ Error getting senior hiring stats:', error);
        return { total: 0, pending: 0, approved: 0, rejected: 0, moreInfoRequested: 0 };
    }
}

// Helper function to get workforce budget statistics
async function getWorkforceBudgetStats() {
    try {
        const [stats] = await db.execute(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = 'Modification Requested' THEN 1 ELSE 0 END) as modificationRequested,
                SUM(total_proposed) as totalProposed
            FROM workforce_budgets`
        );
        return stats[0];
    } catch (error) {
        console.error('❌ Error getting workforce budget stats:', error);
        return { total: 0, pending: 0, approved: 0, rejected: 0, modificationRequested: 0, totalProposed: 0 };
    }
}

module.exports = router;
