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
        const { approvedBy } = req.body;
        const policyId = req.params.id;
        
        console.log('✅ Approving policy:', policyId, 'by:', approvedBy);
        
        // Update policy status
        await db.execute(
                'UPDATE policies SET status = ?, approved_by = ?, approved_date = CURDATE() WHERE id = ?',
                ['Approved', approvedBy, policyId]
        );
        
        // Get policy details for notification
        const [policies] = await db.execute('SELECT * FROM policies WHERE id = ?', [policyId]);
        const policy = policies[0];
        
        // Send notification to submitting department
        console.log('📧 Sending approval notification to:', policy.submitted_by);
        
        res.json({ 
                message: 'Policy approved successfully',
                policy: {
                        ...policy,
                        status: 'Approved',
                        approved_by: approvedBy,
                        approved_date: new Date().toISOString().split('T')[0]
                }
        });
    } catch (error) {
        console.error('❌ Error approving policy:', error);
        res.status(500).json({ error: 'Failed to approve policy' });
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
