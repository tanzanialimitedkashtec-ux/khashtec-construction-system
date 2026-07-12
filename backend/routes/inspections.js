const express = require('express');
const router = express.Router();
const notify = require('../utils/notify');
const db = require('../../database/config/database');
const { getRows, getRow, getInsertId, getAffectedRows } = require('../config/dbHelpers');

console.log('🔍 Inspections route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Inspections test endpoint accessed');
    res.json({ 
        message: 'Inspections API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully',
        debug: 'Inspections routes are loaded and responding'
    });
});

// Root endpoint - get all inspections
router.get('/', async (req, res) => {
    try {
        console.log('🔍 Inspections root endpoint accessed');
        const rows = await db.execute(`
            SELECT i.*, p.name as project_name, p.project_code
            FROM inspections i
            LEFT JOIN projects p ON i.project_id = p.id
            ORDER BY i.inspection_date DESC, i.created_at DESC
        `);
        const inspections = getRows(rows);
        res.json({
            success: true,
            inspections: inspections,
            total: inspections.length
        });
    } catch (error) {
        console.error('❌ Error fetching inspection records:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch inspection records'
        });
    }
});

// Get inspection by ID
router.get('/:id', async (req, res) => {
    try {
        const inspectionId = req.params.id;
        console.log('🔍 Fetching inspection:', inspectionId);
        
        const rows = await db.execute(`
            SELECT i.*, p.name as project_name, p.project_code
            FROM inspections i
            LEFT JOIN projects p ON i.project_id = p.id
            WHERE i.id = ?
        `, [inspectionId]);
        const inspection = getRow(rows);

        if (!inspection) {
            return res.status(404).json({ 
                success: false,
                error: 'Inspection not found' 
            });
        }
        
        res.json({
            success: true,
            inspection: inspection
        });
        
    } catch (error) {
        console.error('❌ Error fetching inspection:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch inspection',
            details: error.message 
        });
    }
});

// Create new inspection
router.post('/', async (req, res) => {
    try {
        console.log('📝 Inspection creation request received');
        console.log('📝 Request body:', req.body);
        
        const {
            project_id,
            inspection_type,
            inspection_date,
            inspector_name,
            inspector_role,
            inspection_status,
            overall_score,
            findings,
            recommendations,
            follow_up_required,
            follow_up_date,
            next_inspection_date,
            weather_conditions,
            site_conditions,
            compliance_level,
            risk_level,
            created_by
        } = req.body;
        
        // Validate required fields
        if (!project_id || !inspection_type || !inspection_date || !inspector_name) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'project_id, inspection_type, inspection_date, and inspector_name are required'
            });
        }
        
        const query = `
            INSERT INTO inspections (
                project_id, inspection_type, inspection_date, inspector_name, inspector_role,
                inspection_status, overall_score, findings, recommendations, follow_up_required,
                follow_up_date, next_inspection_date, weather_conditions, site_conditions,
                compliance_level, risk_level, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const values = [
            project_id,
            inspection_type,
            inspection_date,
            inspector_name,
            inspector_role || null,
            inspection_status || 'Scheduled',
            overall_score || null,
            findings || null,
            recommendations || null,
            follow_up_required || false,
            follow_up_date || null,
            next_inspection_date || null,
            weather_conditions || null,
            site_conditions || null,
            compliance_level || null,
            risk_level || 'Medium',
            created_by || null
        ];

        const result = await db.execute(query, values);
        const insertId = getInsertId(result);

        const createdInspection = getRow(await db.execute(`
            SELECT i.*, p.name as project_name, p.project_code
            FROM inspections i
            LEFT JOIN projects p ON i.project_id = p.id
            WHERE i.id = ?
        `, [insertId]));

        notify('HSE Inspection', 'New ' + inspection_type + ' inspection created by ' + inspector_name + ' on ' + inspection_date + ' (Risk: ' + (risk_level || 'Medium') + ')', 'info', 'MD', 'HSE Department');
        res.status(201).json({
            success: true,
            message: 'Inspection created successfully',
            inspectionId: insertId,
            inspection: createdInspection
        });

    } catch (error) {
        console.error('❌ Error creating inspection:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create inspection',
            details: error.message 
        });
    }
});

// Update inspection
router.put('/:id', async (req, res) => {
    try {
        const inspectionId = req.params.id;
        const updateData = req.body;
        
        console.log('🔄 Updating inspection:', inspectionId);
        console.log('📝 Update data:', updateData);
        
        // Build dynamic update query
        const updateFields = [];
        const updateValues = [];

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined && key !== 'id') {
                updateFields.push(`${key} = ?`);
                updateValues.push(updateData[key]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }

        updateFields.push('updated_at = NOW()');
        updateValues.push(inspectionId);

        const updateQuery = `UPDATE inspections SET ${updateFields.join(', ')} WHERE id = ?`;
        const result = await db.execute(updateQuery, updateValues);

        if (getAffectedRows(result) === 0) {
            return res.status(404).json({ success: false, error: 'Inspection not found' });
        }

        notify('HSE Inspection', 'Inspection #' + inspectionId + ' updated' + (updateData.inspection_status ? ' - Status: ' + updateData.inspection_status : '') + (updateData.inspection_type ? ' - Type: ' + updateData.inspection_type : ''), 'info', 'MD', 'HSE Department');
        res.json({
            success: true,
            message: 'Inspection updated successfully',
            affected_rows: getAffectedRows(result)
        });

    } catch (error) {
        console.error('❌ Error updating inspection:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update inspection',
            details: error.message 
        });
    }
});

// Delete inspection
router.delete('/:id', async (req, res) => {
    try {
        const inspectionId = req.params.id;
        console.log('🗑️ Deleting inspection:', inspectionId);
        
        // Check if inspection exists
        const existing = getRow(await db.execute('SELECT inspection_type FROM inspections WHERE id = ?', [inspectionId]));

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Inspection not found'
            });
        }

        await db.execute('DELETE FROM inspections WHERE id = ?', [inspectionId]);

        notify('HSE Inspection', existing.inspection_type + ' inspection #' + inspectionId + ' has been deleted', 'warning', 'MD', 'HSE Department');
        res.json({
            success: true,
            message: 'Inspection deleted successfully',
            deleted_inspection: {
                id: inspectionId,
                inspection_type: existing.inspection_type
            }
        });

    } catch (error) {
        console.error('❌ Error deleting inspection:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete inspection',
            details: error.message 
        });
    }
});

module.exports = router;
