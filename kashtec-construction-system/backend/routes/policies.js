const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

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
        const [existingPolicies] = await db.execute('SELECT * FROM policies WHERE id = ?', [policyId]);
        
        if (existingPolicies.length === 0) {
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
        const [result] = await db.execute(
            'UPDATE policies SET status = ?, approved_by = ?, approved_date = CURDATE() WHERE id = ?',
            ['Approved', approvedBy, policyId]
        );
        
        console.log('✅ Database update result:', result);
        console.log('📊 Rows affected:', result.affectedRows);
        
        // Get updated policy details for response
        const [updatedPolicies] = await db.execute('SELECT * FROM policies WHERE id = ?', [policyId]);
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
        const { rejectionReason, rejectedBy } = req.body;
        const policyId = req.params.id;
        
        console.log('❌ Rejecting policy:', policyId, 'by:', rejectedBy, 'reason:', rejectionReason);
        
        // Update policy status
        await db.execute(
                'UPDATE policies SET status = ?, rejection_reason = ?, approved_by = ? WHERE id = ?',
                ['Rejected', rejectionReason, rejectedBy, policyId]
        );
        
        // Add to rejection table
        await db.execute(
                'INSERT INTO policy_rejections (policy_id, rejection_reason, rejected_by, rejected_by_role) VALUES (?, ?, ?, ?)',
                [policyId, rejectionReason, rejectedBy, 'HR Manager']
        );
        
        // Get policy details for notification
        const [policies] = await db.execute('SELECT * FROM policies WHERE id = ?', [policyId]);
        const policy = policies[0];
        
        // Send notification to submitting department
        console.log('📧 Sending rejection notification to:', policy.submitted_by);
        
        res.json({ 
                message: 'Policy rejected successfully',
                policy: {
                        ...policy,
                        status: 'Rejected',
                        rejection_reason: rejectionReason,
                        approved_by: rejectedBy
                }
        });
    } catch (error) {
        console.error('❌ Error rejecting policy:', error);
        res.status(500).json({ error: 'Failed to reject policy' });
    }
});

// Request revision
router.post('/:id/revision', async (req, res) => {
    try {
        const { revisionRequest, requestedBy } = req.body;
        const policyId = req.params.id;
        
        console.log('🔄 Requesting revision for policy:', policyId, 'by:', requestedBy);
        
        // Update policy status
        await db.execute(
                'UPDATE policies SET status = ?, revision_request = ? WHERE id = ?',
                ['Revision Requested', revisionRequest, policyId]
        );
        
        // Add to revision table
        await db.execute(
                'INSERT INTO policy_revisions (policy_id, revision_request, requested_by, requested_by_role) VALUES (?, ?, ?, ?)',
                [policyId, revisionRequest, requestedBy, 'HR Manager']
        );
        
        // Get policy details for notification
        const [policies] = await db.execute('SELECT * FROM policies WHERE id = ?', [policyId]);
        const policy = policies[0];
        
        // Send notification to submitting department
        console.log('📧 Sending revision request notification to:', policy.submitted_by);
        
        res.json({ 
                message: 'Revision requested successfully',
                policy: {
                        ...policy,
                        status: 'Revision Requested',
                        revision_request: revisionRequest
                }
        });
    } catch (error) {
        console.error('❌ Error requesting revision:', error);
        res.status(500).json({ error: 'Failed to request revision' });
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
