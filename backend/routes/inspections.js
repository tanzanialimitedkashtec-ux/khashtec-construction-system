const express = require('express');
const router = express.Router();

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
        
        let inspections = [];
        
        try {
            const db = require('../../database/config/database');
            
            // Ensure inspections table exists
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS inspections (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        project_id INT NOT NULL,
                        inspection_type ENUM('Safety', 'Quality', 'Progress', 'Environmental', 'Equipment') NOT NULL,
                        inspection_date DATE NOT NULL,
                        inspector_name VARCHAR(255) NOT NULL,
                        inspector_role VARCHAR(100) NULL,
                        inspection_status ENUM('Scheduled', 'In Progress', 'Completed', 'Failed', 'Cancelled') DEFAULT 'Scheduled',
                        overall_score DECIMAL(5,2) NULL,
                        findings TEXT NULL,
                        recommendations TEXT NULL,
                        follow_up_required BOOLEAN DEFAULT FALSE,
                        follow_up_date DATE NULL,
                        next_inspection_date DATE NULL,
                        weather_conditions VARCHAR(100) NULL,
                        site_conditions VARCHAR(255) NULL,
                        compliance_level ENUM('Fully Compliant', 'Partially Compliant', 'Non-Compliant', 'Not Applicable') NULL,
                        risk_level ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
                        created_by VARCHAR(255) NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_project_id (project_id),
                        INDEX idx_inspection_type (inspection_type),
                        INDEX idx_inspection_date (inspection_date),
                        INDEX idx_status (inspection_status),
                        INDEX idx_inspector (inspector_name),
                        INDEX idx_created_at (created_at)
                    )
                `);
                console.log('✅ Inspections table verified/created successfully');
            } catch (tableError) {
                console.log('⚠️ Could not create inspections table:', tableError.message);
            }
            
            const inspectionsResult = await db.execute(`
                SELECT i.*, p.name as project_name, p.project_code 
                FROM inspections i 
                LEFT JOIN projects p ON i.project_id = p.id 
                ORDER BY i.inspection_date DESC, i.created_at DESC
            `);
            
            // Handle different database response formats
            if (Array.isArray(inspectionsResult)) {
                inspections = inspectionsResult;
            } else if (inspectionsResult && Array.isArray(inspectionsResult[0])) {
                inspections = inspectionsResult[0];
            } else if (inspectionsResult && inspectionsResult.rows) {
                inspections = inspectionsResult.rows;
            } else {
                inspections = [];
            }
            
            console.log('✅ Inspection records fetched from database:', inspections.length);
        } catch (dbError) {
            console.error('❌ Database error, using fallback inspection records:', dbError);
            
            // Fallback to mock inspection data
            inspections = [
                {
                    id: 1,
                    project_id: 1,
                    inspection_type: 'Safety',
                    inspection_date: '2026-05-04',
                    inspector_name: 'John Smith',
                    inspector_role: 'Safety Officer',
                    inspection_status: 'Completed',
                    overall_score: 85.5,
                    findings: 'Minor safety violations found: workers not wearing proper PPE in some areas. Immediate corrective actions taken.',
                    recommendations: 'Implement regular PPE checks and provide additional safety training to all workers.',
                    follow_up_required: true,
                    follow_up_date: '2026-05-11',
                    next_inspection_date: '2026-05-18',
                    weather_conditions: 'Clear',
                    site_conditions: 'Normal operations',
                    compliance_level: 'Partially Compliant',
                    risk_level: 'Medium',
                    created_by: 'Safety Manager',
                    project_name: 'Dar es Salaam Office Complex',
                    project_code: 'PRJ-2026-001',
                    created_at: '2026-05-04T14:30:00Z',
                    updated_at: '2026-05-04T16:45:00Z'
                },
                {
                    id: 2,
                    project_id: 2,
                    inspection_type: 'Quality',
                    inspection_date: '2026-05-03',
                    inspector_name: 'Sarah Johnson',
                    inspector_role: 'Quality Inspector',
                    inspection_status: 'Completed',
                    overall_score: 92.0,
                    findings: 'High quality workmanship observed. Minor issues with concrete finishing in section B.',
                    recommendations: 'Address concrete finishing issues and maintain current quality standards.',
                    follow_up_required: false,
                    follow_up_date: null,
                    next_inspection_date: '2026-05-17',
                    weather_conditions: 'Partly Cloudy',
                    site_conditions: 'Active construction',
                    compliance_level: 'Fully Compliant',
                    risk_level: 'Low',
                    created_by: 'Quality Manager',
                    project_name: 'Kigamboni Residential Estate',
                    project_code: 'PRJ-2026-002',
                    created_at: '2026-05-03T10:15:00Z',
                    updated_at: '2026-05-03T15:30:00Z'
                },
                {
                    id: 3,
                    project_id: 3,
                    inspection_type: 'Progress',
                    inspection_date: '2026-05-02',
                    inspector_name: 'Michael Chen',
                    inspector_role: 'Project Manager',
                    inspection_status: 'In Progress',
                    overall_score: 78.0,
                    findings: 'Project progressing according to schedule. Some delays in material delivery affecting timeline.',
                    recommendations: 'Expedite material procurement and consider alternative suppliers to maintain schedule.',
                    follow_up_required: true,
                    follow_up_date: '2026-05-09',
                    next_inspection_date: '2026-05-16',
                    weather_conditions: 'Rainy',
                    site_conditions: 'Weather delays',
                    compliance_level: 'Partially Compliant',
                    risk_level: 'Medium',
                    created_by: 'Project Director',
                    project_name: 'Industrial Warehouse Complex',
                    project_code: 'PRJ-2026-003',
                    created_at: '2026-05-02T09:45:00Z',
                    updated_at: '2026-05-04T11:20:00Z'
                },
                {
                    id: 4,
                    project_id: 4,
                    inspection_type: 'Environmental',
                    inspection_date: '2026-05-01',
                    inspector_name: 'David Wilson',
                    inspector_role: 'Environmental Officer',
                    inspection_status: 'Completed',
                    overall_score: 88.5,
                    findings: 'Environmental compliance maintained. Proper waste management procedures observed.',
                    recommendations: 'Continue current environmental practices and maintain documentation.',
                    follow_up_required: false,
                    follow_up_date: null,
                    next_inspection_date: '2026-05-15',
                    weather_conditions: 'Clear',
                    site_conditions: 'Normal operations',
                    compliance_level: 'Fully Compliant',
                    risk_level: 'Low',
                    created_by: 'Environmental Manager',
                    project_name: 'Coastal Highway Bridge',
                    project_code: 'PRJ-2026-004',
                    created_at: '2026-05-01T13:20:00Z',
                    updated_at: '2026-05-01T17:15:00Z'
                },
                {
                    id: 5,
                    project_id: 5,
                    inspection_type: 'Equipment',
                    inspection_date: '2026-04-30',
                    inspector_name: 'Emily Brown',
                    inspector_role: 'Equipment Inspector',
                    inspection_status: 'Failed',
                    overall_score: 65.0,
                    findings: 'Several equipment items require maintenance. Crane #3 needs immediate attention.',
                    recommendations: 'Schedule immediate maintenance for critical equipment. Replace worn parts as needed.',
                    follow_up_required: true,
                    follow_up_date: '2026-05-07',
                    next_inspection_date: '2026-05-14',
                    weather_conditions: 'Clear',
                    site_conditions: 'Preparation phase',
                    compliance_level: 'Non-Compliant',
                    risk_level: 'High',
                    created_by: 'Maintenance Manager',
                    project_name: 'Shopping Mall Renovation',
                    project_code: 'PRJ-2026-005',
                    created_at: '2026-04-30T16:00:00Z',
                    updated_at: '2026-05-02T08:30:00Z'
                },
                {
                    id: 6,
                    project_id: 1,
                    inspection_type: 'Safety',
                    inspection_date: '2026-04-29',
                    inspector_name: 'Robert Anderson',
                    inspector_role: 'Senior Safety Officer',
                    inspection_status: 'Completed',
                    overall_score: 95.0,
                    findings: 'Excellent safety standards maintained. All safety protocols properly followed.',
                    recommendations: 'Maintain current safety standards and recognize outstanding safety performance.',
                    follow_up_required: false,
                    follow_up_date: null,
                    next_inspection_date: '2026-05-13',
                    weather_conditions: 'Clear',
                    site_conditions: 'Normal operations',
                    compliance_level: 'Fully Compliant',
                    risk_level: 'Low',
                    created_by: 'Safety Director',
                    project_name: 'Dar es Salaam Office Complex',
                    project_code: 'PRJ-2026-001',
                    created_at: '2026-04-29T11:30:00Z',
                    updated_at: '2026-04-29T14:45:00Z'
                }
            ];
        }
        
        res.json({
            success: true,
            inspections: inspections,
            total: inspections.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching inspection records:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch inspection records',
            details: error.message 
        });
    }
});

// Get inspection by ID
router.get('/:id', async (req, res) => {
    try {
        const inspectionId = req.params.id;
        console.log('🔍 Fetching inspection:', inspectionId);
        
        let inspection = null;
        
        try {
            const db = require('../../database/config/database');
            const inspectionResult = await db.execute(`
                SELECT i.*, p.name as project_name, p.project_code 
                FROM inspections i 
                LEFT JOIN projects p ON i.project_id = p.id 
                WHERE i.id = ?
            `, [inspectionId]);
            
            const inspectionData = Array.isArray(inspectionResult) ? inspectionResult[0] : inspectionResult;
            
            if (inspectionData.length > 0) {
                inspection = inspectionData[0];
                console.log('✅ Inspection found:', inspection);
            }
        } catch (dbError) {
            console.error('❌ Database error, using fallback inspection:', dbError);
            
            // Fallback to mock inspection data
            const mockInspections = [
                {
                    id: 1,
                    project_id: 1,
                    inspection_type: 'Safety',
                    inspection_date: '2026-05-04',
                    inspector_name: 'John Smith',
                    inspector_role: 'Safety Officer',
                    inspection_status: 'Completed',
                    overall_score: 85.5,
                    findings: 'Minor safety violations found: workers not wearing proper PPE in some areas.',
                    recommendations: 'Implement regular PPE checks and provide additional safety training.',
                    follow_up_required: true,
                    follow_up_date: '2026-05-11',
                    next_inspection_date: '2026-05-18',
                    weather_conditions: 'Clear',
                    site_conditions: 'Normal operations',
                    compliance_level: 'Partially Compliant',
                    risk_level: 'Medium',
                    created_by: 'Safety Manager',
                    project_name: 'Dar es Salaam Office Complex',
                    project_code: 'PRJ-2026-001',
                    created_at: '2026-05-04T14:30:00Z',
                    updated_at: '2026-05-04T16:45:00Z'
                }
            ];
            
            inspection = mockInspections.find(i => i.id == inspectionId);
        }
        
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
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
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
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Inspection created successfully:', result);
            
            // Fetch the created inspection
            const createdInspectionResult = await db.execute(`
                SELECT i.*, p.name as project_name, p.project_code 
                FROM inspections i 
                LEFT JOIN projects p ON i.project_id = p.id 
                WHERE i.id = ?
            `, [result.insertId]);
            
            const createdInspection = Array.isArray(createdInspectionResult) ? createdInspectionResult[0] : createdInspectionResult;
            
            res.status(201).json({
                success: true,
                message: 'Inspection created successfully',
                inspectionId: result.insertId,
                inspection: createdInspection[0]
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock inspection creation:', dbError);
            
            // Fallback to mock inspection creation
            const inspectionId = `INS${Date.now().toString().slice(-6)}`;
            
            res.status(201).json({
                success: true,
                message: 'Inspection created successfully (mock)',
                inspectionId: inspectionId,
                inspection: {
                    id: inspectionId,
                    project_id,
                    inspection_type,
                    inspection_date,
                    inspector_name,
                    inspector_role,
                    inspection_status: inspection_status || 'Scheduled',
                    overall_score,
                    findings,
                    recommendations,
                    follow_up_required: follow_up_required || false,
                    follow_up_date,
                    next_inspection_date,
                    weather_conditions,
                    site_conditions,
                    compliance_level,
                    risk_level: risk_level || 'Medium',
                    created_by,
                    created_at: new Date().toISOString(),
                    mock: true
                }
            });
        }
        
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
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
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
            
            const resultResult = await db.execute(updateQuery, updateValues);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Inspection updated successfully:', result);
            
            res.json({
                success: true,
                message: 'Inspection updated successfully',
                affected_rows: result.affectedRows
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock update:', dbError);
            
            // Fallback to mock update
            res.json({
                success: true,
                message: 'Inspection updated successfully (mock)',
                affected_rows: 1,
                mock: true
            });
        }
        
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
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Check if inspection exists
            const inspectionResult = await db.execute('SELECT inspection_type FROM inspections WHERE id = ?', [inspectionId]);
            const inspectionData = Array.isArray(inspectionResult) ? inspectionResult[0] : inspectionResult;
            
            if (inspectionData.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Inspection not found'
                });
            }
            
            // Delete inspection
            const resultResult = await db.execute('DELETE FROM inspections WHERE id = ?', [inspectionId]);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Inspection deleted successfully');
            
            res.json({
                success: true,
                message: 'Inspection deleted successfully',
                deleted_inspection: {
                    id: inspectionId,
                    inspection_type: inspectionData[0].inspection_type
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock delete:', dbError);
            
            // Fallback to mock delete
            res.json({
                success: true,
                message: 'Inspection deleted successfully (mock)',
                deleted_inspection: {
                    id: inspectionId,
                    inspection_type: 'Mock Inspection'
                },
                mock: true
            });
        }
        
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
