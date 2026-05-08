const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

console.log('🚀 Senior hiring routes loaded with database connection');

// Test GET route
router.get('/test', (req, res) => {
    console.log('🧪 GET /api/senior-hiring/test accessed');
    res.json({ 
        message: 'Senior hiring API test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// Main GET route - fetch pending senior hiring requests
router.get('/', async (req, res) => {
    console.log('📝 GET /api/senior-hiring accessed');
    try {
        // Fetch pending senior hiring requests from senior_hiring_approval table
        const rows = await db.execute(`
            SELECT id, candidate_name, position, department, proposed_salary, experience, 
                   hr_recommendation, status, request_date, approval_date, approved_by
            FROM senior_hiring_approval 
            WHERE status = 'pending'
            ORDER BY request_date DESC
        `);
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching senior hiring requests:', error);
        res.status(500).json({ error: 'Failed to fetch senior hiring requests' });
    }
});

// GET by ID route - fetch specific senior hiring request
router.get('/:id', async (req, res) => {
    console.log('📝 GET /api/senior-hiring/:id accessed with id:', req.params.id);
    try {
        const rows = await db.execute(`
            SELECT id, candidate_name, position, department, proposed_salary, experience, 
                   hr_recommendation, status, request_date, approval_date, approved_by
            FROM senior_hiring_approval 
            WHERE id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Senior hiring request not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching senior hiring request:', error);
        res.status(500).json({ error: 'Failed to fetch senior hiring request' });
    }
});

// Create new senior hiring request
router.post('/', async (req, res) => {
    try {
        console.log('📝 Creating new senior hiring request');
        const {
            candidateName,
            position,
            department,
            proposedSalary,
            experience,
            recommendation,
            requestedBy,
            requestedByRole
        } = req.body;

        // Validate required fields
        if (!candidateName || !position || !department || !proposedSalary) {
            return res.status(400).json({
                error: 'Missing required fields: candidateName, position, department, proposedSalary'
            });
        }

        // Generate unique request ID
        const requestId = 'SHR' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

        // Ensure senior hiring tables exist without dropping existing data
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS senior_hiring_approval (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    candidate_name VARCHAR(255) NOT NULL,
                    position VARCHAR(255) NOT NULL,
                    department VARCHAR(100) NOT NULL,
                    proposed_salary VARCHAR(50) NOT NULL,
                    experience TEXT,
                    hr_recommendation TEXT,
                    status ENUM('pending', 'approved', 'rejected', 'info_requested') DEFAULT 'pending',
                    request_date DATE NOT NULL,
                    approval_date DATE,
                    approved_by VARCHAR(255),
                    requested_by VARCHAR(255) NOT NULL DEFAULT 'HR Manager',
                    requested_by_role VARCHAR(100) DEFAULT 'HR',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_status (status),
                    INDEX idx_department (department),
                    INDEX idx_date (request_date)
                )
            `);
            
            await db.execute(`
                CREATE TABLE IF NOT EXISTS senior_hiring_info_request (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    request_id INT NOT NULL,
                    info_request TEXT NOT NULL,
                    requested_by VARCHAR(255) NOT NULL,
                    requested_by_role VARCHAR(100),
                    request_date DATE NOT NULL,
                    response TEXT,
                    response_date DATE,
                    responded_by VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (request_id) REFERENCES senior_hiring_approval(id) ON DELETE CASCADE
                )
            `);
            
            await db.execute(`
                CREATE TABLE IF NOT EXISTS senior_hiring_rejection (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    request_id INT NOT NULL,
                    rejection_reason TEXT NOT NULL,
                    rejected_by VARCHAR(255) NOT NULL,
                    rejected_by_role VARCHAR(100),
                    rejection_date DATE NOT NULL,
                    notified_hr BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (request_id) REFERENCES senior_hiring_approval(id) ON DELETE CASCADE
                )
            `);
            
            console.log('✅ Senior hiring tables ensured to exist');
        } catch (tableError) {
            console.error('Error ensuring senior hiring tables exist:', tableError);
        }

        // Insert into senior_hiring_approval table
        const result = await db.execute(`
            INSERT INTO senior_hiring_approval 
            (candidate_name, position, department, proposed_salary, experience, 
             hr_recommendation, requested_by, requested_by_role, status, request_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `, [
            candidateName,
            position,
            department,
            proposedSalary,
            experience || '',
            recommendation || '',
            requestedBy || 'HR Manager',
            requestedByRole || 'HR'
        ]);

        console.log('✅ Senior hiring request created successfully:', requestId);

        res.json({
            message: 'Senior hiring request created successfully',
            request_id: requestId,
            candidate_name: candidateName,
            position: position,
            department: department,
            proposed_salary: proposedSalary,
            status: 'pending',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating senior hiring request:', error);
        console.error('SQL Error Details:', {
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({ 
            error: 'Failed to create senior hiring request',
            details: error.sqlMessage || error.message
        });
    }
});

// Approve senior hiring request
router.post('/:id/approve', async (req, res) => {
    try {
        console.log('✅ Approving senior hiring request:', req.params.id);
        const approvedBy = req.body.approved_by || req.body.approvedBy || 'Managing Director';
        const approvalDate = new Date().toISOString().split('T')[0];
        
        // Update the senior_hiring_approval table
        const result = await db.execute(`
            UPDATE senior_hiring_approval 
            SET status = 'approved', approval_date = ?, approved_by = ?
            WHERE id = ?
        `, [approvalDate, approvedBy, req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Senior hiring request not found'
            });
        }
        
        console.log('✅ Senior hiring approved successfully');
        
        res.json({
            message: 'Senior hiring request approved successfully',
            request_id: req.params.id,
            status: 'approved',
            approved_by: approvedBy,
            approved_date: approvalDate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error approving senior hiring request:', error);
        res.status(500).json({ error: 'Failed to approve senior hiring request' });
    }
});

// Request more information
router.post('/:id/request-info', async (req, res) => {
    try {
        console.log('🔄 Requesting more info for senior hiring request:', req.params.id);
        const infoRequest = req.body.info_request || req.body.infoRequired || req.body.info_required;
        const requestedBy = req.body.requested_by || req.body.requestedBy || 'Managing Director';
        const requestedDate = new Date().toISOString().split('T')[0];
        
        // Insert into senior_hiring_info_request table
        const result = await db.execute(`
            INSERT INTO senior_hiring_info_request 
            (request_id, info_request, requested_by, requested_date, status)
            VALUES (?, ?, ?, ?, 'pending')
        `, [req.params.id, infoRequest || 'Please provide additional information', requestedBy, requestedDate]);
        
        // Update the main request status
        await db.execute(`
            UPDATE senior_hiring_approval 
            SET status = 'info_requested'
            WHERE id = ?
        `, [req.params.id]);
        
        console.log('✅ Senior hiring info request created successfully');
        
        res.json({
            message: 'Information requested successfully',
            request_id: req.params.id,
            status: 'info_requested',
            info_request: infoRequest || 'Please provide additional information',
            requested_by: requestedBy,
            requested_date: requestedDate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error requesting more info:', error);
        res.status(500).json({ error: 'Failed to request more information', details: error.message });
    }
});

// Reject senior hiring request
router.post('/:id/reject', async (req, res) => {
    console.log('❌ Rejecting senior hiring request:', req.params.id);
    try {
        const rejectionReason = req.body.rejection_reason || req.body.rejectionReason || req.body.rejection_reason;
        const rejectedBy = req.body.rejected_by || req.body.rejectedBy || 'Managing Director';
        const rejectedDate = new Date().toISOString().split('T')[0];
        
        // Insert into senior_hiring_rejection table
        const result = await db.execute(`
            INSERT INTO senior_hiring_rejection 
            (request_id, rejection_reason, rejected_by, rejected_date)
            VALUES (?, ?, ?, ?)
        `, [req.params.id, rejectionReason || 'Candidate does not meet requirements', rejectedBy, rejectedDate]);
        
        // Update the main request status
        await db.execute(`
            UPDATE senior_hiring_approval 
            SET status = 'rejected'
            WHERE id = ?
        `, [req.params.id]);
        
        console.log('✅ Senior hiring rejected successfully');
        
        res.json({
            message: 'Senior hiring request rejected successfully',
            request_id: req.params.id,
            status: 'rejected',
            rejection_reason: rejectionReason || 'Candidate does not meet requirements',
            rejected_by: rejectedBy,
            rejected_date: rejectedDate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error rejecting senior hiring request:', error);
        res.status(500).json({ error: 'Failed to reject senior hiring request', details: error.message });
    }
});

module.exports = router;
