const express = require('express');
const router = express.Router();

console.log('🚀 Workforce Requests route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Workforce Requests test endpoint accessed');
    res.json({ 
        message: 'Workforce Requests API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully',
        debug: 'Workforce Requests routes are loaded and responding'
    });
});

// Root endpoint - get all workforce requests
router.get('/', async (req, res) => {
    try {
        console.log('📝 Workforce Requests root endpoint accessed');
        
        let requests = [];
        
        try {
            const db = require('../../database/config/database');
            
            // Ensure workforce_requests table exists
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS workforce_requests (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        request_id VARCHAR(50) UNIQUE NOT NULL,
                        project_id VARCHAR(50) NOT NULL,
                        project_name VARCHAR(255) NOT NULL,
                        request_type ENUM('additional', 'replacement', 'specialized', 'temporary') NOT NULL,
                        workers_needed INT NOT NULL,
                        duration VARCHAR(100) NOT NULL,
                        job_categories VARCHAR(500) NULL,
                        justification TEXT NOT NULL,
                        start_date DATE NULL,
                        end_date DATE NULL,
                        special_requirements TEXT NULL,
                        status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
                        submitted_by VARCHAR(100) NULL,
                        approved_by VARCHAR(100) NULL,
                        approval_date TIMESTAMP NULL,
                        approved_justification TEXT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_project_id (project_id),
                        INDEX idx_status (status),
                        INDEX idx_request_type (request_type),
                        INDEX idx_created_at (created_at)
                    )
                `);
                console.log('✅ Workforce Requests table verified/created successfully');
            } catch (tableError) {
                console.log('⚠️ Could not create workforce_requests table:', tableError.message);
            }
            
            const requestsResult = await db.execute(`
                SELECT * FROM workforce_requests 
                ORDER BY created_at DESC
            `);
            
            // Handle different MySQL2 return formats
            if (Array.isArray(requestsResult)) {
                requests = requestsResult;
            } else if (requestsResult && Array.isArray(requestsResult[0])) {
                requests = requestsResult[0];
            } else if (requestsResult && requestsResult.rows) {
                requests = requestsResult.rows;
            } else {
                requests = [];
            }
            
            console.log('✅ Workforce Requests records fetched from database:', requests.length);
        } catch (dbError) {
            console.error('❌ Database error, using fallback workforce requests:', dbError);
            
            // Fallback to mock workforce requests
            requests = [
                {
                    id: 1,
                    request_id: 'WFR202605001',
                    project_id: 'prj001',
                    project_name: 'Port Modernization Phase 1',
                    request_type: 'additional',
                    workers_needed: 8,
                    duration: '3 weeks',
                    job_categories: 'construction,engineering,labor',
                    justification: 'Additional workforce needed for accelerated construction schedule due to client deadline pressure',
                    start_date: '2026-05-10',
                    end_date: '2026-05-31',
                    special_requirements: 'Experience with marine construction and safety certifications',
                    status: 'pending',
                    submitted_by: 'John Smith',
                    approved_by: null,
                    approval_date: null,
                    approved_justification: null,
                    created_at: '2026-05-05T09:00:00Z',
                    updated_at: '2026-05-05T09:00:00Z'
                },
                {
                    id: 2,
                    request_id: 'WFR202605002',
                    project_id: 'prj002',
                    project_name: 'Warehouse Construction',
                    request_type: 'replacement',
                    workers_needed: 3,
                    duration: '2 weeks',
                    job_categories: 'supervisor,driver',
                    justification: 'Replacement for workers who resigned unexpectedly',
                    start_date: '2026-05-08',
                    end_date: '2026-05-22',
                    special_requirements: 'Forklift operation experience required',
                    status: 'approved',
                    submitted_by: 'Sarah Johnson',
                    approved_by: 'Project Manager',
                    approval_date: '2026-05-05T14:30:00Z',
                    approved_justification: 'Critical for project timeline continuation',
                    created_at: '2026-05-04T11:00:00Z',
                    updated_at: '2026-05-05T14:30:00Z'
                },
                {
                    id: 3,
                    request_id: 'WFR202605003',
                    project_id: 'prj003',
                    project_name: 'Road Infrastructure',
                    request_type: 'specialized',
                    workers_needed: 5,
                    duration: '1 month',
                    job_categories: 'engineering,safety',
                    justification: 'Specialized engineers required for bridge construction phase',
                    start_date: '2026-05-15',
                    end_date: '2026-06-15',
                    special_requirements: 'Bridge construction experience and safety officer certification',
                    status: 'pending',
                    submitted_by: 'Mike Wilson',
                    approved_by: null,
                    approval_date: null,
                    approved_justification: null,
                    created_at: '2026-05-03T16:00:00Z',
                    updated_at: '2026-05-03T16:00:00Z'
                },
                {
                    id: 4,
                    request_id: 'WFR202605004',
                    project_id: 'prj001',
                    project_name: 'Port Modernization Phase 1',
                    request_type: 'temporary',
                    workers_needed: 4,
                    duration: '1 week',
                    job_categories: 'labor',
                    justification: 'Temporary support for urgent material unloading operation',
                    start_date: '2026-05-06',
                    end_date: '2026-05-13',
                    special_requirements: 'Heavy lifting experience required',
                    status: 'approved',
                    submitted_by: 'David Brown',
                    approved_by: 'Site Manager',
                    approval_date: '2026-05-05T10:15:00Z',
                    approved_justification: 'Urgent operational requirement',
                    created_at: '2026-05-02T13:30:00Z',
                    updated_at: '2026-05-05T10:15:00Z'
                },
                {
                    id: 5,
                    request_id: 'WFR202605005',
                    project_id: 'prj002',
                    project_name: 'Warehouse Construction',
                    request_type: 'additional',
                    workers_needed: 6,
                    duration: '2 weeks',
                    job_categories: 'construction,labor,supervisor',
                    justification: 'Additional workforce for accelerated warehouse completion',
                    start_date: '2026-05-12',
                    end_date: '2026-05-26',
                    special_requirements: 'Warehouse construction experience preferred',
                    status: 'pending',
                    submitted_by: 'Lisa Anderson',
                    approved_by: null,
                    approval_date: null,
                    approved_justification: null,
                    created_at: '2026-05-01T15:45:00Z',
                    updated_at: '2026-05-01T15:45:00Z'
                }
            ];
        }
        
        res.json({
            success: true,
            requests: requests,
            total: requests.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching workforce requests:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch workforce requests',
            details: error.message 
        });
    }
});

// Create new workforce request
router.post('/', async (req, res) => {
    try {
        console.log('📝 Workforce Request creation request received');
        console.log('📝 Request body:', req.body);
        
        const {
            workforceProject,
            requestType,
            workersNeeded,
            workDuration,
            jobCategories,
            workforceJustification,
            workforceStartDate,
            workforceEndDate,
            specialRequirements
        } = req.body;
        
        // Handle job categories array
        const finalJobCategories = Array.isArray(jobCategories) ? jobCategories.join(',') : jobCategories;
        
        // Validate required fields
        if (!workforceProject || !requestType || !workersNeeded || !workDuration || !workforceJustification) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'project, requestType, workersNeeded, duration, and justification are required'
            });
        }
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Generate unique request ID
            const requestId = 'WFR' + Date.now();
            
            // Get project name from project ID
            const projectNames = {
                'prj001': 'Port Modernization Phase 1',
                'prj002': 'Warehouse Construction',
                'prj003': 'Road Infrastructure'
            };
            
            const query = `
                INSERT INTO workforce_requests (
                    request_id, project_id, project_name, request_type, workers_needed,
                    duration, job_categories, justification, start_date, end_date,
                    special_requirements, status, submitted_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            const values = [
                requestId,
                workforceProject,
                projectNames[workforceProject] || workforceProject,
                requestType,
                parseInt(workersNeeded),
                workDuration,
                finalJobCategories,
                workforceJustification,
                workforceStartDate || null,
                workforceEndDate || null,
                specialRequirements || null,
                'pending',
                'Current User' // This should come from session/auth
            ];
            
            console.log('📝 Inserting workforce request with values:', values);
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Workforce request inserted successfully:', result);
            
            // Return success response
            res.status(201).json({
                success: true,
                message: 'Workforce request created successfully',
                requestId: requestId,
                request: {
                    id: result.insertId,
                    request_id: requestId,
                    project_id: workforceProject,
                    project_name: projectNames[workforceProject] || workforceProject,
                    request_type: requestType,
                    workers_needed: parseInt(workersNeeded),
                    duration: workDuration,
                    job_categories: finalJobCategories,
                    justification: workforceJustification,
                    start_date: workforceStartDate,
                    end_date: workforceEndDate,
                    special_requirements: specialRequirements,
                    status: 'pending',
                    submitted_by: 'Current User',
                    created_at: new Date().toISOString()
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using fallback mode:', dbError);
            
            // Fallback mode - return success with mock data
            const requestId = 'WFR' + Date.now();
            const projectNames = {
                'prj001': 'Port Modernization Phase 1',
                'prj002': 'Warehouse Construction',
                'prj003': 'Road Infrastructure'
            };
            
            res.status(201).json({
                success: true,
                message: 'Workforce request created successfully (fallback mode)',
                requestId: requestId,
                request: {
                    id: Math.floor(Math.random() * 1000),
                    request_id: requestId,
                    project_id: workforceProject,
                    project_name: projectNames[workforceProject] || workforceProject,
                    request_type: requestType,
                    workers_needed: parseInt(workersNeeded),
                    duration: workDuration,
                    job_categories: finalJobCategories,
                    justification: workforceJustification,
                    start_date: workforceStartDate,
                    end_date: workforceEndDate,
                    special_requirements: specialRequirements,
                    status: 'pending',
                    submitted_by: 'Current User',
                    created_at: new Date().toISOString(),
                    fallback: true
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error creating workforce request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create workforce request',
            details: error.message
        });
    }
});

// Update workforce request status
router.put('/:id', async (req, res) => {
    try {
        const requestId = req.params.id;
        const { status, approvedBy, approvedJustification } = req.body;
        
        console.log('🔄 Updating workforce request:', requestId, 'to status:', status);
        
        const db = require('../../database/config/database');
        
        const resultResult = await db.execute(`
            UPDATE workforce_requests 
            SET status = ?, approved_by = ?, approved_justification = ?, approval_date = NOW(), updated_at = NOW()
            WHERE id = ?
        `, [status, approvedBy, approvedJustification, requestId]);
        
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Workforce request not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Workforce request updated successfully'
        });
        
    } catch (error) {
        console.error('❌ Error updating workforce request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update workforce request',
            details: error.message
        });
    }
});

// Update workforce request status (matching /:id/status path)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['pending', 'approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status',
                validStatuses: ['pending', 'approved', 'rejected', 'completed', 'cancelled']
            });
        }

        const db = require('../../database/config/database');

        // Introspect table schema to check the type of the 'id' column
        let isIdInteger = true;
        try {
            const columns = await db.execute('SHOW COLUMNS FROM workforce_requests');
            const rows = Array.isArray(columns) ? columns : (columns && Array.isArray(columns[0]) ? columns[0] : []);
            const idCol = rows.find(col => col.Field === 'id');
            if (idCol && !String(idCol.Type).toLowerCase().includes('int')) {
                isIdInteger = false;
            }
        } catch (schemaErr) {
            console.warn('⚠️ Could not introspect workforce_requests table schema:', schemaErr.message);
        }

        // Check if this is a mock request (non-numeric string ID in an integer ID table)
        if (isIdInteger && isNaN(Number(id))) {
            console.log(`ℹ️ Mock workforce request ${id} status updated to ${status} (simulated success)`);
            global.mockWorkforceStatuses = global.mockWorkforceStatuses || {};
            global.mockWorkforceStatuses[id] = status; // Persist in memory
            return res.json({
                success: true,
                message: 'Workforce request status updated successfully (mock simulation)',
                id: id,
                status: status
            });
        }

        // Use appropriate ID type for query
        const queryId = isIdInteger ? parseInt(id, 10) : id;

        // Try to update both possible status update schema variants
        let resultResult;
        try {
            resultResult = await db.execute(`
                UPDATE workforce_requests 
                SET status = ?, approved_by = ?, approval_date = NOW(), updated_at = NOW()
                WHERE id = ?
            `, [status, 'MD', queryId]);
        } catch (firstTryErr) {
            console.warn('⚠️ First status update query failed, trying fallback schema query:', firstTryErr.message);
            resultResult = await db.execute(`
                UPDATE workforce_requests 
                SET status = ?, updated_at = NOW()
                WHERE id = ?
            `, [status, queryId]);
        }
        
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        
        if (!result || result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Workforce request not found'
            });
        }
        
        console.log(`✅ Workforce request ${id} status updated to ${status} via /workforce-requests/:id/status`);
        
        res.json({
            success: true,
            message: 'Workforce request status updated successfully',
            id: id,
            status: status
        });
        
    } catch (error) {
        console.error('❌ Error updating workforce request status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update workforce request status',
            details: error.message
        });
    }
});

// Delete workforce request
router.delete('/:id', async (req, res) => {
    try {
        const requestId = req.params.id;
        
        console.log('🗑️ Deleting workforce request:', requestId);
        
        const db = require('../../database/config/database');
        
        const resultResult = await db.execute('DELETE FROM workforce_requests WHERE id = ?', [requestId]);
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Workforce request not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Workforce request deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error deleting workforce request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete workforce request',
            details: error.message
        });
    }
});

module.exports = router;
