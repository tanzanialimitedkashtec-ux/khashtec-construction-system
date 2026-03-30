const express = require('express');
const router = express.Router();

console.log('🚀 Simple senior hiring routes loaded');

// Test GET route
router.get('/test', (req, res) => {
    console.log('🧪 GET /api/senior-hiring/test accessed');
    res.json({ 
        message: 'Senior hiring API test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// Main GET route
router.get('/', (req, res) => {
    console.log('� GET /api/senior-hiring accessed');
    res.json({ 
        message: 'Senior hiring main endpoint working!',
        timestamp: new Date().toISOString(),
        requests: [
            {
                id: 1,
                candidate_name: 'John Doe',
                position: 'Senior Developer',
                department: 'IT',
                status: 'pending',
                request_date: '2026-03-30',
                approval_date: null
            },
            {
                id: 2,
                candidate_name: 'Jane Smith',
                position: 'Project Manager',
                department: 'Projects',
                status: 'approved',
                request_date: '2026-03-29',
                approval_date: '2026-03-30'
            }
        ]
    });
});

// GET by ID route
router.get('/:id', (req, res) => {
    console.log('📝 GET /api/senior-hiring/:id accessed with id:', req.params.id);
    res.json({ 
        message: 'Senior hiring request by ID endpoint working!',
        id: req.params.id,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
        console.log('🔍 Fetching senior hiring request:', req.params.id);
        const [requests] = await db.execute('SELECT * FROM senior_hiring_requests WHERE id = ?', [req.params.id]);
        
        if (requests.length === 0) {
                return res.status(404).json({ error: 'Senior hiring request not found' });
        }
        
        res.json(requests[0]);
    } catch (error) {
        console.error('❌ Error fetching senior hiring request:', error);
        res.status(500).json({ error: 'Failed to fetch senior hiring request' });
    }
});

// Approve senior hiring request
router.post('/:id/approve', async (req, res) => {
    try {
        const { approvedBy, comments } = req.body;
        const requestId = req.params.id;
        
        console.log('✅ Approving senior hiring request:', requestId, 'by:', approvedBy);
        
        // Update request status
        await db.execute(
                'UPDATE senior_hiring_requests SET status = ?, approved_by = ?, approved_date = CURDATE() WHERE id = ?',
                ['Approved', approvedBy, requestId]
        );
        
        // Add to approvals table
        await db.execute(
                'INSERT INTO senior_hiring_approvals (request_id, approved_by, approved_by_role, comments, final_decision) VALUES (?, ?, ?, ?, ?)',
                [requestId, approvedBy, 'HR Manager', comments, 'Approved']
        );
        
        // Get request details for notification
        const [requests] = await db.execute('SELECT * FROM senior_hiring_requests WHERE id = ?', [requestId]);
        const request = requests[0];
        
        console.log('📧 Sending approval notification for:', request.candidate_name);
        
        res.json({ 
                message: 'Senior hiring request approved successfully',
                request: {
                        ...request,
                        status: 'Approved',
                        approved_by: approvedBy,
                        approved_date: new Date().toISOString().split('T')[0]
                }
        });
    } catch (error) {
        console.error('❌ Error approving senior hiring request:', error);
        res.status(500).json({ error: 'Failed to approve senior hiring request' });
    }
});

// Reject senior hiring request
router.post('/:id/reject', async (req, res) => {
    try {
        const { rejectionReason, rejectedBy } = req.body;
        const requestId = req.params.id;
        
        console.log('❌ Rejecting senior hiring request:', requestId, 'by:', rejectedBy, 'reason:', rejectionReason);
        
        // Update request status
        await db.execute(
                'UPDATE senior_hiring_requests SET status = ?, rejection_reason = ?, approved_by = ? WHERE id = ?',
                ['Rejected', rejectionReason, rejectedBy, requestId]
        );
        
        // Add to rejections table
        await db.execute(
                'INSERT INTO senior_hiring_rejections (request_id, rejection_reason, rejected_by, rejected_by_role) VALUES (?, ?, ?, ?)',
                [requestId, rejectionReason, rejectedBy, 'HR Manager']
        );
        
        // Get request details for notification
        const [requests] = await db.execute('SELECT * FROM senior_hiring_requests WHERE id = ?', [requestId]);
        const request = requests[0];
        
        console.log('📧 Sending rejection notification for:', request.candidate_name);
        
        res.json({ 
                message: 'Senior hiring request rejected successfully',
                request: {
                        ...request,
                        status: 'Rejected',
                        rejection_reason: rejectionReason,
                        approved_by: rejectedBy
                }
        });
    } catch (error) {
        console.error('❌ Error rejecting senior hiring request:', error);
        res.status(500).json({ error: 'Failed to reject senior hiring request' });
    }
});

// Request more information
router.post('/:id/request-info', async (req, res) => {
    try {
        const { infoRequired, requestedBy } = req.body;
        const requestId = req.params.id;
        
        console.log('🔄 Requesting more info for senior hiring request:', requestId, 'by:', requestedBy);
        
        // Update request status
        await db.execute(
                'UPDATE senior_hiring_requests SET status = ?, more_info_request = ? WHERE id = ?',
                ['More Info Requested', infoRequired, requestId]
        );
        
        // Add to info requests table
        await db.execute(
                'INSERT INTO senior_hiring_info_requests (request_id, info_required, requested_by, requested_by_role) VALUES (?, ?, ?, ?)',
                [requestId, infoRequired, requestedBy, 'HR Manager']
        );
        
        // Get request details for notification
        const [requests] = await db.execute('SELECT * FROM senior_hiring_requests WHERE id = ?', [requestId]);
        const request = requests[0];
        
        console.log('📧 Sending info request notification for:', request.candidate_name);
        
        res.json({ 
                message: 'Information request sent successfully',
                request: {
                        ...request,
                        status: 'More Info Requested',
                        more_info_request: infoRequired
                }
        });
    } catch (error) {
        console.error('❌ Error requesting more information:', error);
        res.status(500).json({ error: 'Failed to request more information' });
    }
});

// Get approval history for a request
router.get('/:id/approvals', async (req, res) => {
    try {
        console.log('🔍 Fetching approval history for request:', req.params.id);
        const [approvals] = await db.execute(
                'SELECT * FROM senior_hiring_approvals WHERE request_id = ? ORDER BY approval_date DESC',
                [req.params.id]
        );
        res.json(approvals);
    } catch (error) {
        console.error('❌ Error fetching approval history:', error);
        res.status(500).json({ error: 'Failed to fetch approval history' });
    }
});

// Get rejection history for a request
router.get('/:id/rejections', async (req, res) => {
    try {
        console.log('🔍 Fetching rejection history for request:', req.params.id);
        const [rejections] = await db.execute(
                'SELECT * FROM senior_hiring_rejections WHERE request_id = ? ORDER BY rejection_date DESC',
                [req.params.id]
        );
        res.json(rejections);
    } catch (error) {
        console.error('❌ Error fetching rejection history:', error);
        res.status(500).json({ error: 'Failed to fetch rejection history' });
    }
});

// Get info request history for a request
router.get('/:id/info-requests', async (req, res) => {
    try {
        console.log('🔍 Fetching info request history for request:', req.params.id);
        const [infoRequests] = await db.execute(
                'SELECT * FROM senior_hiring_info_requests WHERE request_id = ? ORDER BY request_date DESC',
                [req.params.id]
        );
        res.json(infoRequests);
    } catch (error) {
        console.error('❌ Error fetching info request history:', error);
        res.status(500).json({ error: 'Failed to fetch info request history' });
    }
});

module.exports = router;
