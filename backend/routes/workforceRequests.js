const express = require('express');
const router = express.Router();
const notify = require('../utils/notify');
const db = require('../../database/config/database');
const { getRows, getRow, getInsertId, getAffectedRows } = require('../config/dbHelpers');

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
        const requests = getRows(await db.execute(`
            SELECT * FROM workforce_requests
            ORDER BY created_at DESC
        `));
        res.json({
            success: true,
            requests: requests,
            total: requests.length
        });
    } catch (error) {
        console.error('❌ Error fetching workforce requests:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch workforce requests'
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const submittedBy = (req.user && (req.user.name || req.user.email)) || 'Unknown';
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
            submittedBy
        ];

        const result = await db.execute(query, values);

        notify('Workforce Request', 'New ' + requestType + ' workforce request for ' + (projectNames[workforceProject] || workforceProject) + ' - ' + workersNeeded + ' workers needed for ' + workDuration, 'info', 'HR', 'Project Manager');
        notify('Workforce Request', 'New ' + requestType + ' workforce request for ' + (projectNames[workforceProject] || workforceProject) + ' - ' + workersNeeded + ' workers needed for ' + workDuration, 'info', 'MD', 'Project Manager');
        res.status(201).json({
            success: true,
            message: 'Workforce request created successfully',
            requestId: requestId,
            request: {
                id: getInsertId(result),
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
                submitted_by: submittedBy,
                created_at: new Date().toISOString()
            }
        });
        
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

        const result = await db.execute(`
            UPDATE workforce_requests 
            SET status = ?, approved_by = ?, approved_justification = ?, approval_date = NOW(), updated_at = NOW()
            WHERE id = ?
        `, [status, approvedBy, approvedJustification, requestId]);

        if (getAffectedRows(result) === 0) {
            return res.status(404).json({
                success: false,
                error: 'Workforce request not found'
            });
        }
        
        notify('Workforce Request', 'Workforce request #' + requestId + ' status changed to "' + status + '"' + (approvedBy ? ' by ' + approvedBy : ''), status === 'approved' ? 'success' : 'info', 'MD', 'Project Manager');
        notify('Workforce Request', 'Workforce request #' + requestId + ' status changed to "' + status + '"' + (approvedBy ? ' by ' + approvedBy : ''), status === 'approved' ? 'success' : 'info', 'HR', 'Project Manager');
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

        const approver = (req.user && (req.user.name || req.user.email)) || 'Unknown';
        const result = await db.execute(`
            UPDATE workforce_requests 
            SET status = ?, approved_by = ?, approval_date = NOW(), updated_at = NOW()
            WHERE id = ?
        `, [status, approver, parseInt(id, 10)]);

        if (getAffectedRows(result) === 0) {
            return res.status(404).json({
                success: false,
                error: 'Workforce request not found'
            });
        }
        
        console.log(`✅ Workforce request ${id} status updated to ${status} via /workforce-requests/:id/status`);
        
        notify('Workforce Request', 'Workforce request #' + id + ' status changed to "' + status + '"', status === 'approved' ? 'success' : status === 'rejected' ? 'warning' : 'info', 'MD', 'Project Manager');
        notify('Workforce Request', 'Workforce request #' + id + ' status changed to "' + status + '"', status === 'approved' ? 'success' : status === 'rejected' ? 'warning' : 'info', 'HR', 'Project Manager');
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

        const result = await db.execute('DELETE FROM workforce_requests WHERE id = ?', [requestId]);

        if (getAffectedRows(result) === 0) {
            return res.status(404).json({
                success: false,
                error: 'Workforce request not found'
            });
        }
        
        notify('Workforce Request', 'Workforce request #' + requestId + ' has been deleted', 'warning', 'MD', 'Project Manager');
        notify('Workforce Request', 'Workforce request #' + requestId + ' has been deleted', 'warning', 'HR', 'Project Manager');
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
