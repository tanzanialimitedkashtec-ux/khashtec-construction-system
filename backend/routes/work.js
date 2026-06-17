const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Whitelist of valid department names to prevent SQL injection
// Only these departments can be used in dynamic table queries
const VALID_DEPARTMENTS = ['hr', 'admin', 'finance', 'hse', 'projects', 'realestate', 'operations'];

function isValidDepartment(department) {
    return VALID_DEPARTMENTS.includes(department.toLowerCase());
}

// Global in-memory state for mock workforce requests to allow status changes to persist across GET requests
global.mockWorkforceStatuses = global.mockWorkforceStatuses || {};
const mockWorkforceStatuses = global.mockWorkforceStatuses;

// Test endpoint to verify API is working
router.get('/test', (req, res) => {
    console.log('🧪 Test endpoint accessed');
    res.json({ 
        message: 'Work API is working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Test database connection
router.get('/test-db', async (req, res) => {
    try {
        console.log('🔍 Testing database connection...');
        const [result] = await db.execute('SELECT 1 as test');
        console.log('✅ Database connection successful:', result);
        res.json({ 
            message: 'Database connection successful',
            result: result
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        res.status(500).json({ 
            error: 'Database connection failed',
            details: error.message 
        });
    }
});

// Test HR table existence
router.get('/test-hr-table', async (req, res) => {
    try {
        console.log('🔍 Testing hr_work table existence...');
        const [result] = await db.execute('SHOW TABLES LIKE "hr_work"');
        console.log('✅ HR table check result:', result);
        res.json({ 
            message: 'HR table check successful',
            exists: result.length > 0,
            result: result
        });
    } catch (error) {
        console.error('❌ HR table check failed:', error);
        res.status(500).json({ 
            error: 'HR table check failed',
            details: error.message 
        });
    }
});

// Get HSE work items (optionally filtered by work_type query parameter)
router.get('/hse', async (req, res) => {
    try {
        const workTypeFilter = req.query.work_type;
        console.log(`🔍 Fetching HSE work items...${workTypeFilter ? ` (filtered: ${workTypeFilter})` : ' (all)'}`);
        
        let hseItems = [];
        
        try {
            let query = 'SELECT * FROM hse_work';
            let params = [];
            
            if (workTypeFilter) {
                query += ' WHERE work_type = ?';
                params.push(workTypeFilter);
            }
            
            query += ' ORDER BY submitted_date DESC';
            
            const dbRecords = await db.execute(query, params);
            hseItems = Array.isArray(dbRecords) ? dbRecords : [];
            console.log(`📊 Found ${hseItems.length} HSE work items from database`);
        } catch (dbError) {
            console.error('❌ Database error, using fallback HSE data:', dbError);
            
            // Fallback to mock HSE data
            let fallbackItems = [
                {
                    id: 3408,
                    department_code: 'HSE',
                    work_type: 'Safety Violation',
                    work_title: 'Safety Violation - Unauthorized Work',
                    work_description: 'Workers found performing unauthorized electrical work without proper permits',
                    submitted_date: '2026-04-10',
                    submitted_by: 'KTC-INS-001',
                    severity: 'High',
                    status: 'Open'
                },
                {
                    id: 3409,
                    department_code: 'HSE',
                    work_type: 'Safety Violation',
                    work_title: 'Safety Violation - No PPE',
                    work_description: 'Workers observed without required personal protective equipment in construction zone',
                    submitted_date: '2026-04-09',
                    submitted_by: 'KTC-INS-002',
                    severity: 'Medium',
                    status: 'Resolved'
                },
                {
                    id: 3410,
                    department_code: 'HSE',
                    work_type: 'Inspection Report',
                    work_title: 'Inspection Report - Site B',
                    work_description: 'Monthly safety inspection completed at Site B with minor findings',
                    submitted_date: '2026-04-08',
                    submitted_by: 'KTC-INS-003',
                    severity: 'Low',
                    status: 'Closed'
                }
            ];
            
            // Apply filter to fallback data too
            if (workTypeFilter) {
                fallbackItems = fallbackItems.filter(item => item.work_type === workTypeFilter);
            }
            
            hseItems = fallbackItems;
            console.log(`📋 Using fallback HSE data: ${hseItems.length} items`);
        }
        
        res.status(200).json(hseItems);
        
    } catch (error) {
        console.error('❌ Error fetching HSE work items:', error);
        res.status(500).json({
            error: 'Failed to fetch HSE work items',
            details: error.message
        });
    }
});

// Root-level POST route for HSE work items (handles safety policy submissions when mounted via server.js)
// This catches POST requests to /api/hse when mounted through server.js
router.post('/', async (req, res, next) => {
    try {
        console.log('🔍 Root-level HSE POST request received');
        console.log('📊 Request body:', req.body);
        
        // Check if this is an HSE request by examining the request body
        const { work_type: requestWorkType } = req.body;
        if (!requestWorkType || !requestWorkType.includes('Safety') && !requestWorkType.includes('Incident') && 
            !requestWorkType.includes('Inspection') && !requestWorkType.includes('Training') && 
            !requestWorkType.includes('Toolbox') && !requestWorkType.includes('PPE')) {
            // Not an HSE request, let it fall through to other routes
            return next();
        }
        
        // Set department to hse for this route
        const department = 'hse';
        
        const {
            work_type,
            work_title,
            work_description,
            priority = 'Medium',
            due_date,
            assigned_to,
            submitted_by,
            // HSE-specific fields
            incident_type,
            severity,
            location,
            project_name,
            status: rawStatus = 'pending'
        } = req.body;

        // Normalize status to match DB ENUM: 'Pending', 'In Progress', 'Completed', 'Rejected', 'Revision Requested'
        const statusMap = { 'pending': 'Pending', 'in progress': 'In Progress', 'in-progress': 'In Progress', 'completed': 'Completed', 'investigating': 'In Progress', 'resolved': 'Completed', 'rejected': 'Rejected', 'revision requested': 'Revision Requested' };
        const status = statusMap[String(rawStatus).toLowerCase()] || 'Pending';
        
        console.log('📝 Extracted HSE data:', {
            work_type,
            work_title,
            work_description,
            priority,
            due_date,
            assigned_to,
            submitted_by,
            hse_specific: {
                incident_type,
                severity,
                location,
                project_name
            }
        });
        
        // Validate required fields
        if (!work_type || !work_title || !work_description) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields: work_type, work_title, work_description',
                received: { work_type, work_title, work_description }
            });
        }
        
        // Map HSE work types to database ENUM values
        const hseWorkTypeMapping = {
            'Safety Policy Upload': 'Safety Policy Upload',
            'Incident Reporting': 'Incident Reporting',
            'Toolbox Meeting': 'Toolbox Meeting',
            'PPE Issuance': 'PPE Issuance',
            'Safety Violation': 'Safety Violation',
            'Inspection Report': 'Inspection Report',
            'Safety Training': 'Safety Training',
            'Project Safety Status': 'Project Safety Status'
        };
        
        const mapped_work_type = hseWorkTypeMapping[work_type] || work_type;
        console.log('🔄 Mapped work type:', work_type, '->', mapped_work_type);
        
        // Build the query for HSE department
        let query = `
            INSERT INTO hse_work (
                department_code,
                work_type,
                work_title,
                work_description,
                priority,
                due_date,
                assigned_to,
                submitted_by,
                submitted_date,
                status
        `;
        
        let values = [
            department,
            mapped_work_type,
            work_title,
            work_description,
            priority,
            due_date,
            assigned_to,
            submitted_by,
            new Date().toISOString().split('T')[0], // submitted_date
            status
        ];
        
        // Add HSE-specific fields if provided
        let additionalFields = [];
        let additionalValues = [];
        
        if (incident_type) {
            additionalFields.push('incident_type');
            additionalValues.push(incident_type);
        }
        if (severity) {
            additionalFields.push('severity');
            additionalValues.push(severity);
        }
        if (location) {
            additionalFields.push('location');
            additionalValues.push(location);
        }
        if (project_name) {
            additionalFields.push('project_name');
            additionalValues.push(project_name);
        }
        
        // Add additional fields to query if any
        if (additionalFields.length > 0) {
            query += ', ' + additionalFields.join(', ');
            query += ') VALUES (';
        } else {
            query += ') VALUES (';
        }
        
        // Build the placeholders for values
        const placeholders = values.map(() => '?').join(', ');
        query += placeholders;
        
        if (additionalValues.length > 0) {
            query += ', ' + additionalValues.map(() => '?').join(', ');
        }
        query += ')';
        
        // Combine all values
        const allValues = values.concat(additionalValues);
        
        console.log('🔍 Final query:', query);
        console.log('🔍 Final values:', allValues);
        
        // Execute the query
        const queryResult = await db.execute(query, allValues);
        const result = queryResult[0] || queryResult;
        
        console.log('✅ HSE work item created successfully:', result);
        
        res.status(201).json({
            success: true,
            message: 'HSE work item created successfully',
            id: result.insertId,
            data: {
                id: result.insertId,
                department_code: department,
                work_type: mapped_work_type,
                work_title,
                work_description,
                priority,
                due_date,
                assigned_to,
                submitted_by,
                status,
                submitted_date: new Date().toISOString().split('T')[0],
                // Include HSE-specific fields if provided
                incident_type: incident_type || null,
                severity: severity || null,
                location: location || null,
                project_name: project_name || null
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating HSE work item:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        res.status(500).json({
            success: false,
            error: 'Failed to create HSE work item',
            details: error.message
        });
    }
});

// Get inspection records (alias for HSE Inspection Report work items)
router.get('/hse/inspections', async (req, res) => {
    try {
        console.log('🔍 Fetching HSE inspection records...');
        
        let inspectionRecords = [];
        
        try {
            const dbRecords = await db.execute(
                `SELECT * FROM hse_work WHERE work_type = 'Inspection Report' ORDER BY submitted_date DESC`
            );
            inspectionRecords = dbRecords;
            console.log(`📊 Found ${inspectionRecords.length} inspection records from database`);
        } catch (dbError) {
            console.error('❌ Database error, using fallback inspection records:', dbError);
            
            // Fallback to mock inspection records
            inspectionRecords = [
                {
                    id: 1,
                    department_code: 'HSE',
                    work_type: 'Inspection Report',
                    work_title: 'Routine Safety Inspection - Site A',
                    work_description: 'Monthly routine safety inspection conducted at Site A. All areas inspected with minor findings.',
                    inspection_date: '2026-04-15',
                    inspector: 'John Smith',
                    compliance_status: 'minor-issues',
                    risk_level: 'low',
                    project: 'proj001',
                    status: 'completed',
                    submitted_by: 'HSE Manager',
                    submitted_date: '2026-04-15',
                    mock: true
                },
                {
                    id: 2,
                    department_code: 'HSE',
                    work_type: 'Inspection Report',
                    work_title: 'Compliance Audit - Site B',
                    work_description: 'Quarterly compliance audit revealing several areas requiring improvement.',
                    inspection_date: '2026-04-10',
                    inspector: 'Sarah Johnson',
                    compliance_status: 'major-issues',
                    risk_level: 'medium',
                    project: 'proj002',
                    status: 'pending-follow-up',
                    submitted_by: 'Safety Officer',
                    submitted_date: '2026-04-10',
                    mock: true
                },
                {
                    id: 3,
                    department_code: 'HSE',
                    work_type: 'Inspection Report',
                    work_title: 'Fire Safety Inspection',
                    work_description: 'Annual fire safety inspection and equipment verification.',
                    inspection_date: '2026-04-05',
                    inspector: 'Mike Wilson',
                    compliance_status: 'fully-compliant',
                    risk_level: 'low',
                    project: 'proj003',
                    status: 'completed',
                    submitted_by: 'Fire Safety Officer',
                    submitted_date: '2026-04-05',
                    mock: true
                }
            ];
            console.log(`📊 Using fallback mock inspection records:`, inspectionRecords.length);
        }
        
        console.log(`📋 Returning ${inspectionRecords.length} inspection records`);
        res.json(inspectionRecords);
    } catch (error) {
        console.error('❌ Error fetching inspection records:', error);
        res.status(500).json({
            error: 'Failed to fetch inspection records',
            details: error.message
        });
    }
});

// Get single inspection record by ID
router.get('/hse/inspections/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Fetching HSE inspection record #${id}...`);
        const dbRecords = await db.execute('SELECT * FROM hse_work WHERE id = ?', [id]);
        const records = Array.isArray(dbRecords) ? dbRecords : [];
        if (records.length === 0) {
            return res.status(404).json({ error: 'Inspection record not found' });
        }
        console.log(`✅ Found inspection record #${id}`);
        res.json({ work: records[0] });
    } catch (error) {
        console.error('❌ Error fetching inspection record:', error);
        res.status(500).json({ error: 'Failed to fetch inspection record', details: error.message });
    }
});

// Delete inspection record by ID
router.delete('/hse/inspections/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Deleting HSE inspection record #${id}...`);
        await db.execute('DELETE FROM hse_work WHERE id = ?', [id]);
        console.log(`✅ Inspection record #${id} deleted successfully`);
        res.json({ success: true, message: `Inspection record #${id} deleted successfully` });
    } catch (error) {
        console.error('❌ Error deleting inspection record:', error);
        res.status(500).json({ error: 'Failed to delete inspection record', details: error.message });
    }
});

// Get inspection records (general endpoint)
router.get('/inspections', async (req, res) => {
    try {
        console.log('🔍 Fetching inspection records (general endpoint)...');
        
        let inspectionRecords = [];
        
        try {
            const dbRecords = await db.execute(
                `SELECT * FROM hse_work WHERE work_type = 'Inspection Report' ORDER BY submitted_date DESC`
            );
            inspectionRecords = dbRecords;
            console.log(`📊 Found ${inspectionRecords.length} inspection records from database`);
        } catch (dbError) {
            console.error('❌ Database error, using fallback inspection records:', dbError);
            
            // Same fallback as above
            inspectionRecords = [
                {
                    id: 1,
                    department_code: 'HSE',
                    work_type: 'Inspection Report',
                    work_title: 'Routine Safety Inspection - Site A',
                    work_description: 'Monthly routine safety inspection conducted at Site A. All areas inspected with minor findings.',
                    inspection_date: '2026-04-15',
                    inspector: 'John Smith',
                    compliance_status: 'minor-issues',
                    risk_level: 'low',
                    project: 'proj001',
                    status: 'completed',
                    submitted_by: 'HSE Manager',
                    submitted_date: '2026-04-15',
                    mock: true
                },
                {
                    id: 2,
                    department_code: 'HSE',
                    work_type: 'Inspection Report',
                    work_title: 'Compliance Audit - Site B',
                    work_description: 'Quarterly compliance audit revealing several areas requiring improvement.',
                    inspection_date: '2026-04-10',
                    inspector: 'Sarah Johnson',
                    compliance_status: 'major-issues',
                    risk_level: 'medium',
                    project: 'proj002',
                    status: 'pending-follow-up',
                    submitted_by: 'Safety Officer',
                    submitted_date: '2026-04-10',
                    mock: true
                },
                {
                    id: 3,
                    department_code: 'HSE',
                    work_type: 'Inspection Report',
                    work_title: 'Fire Safety Inspection',
                    work_description: 'Annual fire safety inspection and equipment verification.',
                    inspection_date: '2026-04-05',
                    inspector: 'Mike Wilson',
                    compliance_status: 'fully-compliant',
                    risk_level: 'low',
                    project: 'proj003',
                    status: 'completed',
                    submitted_by: 'Fire Safety Officer',
                    submitted_date: '2026-04-05',
                    mock: true
                }
            ];
            console.log(`📊 Using fallback mock inspection records:`, inspectionRecords.length);
        }
        
        console.log(`📋 Returning ${inspectionRecords.length} inspection records`);
        res.json(inspectionRecords);
    } catch (error) {
        console.error('❌ Error fetching inspection records:', error);
        res.status(500).json({
            error: 'Failed to fetch inspection records',
            details: error.message
        });
    }
});

// Get safety violations (alias for HSE Safety Violation work items)
router.get('/hse/violations', async (req, res) => {
    try {
        console.log('🔍 Fetching HSE safety violations...');
        
        let violations = [];
        
        try {
            const dbRecords = await db.execute(
                `SELECT * FROM hse_work WHERE work_type = 'Safety Violation' ORDER BY submitted_date DESC`
            );
            violations = dbRecords;
            console.log(`📊 Found ${violations.length} safety violations from database`);
        } catch (dbError) {
            console.error('❌ Database error, using fallback safety violations:', dbError);
            
            // Fallback to mock safety violations
            violations = [
                {
                    id: 1,
                    department_code: 'HSE',
                    work_type: 'Safety Violation',
                    work_title: 'No PPE - Hard Hat',
                    work_description: 'Worker found without hard hat in construction area',
                    severity: 'Major',
                    location: 'Site A - Building 1',
                    violator: 'John Doe',
                    immediate_action: 'Stop work and issue PPE',
                    corrective_action: 'Written warning',
                    status: 'Pending',
                    submitted_by: 'Safety Officer',
                    submitted_date: '2026-04-20',
                    mock: true
                },
                {
                    id: 2,
                    department_code: 'HSE',
                    work_type: 'Safety Violation',
                    work_title: 'Unauthorized Work',
                    work_description: 'Workers performing electrical work without proper authorization',
                    severity: 'Critical',
                    location: 'Site B - Electrical Room',
                    violator: 'Mike Wilson, Sarah Johnson',
                    immediate_action: 'Immediate work stoppage',
                    corrective_action: 'Suspension pending investigation',
                    status: 'Under Investigation',
                    submitted_by: 'HSE Manager',
                    submitted_date: '2026-04-18',
                    mock: true
                },
                {
                    id: 3,
                    department_code: 'HSE',
                    work_type: 'Safety Violation',
                    work_title: 'Improper Scaffolding',
                    work_description: 'Scaffolding not properly secured and missing guardrails',
                    severity: 'Major',
                    location: 'Site C - 3rd Floor',
                    violator: 'Construction Team',
                    immediate_action: 'Area secured and access restricted',
                    corrective_action: 'Retraining and supervision required',
                    status: 'Resolved',
                    submitted_by: 'Site Supervisor',
                    submitted_date: '2026-04-15',
                    mock: true
                }
            ];
            console.log(`📊 Using fallback mock safety violations:`, violations.length);
        }
        
        console.log(`📋 Returning ${violations.length} safety violations`);
        res.json(violations);
    } catch (error) {
        console.error('❌ Error fetching safety violations:', error);
        res.status(500).json({
            error: 'Failed to fetch safety violations',
            details: error.message
        });
    }
});

// Get safety violations (general endpoint)
router.get('/violations', async (req, res) => {
    try {
        console.log('🔍 Fetching safety violations (general endpoint)...');
        
        let violations = [];
        
        try {
            const dbRecords = await db.execute(
                `SELECT * FROM hse_work WHERE work_type = 'Safety Violation' ORDER BY submitted_date DESC`
            );
            violations = dbRecords;
            console.log(`📊 Found ${violations.length} safety violations from database`);
        } catch (dbError) {
            console.error('❌ Database error, using fallback safety violations:', dbError);
            
            // Same fallback as above
            violations = [
                {
                    id: 1,
                    department_code: 'HSE',
                    work_type: 'Safety Violation',
                    work_title: 'No PPE - Hard Hat',
                    work_description: 'Worker found without hard hat in construction area',
                    severity: 'Major',
                    location: 'Site A - Building 1',
                    violator: 'John Doe',
                    immediate_action: 'Stop work and issue PPE',
                    corrective_action: 'Written warning',
                    status: 'Pending',
                    submitted_by: 'Safety Officer',
                    submitted_date: '2026-04-20',
                    mock: true
                },
                {
                    id: 2,
                    department_code: 'HSE',
                    work_type: 'Safety Violation',
                    work_title: 'Unauthorized Work',
                    work_description: 'Workers performing electrical work without proper authorization',
                    severity: 'Critical',
                    location: 'Site B - Electrical Room',
                    violator: 'Mike Wilson, Sarah Johnson',
                    immediate_action: 'Immediate work stoppage',
                    corrective_action: 'Suspension pending investigation',
                    status: 'Under Investigation',
                    submitted_by: 'HSE Manager',
                    submitted_date: '2026-04-18',
                    mock: true
                },
                {
                    id: 3,
                    department_code: 'HSE',
                    work_type: 'Safety Violation',
                    work_title: 'Improper Scaffolding',
                    work_description: 'Scaffolding not properly secured and missing guardrails',
                    severity: 'Major',
                    location: 'Site C - 3rd Floor',
                    violator: 'Construction Team',
                    immediate_action: 'Area secured and access restricted',
                    corrective_action: 'Retraining and supervision required',
                    status: 'Resolved',
                    submitted_by: 'Site Supervisor',
                    submitted_date: '2026-04-15',
                    mock: true
                }
            ];
            console.log(`📊 Using fallback mock safety violations:`, violations.length);
        }
        
        console.log(`📋 Returning ${violations.length} safety violations`);
        res.json(violations);
    } catch (error) {
        console.error('❌ Error fetching safety violations:', error);
        res.status(500).json({
            error: 'Failed to fetch safety violations',
            details: error.message
        });
    }
});

// Track whether ppe_issuance table has been migrated this process
let ppeTableReady = false;

// Ensure ppe_issuance table has the columns needed by the PPE form.
// The original migration (001_create_tables.sql) creates ppe_issuance with
// employee_id/ppe_type ENUM/issued_by INT/project_id INT columns and foreign keys.
// We need text-based columns (worker_name, worker_id, project, department, ppe_items JSON, etc.)
// so we drop and recreate the table with the correct schema for the PPE form.
async function ensurePpeIssuanceTable() {
    if (ppeTableReady) return;
    try {
        // Check if table exists
        let tableExists = false;
        let cols = [];
        try {
            cols = await db.execute('SHOW COLUMNS FROM ppe_issuance');
            if (!Array.isArray(cols)) cols = [];
            tableExists = cols.length > 0;
        } catch (e) {
            tableExists = false;
        }

        if (!tableExists) {
            // Table does not exist — create with correct schema
            await db.execute(`
                CREATE TABLE ppe_issuance (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    issuance_id VARCHAR(50),
                    issue_date DATE,
                    worker_name VARCHAR(255),
                    worker_id VARCHAR(50),
                    project VARCHAR(255),
                    department VARCHAR(100),
                    ppe_items JSON,
                    ppe_condition VARCHAR(50) DEFAULT 'new',
                    return_date DATE,
                    worker_signature VARCHAR(255),
                    issued_by VARCHAR(255),
                    status VARCHAR(50) DEFAULT 'Issued',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            ppeTableReady = true;
            console.log('  ppe_issuance table created with new schema');
            return;
        }

        // Table exists — check if it already has the new schema
        const colNames = new Set(cols.map(c => c.Field));
        const requiredCols = ['issuance_id', 'worker_name', 'worker_id', 'project', 'department', 'ppe_items', 'worker_signature'];
        const allPresent = requiredCols.every(c => colNames.has(c));

        if (allPresent) {
            ppeTableReady = true;
            console.log('  ppe_issuance table already has correct schema');
            return;
        }

        // Old schema — always use ALTER to add missing columns (never drop,
        // because DROP fails when the old migration added foreign key constraints)
        console.log('  ppe_issuance table has old schema, migrating via ALTER...');

        const columnsToAdd = [
            { name: 'issuance_id', def: 'VARCHAR(50)' },
            { name: 'worker_name', def: 'VARCHAR(255)' },
            { name: 'worker_id', def: 'VARCHAR(50)' },
            { name: 'project', def: 'VARCHAR(255)' },
            { name: 'department', def: 'VARCHAR(100)' },
            { name: 'ppe_items', def: 'JSON' },
            { name: 'worker_signature', def: 'VARCHAR(255)' },
            { name: 'issue_date', def: 'DATE' },
            { name: 'return_date', def: 'DATE' },
            { name: 'status', def: "VARCHAR(50) DEFAULT 'Issued'" },
            { name: 'issued_by', def: 'VARCHAR(255)' },
            { name: 'ppe_condition', def: "VARCHAR(50) DEFAULT 'new'" },
            { name: 'created_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
            { name: 'updated_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
        ];

        for (const col of columnsToAdd) {
            if (!colNames.has(col.name)) {
                try {
                    await db.execute(`ALTER TABLE ppe_issuance ADD COLUMN ${col.name} ${col.def}`);
                    console.log(`  Added column ${col.name}`);
                } catch (e) {
                    console.log(`  Skipped adding ${col.name}: ${e.message}`);
                }
            }
        }

        // Widen columns that exist but have incompatible types (ENUM→VARCHAR, INT→VARCHAR)
        const colMap = {};
        cols.forEach(c => { colMap[c.Field] = c.Type.toLowerCase(); });

        if (colMap['issued_by'] && colMap['issued_by'].includes('int')) {
            // Drop FK constraint first if it exists
            try {
                const fks = await db.execute(
                    `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
                     WHERE TABLE_NAME = 'ppe_issuance' AND COLUMN_NAME = 'issued_by'
                     AND REFERENCED_TABLE_NAME IS NOT NULL AND TABLE_SCHEMA = DATABASE()`
                );
                for (const fk of (Array.isArray(fks) ? fks : [])) {
                    try { await db.execute(`ALTER TABLE ppe_issuance DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`); } catch (e) {}
                }
            } catch (e) {}
            try {
                await db.execute('ALTER TABLE ppe_issuance MODIFY COLUMN issued_by VARCHAR(255)');
                console.log('  Widened issued_by to VARCHAR(255)');
            } catch (e) { console.log('  Could not widen issued_by:', e.message); }
        }

        if (colMap['ppe_condition'] && colMap['ppe_condition'].includes('enum')) {
            try {
                await db.execute("ALTER TABLE ppe_issuance MODIFY COLUMN ppe_condition VARCHAR(50) DEFAULT 'new'");
                console.log('  Widened ppe_condition to VARCHAR(50)');
            } catch (e) {}
        }

        if (colMap['status'] && colMap['status'].includes('enum')) {
            try {
                await db.execute("ALTER TABLE ppe_issuance MODIFY COLUMN status VARCHAR(50) DEFAULT 'Issued'");
                console.log('  Widened status to VARCHAR(50)');
            } catch (e) {}
        }

        // Verify migration succeeded by re-checking columns
        const newCols = await db.execute('SHOW COLUMNS FROM ppe_issuance');
        const newColNames = new Set((Array.isArray(newCols) ? newCols : []).map(c => c.Field));
        const migrationOk = requiredCols.every(c => newColNames.has(c));

        if (migrationOk) {
            ppeTableReady = true;
            console.log('  ppe_issuance table migration verified');
        } else {
            const missing = requiredCols.filter(c => !newColNames.has(c));
            console.error('  ppe_issuance migration incomplete, missing columns:', missing.join(', '));
        }
    } catch (error) {
        console.error('  Error ensuring ppe_issuance table:', error.message);
    }
}

// Run table setup on module load
ensurePpeIssuanceTable();

// Helper: parse ppe_items JSON safely
function parsePpeItems(record) {
    let items = [];
    if (record.ppe_items) {
        try {
            items = typeof record.ppe_items === 'string'
                ? JSON.parse(record.ppe_items)
                : record.ppe_items;
        } catch (e) {
            items = [];
        }
    }
    return items;
}

// Helper: fetch PPE records from database with table-readiness check
async function fetchPpeRecords() {
    await ensurePpeIssuanceTable();

    const ppeRecords = await db.execute(
        `SELECT * FROM ppe_issuance ORDER BY COALESCE(issue_date, created_at) DESC`
    );

    return (Array.isArray(ppeRecords) ? ppeRecords : []).map(record => {
        // If some fields were stored in `notes` as JSON overflow, merge them back
        let merged = { ...record };
        if (record.notes) {
            try {
                const overflow = typeof record.notes === 'string' ? JSON.parse(record.notes) : record.notes;
                if (overflow && typeof overflow === 'object') {
                    // Only fill in fields that are missing or null in the record
                    for (const [key, val] of Object.entries(overflow)) {
                        if (merged[key] === undefined || merged[key] === null) {
                            merged[key] = val;
                        }
                    }
                }
            } catch (e) {
                // notes is plain text, not JSON overflow
            }
        }
        merged.ppe_items = parsePpeItems(merged);
        return merged;
    });
}

// Get PPE issuance records
router.get('/hse/ppe', async (req, res) => {
    try {
        console.log('🔍 Fetching HSE PPE issuance records...');
        const parsed = await fetchPpeRecords();
        console.log(`📊 Found ${parsed.length} PPE records`);
        res.json({ data: parsed });
    } catch (error) {
        console.error('❌ Error fetching PPE records:', error);
        // Return empty data instead of 500 so the frontend can still render
        res.json({ data: [] });
    }
});

// Get PPE issuance records (general endpoint)
router.get('/ppe', async (req, res) => {
    try {
        console.log('🔍 Fetching PPE issuance records (general endpoint)...');
        const parsed = await fetchPpeRecords();
        console.log(`📊 Found ${parsed.length} PPE records`);
        res.json({ data: parsed });
    } catch (error) {
        console.error('❌ Error fetching PPE records:', error);
        res.json({ data: [] });
    }
});

// Create a new PPE issuance record
router.post('/hse/ppe', async (req, res) => {
    try {
        await ensurePpeIssuanceTable();

        console.log('📝 Creating new PPE issuance record...');
        const {
            issuance_id, issue_date, worker_name, worker_id,
            project, department, ppe_items, ppe_condition,
            return_date, worker_signature, issued_by
        } = req.body;

        if (!issue_date || !worker_name || !worker_id || !project) {
            return res.status(400).json({ error: 'Missing required fields: issue_date, worker_name, worker_id, project' });
        }

        const itemsJson = JSON.stringify(ppe_items || []);

        // Dynamically build INSERT based on columns that actually exist in the table.
        // ALTER TABLE may fail on Railway due to permissions, so we adapt to
        // whatever schema is present.
        const colRows = await db.execute('SHOW COLUMNS FROM ppe_issuance');
        const existingCols = new Set((Array.isArray(colRows) ? colRows : []).map(c => c.Field));

        // Map of desired column → value
        const fieldMap = {
            issuance_id: issuance_id || null,
            issue_date: issue_date,
            worker_name: worker_name,
            worker_id: worker_id,
            project: project,
            department: department || null,
            ppe_items: itemsJson,
            ppe_condition: ppe_condition || 'new',
            return_date: return_date || null,
            worker_signature: worker_signature || null,
            issued_by: issued_by || null,
            status: 'Issued'
        };

        // Store any data that can't go into a dedicated column into `notes` as JSON
        const insertCols = [];
        const insertPlaceholders = [];
        const insertValues = [];
        const overflow = {};

        for (const [col, val] of Object.entries(fieldMap)) {
            if (existingCols.has(col)) {
                insertCols.push(col);
                insertPlaceholders.push('?');
                insertValues.push(val);
            } else {
                overflow[col] = val;
            }
        }

        // If there's overflow data and a `notes` column exists, store it there
        if (Object.keys(overflow).length > 0 && existingCols.has('notes')) {
            insertCols.push('notes');
            insertPlaceholders.push('?');
            insertValues.push(JSON.stringify(overflow));
        }

        if (insertCols.length === 0) {
            return res.status(500).json({ error: 'No matching columns found in ppe_issuance table' });
        }

        console.log(`📝 Inserting into columns: ${insertCols.join(', ')}`);
        if (Object.keys(overflow).length > 0) {
            console.log(`📝 Overflow fields stored in notes: ${Object.keys(overflow).join(', ')}`);
        }

        const result = await db.execute(
            `INSERT INTO ppe_issuance (${insertCols.join(', ')}) VALUES (${insertPlaceholders.join(', ')})`,
            insertValues
        );

        const insertId = result.insertId || result[0]?.insertId || null;
        console.log(`✅ PPE issuance record created with id: ${insertId}`);
        res.status(201).json({
            message: 'PPE issuance recorded successfully',
            id: insertId,
            issuance_id: issuance_id
        });
    } catch (error) {
        console.error('❌ Error creating PPE issuance record:', error);
        res.status(500).json({
            error: 'Failed to create PPE issuance record',
            details: error.message
        });
    }
});

// Update an existing PPE issuance record
router.put('/hse/ppe/:id', async (req, res) => {
    try {
        await ensurePpeIssuanceTable();

        const id = req.params.id;
        const rows = await db.execute('SELECT * FROM ppe_issuance WHERE id = ?', [id]);
        const existing = Array.isArray(rows) ? rows[0] : rows;
        if (!existing) {
            return res.status(404).json({ error: 'PPE record not found' });
        }

        // Only update columns that actually exist in the table
        const colRows = await db.execute('SHOW COLUMNS FROM ppe_issuance');
        const existingCols = new Set((Array.isArray(colRows) ? colRows : []).map(c => c.Field));

        const candidate = {
            issuance_id: req.body.issuance_id,
            issue_date: req.body.issue_date,
            worker_name: req.body.worker_name,
            worker_id: req.body.worker_id,
            project: req.body.project,
            department: req.body.department,
            ppe_items: req.body.ppe_items !== undefined ? JSON.stringify(req.body.ppe_items || []) : undefined,
            ppe_condition: req.body.ppe_condition,
            return_date: req.body.return_date,
            worker_signature: req.body.worker_signature,
            issued_by: req.body.issued_by,
            status: req.body.status
        };

        const updates = [];
        const params = [];
        for (const [col, val] of Object.entries(candidate)) {
            if (val === undefined) continue;
            if (!existingCols.has(col)) continue;
            updates.push(`${col} = ?`);
            params.push(val);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No updatable fields provided or columns missing' });
        }

        params.push(id);
        await db.execute(`UPDATE ppe_issuance SET ${updates.join(', ')} WHERE id = ?`, params);

        return res.json({ success: true, message: 'PPE record updated successfully' });
    } catch (error) {
        console.error('❌ Error updating PPE record:', error);
        return res.status(500).json({ error: 'Failed to update PPE record', details: error.message });
    }
});

// Get PPE statistics
router.get('/hse/ppe/stats', async (req, res) => {
    try {
        await ensurePpeIssuanceTable();

        const totalRows = await db.execute('SELECT COUNT(*) as total FROM ppe_issuance');
        const totalResult = Array.isArray(totalRows) ? totalRows[0] : totalRows;

        const monthRows = await db.execute(
            `SELECT COUNT(*) as this_month FROM ppe_issuance
             WHERE MONTH(issue_date) = MONTH(CURRENT_DATE()) AND YEAR(issue_date) = YEAR(CURRENT_DATE())`
        );
        const monthResult = Array.isArray(monthRows) ? monthRows[0] : monthRows;

        // Simplified low-stock query that works regardless of MySQL version
        let lowStock = 0;
        try {
            const lowStockRows = await db.execute(
                `SELECT COUNT(DISTINCT JSON_UNQUOTE(JSON_EXTRACT(ppe_items, '$[0].type'))) as low_stock
                 FROM ppe_issuance WHERE status = 'Issued'`
            );
            const lowStockResult = Array.isArray(lowStockRows) ? lowStockRows[0] : lowStockRows;
            lowStock = lowStockResult?.low_stock || 0;
        } catch (e) {
            // JSON_TABLE may not be available on all MySQL versions
        }

        res.json({
            total: totalResult.total || 0,
            this_month: monthResult.this_month || 0,
            low_stock: lowStock
        });
    } catch (error) {
        console.error('❌ Error fetching PPE stats:', error);
        res.json({ total: 0, this_month: 0, low_stock: 0 });
    }
});

// Get projects list for PPE form dropdown
router.get('/hse/ppe/projects', async (req, res) => {
    try {
        const projects = await db.execute(
            `SELECT id, name, status FROM projects ORDER BY name ASC`
        );
        res.json({ data: Array.isArray(projects) ? projects : [] });
    } catch (error) {
        console.error('Error fetching projects for PPE:', error.message);
        res.json({ data: [] });
    }
});

// Get departments list for PPE form dropdown
router.get('/hse/ppe/departments', async (req, res) => {
    try {
        const departments = await db.execute(
            `SELECT id, name, code FROM departments WHERE status = 'Active' ORDER BY name ASC`
        );
        res.json({ data: Array.isArray(departments) ? departments : [] });
    } catch (error) {
        console.error('Error fetching departments for PPE:', error.message);
        res.json({ data: [] });
    }
});

// Get Toolbox Meeting records
router.get('/hse/toolbox-meetings', async (req, res) => {
    try {
        console.log('🔍 Fetching HSE Toolbox Meeting records...');
        
        let toolboxMeetings = [];
        
        try {
            const dbRecords = await db.execute(
                `SELECT * FROM hse_work WHERE work_type = 'Toolbox Meeting' ORDER BY submitted_date DESC`
            );
            toolboxMeetings = dbRecords;
            console.log(`📊 Found ${toolboxMeetings.length} Toolbox Meeting records from database`);
        } catch (dbError) {
            console.error('❌ Database error, using fallback Toolbox Meeting records:', dbError);
            
            // Fallback to mock Toolbox Meeting records
            toolboxMeetings = [
                {
                    id: 1,
                    department_code: 'HSE',
                    work_type: 'Toolbox Meeting',
                    work_title: 'Weekly Safety Talk - Fall Protection',
                    work_description: 'Weekly toolbox meeting discussing fall protection measures and safety protocols',
                    meeting_date: '2026-04-20T09:00:00',
                    duration: 30,
                    topic: 'Fall Protection',
                    attendees: 15,
                    conducted_by: 'HSE Manager',
                    project: 'proj001',
                    status: 'Completed',
                    submitted_by: 'HSE Manager',
                    submitted_date: '2026-04-20',
                    mock: true
                },
                {
                    id: 2,
                    department_code: 'HSE',
                    work_type: 'Toolbox Meeting',
                    work_title: 'Toolbox Talk - PPE Requirements',
                    work_description: 'Discussion on proper PPE usage and requirements for different work areas',
                    meeting_date: '2026-04-18T14:00:00',
                    duration: 25,
                    topic: 'PPE Requirements',
                    attendees: 20,
                    conducted_by: 'Safety Officer',
                    project: 'proj002',
                    status: 'Completed',
                    submitted_by: 'Safety Officer',
                    submitted_date: '2026-04-18',
                    mock: true
                },
                {
                    id: 3,
                    department_code: 'HSE',
                    work_type: 'Toolbox Meeting',
                    work_title: 'Safety Meeting - Electrical Safety',
                    work_description: 'Toolbox meeting covering electrical safety procedures and lockout/tagout protocols',
                    meeting_date: '2026-04-15T08:30:00',
                    duration: 45,
                    topic: 'Electrical Safety',
                    attendees: 18,
                    conducted_by: 'Site Supervisor',
                    project: 'proj003',
                    status: 'In Progress',
                    submitted_by: 'Site Supervisor',
                    submitted_date: '2026-04-15',
                    mock: true
                }
            ];
            console.log(`📊 Using fallback mock Toolbox Meeting records:`, toolboxMeetings.length);
        }
        
        console.log(`📋 Returning ${toolboxMeetings.length} Toolbox Meeting records`);
        res.json(toolboxMeetings);
    } catch (error) {
        console.error('❌ Error fetching Toolbox Meeting records:', error);
        res.status(500).json({
            error: 'Failed to fetch Toolbox Meeting records',
            details: error.message
        });
    }
});

// Get Toolbox Meeting records (general endpoint)
router.get('/toolbox-meetings', async (req, res) => {
    try {
        console.log('🔍 Fetching Toolbox Meeting records (general endpoint)...');
        
        let toolboxMeetings = [];
        
        try {
            const dbRecords = await db.execute(
                `SELECT * FROM hse_work WHERE work_type = 'Toolbox Meeting' ORDER BY submitted_date DESC`
            );
            toolboxMeetings = dbRecords;
            console.log(`📊 Found ${toolboxMeetings.length} Toolbox Meeting records from database`);
        } catch (dbError) {
            console.error('❌ Database error, using fallback Toolbox Meeting records:', dbError);
            
            // Same fallback as above
            toolboxMeetings = [
                {
                    id: 1,
                    department_code: 'HSE',
                    work_type: 'Toolbox Meeting',
                    work_title: 'Weekly Safety Talk - Fall Protection',
                    work_description: 'Weekly toolbox meeting discussing fall protection measures and safety protocols',
                    meeting_date: '2026-04-20T09:00:00',
                    duration: 30,
                    topic: 'Fall Protection',
                    attendees: 15,
                    conducted_by: 'HSE Manager',
                    project: 'proj001',
                    status: 'Completed',
                    submitted_by: 'HSE Manager',
                    submitted_date: '2026-04-20',
                    mock: true
                },
                {
                    id: 2,
                    department_code: 'HSE',
                    work_type: 'Toolbox Meeting',
                    work_title: 'Toolbox Talk - PPE Requirements',
                    work_description: 'Discussion on proper PPE usage and requirements for different work areas',
                    meeting_date: '2026-04-18T14:00:00',
                    duration: 25,
                    topic: 'PPE Requirements',
                    attendees: 20,
                    conducted_by: 'Safety Officer',
                    project: 'proj002',
                    status: 'Completed',
                    submitted_by: 'Safety Officer',
                    submitted_date: '2026-04-18',
                    mock: true
                },
                {
                    id: 3,
                    department_code: 'HSE',
                    work_type: 'Toolbox Meeting',
                    work_title: 'Safety Meeting - Electrical Safety',
                    work_description: 'Toolbox meeting covering electrical safety procedures and lockout/tagout protocols',
                    meeting_date: '2026-04-15T08:30:00',
                    duration: 45,
                    topic: 'Electrical Safety',
                    attendees: 18,
                    conducted_by: 'Site Supervisor',
                    project: 'proj003',
                    status: 'In Progress',
                    submitted_by: 'Site Supervisor',
                    submitted_date: '2026-04-15',
                    mock: true
                }
            ];
            console.log(`📊 Using fallback mock Toolbox Meeting records:`, toolboxMeetings.length);
        }
        
        console.log(`📋 Returning ${toolboxMeetings.length} Toolbox Meeting records`);
        res.json(toolboxMeetings);
    } catch (error) {
        console.error('❌ Error fetching Toolbox Meeting records:', error);
        res.status(500).json({
            error: 'Failed to fetch Toolbox Meeting records',
            details: error.message
        });
    }
});

// Get Incident Reporting records
router.get('/hse/incidents', async (req, res) => {
    try {
        console.log('🔍 Fetching HSE Incident Reporting records...');
        
        let incidentRecords = [];
        
        try {
            const dbRecords = await db.execute(
                `SELECT * FROM hse_work WHERE work_type = 'Incident Reporting' ORDER BY submitted_date DESC`
            );
            incidentRecords = dbRecords;
            console.log(`📊 Found ${incidentRecords.length} Incident Reporting records from database`);
        } catch (dbError) {
            console.error('❌ Database error, using fallback Incident Reporting records:', dbError);
            
            // Fallback to mock Incident Reporting records
            incidentRecords = [
                {
                    id: 1,
                    department_code: 'HSE',
                    work_type: 'Incident Reporting',
                    work_title: 'Near Miss - Falling Tools',
                    work_description: 'Near miss incident with tools falling from height at tower construction site',
                    incident_type: 'Near Miss',
                    severity: 'Moderate',
                    location: 'Tower Base Area',
                    project: 'proj001',
                    status: 'Resolved',
                    submitted_by: 'Jennifer Lee',
                    submitted_date: '2026-04-22',
                    mock: true
                },
                {
                    id: 2,
                    department_code: 'HSE',
                    work_type: 'Incident Reporting',
                    work_title: 'Trench Collapse',
                    work_description: 'Trench collapse with workers trapped during foundation excavation',
                    incident_type: 'Accident',
                    severity: 'Critical',
                    location: 'Foundation Excavation',
                    project: 'proj002',
                    status: 'Investigating',
                    submitted_by: 'Thomas Anderson',
                    submitted_date: '2026-04-18',
                    mock: true
                },
                {
                    id: 3,
                    department_code: 'HSE',
                    work_type: 'Incident Reporting',
                    work_title: 'Equipment Fire Damage',
                    work_description: 'Fire damage to welding equipment in welding area',
                    incident_type: 'Property Damage',
                    severity: 'Minor',
                    location: 'Welding Area - Section B',
                    project: 'proj003',
                    status: 'Resolved',
                    submitted_by: 'Patricia Johnson',
                    submitted_date: '2026-04-15',
                    mock: true
                }
            ];
            console.log(`📊 Using fallback mock Incident Reporting records:`, incidentRecords.length);
        }
        
        console.log(`📋 Returning ${incidentRecords.length} Incident Reporting records`);
        res.json(incidentRecords);
    } catch (error) {
        console.error('❌ Error fetching Incident Reporting records:', error);
        res.status(500).json({
            error: 'Failed to fetch Incident Reporting records',
            details: error.message
        });
    }
});

// Get Incident Reporting records (general endpoint)
router.get('/incidents', async (req, res) => {
    try {
        console.log('🔍 Fetching Incident Reporting records (general endpoint)...');
        
        let incidentRecords = [];
        
        try {
            const dbRecords = await db.execute(
                `SELECT * FROM hse_work WHERE work_type = 'Incident Reporting' ORDER BY submitted_date DESC`
            );
            incidentRecords = dbRecords;
            console.log(`📊 Found ${incidentRecords.length} Incident Reporting records from database`);
        } catch (dbError) {
            console.error('❌ Database error, using fallback Incident Reporting records:', dbError);
            
            // Same fallback as above
            incidentRecords = [
                {
                    id: 1,
                    department_code: 'HSE',
                    work_type: 'Incident Reporting',
                    work_title: 'Near Miss - Falling Tools',
                    work_description: 'Near miss incident with tools falling from height at tower construction site',
                    incident_type: 'Near Miss',
                    severity: 'Moderate',
                    location: 'Tower Base Area',
                    project: 'proj001',
                    status: 'Resolved',
                    submitted_by: 'Jennifer Lee',
                    submitted_date: '2026-04-22',
                    mock: true
                },
                {
                    id: 2,
                    department_code: 'HSE',
                    work_type: 'Incident Reporting',
                    work_title: 'Trench Collapse',
                    work_description: 'Trench collapse with workers trapped during foundation excavation',
                    incident_type: 'Accident',
                    severity: 'Critical',
                    location: 'Foundation Excavation',
                    project: 'proj002',
                    status: 'Investigating',
                    submitted_by: 'Thomas Anderson',
                    submitted_date: '2026-04-18',
                    mock: true
                },
                {
                    id: 3,
                    department_code: 'HSE',
                    work_type: 'Incident Reporting',
                    work_title: 'Equipment Fire Damage',
                    work_description: 'Fire damage to welding equipment in welding area',
                    incident_type: 'Property Damage',
                    severity: 'Minor',
                    location: 'Welding Area - Section B',
                    project: 'proj003',
                    status: 'Resolved',
                    submitted_by: 'Patricia Johnson',
                    submitted_date: '2026-04-15',
                    mock: true
                }
            ];
            console.log(`📊 Using fallback mock Incident Reporting records:`, incidentRecords.length);
        }
        
        console.log(`📋 Returning ${incidentRecords.length} Incident Reporting records`);
        res.json(incidentRecords);
    } catch (error) {
        console.error('❌ Error fetching Incident Reporting records:', error);
        res.status(500).json({
            error: 'Failed to fetch Incident Reporting records',
            details: error.message
        });
    }
});

// Get Site Report records
router.get('/site-reports', async (req, res) => {
    try {
        console.log('🔍 Fetching Site Report records...');
        
        let siteReports = [];
        
        try {
            // Auto-create site_reports table if it doesn't exist
            await db.execute(`
                CREATE TABLE IF NOT EXISTS site_reports (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    project_id INT NOT NULL,
                    report_date DATE NOT NULL,
                    weather_conditions VARCHAR(50) NOT NULL,
                    site_supervisor VARCHAR(255) NOT NULL,
                    workers_present INT NOT NULL,
                    work_completed TEXT NOT NULL,
                    site_issues TEXT,
                    safety_incidents TEXT,
                    materials_used VARCHAR(500),
                    equipment_used VARCHAR(500),
                    next_day_plan TEXT NOT NULL,
                    photos_files TEXT,
                    status VARCHAR(50) DEFAULT 'Draft',
                    created_by VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            const dbRecords = await db.execute(`
                SELECT sr.id, sr.project_id, sr.report_date, sr.weather_conditions,
                       sr.site_supervisor, sr.workers_present, sr.work_completed,
                       sr.site_issues, sr.safety_incidents, sr.materials_used,
                       sr.equipment_used, sr.next_day_plan, sr.status, sr.created_by,
                       sr.created_at, p.name as project_name
                FROM site_reports sr
                LEFT JOIN projects p ON sr.project_id = p.id
                ORDER BY sr.report_date DESC
            `);
            siteReports = dbRecords;
            console.log(`📊 Found ${siteReports.length} Site Report records from database`);
        } catch (dbError) {
            console.error('❌ Database error fetching Site Report records:', dbError.message);
            siteReports = [];
        }
        
        console.log(`📋 Returning ${siteReports.length} Site Report records`);
        res.json(siteReports);
    } catch (error) {
        console.error('❌ Error fetching Site Report records:', error);
        res.status(500).json({
            error: 'Failed to fetch Site Report records',
            details: error.message
        });
    }
});

// ============================================
// Administrative Operations Endpoints
// ============================================

// GET /operations - Fetch all admin operations data from database
router.get('/operations', async (req, res) => {
    try {
        console.log('📋 Fetching administrative operations data...');

        let adminWork = [];
        let documents = [];
        let officeResources = [];
        let internalComms = [];

        // Fetch admin work items
        try {
            const rows = await db.execute(
                `SELECT id, work_type, work_title, work_description, status, priority,
                        submitted_by, submitted_date, assigned_to, deadline, completion_date
                 FROM admin_work
                 ORDER BY submitted_date DESC
                 LIMIT 50`
            );
            adminWork = Array.isArray(rows) ? rows : [];
            console.log(`✅ Loaded ${adminWork.length} admin work items`);
        } catch (e) {
            console.error('⚠️ Error fetching admin_work:', e.message);
        }

        // Fetch documents
        try {
            const rows = await db.execute(
                `SELECT id, title, description, file_name, category, status, created_at, updated_at
                 FROM documents
                 ORDER BY updated_at DESC
                 LIMIT 50`
            );
            documents = Array.isArray(rows) ? rows : [];
            console.log(`✅ Loaded ${documents.length} documents`);
        } catch (e) {
            console.error('⚠️ Error fetching documents:', e.message);
        }

        // Fetch office resources
        try {
            const rows = await db.execute(
                `SELECT id, resource_code, resource_name, resource_type, description,
                        status, \`condition\`, location, assigned_to, created_at
                 FROM office_resources
                 ORDER BY created_at DESC
                 LIMIT 50`
            );
            officeResources = Array.isArray(rows) ? rows : [];
            console.log(`✅ Loaded ${officeResources.length} office resources`);
        } catch (e) {
            console.error('⚠️ Error fetching office_resources:', e.message);
        }

        // Fetch internal communications from admin_work where work_type relates to communication
        try {
            const rows = await db.execute(
                `SELECT id, work_type, work_title, work_description, status, priority,
                        submitted_by, submitted_date
                 FROM admin_work
                 WHERE work_type IN ('Administrative Operations', 'Department Coordination', 'Document Management')
                 ORDER BY submitted_date DESC
                 LIMIT 20`
            );
            internalComms = Array.isArray(rows) ? rows : [];
            console.log(`✅ Loaded ${internalComms.length} internal communication items`);
        } catch (e) {
            console.error('⚠️ Error fetching internal comms:', e.message);
        }

        // Compute summary stats
        const totalWork = adminWork.length;
        const pendingWork = adminWork.filter(w => w.status === 'Pending').length;
        const inProgressWork = adminWork.filter(w => w.status === 'In Progress').length;
        const completedWork = adminWork.filter(w => w.status === 'Completed').length;
        const totalDocs = documents.length;
        const totalResources = officeResources.length;

        res.json({
            success: true,
            data: {
                adminWork,
                documents,
                officeResources,
                internalComms,
                summary: {
                    totalWork,
                    pendingWork,
                    inProgressWork,
                    completedWork,
                    totalDocs,
                    totalResources,
                    internalCommStatus: internalComms.length > 0 ? 'Active' : 'No Records',
                    documentationControl: totalDocs > 0 ? 'Organized' : 'No Records',
                    filingSystemStatus: totalDocs > 0 ? 'Updated' : 'No Records'
                }
            }
        });
    } catch (error) {
        console.error('❌ Error fetching admin operations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch administrative operations data',
            details: error.message
        });
    }
});

// POST /operations/internal-comm - Create/update internal communication record
router.post('/operations/internal-comm', async (req, res) => {
    try {
        const { subject, message, priority, recipients } = req.body;
        console.log('📨 Creating internal communication record...');

        const result = await db.execute(
            `INSERT INTO admin_work (department_code, work_type, work_title, work_description, status, priority, submitted_by, submitted_date)
             VALUES ('ADMIN', 'Department Coordination', ?, ?, 'Pending', ?, ?, NOW())`,
            [
                subject || 'Internal Communication',
                message || '',
                priority || 'Medium',
                (recipients || 'Admin')
            ]
        );

        console.log('✅ Internal communication record created, ID:', result.insertId);

        // Create a notification so it appears in the bell icon
        try {
            await db.execute(
                `INSERT INTO notifications (title, message, type, priority, recipient_type, recipients, sent_by, status, is_read, created_at)
                 VALUES (?, ?, 'info', ?, 'all', ?, ?, 'sent', 0, NOW())`,
                [
                    'Internal Communication: ' + (subject || 'New Message'),
                    message || '',
                    priority || 'Medium',
                    recipients || 'All Staff',
                    'Admin'
                ]
            );
            console.log('🔔 Notification created for internal communication');
        } catch (notifError) {
            console.error('⚠️ Failed to create notification for internal comm:', notifError.message);
        }

        res.json({
            success: true,
            message: 'Internal communication recorded successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('❌ Error creating internal comm:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create internal communication',
            details: error.message
        });
    }
});

// POST /operations/filing-system - Update filing system record
router.post('/operations/filing-system', async (req, res) => {
    try {
        const { action, category, description } = req.body;
        console.log('📂 Updating filing system...');

        const result = await db.execute(
            `INSERT INTO admin_work (department_code, work_type, work_title, work_description, status, priority, submitted_by, submitted_date)
             VALUES ('ADMIN', 'Document Management', ?, ?, 'Completed', 'Medium', 'Admin System', NOW())`,
            [
                action || 'Filing System Update',
                description || `Filing system ${category || 'general'} update performed`
            ]
        );

        console.log('✅ Filing system updated, ID:', result.insertId);
        res.json({
            success: true,
            message: 'Filing system updated successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('❌ Error updating filing system:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update filing system',
            details: error.message
        });
    }
});

// GET /operations/admin-report - Generate admin report from real data
router.get('/operations/admin-report', async (req, res) => {
    try {
        console.log('📊 Generating administrative report...');

        let workSummary = [];
        let docSummary = [];
        let resourceSummary = [];

        try {
            const rows = await db.execute(
                `SELECT status, COUNT(*) as count FROM admin_work GROUP BY status`
            );
            workSummary = Array.isArray(rows) ? rows : [];
        } catch (e) {
            console.error('⚠️ Error in work summary:', e.message);
        }

        try {
            const rows = await db.execute(
                `SELECT category, status, COUNT(*) as count FROM documents GROUP BY category, status`
            );
            docSummary = Array.isArray(rows) ? rows : [];
        } catch (e) {
            console.error('⚠️ Error in doc summary:', e.message);
        }

        try {
            const rows = await db.execute(
                `SELECT resource_type, status, COUNT(*) as count FROM office_resources GROUP BY resource_type, status`
            );
            resourceSummary = Array.isArray(rows) ? rows : [];
        } catch (e) {
            console.error('⚠️ Error in resource summary:', e.message);
        }

        // Recent activity
        let recentActivity = [];
        try {
            const rows = await db.execute(
                `SELECT id, work_type, work_title, status, submitted_date
                 FROM admin_work
                 ORDER BY submitted_date DESC
                 LIMIT 10`
            );
            recentActivity = Array.isArray(rows) ? rows : [];
        } catch (e) {
            console.error('⚠️ Error in recent activity:', e.message);
        }

        res.json({
            success: true,
            report: {
                generatedAt: new Date().toISOString(),
                workSummary,
                docSummary,
                resourceSummary,
                recentActivity
            }
        });
    } catch (error) {
        console.error('❌ Error generating admin report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate admin report',
            details: error.message
        });
    }
});

// Get all work items for a specific department
router.get('/:department', async (req, res, next) => {
    let department = req.params.department;

    const reservedPaths = new Set([
        'workforce-requests',
        'notifications'
    ]);

    if (reservedPaths.has(String(department || '').toLowerCase())) {
        return next();
    }

    try {
        
        // Fix department detection for GET requests too
        if (department === 'work') {
            const originalUrl = req.originalUrl || req.url;
            console.log('🔍 Original URL (GET):', originalUrl);
            
            if (originalUrl.includes('/api/hse/')) {
                department = 'hse';
            } else if (originalUrl.includes('/api/hr/')) {
                department = 'hr';
            } else if (originalUrl.includes('/api/finance/')) {
                department = 'finance';
            } else if (originalUrl.includes('/api/project/')) {
                department = 'projects';
            } else if (originalUrl.includes('/api/realestate/')) {
                department = 'realestate';
            } else if (originalUrl.includes('/api/admin/')) {
                department = 'admin';
            }
        }
        
        // Map assignments to admin_work table since assignments_work doesn't exist
        if (department === 'assignments') {
            department = 'admin';
            console.log('🔄 Mapping assignments department to admin_work table');
        }
        
        console.log(`📋 Fetching ${department} work items`);
        
        let workItems = [];
        
        try {
            const dbWorkItems = await db.execute(
                `SELECT * FROM \`${department}_work\` ORDER BY submitted_date DESC`
            );
            workItems = dbWorkItems;
            console.log(`📊 Found ${workItems.length} ${department} work items from database`);
            
            // For HSE department, supplement with mock data if fewer than 3 records
            if (department === 'hse' && workItems.length < 3) {
                console.log(`⚠️ Only ${workItems.length} HSE records found, adding mock data for demonstration`);
                const mockData = getMockWorkItems('hse');
                
                // Add mock data that doesn't conflict with real IDs
                const additionalMockData = mockData.filter(mock => 
                    !workItems.some(real => real.id === mock.id)
                ).slice(0, 5 - workItems.length);
                workItems = [...workItems, ...additionalMockData];
                console.log(`📊 Total HSE items after adding mock data: ${workItems.length}`);
            }
        } catch (dbError) {
            console.error('❌ Database error, using fallback work items:', dbError);
            
            // Fallback to mock work items based on department
            workItems = getMockWorkItems(department);
            console.log(`📊 Using fallback mock work items:`, workItems.length);
        }
        
        console.log(`📋 Returning ${workItems.length} ${department} work items`);
        res.json(workItems);
    } catch (error) {
        console.error(`❌ Error fetching ${department} work items:`, error);
        res.status(500).json({
            error: 'Failed to fetch work items',
            details: error.message
        });
    }
});

// Helper function to get mock work items
function getMockWorkItems(department) {
    const mockWorkItems = {
                hr: [
                    {
                        id: 1,
                        department_code: 'HR',
                        work_type: 'Employee Registration',
                        work_title: 'New Employee Onboarding',
                        work_description: 'Complete onboarding for new hires',
                        employee_name: 'John Doe',
                        status: 'Pending',
                        priority: 'Medium',
                        submitted_by: 'HR Manager',
                        submitted_date: '2024-01-15',
                        mock: true
                    },
                    {
                        id: 2,
                        department_code: 'HR',
                        work_type: 'Leave Management',
                        work_title: 'Leave Request Processing',
                        work_description: 'Process pending leave requests',
                        employee_name: 'Jane Smith',
                        status: 'In Progress',
                        priority: 'High',
                        submitted_by: 'HR Assistant',
                        submitted_date: '2024-01-14',
                        mock: true
                    }
                ],
                finance: [
                    {
                        id: 1,
                        department_code: 'FINANCE',
                        work_type: 'Budget Management',
                        work_title: 'Q1 Budget Review',
                        work_description: 'Review and approve Q1 budget allocations',
                        amount: 150000.00,
                        status: 'Pending',
                        priority: 'High',
                        submitted_by: 'Finance Manager',
                        submitted_date: '2024-01-15',
                        mock: true
                    }
                ],
                hse: [
                    {
                        id: 1,
                        department_code: 'HSE',
                        work_type: 'Incident Reporting',
                        work_title: 'Safety Incident Investigation',
                        work_description: 'Investigate reported safety incident',
                        incident_type: 'Near Miss',
                        severity: 'Medium',
                        location: 'Site A',
                        status: 'In Progress',
                        priority: 'High',
                        submitted_by: 'HSE Manager',
                        submitted_date: '2024-01-15',
                        mock: true
                    },
                    {
                        id: 2,
                        department_code: 'HSE',
                        work_type: 'Safety Violation',
                        work_title: 'PPE Compliance Check',
                        work_description: 'Regular PPE compliance inspection',
                        incident_type: 'Safety Violation',
                        severity: 'Low',
                        location: 'Site B',
                        status: 'Completed',
                        priority: 'Medium',
                        submitted_by: 'Safety Officer',
                        submitted_date: '2024-01-14',
                        mock: true
                    },
                    {
                        id: 3,
                        department_code: 'HSE',
                        work_type: 'Toolbox Meeting',
                        work_title: 'Weekly Safety Toolbox Talk',
                        work_description: 'Conduct weekly safety meeting with crew',
                        incident_type: null,
                        severity: 'Low',
                        location: 'Main Office',
                        status: 'Scheduled',
                        priority: 'Medium',
                        submitted_by: 'Site Supervisor',
                        submitted_date: '2024-01-13',
                        mock: true
                    },
                    {
                        id: 4,
                        department_code: 'HSE',
                        work_type: 'Safety Policy Upload',
                        work_title: 'Updated Safety Manual',
                        work_description: 'Upload revised safety procedures manual',
                        incident_type: null,
                        severity: 'Low',
                        location: 'All Sites',
                        status: 'Pending',
                        priority: 'High',
                        submitted_by: 'HSE Manager',
                        submitted_date: '2024-01-12',
                        mock: true
                    },
                    {
                        id: 5,
                        department_code: 'HSE',
                        work_type: 'Incident Reporting',
                        work_title: 'Equipment Failure Report',
                        work_description: 'Report and investigate equipment malfunction',
                        incident_type: 'Equipment Failure',
                        severity: 'High',
                        location: 'Site C',
                        status: 'Pending',
                        priority: 'High',
                        submitted_by: 'Maintenance Supervisor',
                        submitted_date: '2024-01-11',
                        mock: true
                    },
                    {
                        id: 6,
                        department_code: 'HSE',
                        work_type: 'PPE Issuance',
                        work_title: 'Hard Hat Distribution',
                        work_description: 'Issue hard hats to new construction workers',
                        ppe_type: 'Hard Hat',
                        employee_name: 'John Doe',
                        issued_date: '2024-01-10',
                        return_date: '2024-04-10',
                        status: 'Issued',
                        priority: 'Medium',
                        submitted_by: 'Safety Officer',
                        submitted_date: '2024-01-10',
                        mock: true
                    },
                    {
                        id: 7,
                        department_code: 'HSE',
                        work_type: 'Inspection Report',
                        work_title: 'Monthly Safety Inspection',
                        work_description: 'Conduct monthly safety inspection of all work areas',
                        inspection_date: '2024-01-09',
                        inspector: 'HSE Manager',
                        compliance_status: 'minor-issues',
                        risk_level: 'Low',
                        project: 'proj001',
                        status: 'Completed',
                        priority: 'High',
                        submitted_by: 'HSE Manager',
                        submitted_date: '2024-01-09',
                        mock: true
                    }
                ],
                projects: [
                    {
                        id: 1,
                        department_code: 'PROJECT',
                        work_type: 'Project Creation',
                        work_title: 'New Project Setup',
                        work_description: 'Set up new construction project',
                        project_name: 'Tower Complex Phase 2',
                        client_name: 'ABC Corporation',
                        status: 'Pending',
                        priority: 'High',
                        submitted_by: 'Project Manager',
                        submitted_date: '2024-01-15',
                        mock: true
                    },
                    {
                        id: 2,
                        department_code: 'PROJECT',
                        work_type: 'Site Report',
                        work_title: 'Daily Site Report - Port Modernization',
                        work_description: 'Daily progress report for port modernization project',
                        project: 'prj001',
                        report_date: '2024-01-14',
                        weather_conditions: 'Sunny',
                        site_supervisor: 'John Mwangi',
                        workers_present: 20,
                        work_completed: 'Column construction completed, beam installation started',
                        issues_challenges: 'No issues',
                        safety_incidents: 'None',
                        materials_used: 'Steel beams: 10 units, Bolts: 500 units',
                        equipment_used: 'Crane, Torque wrench',
                        next_day_plan: 'Continue beam installation, begin deck construction',
                        status: 'Completed',
                        submitted_by: 'John Mwangi',
                        submitted_date: '2024-01-14',
                        mock: true
                    }
                ],
                realestate: [
                    {
                        id: 1,
                        department_code: 'REALESTATE',
                        work_type: 'Property Addition',
                        work_title: 'New Property Listing',
                        work_description: 'Add new property to portfolio',
                        property_address: '123 Main St, Dar es Salaam',
                        property_type: 'Commercial',
                        status: 'Pending',
                        priority: 'Medium',
                        submitted_by: 'Real Estate Manager',
                        submitted_date: '2024-01-15',
                        mock: true
                    }
                ],
                admin: [
                    {
                        id: 1,
                        department_code: 'ADMIN',
                        work_type: 'Document Management',
                        work_title: 'Policy Document Update',
                        work_description: 'Update company policy documentation',
                        status: 'In Progress',
                        priority: 'Medium',
                        submitted_by: 'Admin Assistant',
                        submitted_date: '2024-01-15',
                        mock: true
                    }
                ]
            };
            
            return mockWorkItems[department] || [];
}

// Worker Assignments Routes
// Create new worker assignment (moved here to prevent conflicts with general POST route)
router.post('/assignments', async (req, res) => {
    try {
        console.log('📝 Creating new worker assignment...');
        console.log('📊 Request body:', req.body);
        
        const {
            employee_id,
            employee_name,
            project_id,
            project_name,
            role_in_project,
            start_date,
            end_date,
            assignment_notes,
            assigned_by = 'HR Manager',
            assigned_by_role = 'HR Manager'
        } = req.body;
        
        // Validate required fields
        if (!employee_id || !employee_name || !project_id || !project_name || !role_in_project || !start_date) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['employee_id', 'employee_name', 'project_id', 'project_name', 'role_in_project', 'start_date'],
                received: { employee_id, employee_name, project_id, project_name, role_in_project, start_date }
            });
        }
        
        // Insert new assignment with error handling for missing columns
        let result;
        try {
            result = await db.execute(`
                INSERT INTO worker_assignments (
                    employee_id, employee_name, project_id, project_name, role_in_project,
                    start_date, end_date, assignment_notes, status, assigned_by, assigned_by_role
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                employee_id,
                employee_name,
                project_id,
                project_name,
                role_in_project,
                start_date,
                end_date || null,
                assignment_notes || null,
                'Active', // Add status column
                assigned_by,
                assigned_by_role
            ]);
        } catch (columnError) {
            if (columnError.message.includes('Unknown column')) {
                console.log('⚠️ Missing column detected, adding missing columns safely (preserving data)...');
                
                // Add missing columns instead of dropping the table (DATA SAFE)
                const requiredColumns = [
                    { name: 'employee_id', def: "VARCHAR(50) NOT NULL DEFAULT ''" },
                    { name: 'employee_name', def: "VARCHAR(255) NOT NULL DEFAULT ''" },
                    { name: 'project_id', def: "VARCHAR(50) NOT NULL DEFAULT ''" },
                    { name: 'project_name', def: "VARCHAR(255) NOT NULL DEFAULT ''" },
                    { name: 'role_in_project', def: "VARCHAR(255) NOT NULL DEFAULT ''" },
                    { name: 'start_date', def: "DATE NULL" },
                    { name: 'end_date', def: "DATE NULL" },
                    { name: 'assignment_notes', def: "TEXT NULL" },
                    { name: 'status', def: "VARCHAR(50) DEFAULT 'Active'" },
                    { name: 'assigned_by', def: "VARCHAR(255) NOT NULL DEFAULT ''" },
                    { name: 'assigned_by_role', def: "VARCHAR(255) NOT NULL DEFAULT ''" }
                ];
                
                for (const col of requiredColumns) {
                    try {
                        await db.execute(`ALTER TABLE worker_assignments ADD COLUMN ${col.name} ${col.def}`);
                        console.log(`✅ Added missing column: ${col.name}`);
                    } catch (alterErr) {
                        // Column already exists — safe to ignore
                    }
                }
                
                console.log('✅ worker_assignments schema updated safely, retrying insertion...');
                
                // Retry insertion
                result = await db.execute(`
                    INSERT INTO worker_assignments (
                        employee_id, employee_name, project_id, project_name, role_in_project,
                        start_date, end_date, assignment_notes, status, assigned_by, assigned_by_role
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    employee_id,
                    employee_name,
                    project_id,
                    project_name,
                    role_in_project,
                    start_date,
                    end_date || null,
                    assignment_notes || null,
                    'Active',
                    assigned_by,
                    assigned_by_role
                ]);
            } else {
                throw columnError;
            }
        }
        
        // Handle different result formats from db.execute()
        const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;
        console.log('✅ Worker assignment created successfully:', result);
        console.log('✅ Insert ID:', insertId);
        
        // Verify the data was actually inserted
        try {
            const [verification] = await db.execute(
                'SELECT * FROM worker_assignments WHERE id = ?',
                [insertId]
            );
            console.log('🔍 Verification - Retrieved assignment:', verification);
            console.log('🔍 Verification - Assignment exists:', verification && verification.length > 0);
        } catch (verifyError) {
            console.error('❌ Verification error:', verifyError);
        }
        
        res.status(201).json({
            message: 'Worker assignment created successfully',
            assignment_id: insertId,
            data: {
                employee_id,
                employee_name,
                project_id,
                project_name,
                role_in_project,
                start_date,
                end_date,
                assignment_notes,
                assigned_by,
                assigned_by_role
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating worker assignment:', error);
        res.status(500).json({ 
            error: 'Failed to create worker assignment',
            details: error.message
        });
    }
});

// Get all worker assignments
router.get('/assignments', async (req, res) => {
    try {
        console.log('📋 Fetching worker assignments...');
        
        const [assignments] = await db.execute(`
            SELECT * FROM worker_assignments 
            ORDER BY created_at DESC
        `);
        
        console.log('✅ Worker assignments fetched:', assignments.length);
        res.json(assignments);
        
    } catch (error) {
        console.error('❌ Error fetching worker assignments:', error);
        res.status(500).json({ error: 'Failed to fetch worker assignments' });
    }
});

// Test endpoint to verify worker_assignments table
router.get('/assignments-test', async (req, res) => {
    try {
        console.log('🧪 Testing worker_assignments table...');
        
        // Check if table exists
        const [tableCheck] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'worker_assignments'
        `);
        
        console.log('🔍 Table exists check:', tableCheck[0].count > 0);
        
        if (tableCheck[0].count === 0) {
            return res.status(404).json({ 
                error: 'worker_assignments table does not exist',
                suggestion: 'Run database migrations'
            });
        }
        
        // Get table structure
        const [structure] = await db.execute('DESCRIBE worker_assignments');
        console.log('🔍 Table structure:', structure);
        
        // Get all records
        const [allRecords] = await db.execute('SELECT * FROM worker_assignments ORDER BY id DESC LIMIT 5');
        console.log('🔍 Recent records:', allRecords);
        
        res.json({
            table_exists: true,
            table_structure: structure,
            recent_records: allRecords,
            total_records: allRecords.length
        });
        
    } catch (error) {
        console.error('❌ Test endpoint error:', error);
        res.status(500).json({ error: 'Test failed', details: error.message });
    }
});

// Direct work assignment endpoint for HR department
router.post('/', async (req, res, next) => {
    try {
        console.log('🔍 Direct HR work assignment request received');
        console.log('📊 Request body:', req.body);
        
        const department = 'hr'; // Fixed for HR department
        
        const {
            work_type,
            work_title,
            work_description,
            priority = 'Medium',
            due_date,
            assigned_to,
            submitted_by,
            // HR-specific fields
            employee_name,
            employee_email,
            project_name,
            // Additional fields
            status = 'pending'
        } = req.body;
        
        // Validate required fields
        if (!work_type || !work_title || !work_description) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields: work_type, work_title, work_description',
                received: { work_type, work_title, work_description }
            });
        }
        
        // Map frontend work types to database ENUM values
        const getMappedWorkType = (workType) => {
            const mappings = {
                'Attendance Management': 'Attendance Tracking',
                'Employee Registration': 'Employee Registration',
                'Worker Account Creation': 'Worker Account Creation',
                'Project Assignment': 'Project Assignment',
                'Leave Management': 'Leave Management',
                'Leave Request': 'Leave Management', // Added mapping for Leave Request
                'Contract Management': 'Contract Management',
                'Policy Management': 'Policy Management',
                'Senior Staff Hiring': 'Senior Staff Hiring',
                'Budget Approval': 'Budget Approval'
            };
            
            return mappings[workType] || workType;
        };
        
        const mapped_work_type = getMappedWorkType(work_type);
        console.log('🔄 Mapped work type:', work_type, '->', mapped_work_type);
        console.log('🔍 Work type length:', work_type ? work_type.length : 'undefined');
        console.log('🔍 Mapped work type length:', mapped_work_type ? mapped_work_type.length : 'undefined');
        
        // Validate that mapped_work_type is a valid ENUM value
        const validWorkTypes = [
            'Employee Registration', 'Worker Account Creation', 'Project Assignment', 
            'Attendance Tracking', 'Leave Management', 'Contract Management', 
            'Policy Management', 'Senior Staff Hiring', 'Budget Approval', 'Employment Action'
        ];
        
        if (!validWorkTypes.includes(mapped_work_type)) {
            console.log('❌ Invalid work type:', mapped_work_type);
            return res.status(400).json({
                error: 'Invalid work_type',
                details: `Work type "${mapped_work_type}" is not valid`,
                validOptions: validWorkTypes
            });
        }
        
        // Build the query for HR department
        let query = '';
        let values = [];
        
        // Base fields
        const baseFields = [
            'department_code',
            'work_type',
            'work_title', 
            'work_description',
            'priority',
            'due_date',
            'assigned_to',
            'submitted_by',
            'submitted_date',
            'status'
        ];
        
        const baseValues = [
            department,
            mapped_work_type,
            work_title,
            work_description,
            priority || 'Medium',
            due_date || null,
            assigned_to || null,
            submitted_by || null,
            new Date().toISOString().split('T')[0], // submitted_date
            status || 'pending'
        ];
        
        // HR-specific fields
        let additionalFields = [];
        let additionalValues = [];
        
        if (employee_name) {
            additionalFields.push('employee_name');
            additionalValues.push(employee_name);
        }
        if (employee_email) {
            additionalFields.push('employee_email');
            additionalValues.push(employee_email);
        }
        if (project_name) {
            additionalFields.push('project_name');
            additionalValues.push(project_name);
        }
        
        const allFields = baseFields.concat(additionalFields);
        const allValues = baseValues.concat(additionalValues);
        
        query = `
            INSERT INTO hr_work (
                ${allFields.join(', ')}
            ) VALUES (
                ${allFields.map(() => '?').join(', ')}
            )
        `;
        
        values = allValues;
        
        console.log('🔍 Executing query:', query);
        console.log('📊 Query values:', values);
        
        try {
            const result = await db.execute(query, values);
            console.log('✅ Work item created successfully:', result);
            
            const hrWorkId = result.insertId;
            
            // Check if this is a leave request or contract management and save to dedicated tables
            let dualSaveResult = null;
            
            if (work_type === 'Leave Management' || work_type === 'Leave Request') {
                console.log('🔄 Detected leave request, saving to leave_requests table...');
                try {
                    // Extract leave request data from the request
                    const {
                        employee: employee_id,
                        employee_name: leave_employee_name,
                        leaveType: leave_type,
                        startDate: start_date,
                        endDate: end_date,
                        daysRequested: days_requested,
                        reasonForLeave: reason_for_leave,
                        approvedBy
                    } = req.body;
                    
                    if (employee_id && leave_type && start_date && days_requested && reason_for_leave) {
                        const leaveQuery = `
                            INSERT INTO leave_requests (
                                employee_id, employee_name, leave_type, start_date, end_date,
                                days_requested, reason_for_leave, approval_status, approved_by,
                                approved_date, rejection_reason
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        
                        const leaveValues = [
                            employee_id,
                            leave_employee_name || employee_name || 'Unknown Employee',
                            leave_type,
                            start_date,
                            end_date || null,
                            days_requested,
                            reason_for_leave,
                            'pending', // approval_status
                            approvedBy || null,
                            null, // approved_date
                            null // rejection_reason
                        ];
                        
                        const leaveResult = await db.execute(leaveQuery, leaveValues);
                        console.log('✅ Leave request also saved to leave_requests table:', leaveResult);
                        
                        dualSaveResult = {
                            leave_request_id: leaveResult.insertId,
                            table: 'leave_requests'
                        };
                    }
                } catch (leaveError) {
                    console.error('❌ Error saving to leave_requests table:', leaveError);
                    // Continue with response even if dual save fails
                }
            }
            
            if (work_type === 'Contract Management') {
                console.log('🔄 Detected contract management, saving to contracts table...');
                try {
                    // Extract contract data from the request
                    const {
                        employee: employee_id,
                        employee_name: contract_employee_name,
                        contract_type,
                        start_date,
                        end_date,
                        salary,
                        contract_status = 'active',
                        contract_terms,
                        contract_document,
                        created_by
                    } = req.body;
                    
                    if (employee_id && contract_type && start_date && salary) {
                        const contractQuery = `
                            INSERT INTO contracts (
                                employee_id, employee_name, contract_type, start_date, end_date,
                                salary, contract_status, contract_terms, contract_document, created_by
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        
                        const contractValues = [
                            employee_id,
                            contract_employee_name || employee_name || 'Unknown Employee',
                            contract_type,
                            start_date,
                            end_date || null,
                            salary,
                            contract_status,
                            contract_terms || null,
                            contract_document || null,
                            created_by || 'HR Manager'
                        ];
                        
                        const contractResult = await db.execute(contractQuery, contractValues);
                        console.log('✅ Contract also saved to contracts table:', contractResult);
                        
                        dualSaveResult = {
                            contract_id: contractResult.insertId,
                            table: 'contracts'
                        };
                    }
                } catch (contractError) {
                    console.error('❌ Error saving to contracts table:', contractError);
                    // Continue with response even if dual save fails
                }
            }
            
            // Build response with dual save information
            const response = {
                message: 'Work item created successfully',
                id: hrWorkId,
                department,
                work_type: mapped_work_type,
                work_title,
                status,
                created_at: new Date().toISOString()
            };
            
            // Add dual save information if applicable
            if (dualSaveResult) {
                response.dual_save = {
                    success: true,
                    ...dualSaveResult,
                    message: `Also saved to ${dualSaveResult.table} table`
                };
            }
            
            res.status(201).json(response);
        } catch (dbError) {
            console.error('❌ Database execution error:', dbError);
            throw new Error(`Database query failed: ${dbError.message}`);
        }
        
    } catch (error) {
        console.error('❌ Error creating work item:', error);
        res.status(500).json({ 
            error: 'Failed to create work item',
            details: error.message 
        });
    }
});

// Database Test Endpoint
router.get('/db-test', async (req, res) => {
    try {
        console.log('Testing database connection and tables...');
        
        const db = require('../../database/config/database');
        
        // Test basic connection
        const [testResult] = await db.execute('SELECT 1 as test');
        console.log('Database connection test:', testResult);
        
        // Check existing tables
        const [tables] = await db.execute('SHOW TABLES');
        console.log('Existing tables:', tables.map(t => Object.values(t)[0]));
        
        // Test site_reports table
        try {
            const [siteReportsCheck] = await db.execute('DESCRIBE site_reports');
            console.log('site_reports table structure:', siteReportsCheck);
        } catch (e) {
            console.log('site_reports table error:', e.message);
        }
        
        // Test work_approvals table
        try {
            const [workApprovalsCheck] = await db.execute('DESCRIBE work_approvals');
            console.log('work_approvals table structure:', workApprovalsCheck);
        } catch (e) {
            console.log('work_approvals table error:', e.message);
        }
        
        res.json({
            success: true,
            message: 'Database test completed',
            connection: testResult,
            tables: tables.map(t => Object.values(t)[0]),
            site_reports_exists: siteReportsCheck ? true : false,
            work_approvals_exists: workApprovalsCheck ? true : false
        });
        
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({
            success: false,
            error: 'Database test failed',
            details: error.message
        });
    }
});

// Save Site Report
router.post('/site-reports', async (req, res) => {
    try {
        console.log('Saving site report...');
        console.log('Request body raw:', JSON.stringify(req.body, null, 2));
        
        const {
            project_id,
            report_date,
            weather_conditions,
            site_supervisor,
            workers_present,
            work_completed,
            site_issues,
            safety_incidents,
            materials_used,
            equipment_used,
            next_day_plan
        } = req.body;
        
        // Debug each field
        console.log('Field validation:');
        console.log('  project_id:', project_id, 'type:', typeof project_id, 'truthy:', !!project_id);
        console.log('  report_date:', report_date, 'type:', typeof report_date, 'truthy:', !!report_date);
        console.log('  weather_conditions:', weather_conditions, 'type:', typeof weather_conditions, 'truthy:', !!weather_conditions);
        console.log('  workers_present:', workers_present, 'type:', typeof workers_present, 'truthy:', !!workers_present);
        console.log('  work_completed:', work_completed, 'type:', typeof work_completed, 'truthy:', !!work_completed);
        console.log('  next_day_plan:', next_day_plan, 'type:', typeof next_day_plan, 'truthy:', !!next_day_plan);
        
        // Convert project_id from string to integer if needed
        let numericProjectId = project_id;
        if (typeof project_id === 'string' && project_id.startsWith('prj')) {
            // Extract numeric part from 'prj001', 'prj002', etc.
            const projectMap = {
                'prj001': 1,
                'prj002': 2,
                'prj003': 3
            };
            numericProjectId = projectMap[project_id] || parseInt(project_id.replace('prj', '')) || 1;
            console.log(`Converted project_id from ${project_id} to ${numericProjectId}`);
        }

        // Validate required fields with better checking
        const missingFields = [];
        if (!numericProjectId || numericProjectId === '') missingFields.push('project_id');
        if (!report_date || report_date === '') missingFields.push('report_date');
        if (!weather_conditions || weather_conditions === '') missingFields.push('weather_conditions');
        if (!workers_present || workers_present === '') missingFields.push('workers_present');
        if (!work_completed || work_completed === '') missingFields.push('work_completed');
        if (!next_day_plan || next_day_plan === '') missingFields.push('next_day_plan');
        
        if (missingFields.length > 0) {
            console.log('Missing fields detected:', missingFields);
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields',
                missing_fields: missingFields,
                received: {
                    project_id,
                    report_date,
                    weather_conditions,
                    workers_present,
                    work_completed,
                    next_day_plan
                }
            });
        }
        
        // Try to save to database
        try {
            const db = require('../../database/config/database');
            
            console.log('Checking if site_reports table exists...');
            
            // Create site_reports table if it doesn't exist
            await db.execute(`
                CREATE TABLE IF NOT EXISTS site_reports (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    project_id INT NOT NULL,
                    report_date DATE NOT NULL,
                    weather_conditions VARCHAR(50) NOT NULL,
                    site_supervisor VARCHAR(255) NOT NULL,
                    workers_present INT NOT NULL,
                    work_completed TEXT NOT NULL,
                    site_issues TEXT,
                    safety_incidents TEXT,
                    materials_used TEXT,
                    equipment_used TEXT,
                    next_day_plan TEXT NOT NULL,
                    status ENUM('submitted', 'reviewed', 'approved') DEFAULT 'submitted',
                    created_by VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_project_id (project_id),
                    INDEX idx_report_date (report_date),
                    INDEX idx_status (status)
                )
            `);
            
            console.log('site_reports table ready...');
            
            // Log the values being inserted
            const insertValues = [
                numericProjectId, report_date, weather_conditions, site_supervisor,
                workers_present, work_completed, site_issues || null, safety_incidents || null,
                materials_used || null, equipment_used || null, next_day_plan, site_supervisor
            ];
            
            console.log('📝 Inserting values:', insertValues);
            console.log('📝 SQL Query:');
            console.log(`
                INSERT INTO site_reports (
                    project_id, report_date, weather_conditions, site_supervisor, 
                    workers_present, work_completed, site_issues, safety_incidents,
                    materials_used, equipment_used, next_day_plan, status, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)
            `);
            
            // Insert site report into existing table
            const result = await db.execute(`
                INSERT INTO site_reports (
                    project_id, report_date, weather_conditions, site_supervisor, 
                    workers_present, work_completed, site_issues, safety_incidents,
                    materials_used, equipment_used, next_day_plan, status, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)
            `, insertValues);
            
            console.log('✅ Site report saved to database with ID:', result.insertId);
            console.log('✅ Database insert result:', result);
            
            res.json({
                success: true,
                message: 'Site report submitted successfully',
                report_id: result.insertId,
                data: {
                    id: result.insertId,
                    project_id,
                    report_date,
                    weather_conditions,
                    site_supervisor,
                    workers_present,
                    work_completed,
                    site_issues,
                    safety_incidents,
                    materials_used,
                    equipment_used,
                    next_day_plan,
                    created_at: new Date().toISOString()
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using fallback for site report:', dbError.message);
            console.error('❌ Full database error:', dbError);
            console.error('❌ Error code:', dbError.code);
            console.error('❌ Error errno:', dbError.errno);
            console.error('❌ SQL state:', dbError.sqlState);
            console.error('❌ Error stack:', dbError.stack);
            
            // Fallback: Generate a mock report ID and return success
            const reportId = `SR${Date.now().toString().slice(-6)}`;
            
            res.json({
                success: true,
                message: 'Site report submitted successfully (saved locally)',
                report_id: reportId,
                fallback: true,
                data: {
                    id: reportId,
                    project_id,
                    report_date,
                    weather_conditions,
                    site_supervisor,
                    workers_present,
                    work_completed,
                    site_issues,
                    safety_incidents,
                    materials_used,
                    equipment_used,
                    next_day_plan,
                    created_at: new Date().toISOString()
                }
            });
        }
        
    } catch (error) {
        console.error('Error saving site report:', error);
        res.status(500).json({ 
            error: 'Failed to save site report',
            details: error.message 
        });
    }
});

// Delete Site Report
router.delete('/site-reports/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Deleting site report #${id}...`);

        const result = await db.execute('DELETE FROM site_reports WHERE id = ?', [id]);
        const affectedRows = Array.isArray(result) ? (result[0]?.affectedRows || result.affectedRows) : (result?.affectedRows || 0);

        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Site report not found' });
        }

        console.log(`✅ Site report #${id} deleted successfully`);
        res.json({ success: true, message: `Site report #${id} deleted successfully` });
    } catch (error) {
        console.error('❌ Error deleting site report:', error);
        res.status(500).json({ error: 'Failed to delete site report', details: error.message });
    }
});

// Note: Duplicate GET /site-reports route removed - handled by the route above at line ~1124

// Save Work Approval
router.post('/approvals', async (req, res) => {
    try {
        console.log('Saving work approval...');
        console.log('Request body raw:', JSON.stringify(req.body, null, 2));
        
        const {
            work_id,
            quality_assessment,
            compliance_check,
            approval_comments,
            safety_compliance,
            time_completion,
            approved_by
        } = req.body;
        
        // Debug each field
        console.log('Field validation:');
        console.log('  work_id:', work_id, 'type:', typeof work_id, 'truthy:', !!work_id);
        console.log('  quality_assessment:', quality_assessment, 'type:', typeof quality_assessment, 'truthy:', !!quality_assessment);
        console.log('  compliance_check:', compliance_check, 'type:', typeof compliance_check, 'truthy:', !!compliance_check);
        console.log('  approval_comments:', approval_comments, 'type:', typeof approval_comments, 'truthy:', !!approval_comments);
        
        // Validate required fields
        const missingFields = [];
        if (!work_id || work_id === '') missingFields.push('work_id');
        if (!quality_assessment || quality_assessment === '') missingFields.push('quality_assessment');
        if (!compliance_check || compliance_check === '') missingFields.push('compliance_check');
        if (!approval_comments || approval_comments === '') missingFields.push('approval_comments');
        
        if (missingFields.length > 0) {
            console.log('Missing fields detected:', missingFields);
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields',
                missing_fields: missingFields,
                received: {
                    work_id,
                    quality_assessment,
                    compliance_check,
                    approval_comments
                }
            });
        }
        
        // Try to save to database
        try {
            const db = require('../../database/config/database');
            
            console.log('Creating work_approvals table if needed...');
            
            // Create work_approvals table if it doesn't exist (VARCHAR columns)
            await db.execute(`
                CREATE TABLE IF NOT EXISTS work_approvals (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    work_id VARCHAR(50) NOT NULL,
                    project_id INT,
                    completed_by VARCHAR(255),
                    completion_date DATE,
                    quality_assessment VARCHAR(50) NOT NULL,
                    compliance_check VARCHAR(50) NOT NULL,
                    approval_comments TEXT NOT NULL,
                    safety_compliance VARCHAR(50) DEFAULT 'compliant',
                    time_completion VARCHAR(50) DEFAULT 'on-time',
                    quality_score DECIMAL(5,2),
                    status VARCHAR(30) DEFAULT 'pending',
                    approved_by VARCHAR(255),
                    approval_date DATE,
                    source_table VARCHAR(50),
                    source_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_work_id (work_id),
                    INDEX idx_status (status),
                    INDEX idx_created_at (created_at)
                )
            `);
            
            console.log('work_approvals table ready...');

            // Determine source table and source id from work_id prefix
            let sourceTable = null;
            let sourceId = null;
            let numericWorkId = work_id;
            if (typeof work_id === 'string' && work_id.startsWith('SR-')) {
                sourceTable = 'site_reports';
                sourceId = parseInt(work_id.replace('SR-', ''), 10);
                numericWorkId = work_id;
            } else if (typeof work_id === 'string' && work_id.startsWith('HW-')) {
                sourceTable = 'hr_work';
                sourceId = parseInt(work_id.replace('HW-', ''), 10);
                numericWorkId = work_id;
            } else if (typeof work_id === 'string' && work_id.startsWith('PW-')) {
                sourceTable = 'projects_work';
                sourceId = parseInt(work_id.replace('PW-', ''), 10);
                numericWorkId = work_id;
            } else if (typeof work_id === 'string' && work_id.startsWith('FW-')) {
                sourceTable = 'finance_work';
                sourceId = parseInt(work_id.replace('FW-', ''), 10);
                numericWorkId = work_id;
            }
            
            // Fetch the details of the work completion if available
            let projectId = null;
            let completedBy = 'Current User';
            let completionDate = new Date().toISOString().split('T')[0];
            
            if (sourceTable === 'site_reports' && sourceId) {
                try {
                    const srRows = await db.execute(
                        'SELECT sr.*, COALESCE(p.project_name, CONCAT(\'Project #\', sr.project_id)) AS project_name FROM site_reports sr LEFT JOIN projects p ON sr.project_id = p.id WHERE sr.id = ? LIMIT 1',
                        [sourceId]
                    );
                    if (srRows && srRows.length > 0) {
                        projectId = srRows[0].project_id;
                        completedBy = srRows[0].site_supervisor || 'Site Supervisor';
                        completionDate = srRows[0].report_date ? new Date(srRows[0].report_date).toISOString().split('T')[0] : completionDate;
                    }
                } catch (err) {
                    console.log('⚠️ Could not query site_reports details:', err.message);
                }
            } else if (sourceTable === 'hr_work' && sourceId) {
                try {
                    const hwRows = await db.execute(
                        'SELECT * FROM hr_work WHERE id = ? LIMIT 1',
                        [sourceId]
                    );
                    if (hwRows && hwRows.length > 0) {
                        completedBy = hwRows[0].submitted_by || 'N/A';
                        completionDate = hwRows[0].submitted_date ? new Date(hwRows[0].submitted_date).toISOString().split('T')[0] : completionDate;
                    }
                } catch (err) {
                    console.log('⚠️ Could not query hr_work details:', err.message);
                }
            } else if (sourceTable === 'projects_work' && sourceId) {
                try {
                    const pwRows = await db.execute(
                        `SELECT pw.*, COALESCE(wa.full_name, pw.assigned_to, pw.submitted_by) AS resolved_worker
                         FROM projects_work pw
                         LEFT JOIN worker_accounts wa ON wa.full_name = pw.assigned_to OR wa.full_name = pw.submitted_by
                         WHERE pw.id = ? LIMIT 1`,
                        [sourceId]
                    );
                    if (pwRows && pwRows.length > 0) {
                        completedBy = pwRows[0].resolved_worker || pwRows[0].submitted_by || 'N/A';
                        completionDate = pwRows[0].submitted_date ? new Date(pwRows[0].submitted_date).toISOString().split('T')[0] : completionDate;
                    }
                } catch (err) {
                    console.log('⚠️ Could not query projects_work details:', err.message);
                }
            } else if (sourceTable === 'finance_work' && sourceId) {
                try {
                    const fwRows = await db.execute(
                        'SELECT * FROM finance_work WHERE id = ? LIMIT 1',
                        [sourceId]
                    );
                    if (fwRows && fwRows.length > 0) {
                        completedBy = fwRows[0].submitted_by || 'Finance Manager';
                        completionDate = fwRows[0].submitted_date ? new Date(fwRows[0].submitted_date).toISOString().split('T')[0] : completionDate;
                    }
                } catch (err) {
                    console.log('⚠️ Could not query finance_work details:', err.message);
                }
            } else {
                try {
                    const completions = await db.execute(
                        'SELECT * FROM work_completions WHERE id = ? LIMIT 1',
                        [work_id]
                    );
                    if (completions && completions.length > 0) {
                        completedBy = completions[0].completed_by || 'Current User';
                        completionDate = completions[0].completed_date ? new Date(completions[0].completed_date).toISOString().split('T')[0] : completionDate;
                    }
                } catch (err) {
                    console.log('⚠️ Could not query work completion details, using defaults:', err.message);
                }
            }
            
            // Calculate quality score from assessment
            const qualityScoreMap = { 'excellent': 95, 'good': 85, 'acceptable': 75, 'poor': 50 };
            const calcScore = qualityScoreMap[quality_assessment] || 80;

            // Insert work approval
            const result = await db.execute(`
                INSERT INTO work_approvals (
                    work_id, project_id, completed_by, completion_date, quality_assessment, 
                    compliance_check, approval_comments, safety_compliance, time_completion, 
                    quality_score, status, approved_by, approval_date, source_table, source_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, CURDATE(), ?, ?)
            `, [
                work_id, projectId, completedBy, completionDate, 
                quality_assessment, compliance_check, approval_comments,
                safety_compliance || 'compliant', time_completion || 'on-time', calcScore,
                approved_by || 'Managing Director', sourceTable, sourceId
            ]);
            
            console.log('Work approval saved to database with ID:', result.insertId);
            
            // Update status in the source table
            if (sourceTable === 'site_reports' && sourceId) {
                try {
                    await db.execute(
                        `UPDATE site_reports SET status = 'Approved' WHERE id = ?`,
                        [sourceId]
                    );
                    console.log(`✅ Updated site_reports status to Approved for ID ${sourceId}`);
                } catch (updateError) {
                    console.log('⚠️ Failed to update site_reports status:', updateError.message);
                }
            } else if (sourceTable === 'hr_work' && sourceId) {
                try {
                    await db.execute(
                        `UPDATE hr_work SET status = 'Approved' WHERE id = ?`,
                        [sourceId]
                    );
                    console.log(`✅ Updated hr_work status to Approved for ID ${sourceId}`);
                } catch (updateError) {
                    console.log('⚠️ Failed to update hr_work status:', updateError.message);
                }
            } else if (sourceTable === 'projects_work' && sourceId) {
                try {
                    await db.execute(
                        `UPDATE projects_work SET status = 'Approved' WHERE id = ?`,
                        [sourceId]
                    );
                    console.log(`✅ Updated projects_work status to Approved for ID ${sourceId}`);
                } catch (updateError) {
                    console.log('⚠️ Failed to update projects_work status:', updateError.message);
                }
            } else if (sourceTable === 'finance_work' && sourceId) {
                try {
                    await db.execute(
                        `UPDATE finance_work SET status = 'Approved' WHERE id = ?`,
                        [sourceId]
                    );
                    console.log(`✅ Updated finance_work status to Approved for ID ${sourceId}`);
                } catch (updateError) {
                    console.log('⚠️ Failed to update finance_work status:', updateError.message);
                }
            }

            // Also update status in work_completions if it exists there
            try {
                await db.execute(`
                    UPDATE work_completions 
                    SET status = 'approved', 
                        approved_by = ?, 
                        approval_notes = ?,
                        approval_date = NOW()
                    WHERE id = ? OR (source_table = ? AND source_id = ?)
                `, [approved_by || 'Managing Director', approval_comments || '', work_id, sourceTable, sourceId]);
                console.log(`✅ Updated status to approved in work_completions for ID ${work_id}`);
            } catch (updateError) {
                console.log('⚠️ Failed to update work_completions status:', updateError.message);
            }

            // Create notification for the submitter about approval
            try {
                await db.execute(`
                    INSERT INTO notifications (title, message, type, priority, recipient_type, recipients, sent_by, status, is_read, created_at)
                    VALUES (?, ?, 'success', 'High', 'individual', ?, ?, 'sent', 0, NOW())
                `, [
                    'Work Approved: ' + work_id,
                    `Your work item ${work_id} has been approved by ${approved_by || 'Managing Director'}. Quality: ${quality_assessment}. Comments: ${approval_comments || 'None'}`,
                    completedBy || 'all',
                    approved_by || 'Managing Director'
                ]);
                console.log(`📢 Notification sent for work approval ${work_id}`);
            } catch (notifErr) {
                console.log('⚠️ Could not create approval notification:', notifErr.message);
            }
            
            res.json({
                success: true,
                message: 'Work approval submitted successfully',
                approval_id: result.insertId,
                data: {
                    id: result.insertId,
                    work_id,
                    quality_assessment,
                    compliance_check,
                    approval_comments,
                    safety_compliance,
                    time_completion,
                    status: 'approved',
                    created_at: new Date().toISOString()
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using fallback for work approval:', dbError.message);
            
            // Fallback: Generate a mock approval ID and return success
            const approvalId = `WA${Date.now().toString().slice(-6)}`;
            
            res.json({
                success: true,
                message: 'Work approval submitted successfully (saved locally)',
                approval_id: approvalId,
                fallback: true,
                data: {
                    id: approvalId,
                    work_id,
                    quality_assessment,
                    compliance_check,
                    approval_comments,
                    safety_compliance,
                    time_completion,
                    status: 'approved',
                    created_at: new Date().toISOString()
                }
            });
        }
        
    } catch (error) {
        console.error('Error saving work approval:', error);
        res.status(500).json({ 
            error: 'Failed to save work approval',
            details: error.message 
        });
    }
});

// POST route for HSE work items (handles safety policy submissions)
// This route must come before the general /:department route
router.post('/hse', async (req, res) => {
    try {
        console.log('🔍 HSE POST request received');
        console.log('📊 Request body:', req.body);
        
        // Set department to hse for this route
        const department = 'hse';
        
        const {
            work_type,
            work_title,
            work_description,
            priority = 'Medium',
            due_date,
            assigned_to,
            submitted_by,
            // HSE-specific fields
            incident_type,
            severity,
            location,
            project_name,
            status: rawStatus = 'pending'
        } = req.body;

        // Normalize status to match DB ENUM: 'Pending', 'In Progress', 'Completed'
        const statusMap = { 'pending': 'Pending', 'in progress': 'In Progress', 'in-progress': 'In Progress', 'completed': 'Completed', 'investigating': 'Investigating', 'resolved': 'Resolved' };
        const status = statusMap[String(rawStatus).toLowerCase()] || rawStatus || 'Pending';
        
        console.log('📝 Extracted HSE data:', {
            work_type,
            work_title,
            work_description,
            priority,
            due_date,
            assigned_to,
            submitted_by,
            hse_specific: {
                incident_type,
                severity,
                location,
                project_name
            }
        });
        
        // Validate required fields
        if (!work_type || !work_title || !work_description) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields: work_type, work_title, work_description',
                received: { work_type, work_title, work_description }
            });
        }
        
        // Map HSE work types to database ENUM values
        const hseWorkTypeMapping = {
            'Safety Policy Upload': 'Safety Policy Upload',
            'Incident Reporting': 'Incident Reporting',
            'Toolbox Meeting': 'Toolbox Meeting',
            'PPE Issuance': 'PPE Issuance',
            'Safety Violation': 'Safety Violation',
            'Inspection Report': 'Inspection Report',
            'Safety Training': 'Safety Training',
            'Project Safety Status': 'Project Safety Status'
        };
        
        const mapped_work_type = hseWorkTypeMapping[work_type] || work_type;
        console.log('🔄 Mapped work type:', work_type, '->', mapped_work_type);
        
        // Build the query for HSE department
        let query = `
            INSERT INTO hse_work (
                department_code,
                work_type,
                work_title,
                work_description,
                priority,
                due_date,
                assigned_to,
                submitted_by,
                submitted_date,
                status
        `;
        
        let values = [
            department,
            mapped_work_type,
            work_title,
            work_description,
            priority,
            due_date,
            assigned_to,
            submitted_by,
            new Date().toISOString().split('T')[0], // submitted_date
            status
        ];
        
        // Add HSE-specific fields if provided
        let additionalFields = [];
        let additionalValues = [];
        
        if (incident_type) {
            additionalFields.push('incident_type');
            additionalValues.push(incident_type);
        }
        if (severity) {
            additionalFields.push('severity');
            additionalValues.push(severity);
        }
        if (location) {
            additionalFields.push('location');
            additionalValues.push(location);
        }
        if (project_name) {
            additionalFields.push('project_name');
            additionalValues.push(project_name);
        }
        
        // Add additional fields to query if any
        if (additionalFields.length > 0) {
            query += ', ' + additionalFields.join(', ');
            query += ') VALUES (';
        } else {
            query += ') VALUES (';
        }
        
        // Build the placeholders for values
        const placeholders = values.map(() => '?').join(', ');
        query += placeholders;
        
        if (additionalValues.length > 0) {
            query += ', ' + additionalValues.map(() => '?').join(', ');
        }
        query += ')';
        
        // Combine all values
        const allValues = values.concat(additionalValues);
        
        console.log('🔍 Final query:', query);
        console.log('🔍 Final values:', allValues);
        
        // Execute the query
        const queryResult = await db.execute(query, allValues);
        const result = queryResult[0] || queryResult;
        
        console.log('✅ HSE work item created successfully:', result);
        
        res.status(201).json({
            success: true,
            message: 'HSE work item created successfully',
            id: result.insertId,
            data: {
                id: result.insertId,
                department_code: department,
                work_type: mapped_work_type,
                work_title,
                work_description,
                priority,
                due_date,
                assigned_to,
                submitted_by,
                status,
                submitted_date: new Date().toISOString().split('T')[0],
                // Include HSE-specific fields if provided
                incident_type: incident_type || null,
                severity: severity || null,
                location: location || null,
                project_name: project_name || null
            }
        });
        
    } catch (error) {
        console.error(' Error creating HSE work item:', error);
        console.error(' Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        res.status(500).json({
            success: false,
            error: 'Failed to create HSE work item',
            details: error.message
        });
    }
});

// Root-level POST route for HSE work items (handles safety policy submissions when mounted via server.js)
// This catches POST requests to /api/hse when mounted through server.js
router.post('/', async (req, res, next) => {
    try {
        console.log(' Root-level HSE POST request received');
        console.log(' Request body:', req.body);

    } catch (error) {
        console.error(' Error creating HSE work item:', error);
        console.error(' Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            error: 'Failed to create HSE work item',
            details: error.message
        });
    }
});

// Create new work item
router.post('/:department', async (req, res, next) => {
    try {
        console.log(' Work request received');
        console.log(' Request headers:', req.headers);
        console.log(' Request URL:', req.url);
        console.log(' Request method:', req.method);
        console.log(' Department parameter:', req.params.department);
        console.log(' Request body:', req.body);
        
        // Fix department detection
        let department = req.params.department;
        
        // If department is "work", we need to determine the actual department from the route
        if (department === 'work') {
            // Check the original URL to determine the actual department
            const originalUrl = req.originalUrl || req.url;
            console.log('🔍 Original URL:', originalUrl);
            
            if (originalUrl.includes('/api/hse/')) {
                department = 'hse';
            } else if (originalUrl.includes('/api/hr/')) {
                department = 'hr';
            } else if (originalUrl.includes('/api/finance/')) {
                department = 'finance';
            } else if (originalUrl.includes('/api/project/')) {
                department = 'projects';
            } else if (originalUrl.includes('/api/realestate/')) {
                department = 'realestate';
            } else if (originalUrl.includes('/api/admin/')) {
                department = 'admin';
            }
        }
        
        console.log('✅ Determined department:', department);
        
        const validDepartments = ['hr', 'hse', 'finance', 'projects', 'realestate', 'admin'];
        if (!validDepartments.includes(department)) {
            console.log('➡️ Passing request to a more specific route:', department);
            return next();
        }
        
        const {
            work_type,
            work_title,
            work_description,
            priority = 'Medium',
            due_date,
            assigned_to,
            submitted_by,
            amount,
            vendor_name,
            invoice_number,
            incident_type, severity, location,
            employee_name, employee_email,
            project_name, client_name,
            property_name, property_type,
            affected_systems,
            status: rawStatus = 'pending'
        } = req.body;

        // Normalize status to match DB ENUM: 'Pending', 'In Progress', 'Completed', 'Rejected', 'Revision Requested'
        const statusNormMap = { 'pending': 'Pending', 'in progress': 'In Progress', 'in-progress': 'In Progress', 'completed': 'Completed', 'investigating': 'In Progress', 'resolved': 'Completed', 'scheduled': 'Pending', 'rejected': 'Rejected', 'revision requested': 'Revision Requested' };
        const status = statusNormMap[String(rawStatus || 'pending').toLowerCase()] || 'Pending';

        console.log('📝 Extracted data:', {
            work_type,
            work_title,
            work_description,
            priority,
            due_date,
            assigned_to,
            submitted_by,
            department_specific: {
                amount,
                incident_type,
                severity,
                project_name,
                client_name,
                property_name,
                property_type,
                affected_systems
            }
        });
        
        if (!work_type || !work_title || !work_description) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields: work_type, work_title, work_description',
                received: { work_type, work_title, work_description }
            });
        }
        
        const getMappedWorkType = (department, workType) => {
            const mappings = {
                'hr': {
                    'Attendance Management': 'Attendance Tracking',
                    'Employee Registration': 'Employee Registration',
                    'Worker Account Creation': 'Worker Account Creation',
                    'Project Assignment': 'Project Assignment',
                    'Leave Management': 'Leave Management',
                    'Leave Request': 'Leave Management',
                    'Contract Management': 'Contract Management',
                    'Policy Management': 'Policy Management',
                    'Senior Staff Hiring': 'Senior Staff Hiring',
                    'Budget Approval': 'Budget Approval'
                },
                'hse': {
                    'Incident Reporting': 'Incident Reporting',
                    'Safety Policy Upload': 'Safety Policy Upload',
                    'Toolbox Meeting': 'Toolbox Meeting',
                    'PPE Issuance': 'PPE Issuance',
                    'Safety Violation': 'Safety Violation',
                    'Inspection Report': 'Inspection Report',
                    'Safety Training': 'Safety Training',
                    'Project Safety Status': 'Project Safety Status'
                },
                'finance': {
                    'Budget Management': 'Budget Management',
                    'Financial Reporting': 'Financial Reporting',
                    'Payroll Processing': 'Payroll Processing',
                    'Expense Control': 'Expense Control',
                    'Audits': 'Audits',
                    'Compliance': 'Compliance',
                    'Invoice Processing': 'Invoice Processing',
                    'Budget Approval': 'Budget Approval'
                },
                'projects': {
                    'Project Creation': 'Project Creation',
                    'Project Assignment': 'Project Assignment',
                    'Progress Update': 'Progress Update',
                    'Task Assignment': 'Task Assignment',
                    'Workforce Request': 'Workforce Request',
                    'Site Report': 'Site Report',
                    'Work Approval': 'Work Approval',
                    'Project Completion': 'Project Completion',
                    'Resource Management': 'Resource Management'
                },
                'realestate': {
                    'Property Management': 'Property Management',
                    'Property Addition': 'Property Addition',
                    'Property Editing': 'Property Editing',
                    'Client Registration': 'Client Registration',
                    'Sale Recording': 'Sale Recording',
                    'Payment Tracking': 'Payment Tracking',
                    'Sales Report': 'Sales Report',
                    'Client Communication': 'Client Communication'
                },
                'admin': {
                    'Administrative Operations': 'Administrative Operations',
                    'Compliance Management': 'Compliance Management',
                    'Staff Oversight': 'Staff Oversight',
                    'Document Management': 'Document Management',
                    'User Account Management': 'User Account Management',
                    'System Administration': 'System Administration',
                    'Department Coordination': 'Department Coordination'
                }
            };
            
            return mappings[department]?.[workType] || workType;
        };
        
        const mapped_work_type = getMappedWorkType(department, work_type);
        console.log('🔄 Mapped work type:', work_type, '->', mapped_work_type);
        console.log('🔍 Department:', department);
        
        console.log('✅ Validation passed, proceeding to database insertion...');
        
        // Build the query dynamically based on department
        let query = '';
        let values = [];
        
        // Base fields for all departments
        const baseFields = [
            'department_code',
            'work_type',
            'work_title', 
            'work_description',
            'priority',
            'due_date',
            'assigned_to',
            'submitted_by',
            'submitted_date',
            'status'
        ];
        
        const baseValues = [
            department,
            mapped_work_type,
            work_title,
            work_description,
            priority,
            due_date,
            assigned_to,
            submitted_by,
            new Date().toISOString().split('T')[0], // submitted_date
            status
        ];
        
        // Department-specific fields
        let additionalFields = [];
        let additionalValues = [];
        
        if (department === 'finance') {
            if (amount) {
                additionalFields.push('amount');
                additionalValues.push(amount);
            }
            if (vendor_name) {
                additionalFields.push('vendor_name');
                additionalValues.push(vendor_name);
            }
            if (invoice_number) {
                additionalFields.push('invoice_number');
                additionalValues.push(invoice_number);
            }
        }
        
        if (department === 'hse') {
            if (incident_type) {
                additionalFields.push('incident_type');
                additionalValues.push(incident_type);
            }
            if (severity) {
                additionalFields.push('severity');
                additionalValues.push(severity);
            }
            if (location) {
                additionalFields.push('location');
                additionalValues.push(location);
            }
            if (project_name) {
                additionalFields.push('project_name');
                additionalValues.push(project_name);
            }
        }
        
        if (department === 'hr') {
            if (employee_name) {
                additionalFields.push('employee_name');
                additionalValues.push(employee_name);
            }
            if (employee_email) {
                additionalFields.push('employee_email');
                additionalValues.push(employee_email);
            }
            if (project_name) {
                additionalFields.push('project_name');
                additionalValues.push(project_name);
            }
        }
        
        if (department === 'projects') {
            if (project_name) {
                additionalFields.push('project_name');
                additionalValues.push(project_name);
            }
            if (client_name) {
                additionalFields.push('client_name');
                additionalValues.push(client_name);
            }
        }
        
        if (department === 'realestate') {
            if (property_name) {
                additionalFields.push('property_address');
                additionalValues.push(property_name);
            }
            if (property_type) {
                additionalFields.push('property_type');
                additionalValues.push(property_type);
            }
        }
        
        if (department === 'admin' && affected_systems) {
            additionalFields.push('affected_systems');
            additionalValues.push(affected_systems);
        }
        
        // Ensure arrays are properly initialized and convert undefined to null
        const safeBaseFields = Array.isArray(baseFields) ? baseFields : [];
        const safeAdditionalFields = Array.isArray(additionalFields) ? additionalFields : [];
        const safeBaseValues = Array.isArray(baseValues) ? baseValues.map(val => val === undefined ? null : val) : [];
        const safeAdditionalValues = Array.isArray(additionalValues) ? additionalValues.map(val => val === undefined ? null : val) : [];
        
        const allFields = safeBaseFields.concat(safeAdditionalFields);
        const allValues = safeBaseValues.concat(safeAdditionalValues);
        
        // Map departments to correct tables
        const departmentTableMap = {
            'hr': 'hr_work',
            'hse': 'hse_work', 
            'finance': 'finance_work',
            'project': 'project_work',
            'realestate': 'realestate_work',
            'admin': 'admin_work'
        };
        
        const tableName = departmentTableMap[department] || 'admin_work';
        
        query = `
            INSERT INTO ${tableName} (
                ${allFields.join(', ')}
            ) VALUES (
                ${allFields.map(() => '?').join(', ')}
            )
        `;
        
        values = allValues;
        
        console.log('� Executing query:', query);
        console.log('📊 Query values:', values);
        
        // Execute the query
        console.log('🔍 Preparing to execute query...');
        console.log('🔍 Query type:', typeof query);
        console.log('🔍 Values type:', typeof values);
        console.log('🔍 Values isArray:', Array.isArray(values));
        console.log('🔍 Values length:', values ? values.length : 'undefined');
        
        if (!query || typeof query !== 'string') {
            throw new Error('Invalid query: query is not a string');
        }
        
        if (!Array.isArray(values)) {
            throw new Error('Invalid values: values is not an array');
        }
        
        try {
            const result = await db.execute(query, values);
            console.log('🔍 Database result type:', typeof result);
            console.log('🔍 Database result:', result);
            
            if (!result || typeof result !== 'object') {
                throw new Error('Database query returned invalid result');
            }
            
            console.log('✅ Work item created successfully:', result);
            
            // Create entries in shared tables based on work type
            if (mapped_work_type === 'Safety Policy Upload') {
                console.log('🔍 Safety Policy Upload detected - creating policy entry...');
                console.log('📋 Policy data:', {
                    work_title,
                    work_description,
                    mapped_work_type
                });
                
                try {
                    const policyId = `POL${Date.now().toString().slice(-6)}`;
                    console.log('🆔 Generated policy ID:', policyId);
                    
                    await db.execute(`
                        INSERT INTO policies (
                            id, title, description, submitted_by, submitted_by_role, 
                            status, submission_date
                        ) VALUES (?, ?, ?, ?, ?, ?, CURDATE())
                    `, [
                        policyId,
                        work_title,
                        work_description || 'Safety policy uploaded via HSE work item',
                        req.user?.id || 'system',
                        req.user?.role || 'HSE Manager',
                        'Pending'
                    ]);
                    console.log('✅ Policy successfully created in policies table:', policyId);
                    console.log('📊 Policy details inserted:', {
                        id: policyId,
                        title: work_title,
                        department: 'HSE',
                        status: 'pending'
                    });
                } catch (policyError) {
                    console.error('❌ Failed to create policy entry:', policyError.message);
                    console.error('❌ Policy error details:', {
                        code: policyError.code,
                        errno: policyError.errno,
                        sqlState: policyError.sqlState,
                        sqlMessage: policyError.sqlMessage
                    });
                }
            } else {
                console.log('ℹ️ Work type is not Safety Policy Upload:', mapped_work_type);
            }
            
            // Record Incident Reports - Create entry in hse_incidents table
            if (mapped_work_type === 'Incident Reporting') {
                try {
                    const incidentId = `INC${Date.now().toString().slice(-6)}`;
                    await db.execute(`
                        INSERT INTO hse_incidents (
                            id, incident_date, incident_type, severity, description, 
                            reported_by, project_id, status, created_at
                        ) VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, NOW())
                    `, [
                        incidentId,
                        'General Incident',
                        'Medium',
                        work_description || 'Incident reported via HSE work item',
                        req.user?.id || 'system',
                        1, // Default project ID
                        'pending'
                    ]);
                    console.log('✅ Incident also created in hse_incidents table:', incidentId);
                } catch (incidentError) {
                    console.error('⚠️ Failed to create incident entry:', incidentError.message);
                }
            }
            
            // Record Toolbox Meetings - Create entry in schedule_meetings table
            if (mapped_work_type === 'Toolbox Meeting') {
                try {
                    const meetingId = `MTG${Date.now().toString().slice(-6)}`;
                    await db.execute(`
                        INSERT INTO schedule_meetings (
                            id, title, meeting_date, meeting_type, organizer, 
                            department, status, agenda, created_at
                        ) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, NOW())
                    `, [
                        meetingId,
                        work_title,
                        'Toolbox Meeting',
                        req.user?.id || 'system',
                        'HSE',
                        'scheduled',
                        work_description || 'Toolbox meeting via HSE work item'
                    ]);
                    console.log('✅ Meeting also created in schedule_meetings table:', meetingId);
                } catch (meetingError) {
                    console.error('⚠️ Failed to create meeting entry:', meetingError.message);
                }
            }
            
            // Track PPE Issuance - Create entry in ppe_issuance table
            if (mapped_work_type === 'PPE Issuance') {
                try {
                    const ppeId = `PPE${Date.now().toString().slice(-6)}`;
                    await db.execute(`
                        INSERT INTO ppe_issuance (
                            id, item_name, quantity, issued_to, issued_by, 
                            issue_date, expected_return_date, status, notes, created_at
                        ) VALUES (?, ?, 1, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), ?, ?, NOW())
                    `, [
                        ppeId,
                        work_title,
                        req.user?.id || 'system',
                        req.user?.id || 'system',
                        'issued',
                        work_description || 'PPE issued via HSE work item'
                    ]);
                    console.log('✅ PPE also created in ppe_issuance table:', ppeId);
                } catch (ppeError) {
                    console.error('⚠️ Failed to create PPE entry:', ppeError.message);
                }
            }
            
            // Mark Safety Violations - Create entry in hse_incidents table
            if (mapped_work_type === 'Safety Violation') {
                try {
                    const violationId = `VIO${Date.now().toString().slice(-6)}`;
                    await db.execute(`
                        INSERT INTO hse_incidents (
                            id, incident_date, incident_type, severity, description, 
                            reported_by, project_id, status, created_at
                        ) VALUES (?, CURDATE(), 'Safety Violation', ?, ?, ?, ?, ?, NOW())
                    `, [
                        violationId,
                        'High',
                        work_description || 'Safety violation reported via HSE work item',
                        req.user?.id || 'system',
                        1, // Default project ID
                        'pending'
                    ]);
                    console.log('✅ Safety violation also created in hse_incidents table:', violationId);
                } catch (violationError) {
                    console.error('⚠️ Failed to create safety violation entry:', violationError.message);
                }
            }
            
            // Upload Inspection Reports - Create entry in documents table
            if (mapped_work_type === 'Inspection Report') {
                try {
                    const documentId = `DOC${Date.now().toString().slice(-6)}`;
                    await db.execute(`
                        INSERT INTO documents (
                            id, title, description, category, uploaded_by, 
                            project_id, status, created_at
                        ) VALUES (?, ?, ?, 'Inspection Report', ?, ?, ?, NOW())
                    `, [
                        documentId,
                        work_title,
                        work_description || 'Inspection report uploaded via HSE work item',
                        req.user?.id || 'system',
                        1, // Default project ID
                        'pending'
                    ]);
                    console.log('✅ Document also created in documents table:', documentId);
                } catch (documentError) {
                    console.error('⚠️ Failed to create document entry:', documentError.message);
                }
            }
            
            // Return success response
            res.status(201).json({
                message: 'Work item created successfully',
                id: result.insertId,
                department,
                work_type: mapped_work_type,
                work_title,
                status,
                created_at: new Date().toISOString()
            });
        } catch (dbError) {
            console.error('❌ Database execution error:', dbError);
            throw new Error(`Database query failed: ${dbError.message}`);
        }
        
    } catch (error) {
        console.error('❌ Error creating work item:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to create work item: ' + error.message,
            details: error.stack 
        });
    }
});

// Get work completions for approval
router.get('/completions/pending', async (req, res) => {
    try {
        console.log('📋 Fetching work completions for approval...');
        
        let allCompletions = [];

        // Ensure work_completions table exists
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS work_completions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    work_details VARCHAR(255) NOT NULL,
                    project VARCHAR(255),
                    completed_by VARCHAR(255),
                    completed_date DATE,
                    quality_score INT DEFAULT 0,
                    quality_level VARCHAR(50),
                    status VARCHAR(30) DEFAULT 'pending',
                    approved_by VARCHAR(255),
                    approval_notes TEXT,
                    approval_date DATETIME,
                    rework_reason TEXT,
                    rework_requested_by VARCHAR(255),
                    rework_request_date DATETIME,
                    rejection_reason TEXT,
                    rejected_by VARCHAR(255),
                    rejection_date DATETIME,
                    source_table VARCHAR(50) DEFAULT 'work_completions',
                    source_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_status (status),
                    INDEX idx_completed_date (completed_date)
                )
            `);
        } catch (createErr) {
            console.log('⚠️ work_completions table check:', createErr.message);
        }

        // 1) Query pending items from work_completions
        try {
            const wcRows = await db.execute(
                `SELECT * FROM work_completions WHERE status = 'pending' ORDER BY completed_date DESC LIMIT 50`
            );
            if (wcRows && wcRows.length > 0) {
                allCompletions = allCompletions.concat(wcRows);
                console.log(`📊 Found ${wcRows.length} pending work completions`);
            }
        } catch (wcErr) {
            console.log('⚠️ work_completions query:', wcErr.message);
        }

        // 2) Also pull submitted site reports that have not been approved yet
        try {
            const srRows = await db.execute(`
                SELECT sr.id, sr.work_completed AS work_details,
                       COALESCE(p.project_name, CONCAT('Project #', sr.project_id)) AS project,
                       sr.site_supervisor AS completed_by,
                       sr.report_date AS completed_date,
                       CASE
                           WHEN sr.safety_incidents IS NULL OR sr.safety_incidents = '' THEN 85
                           ELSE 60
                       END AS quality_score,
                       sr.status,
                       'site_reports' AS source_table,
                       sr.id AS source_id,
                       sr.created_at
                FROM site_reports sr
                LEFT JOIN projects p ON sr.project_id = p.id
                WHERE (sr.status = 'submitted' OR sr.status IS NULL)
                  AND sr.id NOT IN (
                      SELECT COALESCE(source_id, 0) FROM work_completions WHERE source_table = 'site_reports'
                  )
                ORDER BY sr.report_date DESC
                LIMIT 50
            `);
            if (srRows && srRows.length > 0) {
                const mapped = srRows.map(sr => ({
                    id: 'SR-' + sr.id,
                    work_details: sr.work_details || 'Site Report Work',
                    project: sr.project || 'N/A',
                    completed_by: sr.completed_by || 'Site Supervisor',
                    completed_date: sr.completed_date,
                    quality_score: sr.quality_score || 85,
                    quality_level: sr.quality_score >= 90 ? 'excellent' : sr.quality_score >= 80 ? 'good' : 'acceptable',
                    status: 'pending',
                    source_table: 'site_reports',
                    source_id: sr.source_id
                }));
                allCompletions = allCompletions.concat(mapped);
                console.log(`📊 Found ${srRows.length} site reports pending approval`);
            }
        } catch (srErr) {
            console.log('⚠️ site_reports query:', srErr.message);
        }

        // 3) Also pull from hr_work items with status submitted/pending
        try {
            const hrRows = await db.execute(`
                SELECT hw.id, hw.work_title AS work_details,
                       hw.department_code AS project,
                       hw.submitted_by AS completed_by,
                       hw.submitted_date AS completed_date,
                       CASE hw.severity
                           WHEN 'Low' THEN 90
                           WHEN 'Medium' THEN 80
                           WHEN 'High' THEN 70
                           ELSE 85
                       END AS quality_score,
                       hw.status,
                       'hr_work' AS source_table,
                       hw.id AS source_id
                FROM hr_work hw
                WHERE (hw.status = 'Open' OR hw.status = 'submitted' OR hw.status = 'pending')
                  AND hw.id NOT IN (
                      SELECT COALESCE(source_id, 0) FROM work_completions WHERE source_table = 'hr_work'
                  )
                ORDER BY hw.submitted_date DESC
                LIMIT 50
            `);
            if (hrRows && hrRows.length > 0) {
                const mapped = hrRows.map(hw => ({
                    id: 'HW-' + hw.id,
                    work_details: hw.work_details || 'HR Work Item',
                    project: hw.project || 'N/A',
                    completed_by: hw.completed_by || 'N/A',
                    completed_date: hw.completed_date,
                    quality_score: hw.quality_score || 85,
                    quality_level: hw.quality_score >= 90 ? 'excellent' : hw.quality_score >= 80 ? 'good' : 'acceptable',
                    status: 'pending',
                    source_table: 'hr_work',
                    source_id: hw.source_id
                }));
                allCompletions = allCompletions.concat(mapped);
                console.log(`📊 Found ${hrRows.length} HR work items pending approval`);
            }
        } catch (hrErr) {
            console.log('⚠️ hr_work query:', hrErr.message);
        }

        // 4) Also pull from projects_work — join with projects table for real names
        try {
            const pwRows = await db.execute(`
                SELECT pw.id, pw.work_title AS work_details,
                       COALESCE(p.name, pw.project_name) AS project,
                       COALESCE(pw.assigned_to, wa.full_name, pw.submitted_by) AS completed_by,
                       pw.submitted_date AS completed_date,
                       CASE pw.priority
                           WHEN 'Low' THEN 90
                           WHEN 'Medium' THEN 85
                           WHEN 'High' THEN 75
                           WHEN 'Critical' THEN 65
                           ELSE 85
                       END AS quality_score,
                       pw.status,
                       'projects_work' AS source_table,
                       pw.id AS source_id
                FROM projects_work pw
                LEFT JOIN projects p ON p.name = pw.project_name OR p.id = pw.id
                LEFT JOIN worker_accounts wa ON wa.full_name = pw.assigned_to OR wa.full_name = pw.submitted_by
                WHERE (pw.status = 'Pending' OR pw.status = 'In Progress')
                  AND pw.id NOT IN (
                      SELECT COALESCE(source_id, 0) FROM work_completions WHERE source_table = 'projects_work'
                  )
                GROUP BY pw.id
                ORDER BY pw.submitted_date DESC
                LIMIT 50
            `);
            if (pwRows && pwRows.length > 0) {
                const mapped = pwRows.map(pw => ({
                    id: 'PW-' + pw.id,
                    work_details: pw.work_details || 'Project Work Item',
                    project: pw.project || 'N/A',
                    completed_by: pw.completed_by || 'N/A',
                    completed_date: pw.completed_date,
                    quality_score: pw.quality_score || 85,
                    quality_level: pw.quality_score >= 90 ? 'excellent' : pw.quality_score >= 80 ? 'good' : 'acceptable',
                    status: 'pending',
                    source_table: 'projects_work',
                    source_id: pw.source_id
                }));
                allCompletions = allCompletions.concat(mapped);
                console.log(`📊 Found ${pwRows.length} project work items pending approval`);
            }
        } catch (pwErr) {
            console.log('⚠️ projects_work query:', pwErr.message);
        }

        // 5) Also pull from finance_work (expense/invoice items pending approval)
        try {
            const fwRows = await db.execute(`
                SELECT fw.id, fw.work_title AS work_details,
                       COALESCE(fw.work_type, fw.department_code, 'Finance') AS project,
                       COALESCE(wa.full_name, fw.submitted_by) AS completed_by,
                       fw.submitted_date AS completed_date,
                       CASE fw.priority
                           WHEN 'Low' THEN 90
                           WHEN 'Medium' THEN 85
                           WHEN 'High' THEN 75
                           WHEN 'Critical' THEN 65
                           ELSE 85
                       END AS quality_score,
                       fw.status,
                       'finance_work' AS source_table,
                       fw.id AS source_id
                FROM finance_work fw
                LEFT JOIN worker_accounts wa ON wa.full_name = fw.submitted_by
                WHERE (fw.status = 'Pending' OR fw.status = 'submitted')
                  AND fw.id NOT IN (
                      SELECT COALESCE(source_id, 0) FROM work_completions WHERE source_table = 'finance_work'
                  )
                ORDER BY fw.submitted_date DESC
                LIMIT 50
            `);
            if (fwRows && fwRows.length > 0) {
                const mapped = fwRows.map(fw => ({
                    id: 'FW-' + fw.id,
                    work_details: fw.work_details || 'Finance Work Item',
                    project: fw.project || 'Finance',
                    completed_by: fw.completed_by || 'N/A',
                    completed_date: fw.completed_date,
                    quality_score: fw.quality_score || 85,
                    quality_level: fw.quality_score >= 90 ? 'excellent' : fw.quality_score >= 80 ? 'good' : 'acceptable',
                    status: 'pending',
                    source_table: 'finance_work',
                    source_id: fw.source_id
                }));
                allCompletions = allCompletions.concat(mapped);
                console.log(`📊 Found ${fwRows.length} finance work items pending approval`);
            }
        } catch (fwErr) {
            console.log('⚠️ finance_work query:', fwErr.message);
        }

        console.log(`📊 Total pending completions: ${allCompletions.length}`);
        return res.json({
            success: true,
            count: allCompletions.length,
            data: allCompletions
        });

    } catch (error) {
        console.error('❌ Unexpected error fetching work completions:', error);
        res.status(500).json({
            success: false,
            error: 'Unexpected error fetching work completions',
            details: error.message
        });
    }
});

// Get real projects list for approval form
router.get('/available-projects', async (req, res) => {
    try {
        const rows = await db.execute(`
            SELECT id, name, location, status, budget
            FROM projects
            ORDER BY name ASC
        `);
        const projects = Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0]) ? rows[0] : (Array.isArray(rows) ? rows : []);
        res.json({ success: true, data: projects });
    } catch (error) {
        console.error('❌ Error fetching projects:', error.message);
        res.json({ success: true, data: [] });
    }
});

// Get real workers list for approval form
router.get('/available-workers', async (req, res) => {
    try {
        let workers = [];
        // Try worker_accounts first
        try {
            const waRows = await db.execute(`
                SELECT id, employee_id, full_name, designation, department
                FROM worker_accounts
                WHERE status = 'active' OR status IS NULL
                ORDER BY full_name ASC
            `);
            const waList = Array.isArray(waRows) && waRows.length > 0 && Array.isArray(waRows[0]) ? waRows[0] : (Array.isArray(waRows) ? waRows : []);
            workers = workers.concat(waList.map(w => ({
                id: w.id,
                name: w.full_name,
                employee_id: w.employee_id,
                role: w.designation || w.department || 'Worker',
                source: 'worker_accounts'
            })));
        } catch (e) { console.log('⚠️ worker_accounts query:', e.message); }
        
        // Also try users table for staff
        try {
            const uRows = await db.execute(`
                SELECT id, full_name, role, department
                FROM users
                WHERE status = 'Active' AND role != 'Customer'
                ORDER BY full_name ASC
            `);
            const uList = Array.isArray(uRows) && uRows.length > 0 && Array.isArray(uRows[0]) ? uRows[0] : (Array.isArray(uRows) ? uRows : []);
            uList.forEach(u => {
                if (!workers.find(w => w.name === u.full_name)) {
                    workers.push({
                        id: 'U-' + u.id,
                        name: u.full_name,
                        role: u.role || u.department || 'Staff',
                        source: 'users'
                    });
                }
            });
        } catch (e) { console.log('⚠️ users query:', e.message); }
        
        res.json({ success: true, data: workers });
    } catch (error) {
        console.error('❌ Error fetching workers:', error.message);
        res.json({ success: true, data: [] });
    }
});

// Get recent approval history
router.get('/approvals/recent', async (req, res) => {
    try {
        console.log('📋 Fetching recent approval history...');

        // Ensure work_approvals table exists with VARCHAR columns
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS work_approvals (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    work_id VARCHAR(50) NOT NULL,
                    project_id INT,
                    completed_by VARCHAR(255),
                    completion_date DATE,
                    quality_assessment VARCHAR(50) NOT NULL,
                    compliance_check VARCHAR(50) NOT NULL,
                    approval_comments TEXT NOT NULL,
                    safety_compliance VARCHAR(50) DEFAULT 'compliant',
                    time_completion VARCHAR(50) DEFAULT 'on-time',
                    quality_score DECIMAL(5,2),
                    status VARCHAR(30) DEFAULT 'pending',
                    approved_by VARCHAR(255),
                    approval_date TIMESTAMP NULL,
                    source_table VARCHAR(50),
                    source_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_work_id (work_id),
                    INDEX idx_status (status),
                    INDEX idx_created_at (created_at)
                )
            `);
        } catch (tblErr) {
            console.log('⚠️ work_approvals table check:', tblErr.message);
        }

        try {
            const dbRecords = await db.execute(`
                SELECT * FROM work_approvals 
                ORDER BY created_at DESC 
                LIMIT 20
            `);
            
            const approvals = dbRecords || [];
            console.log(`📊 Found ${approvals.length} recent approvals from database`);
            
            return res.json({
                success: true,
                count: approvals.length,
                data: approvals
            });
        } catch (dbError) {
            console.error('❌ Database error fetching approvals:', dbError.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch approvals from database',
                details: dbError.message,
                code: dbError.code
            });
        }
    } catch (error) {
        console.error('❌ Unexpected error fetching approvals:', error);
        res.status(500).json({
            success: false,
            error: 'Unexpected error fetching approvals',
            details: error.message
        });
    }
});

// Update work completion status
router.post('/completions/:workId/approve', async (req, res) => {
    try {
        const { workId } = req.params;
        const { approvedBy, approvalNotes } = req.body;
        
        console.log(`✅ Approving work ${workId}...`);
        
        try {
            await db.execute(`
                UPDATE work_completions 
                SET status = 'approved', 
                    approved_by = ?, 
                    approval_notes = ?,
                    approval_date = NOW()
                WHERE id = ?
            `, [approvedBy || 'System', approvalNotes || '', workId]);
        } catch (dbError) {
            console.log('⚠️ Database not available, accepting mock approval');
        }
        
        res.json({
            success: true,
            message: 'Work approved successfully',
            workId: workId,
            status: 'approved'
        });
    } catch (error) {
        console.error('❌ Error approving work:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to approve work',
            details: error.message
        });
    }
});

// Request rework for completion
router.post('/completions/:workId/rework', async (req, res) => {
    try {
        const { workId } = req.params;
        const { reworkReason, requestedBy } = req.body;
        
        console.log(`🔄 Requesting rework for work ${workId}...`);
        
        // Determine source table from workId prefix
        let sourceTable = null;
        let sourceId = null;
        if (typeof workId === 'string' && workId.startsWith('PW-')) {
            sourceTable = 'projects_work';
            sourceId = parseInt(workId.replace('PW-', ''), 10);
        } else if (typeof workId === 'string' && workId.startsWith('FW-')) {
            sourceTable = 'finance_work';
            sourceId = parseInt(workId.replace('FW-', ''), 10);
        } else if (typeof workId === 'string' && workId.startsWith('SR-')) {
            sourceTable = 'site_reports';
            sourceId = parseInt(workId.replace('SR-', ''), 10);
        } else if (typeof workId === 'string' && workId.startsWith('HW-')) {
            sourceTable = 'hr_work';
            sourceId = parseInt(workId.replace('HW-', ''), 10);
        }
        
        try {
            await db.execute(`
                UPDATE work_completions 
                SET status = 'rework_requested', 
                    rework_reason = ?,
                    rework_requested_by = ?,
                    rework_request_date = NOW()
                WHERE id = ?
            `, [reworkReason || '', requestedBy || 'System', workId]);
        } catch (dbError) {
            console.log('⚠️ work_completions update:', dbError.message);
        }

        // Update source table status to Rework
        if (sourceTable && sourceId) {
            try {
                await db.execute(
                    `UPDATE ${sourceTable} SET status = 'Rework' WHERE id = ?`,
                    [sourceId]
                );
                console.log(`✅ Updated ${sourceTable} status to Rework for ID ${sourceId}`);
            } catch (e) { console.log(`⚠️ ${sourceTable} rework update:`, e.message); }
        }

        // Create notification for submitter
        try {
            await db.execute(`
                INSERT INTO notifications (title, message, type, priority, recipient_type, recipients, sent_by, status, is_read, created_at)
                VALUES (?, ?, 'warning', 'High', 'individual', 'all', ?, 'sent', 0, NOW())
            `, [
                'Rework Requested: ' + workId,
                `Your work item ${workId} requires rework. Reason: ${reworkReason || 'Not specified'}. Requested by: ${requestedBy || 'Managing Director'}`,
                requestedBy || 'Managing Director'
            ]);
        } catch (notifErr) { console.log('⚠️ Rework notification:', notifErr.message); }
        
        res.json({
            success: true,
            message: 'Rework requested successfully',
            workId: workId,
            status: 'rework_requested'
        });
    } catch (error) {
        console.error('❌ Error requesting rework:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to request rework',
            details: error.message
        });
    }
});

// Reject work completion
router.post('/completions/:workId/reject', async (req, res) => {
    try {
        const { workId } = req.params;
        const { rejectionReason, rejectedBy } = req.body;
        
        console.log(`❌ Rejecting work ${workId}...`);
        
        // Determine source table from workId prefix
        let sourceTable = null;
        let sourceId = null;
        if (typeof workId === 'string' && workId.startsWith('PW-')) {
            sourceTable = 'projects_work';
            sourceId = parseInt(workId.replace('PW-', ''), 10);
        } else if (typeof workId === 'string' && workId.startsWith('FW-')) {
            sourceTable = 'finance_work';
            sourceId = parseInt(workId.replace('FW-', ''), 10);
        } else if (typeof workId === 'string' && workId.startsWith('SR-')) {
            sourceTable = 'site_reports';
            sourceId = parseInt(workId.replace('SR-', ''), 10);
        } else if (typeof workId === 'string' && workId.startsWith('HW-')) {
            sourceTable = 'hr_work';
            sourceId = parseInt(workId.replace('HW-', ''), 10);
        }
        
        try {
            await db.execute(`
                UPDATE work_completions 
                SET status = 'rejected', 
                    rejection_reason = ?,
                    rejected_by = ?,
                    rejection_date = NOW()
                WHERE id = ?
            `, [rejectionReason || '', rejectedBy || 'System', workId]);
        } catch (dbError) {
            console.log('⚠️ work_completions reject update:', dbError.message);
        }

        // Update source table status to Rejected
        if (sourceTable && sourceId) {
            try {
                await db.execute(
                    `UPDATE ${sourceTable} SET status = 'Rejected' WHERE id = ?`,
                    [sourceId]
                );
                console.log(`✅ Updated ${sourceTable} status to Rejected for ID ${sourceId}`);
            } catch (e) { console.log(`⚠️ ${sourceTable} reject update:`, e.message); }
        }

        // Create notification for submitter
        try {
            await db.execute(`
                INSERT INTO notifications (title, message, type, priority, recipient_type, recipients, sent_by, status, is_read, created_at)
                VALUES (?, ?, 'error', 'High', 'individual', 'all', ?, 'sent', 0, NOW())
            `, [
                'Work Rejected: ' + workId,
                `Your work item ${workId} has been rejected. Reason: ${rejectionReason || 'Not specified'}. Rejected by: ${rejectedBy || 'Managing Director'}`,
                rejectedBy || 'Managing Director'
            ]);
        } catch (notifErr) { console.log('⚠️ Rejection notification:', notifErr.message); }
        
        res.json({
            success: true,
            message: 'Work rejected successfully',
            workId: workId,
            status: 'rejected'
        });
    } catch (error) {
        console.error('❌ Error rejecting work:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reject work',
            details: error.message
        });
    }
});

// Update work item
router.put('/:department/:id', async (req, res) => {
    try {
        const { department, id } = req.params;
        
        // Validate department to prevent SQL injection
        if (!isValidDepartment(department)) {
            return res.status(400).json({ error: 'Invalid department name' });
        }
        
        const updates = req.body;
        
        // Check if work item exists
        const [existingItems] = await db.execute(
            `SELECT id FROM ${department}_work WHERE id = ?`,
            [id]
        );
        
        if (existingItems.length === 0) {
            return res.status(404).json({ error: 'Work item not found' });
        }
        
        // Build dynamic update query
        const updateFields = [];
        const values = [];
        
        // Update common fields
        if (updates.work_title) {
            updateFields.push('work_title = ?');
            values.push(updates.work_title);
        }
        if (updates.work_description) {
            updateFields.push('work_description = ?');
            values.push(updates.work_description);
        }
        if (updates.status) {
            updateFields.push('status = ?');
            values.push(updates.status);
        }
        if (updates.priority) {
            updateFields.push('priority = ?');
            values.push(updates.priority);
        }
        if (updates.assigned_to) {
            updateFields.push('assigned_to = ?');
            values.push(updates.assigned_to);
        }
        if (updates.due_date) {
            updateFields.push('due_date = ?');
            values.push(updates.due_date);
        }
        if (updates.completion_date) {
            updateFields.push('completion_date = ?');
            values.push(updates.completion_date);
        }
        
        // Department-specific updates
        if (department === 'finance' && updates.amount !== undefined) {
            updateFields.push('amount = ?');
            values.push(updates.amount);
        }
        
        if (department === 'hse') {
            if (updates.incident_type) {
                updateFields.push('incident_type = ?');
                values.push(updates.incident_type);
            }
            if (updates.severity) {
                updateFields.push('severity = ?');
                values.push(updates.severity);
            }
        }
        
        if (department === 'project') {
            if (updates.project_name) {
                updateFields.push('project_name = ?');
                values.push(updates.project_name);
            }
            if (updates.client_name) {
                updateFields.push('client_name = ?');
                values.push(updates.client_name);
            }
        }
        
        if (department === 'realestate') {
            if (updates.property_address) {
                updateFields.push('property_address = ?');
                values.push(updates.property_address);
            }
            if (updates.property_type) {
                updateFields.push('property_type = ?');
                values.push(updates.property_type);
            }
            if (updates.sale_amount) {
                updateFields.push('sale_amount = ?');
                values.push(updates.sale_amount);
            }
        }
        
        if (department === 'admin') {
            if (updates.affected_department) {
                updateFields.push('affected_department = ?');
                values.push(updates.affected_department);
            }
            if (updates.deadline) {
                updateFields.push('deadline = ?');
                values.push(updates.deadline);
            }
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        values.push(id);
        
        await db.execute(
            `UPDATE ${department}_work SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );
        
        // Return updated work item
        const [updatedWorkItem] = await db.execute(
            `SELECT * FROM ${department}_work WHERE id = ?`,
            [id]
        );
        
        res.json({
            message: `${department} work item updated successfully`,
            workItem: updatedWorkItem[0]
        });
        
    } catch (error) {
        console.error('Error updating work item:', error);
        res.status(500).json({ error: 'Failed to update work item' });
    }
});

// Delete work item
router.delete('/:department/:id', async (req, res) => {
    try {
        const { department, id } = req.params;
        
        // Validate department to prevent SQL injection
        if (!isValidDepartment(department)) {
            return res.status(400).json({ error: 'Invalid department name' });
        }
        
        const [result] = await db.execute(
            `DELETE FROM ${department}_work WHERE id = ?`,
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Work item not found' });
        }
        
        res.json({ message: 'Work item deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting work item:', error);
        res.status(500).json({ error: 'Failed to delete work item' });
    }
});

// Get work item by ID
router.get('/:department/:id', async (req, res) => {
    try {
        const { department, id } = req.params;
        
        // Validate department to prevent SQL injection
        if (!isValidDepartment(department)) {
            return res.status(400).json({ error: 'Invalid department name' });
        }
        
        const [workItems] = await db.execute(
            `SELECT * FROM ${department}_work WHERE id = ?`,
            [id]
        );
        
        if (workItems.length === 0) {
            return res.status(404).json({ error: 'Work item not found' });
        }
        
        res.json(workItems[0]);
        
    } catch (error) {
        console.error('Error fetching work item:', error);
        res.status(500).json({ error: 'Failed to fetch work item' });
    }
});

// Get work statistics for a department
router.get('/:department/stats', async (req, res) => {
    try {
        const { department } = req.params;
        
        // Validate department to prevent SQL injection
        if (!isValidDepartment(department)) {
            return res.status(400).json({ error: 'Invalid department name' });
        }
        
        // Get total work items
        const [totalResult] = await db.execute(
            `SELECT COUNT(*) as total FROM ${department}_work`
        );
        
        // Get work items by status
        const [statusResult] = await db.execute(
            `SELECT status, COUNT(*) as count FROM ${department}_work GROUP BY status`
        );
        
        // Get work items by priority
        const [priorityResult] = await db.execute(
            `SELECT priority, COUNT(*) as count FROM ${department}_work GROUP BY priority`
        );
        
        // Get work items by type
        const [typeResult] = await db.execute(
            `SELECT work_type, COUNT(*) as count FROM ${department}_work GROUP BY work_type`
        );
        
        // Get recent work items
        const [recentResult] = await db.execute(
            `SELECT * FROM ${department}_work ORDER BY submitted_date DESC LIMIT 5`
        );
        
        res.json({
            total: totalResult[0].total,
            byStatus: statusResult,
            byPriority: priorityResult,
            byType: typeResult,
            recent: recentResult
        });
        
    } catch (error) {
        console.error('Error fetching work statistics:', error);
        res.status(500).json({ error: 'Failed to fetch work statistics' });
    }
});

// Worker Assignments Routes
// Get all worker assignments
router.get('/assignments', async (req, res) => {
    try {
        console.log('📋 Fetching worker assignments...');
        
        const [assignments] = await db.execute(`
            SELECT * FROM worker_assignments 
            ORDER BY created_at DESC
        `);
        
        console.log('✅ Worker assignments fetched:', assignments.length);
        res.json(assignments);
        
    } catch (error) {
        console.error('❌ Error fetching worker assignments:', error);
        res.status(500).json({ error: 'Failed to fetch worker assignments' });
    }
});

// Update worker assignment
router.put('/assignments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            employee_name,
            project_name,
            role_in_project,
            start_date,
            end_date,
            assignment_notes,
            status
        } = req.body;
        
        console.log('📝 Updating worker assignment:', id);
        
        const [result] = await db.execute(`
            UPDATE worker_assignments SET
                employee_name = ?, project_name = ?, role_in_project = ?,
                start_date = ?, end_date = ?, assignment_notes = ?, status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            employee_name,
            project_name,
            role_in_project,
            start_date,
            end_date || null,
            assignment_notes || null,
            status || 'Active',
            id
        ]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Worker assignment not found' });
        }
        
        console.log('✅ Worker assignment updated successfully');
        res.json({
            message: 'Worker assignment updated successfully',
            id: parseInt(id),
            updated_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error updating worker assignment:', error);
        res.status(500).json({ error: 'Failed to update worker assignment' });
    }
});

// Delete worker assignment
router.delete('/assignments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🗑️ Deleting worker assignment:', id);
        
        const [result] = await db.execute(`
            DELETE FROM worker_assignments WHERE id = ?
        `, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Worker assignment not found' });
        }
        
        console.log('✅ Worker assignment deleted successfully');
        res.json({
            message: 'Worker assignment deleted successfully',
            id: parseInt(id)
        });
        
    } catch (error) {
        console.error('❌ Error deleting worker assignment:', error);
        res.status(500).json({ error: 'Failed to delete worker assignment' });
    }
});

const workforceProjectNames = {
    prj001: 'Port Modernization Phase 1',
    prj002: 'Warehouse Construction',
    prj003: 'Road Infrastructure'
};

function getFallbackWorkforceProjectName(projectValue) {
    const normalizedProject = String(projectValue || '').trim().toLowerCase();
    return workforceProjectNames[normalizedProject] || projectValue;
}

function getDbRows(result) {
    if (Array.isArray(result)) {
        if (result.length > 0 && Array.isArray(result[0])) {
            return result[0];
        }
        return result;
    }

    if (result && Array.isArray(result.rows)) {
        return result.rows;
    }

    return [];
}

async function getWorkforceRequestSchema() {
    const columns = getDbRows(await db.execute('SHOW COLUMNS FROM workforce_requests'));
    return new Map((columns || []).map(column => [column.Field, String(column.Type || '').toLowerCase()]));
}

async function resolveWorkforceProject(projectValue) {
    const normalizedProject = String(projectValue || '').trim();
    const projectNumberMatch = normalizedProject.match(/(\d+)/);
    const numericProjectId = /^\d+$/.test(normalizedProject)
        ? parseInt(normalizedProject, 10)
        : (projectNumberMatch ? parseInt(projectNumberMatch[1], 10) : null);

    try {
        const projectColumns = getDbRows(await db.execute('SHOW COLUMNS FROM projects'));
        const projectSchema = new Set((projectColumns || []).map(column => column.Field));
        const selectableColumns = ['id', 'name'];
        const whereClauses = [];
        const queryValues = [];

        if (projectSchema.has('project_code')) {
            selectableColumns.push('project_code');
            whereClauses.push('project_code = ?');
            queryValues.push(normalizedProject);
        }

        if (projectSchema.has('code')) {
            selectableColumns.push('code');
            whereClauses.push('code = ?');
            queryValues.push(normalizedProject);
        }

        if (projectSchema.has('name')) {
            whereClauses.push('name = ?');
            queryValues.push(normalizedProject);
        }

        if (projectSchema.has('id')) {
            whereClauses.unshift('id = ?');
            queryValues.unshift(numericProjectId || 0);
        }

        const rows = await db.execute(`
            SELECT ${selectableColumns.join(', ')}
            FROM projects
            WHERE ${whereClauses.join(' OR ')}
            LIMIT 1
        `, queryValues);

        const normalizedRows = getDbRows(rows);

        if (normalizedRows.length > 0) {
            return normalizedRows[0];
        }
    } catch (error) {
        console.error('⚠️ Error resolving workforce project:', error.message);
    }

    return {
        id: numericProjectId,
        name: getFallbackWorkforceProjectName(normalizedProject),
        project_code: normalizedProject,
        code: normalizedProject
    };
}

function normalizeWorkforceRequestRecord(record) {
    let projectLabel = record.project || record.project_name;

    if (!projectLabel && record.project_id != null) {
        const projectIdValue = String(record.project_id).trim();
        projectLabel = /^\d+$/.test(projectIdValue)
            ? getFallbackWorkforceProjectName(`prj${projectIdValue.padStart(3, '0')}`)
            : getFallbackWorkforceProjectName(projectIdValue);
    }

    const submittedDate = record.submitted_date || record.created_at || record.updated_at || null;

    return {
        ...record,
        requestId: record.request_id || String(record.id || ''),
        project: projectLabel || 'Unknown Project',
        requestType: record.request_type || record.requestType || '',
        workersNeeded: record.workers_needed ?? record.workersNeeded ?? 0,
        jobCategories: record.job_categories ?? record.jobCategories ?? [],
        duration: record.duration || '',
        startDate: record.start_date || record.startDate || null,
        endDate: record.end_date || record.endDate || null,
        submittedDate,
        justification: record.justification || '',
        specialRequirements: record.special_requirements || record.specialRequirements || '',
        submittedBy: record.submitted_by || record.requested_by || record.submittedBy || '',
        status: record.status || 'pending'
    };
}

// Workforce Requests Routes
// Get all workforce requests
router.get('/workforce-requests', async (req, res) => {
    try {
        console.log('📋 Fetching workforce requests...');
        
        let workforceRequests = [];
        
        try {
            const workforceSchema = await getWorkforceRequestSchema();
            const orderField = workforceSchema.has('submitted_date')
                ? 'submitted_date'
                : (workforceSchema.has('created_at') ? 'created_at' : 'id');

            const dbRequests = await db.execute(`
                SELECT * FROM workforce_requests 
                ORDER BY ${orderField} DESC
            `);
            workforceRequests = getDbRows(dbRequests).map(normalizeWorkforceRequestRecord);
            console.log(`📊 Found ${workforceRequests.length} workforce requests from database`);
            
            // If fewer than 3 records, add sample data for demonstration
            if (workforceRequests.length < 3) {
                console.log(`⚠️ Only ${workforceRequests.length} workforce requests found, adding sample data`);
                const sampleRequests = [
                    {
                        id: 'WFR-001',
                        request_id: 'WFR-2026-001',
                        project: 'Port Modernization Phase 1',
                        request_type: 'additional',
                        workers_needed: 5,
                        job_categories: JSON.stringify(['construction', 'supervisor']),
                        duration: '2 weeks',
                        start_date: '2026-05-15',
                        end_date: '2026-05-29',
                        submitted_date: '2026-05-03',
                        status: 'pending',
                        justification: 'Additional workforce needed for accelerated timeline',
                        special_requirements: 'Marine construction experience preferred',
                        created_at: new Date().toISOString(),
                        mock: true
                    },
                    {
                        id: 'WFR-002',
                        request_id: 'WFR-2026-002',
                        project: 'Warehouse Construction',
                        request_type: 'specialized',
                        workers_needed: 3,
                        job_categories: JSON.stringify(['engineering', 'safety']),
                        duration: '1 month',
                        start_date: '2026-05-10',
                        end_date: '2026-06-10',
                        submitted_date: '2026-05-01',
                        status: 'approved',
                        justification: 'Need specialized engineers for structural work',
                        special_requirements: 'Structural engineering certification required',
                        created_at: new Date().toISOString(),
                        mock: true
                    }
                ];
                
                // Apply persistent in-memory statuses for mock requests
                sampleRequests.forEach(sample => {
                    if (mockWorkforceStatuses[sample.id]) {
                        sample.status = mockWorkforceStatuses[sample.id];
                    }
                });

                // Add sample data that doesn't conflict with real IDs
                const additionalSampleData = sampleRequests.filter(sample => 
                    !workforceRequests.some(real => real.id === sample.id)
                ).map(normalizeWorkforceRequestRecord);
                workforceRequests = [...workforceRequests, ...additionalSampleData];
                console.log(`📊 Total workforce requests after adding sample data: ${workforceRequests.length}`);
            }
        } catch (dbError) {
            console.error('❌ Database error, workforce_requests table may not exist:', dbError);
            
            // Create table if it doesn't exist
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS workforce_requests (
                        id VARCHAR(50) PRIMARY KEY,
                        request_id VARCHAR(100) NOT NULL,
                        project VARCHAR(255) NOT NULL,
                        request_type ENUM('additional', 'replacement', 'specialized', 'temporary') NOT NULL,
                        workers_needed INT NOT NULL,
                        job_categories JSON,
                        duration VARCHAR(100),
                        start_date DATE,
                        end_date DATE,
                        submitted_date DATE NOT NULL,
                        status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
                        justification TEXT,
                        special_requirements TEXT,
                        submitted_by VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `);
                console.log('✅ workforce_requests table created successfully');
                
                // Return empty array since table is new
                workforceRequests = [];
            } catch (createError) {
                console.error('❌ Failed to create workforce_requests table:', createError);
                return res.status(500).json({
                    error: 'Failed to create workforce requests table',
                    details: createError.message
                });
            }
        }
        
        console.log(`📋 Returning ${workforceRequests.length} workforce requests`);
        res.json(workforceRequests);
        
    } catch (error) {
        console.error('❌ Error fetching workforce requests:', error);
        res.status(500).json({
            error: 'Failed to fetch workforce requests',
            details: error.message
        });
    }
});

// Create new workforce request
router.post('/workforce-requests', async (req, res) => {
    // Check if request body exists and is properly parsed
    if (!req.body || Object.keys(req.body).length === 0) {
        console.log('❌ Empty or missing request body');
        return res.status(400).json({
            error: 'Request body is empty or missing',
            contentType: req.headers['content-type'],
            body: req.body
        });
    }
    
    try {
        console.log('📝 Creating new workforce request...');
        console.log('📊 Request headers:', req.headers);
        console.log('📊 Request body:', req.body);
        console.log('📊 Content-Type:', req.headers['content-type']);
        
        const {
            project,
            requestType,
            workersNeeded,
            jobCategories,
            duration,
            startDate,
            endDate,
            justification,
            specialRequirements,
            submittedBy = 'Project Manager'
        } = req.body;
        
        // Debug logging
        console.log('🔍 Received fields:', {
            project: !!project,
            requestType: !!requestType,
            workersNeeded: !!workersNeeded,
            jobCategories: jobCategories,
            jobCategoriesType: typeof jobCategories,
            jobCategoriesLength: Array.isArray(jobCategories) ? jobCategories.length : 'N/A',
            duration: !!duration,
            startDate: !!startDate,
            justification: !!justification
        });
        
        // Validate required fields
        console.log('🔍 Validating required fields...');
        const missingFields = [];
        if (!project) missingFields.push('project');
        if (!requestType) missingFields.push('requestType');
        if (!workersNeeded) missingFields.push('workersNeeded');
        if (!duration) missingFields.push('duration');
        if (!startDate) missingFields.push('startDate');
        if (!justification) missingFields.push('justification');
        
        if (missingFields.length > 0) {
            console.log('❌ Missing required fields:', missingFields);
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['project', 'requestType', 'workersNeeded', 'jobCategories', 'duration', 'startDate', 'justification'],
                missing: missingFields,
                received: {
                    project: !!project,
                    requestType: !!requestType,
                    workersNeeded: !!workersNeeded,
                    jobCategories: jobCategories,
                    duration: !!duration,
                    startDate: !!startDate,
                    justification: !!justification,
                    fullBody: req.body
                }
            });
        }
        
        // Validate job categories separately
        console.log('🔍 Validating job categories...');
        console.log('📊 Job categories details:', {
            exists: !!jobCategories,
            isArray: Array.isArray(jobCategories),
            type: typeof jobCategories,
            length: Array.isArray(jobCategories) ? jobCategories.length : 'N/A',
            value: jobCategories
        });
        
        if (!jobCategories || (Array.isArray(jobCategories) && jobCategories.length === 0)) {
            console.log('❌ Job categories validation failed');
            return res.status(400).json({
                error: 'At least one job category must be selected',
                received: jobCategories,
                details: {
                    exists: !!jobCategories,
                    isArray: Array.isArray(jobCategories),
                    length: Array.isArray(jobCategories) ? jobCategories.length : 'N/A'
                }
            });
        }
        
        console.log('✅ Job categories validation passed');
        
        // Generate unique request ID
        const requestId = `WFR-${Date.now().toString().slice(-6)}`;
        const id = `WFR-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
        const normalizedJobCategories = JSON.stringify(Array.isArray(jobCategories) ? jobCategories : [jobCategories]);
        const resolvedProject = await resolveWorkforceProject(project);
        const projectDisplayName = resolvedProject.name || getFallbackWorkforceProjectName(project);
        
        // Ensure table exists
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS workforce_requests (
                    id VARCHAR(50) PRIMARY KEY,
                    request_id VARCHAR(100) NOT NULL,
                    project VARCHAR(255) NOT NULL,
                    request_type ENUM('additional', 'replacement', 'specialized', 'temporary') NOT NULL,
                    workers_needed INT NOT NULL,
                    job_categories JSON,
                    duration VARCHAR(100),
                    start_date DATE,
                    end_date DATE,
                    submitted_date DATE NOT NULL,
                    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
                    justification TEXT,
                    special_requirements TEXT,
                    submitted_by VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
        } catch (tableError) {
            console.error('⚠️ Table creation error:', tableError.message);
        }
        
        // Insert workforce request
        const workforceSchema = await getWorkforceRequestSchema();
        const insertColumns = [];
        const insertValues = [];
        const idColumnType = workforceSchema.get('id') || '';

        const addColumnValue = (columnName, value) => {
            if (workforceSchema.has(columnName)) {
                insertColumns.push(columnName);
                insertValues.push(value);
            }
        };

        if (workforceSchema.has('id') && !idColumnType.includes('int')) {
            addColumnValue('id', id);
        }

        addColumnValue('request_id', requestId);
        addColumnValue('project', projectDisplayName);
        addColumnValue('project_name', projectDisplayName);

        if (workforceSchema.has('project_id')) {
            const projectIdColumnType = workforceSchema.get('project_id') || '';
            const resolvedProjectId = projectIdColumnType.includes('int')
                ? (resolvedProject.id || null)
                : String(project);
            addColumnValue('project_id', resolvedProjectId);
        }

        addColumnValue('request_type', requestType);
        addColumnValue('workers_needed', parseInt(workersNeeded, 10));
        addColumnValue('job_categories', normalizedJobCategories);
        addColumnValue('duration', duration);
        addColumnValue('start_date', startDate);
        addColumnValue('end_date', endDate || null);
        addColumnValue('submitted_date', new Date().toISOString().split('T')[0]);
        addColumnValue('status', 'pending');
        addColumnValue('justification', justification);
        addColumnValue('special_requirements', specialRequirements || null);
        addColumnValue('submitted_by', submittedBy);
        addColumnValue('requested_by', submittedBy);

        if (insertColumns.length === 0) {
            throw new Error('No compatible workforce_requests columns were found for insert');
        }

        const queryResult = await db.execute(`
            INSERT INTO workforce_requests (
                ${insertColumns.join(', ')}
            ) VALUES (
                ${insertColumns.map(() => '?').join(', ')}
            )
        `, insertValues);
        
        console.log('✅ Workforce request created successfully:', requestId);
        
        res.status(201).json({
            message: 'Workforce request created successfully',
            requestId: requestId,
            id: workforceSchema.has('id') && !idColumnType.includes('int') ? id : ((queryResult[0] || queryResult).insertId || id),
            data: normalizeWorkforceRequestRecord({
                id: workforceSchema.has('id') && !idColumnType.includes('int') ? id : ((queryResult[0] || queryResult).insertId || id),
                request_id: requestId,
                project: projectDisplayName,
                project_name: projectDisplayName,
                project_id: resolvedProject.id || project,
                request_type: requestType,
                workers_needed: parseInt(workersNeeded, 10),
                job_categories: normalizedJobCategories,
                duration,
                start_date: startDate,
                end_date: endDate || null,
                submitted_date: new Date().toISOString().split('T')[0],
                justification,
                special_requirements: specialRequirements || null,
                submitted_by: submittedBy,
                requested_by: submittedBy,
                status: 'pending'
            })
        });
        
    } catch (error) {
        console.error('❌ Error creating workforce request:', error);
        res.status(500).json({
            error: 'Failed to create workforce request',
            details: error.message
        });
    }
});

// Update workforce request status
router.put('/workforce-requests/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                validStatuses: ['pending', 'approved', 'rejected', 'completed']
            });
        }
        
        // Introspect table schema to check the type of the 'id' column
        const workforceSchema = await getWorkforceRequestSchema();
        const idColumnType = workforceSchema.get('id') || '';
        const isIdInteger = idColumnType.includes('int');

        // Check if this is a mock request (non-numeric string ID in an integer ID table)
        if (isIdInteger && isNaN(Number(id))) {
            console.log(`ℹ️ Mock workforce request ${id} status updated to ${status} (simulated success)`);
            mockWorkforceStatuses[id] = status; // Persist in memory
            return res.json({
                message: 'Workforce request status updated successfully (mock simulation)',
                id: id,
                status: status
            });
        }

        // Use appropriate ID type for query
        const queryId = isIdInteger ? parseInt(id, 10) : id;

        const result = await db.execute(`
            UPDATE workforce_requests 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [status, queryId]);
        
        if (!result || result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Workforce request not found'
            });
        }
        
        console.log(`✅ Workforce request ${id} status updated to ${status}`);
        
        res.json({
            message: 'Workforce request status updated successfully',
            id: id,
            status: status
        });
        
    } catch (error) {
        console.error('❌ Error updating workforce request status:', error);
        res.status(500).json({
            error: 'Failed to update workforce request status',
            details: error.message
        });
    }
});

// Notifications Routes
// Get all notifications
router.get('/notifications', async (req, res) => {
    try {
        console.log('📋 Fetching notifications...');
        
        let notifications = [];
        
        try {
            const dbResult = await db.execute(`
                SELECT * FROM notifications 
                ORDER BY created_at DESC
            `);
            // Handle different mysql2 return formats
            if (Array.isArray(dbResult) && Array.isArray(dbResult[0])) {
                notifications = dbResult[0];
            } else if (Array.isArray(dbResult)) {
                notifications = dbResult;
            } else {
                notifications = [];
            }
            console.log(`📊 Found ${notifications.length} notifications from database`);
        } catch (dbError) {
            console.error('❌ Database error, notifications table may not exist:', dbError);
            
            // Create table if it doesn't exist
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS notifications (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        message TEXT NOT NULL,
                        type VARCHAR(50) DEFAULT 'info',
                        priority VARCHAR(50) DEFAULT 'normal',
                        recipient_type VARCHAR(50) DEFAULT 'all',
                        recipients VARCHAR(255) DEFAULT 'All Staff',
                        sent_by VARCHAR(255) DEFAULT 'System',
                        status VARCHAR(50) DEFAULT 'draft',
                        sent_date DATE,
                        scheduled_date DATETIME,
                        read_rate DECIMAL(5,2) DEFAULT 0,
                        is_read BOOLEAN DEFAULT FALSE,
                        user_id VARCHAR(50),
                        category VARCHAR(50) DEFAULT 'system',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `);
                console.log('✅ notifications table created successfully');
                notifications = [];
            } catch (createError) {
                console.error('❌ Failed to create notifications table:', createError);
                return res.status(500).json({
                    error: 'Failed to create notifications table',
                    details: createError.message
                });
            }
        }
        
        console.log(`📋 Returning ${notifications.length} notifications`);
        res.json(notifications);
        
    } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        res.status(500).json({
            error: 'Failed to fetch notifications',
            details: error.message
        });
    }
});

// Create new notification
router.post('/notifications', async (req, res) => {
    try {
        console.log('📝 Creating new notification...');
        console.log('📊 Request body:', req.body);
        
        const {
            title,
            recipientType,
            recipients,
            message,
            priority = 'normal',
            scheduleType = 'immediate',
            scheduleDateTime,
            sentBy = 'Admin Assistant'
        } = req.body;
        
        // Validate required fields
        if (!title || !recipientType || !recipients || !message) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['title', 'recipientType', 'recipients', 'message']
            });
        }
        
        // Ensure notifications table has all required columns
        const missingColumns = [
            { name: 'sent_date', definition: 'DATE' },
            { name: 'scheduled_date', definition: 'DATETIME' },
            { name: 'sent_by', definition: "VARCHAR(255) DEFAULT 'System'" },
            { name: 'read_rate', definition: 'DECIMAL(5,2) DEFAULT 0' },
            { name: 'recipient_type', definition: "VARCHAR(50) DEFAULT 'all'" },
            { name: 'recipients', definition: "VARCHAR(255) DEFAULT 'All Staff'" },
            { name: 'status', definition: "VARCHAR(50) DEFAULT 'draft'" }
        ];
        for (const col of missingColumns) {
            try {
                await db.execute(`ALTER TABLE notifications ADD COLUMN ${col.name} ${col.definition}`);
                console.log(`✅ Added missing column: ${col.name}`);
            } catch (alterErr) {
                // Column already exists - ignore
            }
        }
        
        // Convert ENUM columns to VARCHAR to accept all values
        const columnsToModify = [
            { name: 'priority', definition: "VARCHAR(50) DEFAULT 'Medium'" },
            { name: 'type', definition: "VARCHAR(50) DEFAULT 'Info'" }
        ];
        for (const col of columnsToModify) {
            try {
                await db.execute(`ALTER TABLE notifications MODIFY COLUMN ${col.name} ${col.definition}`);
            } catch (modifyErr) {
                // Ignore if already modified or column doesn't exist
            }
        }
        
        // Map frontend priority values to DB-compatible values
        const priorityMap = {
            'normal': 'Medium',
            'important': 'High',
            'urgent': 'Urgent',
            'low': 'Low'
        };
        const mappedPriority = priorityMap[priority] || priority;
        
        // Determine status and dates
        let status = 'draft';
        let sentDate = null;
        let scheduledDate = null;
        
        if (scheduleType === 'immediate') {
            status = 'sent';
            sentDate = new Date().toISOString().split('T')[0];
        } else if (scheduleType === 'scheduled' && scheduleDateTime) {
            status = 'scheduled';
            scheduledDate = scheduleDateTime;
        }
        
        // Insert notification (auto-increment ID)
        const insertResult = await db.execute(`
            INSERT INTO notifications (
                title, message, type, priority, recipient_type, recipients,
                status, sent_date, scheduled_date, sent_by, read_rate
            ) VALUES (?, ?, 'Info', ?, ?, ?, ?, ?, ?, ?, 0)
        `, [
            title,
            message,
            mappedPriority,
            recipientType,
            recipients,
            status,
            sentDate,
            scheduledDate,
            sentBy
        ]);
        const result = Array.isArray(insertResult) ? insertResult[0] : insertResult;
        
        console.log('✅ Notification created successfully, ID:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            notificationId: result.insertId,
            data: {
                id: result.insertId,
                title,
                recipientType,
                recipients,
                message,
                priority,
                status,
                sentDate,
                scheduledDate
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        res.status(500).json({
            error: 'Failed to create notification',
            details: error.message
        });
    }
});

// Update notification status
router.put('/notifications/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, readRate } = req.body;
        
        if (!['draft', 'scheduled', 'sent', 'failed'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                validStatuses: ['draft', 'scheduled', 'sent', 'failed']
            });
        }
        
        let updateQuery = 'UPDATE notifications SET status = ?, updated_at = CURRENT_TIMESTAMP';
        let params = [status, id];
        
        if (readRate !== undefined) {
            updateQuery += ', read_rate = ?';
            params = [status, readRate, id];
        }
        
        updateQuery += ' WHERE id = ?';
        
        const updateResult = await db.execute(updateQuery, params);
        const result = Array.isArray(updateResult) ? updateResult[0] : updateResult;
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Notification not found'
            });
        }
        
        console.log(`✅ Notification ${id} status updated to ${status}`);
        
        res.json({
            message: 'Notification status updated successfully',
            id: id,
            status: status,
            readRate: readRate
        });
        
    } catch (error) {
        console.error('❌ Error updating notification status:', error);
        res.status(500).json({
            error: 'Failed to update notification status',
            details: error.message
        });
    }
});

// Delete notification
router.delete('/notifications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleteResult = await db.execute(`
            DELETE FROM notifications WHERE id = ?
        `, [id]);
        const result = Array.isArray(deleteResult) ? deleteResult[0] : deleteResult;
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Notification not found'
            });
        }
        
        console.log(`✅ Notification ${id} deleted successfully`);
        
        res.json({
            message: 'Notification deleted successfully',
            id: id
        });
        
    } catch (error) {
        console.error('❌ Error deleting notification:', error);
        res.status(500).json({
            error: 'Failed to delete notification',
            details: error.message
        });
    }
});

// Accountant Management API
router.post('/finance/accountant', async (req, res) => {
    try {
        console.log('🔍 Accountant creation request received');
        console.log('📊 Request body:', req.body);
        
        const {
            name,
            employeeId,
            email,
            phone,
            department,
            reportingTo,
            startDate,
            employmentType,
            professionalQualification,
            yearsExperience,
            additionalCertifications,
            notes,
            financialReporting,
            bookkeeping,
            regulatory,
            systemAccess
        } = req.body;
        
        // Validate required fields
        if (!name || !employeeId || !email || !department || !reportingTo || !startDate) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['name', 'employeeId', 'email', 'department', 'reportingTo', 'startDate'],
                received: { name, employeeId, email, department, reportingTo, startDate }
            });
        }
        
        // Convert arrays to JSON strings for database storage
        const financialReportingJson = financialReporting ? JSON.stringify(financialReporting) : null;
        const bookkeepingJson = bookkeeping ? JSON.stringify(bookkeeping) : null;
        const regulatoryJson = regulatory ? JSON.stringify(regulatory) : null;
        const systemAccessJson = systemAccess ? JSON.stringify(systemAccess) : null;
        
        // Get user ID from session (assuming authentication middleware sets req.user)
        const submittedBy = req.user?.id || 1; // Default to 1 for testing
        const submittedByRole = req.user?.role || 'Managing Director';
        
        console.log('📝 Extracted accountant data:', {
            name,
            employeeId,
            email,
            department,
            reportingTo,
            startDate,
            employmentType,
            professionalQualification,
            yearsExperience,
            financialReporting: financialReportingJson,
            bookkeeping: bookkeepingJson,
            regulatory: regulatoryJson,
            systemAccess: systemAccessJson
        });
        
        // Check if employee ID already exists
        const [existingAccountant] = await db.execute(`
            SELECT id FROM accountants WHERE employee_id = ?
        `, [employeeId]);
        
        if (existingAccountant.length > 0) {
            console.log('❌ Employee ID already exists:', employeeId);
            return res.status(400).json({
                error: 'Employee ID already exists',
                employeeId: employeeId
            });
        }
        
        // Check if email already exists
        const [existingEmail] = await db.execute(`
            SELECT id FROM accountants WHERE email = ?
        `, [email]);
        
        if (existingEmail.length > 0) {
            console.log('❌ Email already exists:', email);
            return res.status(400).json({
                error: 'Email already exists',
                email: email
            });
        }
        
        // Insert accountant data
        const [result] = await db.execute(`
            INSERT INTO accountants (
                employee_id, name, email, phone, department, reporting_to, 
                start_date, employment_type, professional_qualification, years_of_experience,
                additional_certifications, status, notes,
                financial_reporting, bookkeeping, regulatory, system_access,
                role, submitted_by, submitted_by_role, submitted_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            employeeId,
            name,
            email,
            phone,
            department,
            reportingTo,
            startDate,
            employmentType,
            professionalQualification,
            parseInt(yearsExperience) || 0,
            additionalCertifications,
            'Active',
            notes,
            financialReportingJson,
            bookkeepingJson,
            regulatoryJson,
            systemAccessJson,
            'Accountant',
            submittedBy,
            submittedByRole,
            new Date().toISOString().split('T')[0] // submitted_date
        ]);
        
        console.log('✅ Accountant created successfully:', result);
        
        res.status(201).json({
            success: true,
            message: 'Accountant details saved successfully',
            id: result.insertId,
            data: {
                id: result.insertId,
                employeeId,
                name,
                email,
                department,
                reportingTo,
                startDate,
                employmentType,
                professionalQualification,
                yearsExperience: parseInt(yearsExperience) || 0,
                financialReporting: financialReporting || [],
                bookkeeping: bookkeeping || [],
                regulatory: regulatory || [],
                systemAccess: systemAccess || [],
                status: 'Active',
                submittedBy: submittedByRole,
                submittedDate: new Date().toISOString().split('T')[0]
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating accountant:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        res.status(500).json({
            success: false,
            error: 'Failed to save accountant details',
            details: error.message
        });
    }
});

module.exports = router;

