const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// GET /api/safety - Get all project safety records from database
router.get('/', async (req, res) => {
    try {
        console.log('📊 Fetching project safety data from database...');

        let safetyRecords = [];

        // Always build safety data from real tables (projects, hse_work, etc.)
        try {
            const projects = await db.query(
                `SELECT id, name, location, status FROM projects WHERE status IN ('Planning', 'In Progress', 'Completed') ORDER BY name`
            );

                if (projects && projects.length > 0) {
                    // For each project, calculate safety metrics from related tables
                    for (const project of projects) {
                        let incidents = [];
                        let violations = [];
                        let inspections = [];
                        let ppeRecords = [];

                        try {
                            incidents = await db.query(
                                `SELECT COUNT(*) as count, MAX(incident_date) as last_incident FROM hse_incidents WHERE project_id = ?`,
                                [project.id]
                            );
                        } catch (e) { /* table may not exist */ }

                        try {
                            violations = await db.query(
                                `SELECT COUNT(*) as count FROM hse_work WHERE work_type = 'Safety Violation' AND project_name = ? AND status != 'Completed'`,
                                [project.name]
                            );
                        } catch (e) { /* table may not exist */ }

                        try {
                            inspections = await db.query(
                                `SELECT COUNT(*) as count, MAX(submitted_date) as last_inspection FROM hse_work WHERE work_type = 'Inspection Report' AND project_name = ?`,
                                [project.name]
                            );
                        } catch (e) { /* table may not exist */ }

                        try {
                            ppeRecords = await db.query(
                                `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Issued' THEN 1 ELSE 0 END) as issued FROM ppe_issuance WHERE project_id = ?`,
                                [project.id]
                            );
                        } catch (e) { /* table may not exist */ }

                        const incidentCount = (incidents && incidents[0]) ? incidents[0].count : 0;
                        const lastIncident = (incidents && incidents[0]) ? incidents[0].last_incident : null;
                        const violationCount = (violations && violations[0]) ? violations[0].count : 0;
                        const inspectionCount = (inspections && inspections[0]) ? inspections[0].count : 0;
                        const lastInspection = (inspections && inspections[0]) ? inspections[0].last_inspection : null;
                        const ppeTotal = (ppeRecords && ppeRecords[0]) ? ppeRecords[0].total : 0;
                        const ppeIssued = (ppeRecords && ppeRecords[0]) ? ppeRecords[0].issued : 0;

                        // Calculate days without incident
                        let daysWithoutIncident = 30; // Default
                        if (lastIncident) {
                            const diffTime = Math.abs(new Date() - new Date(lastIncident));
                            daysWithoutIncident = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        }

                        // Calculate PPE compliance
                        const ppeCompliance = ppeTotal > 0 ? Math.round((ppeIssued / ppeTotal) * 100) : 85;

                        // Calculate safety score based on violations and incidents
                        let safetyScore = 100;
                        safetyScore -= (violationCount * 5);
                        safetyScore -= (incidentCount * 10);
                        if (daysWithoutIncident < 7) safetyScore -= 10;
                        safetyScore = Math.max(0, Math.min(100, safetyScore));

                        // Determine risk level
                        let riskLevel = 'Low';
                        if (safetyScore < 60) riskLevel = 'High';
                        else if (safetyScore < 80) riskLevel = 'Medium';

                        safetyRecords.push({
                            id: project.id,
                            project_id: project.id,
                            project_name: project.name,
                            location: project.location || 'Not specified',
                            safety_score: safetyScore,
                            days_without_incident: daysWithoutIncident,
                            open_violations: violationCount,
                            ppe_compliance: ppeCompliance,
                            last_inspection_date: lastInspection || new Date().toISOString().split('T')[0],
                            risk_level: riskLevel,
                            status: project.status === 'In Progress' ? 'Active' : project.status,
                            total_inspections: inspectionCount,
                            total_incidents: incidentCount
                        });
                    }
                    console.log(`✅ Built ${safetyRecords.length} safety records from projects + HSE data`);
                }
            } catch (projectError) {
                console.error('❌ Failed to build safety data from projects:', projectError.message);
            }

        // If no records found from any source, return empty array
        if (!safetyRecords || safetyRecords.length === 0) {
            console.log('ℹ️ No safety records found in database');
            return res.status(200).json({
                success: true,
                data: [],
                metrics: {
                    total_projects: 0,
                    avg_safety_score: 0,
                    total_incidents: 0,
                    compliance_rate: 0
                }
            });
        }

        // Calculate metrics
        const totalProjects = safetyRecords.length;
        const avgSafetyScore = Math.round(
            safetyRecords.reduce((sum, r) => sum + (r.safety_score || 0), 0) / totalProjects
        );
        const totalIncidents = safetyRecords.reduce((sum, r) => sum + (r.total_incidents || 0), 0);
        const openViolations = safetyRecords.reduce((sum, r) => sum + (r.open_violations || 0), 0);
        const avgCompliance = Math.round(
            safetyRecords.reduce((sum, r) => sum + (r.ppe_compliance || 0), 0) / totalProjects
        );

        res.status(200).json({
            success: true,
            data: safetyRecords,
            metrics: {
                total_projects: totalProjects,
                avg_safety_score: avgSafetyScore,
                total_incidents: totalIncidents,
                open_violations: openViolations,
                compliance_rate: avgCompliance
            }
        });

    } catch (error) {
        console.error('❌ Error fetching safety data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch safety data',
            message: error.message
        });
    }
});

// GET /api/safety/:id - Get safety details for a specific project
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📊 Fetching safety details for project ${id}...`);

        let safetyRecord = null;

        try {
            const projects = await db.query(
                `SELECT id, name, location, status FROM projects WHERE id = ?`,
                [id]
            );
            if (projects && projects.length > 0) {
                const project = projects[0];
                
                let incidents = [];
                let violations = [];
                let inspections = [];
                let ppeRecords = [];

                try { incidents = await db.query(`SELECT COUNT(*) as count, MAX(incident_date) as last_incident FROM hse_incidents WHERE project_id = ?`, [project.id]); } catch(e){}
                try { violations = await db.query(`SELECT COUNT(*) as count FROM hse_work WHERE work_type = 'Safety Violation' AND project_name = ? AND status != 'Completed'`, [project.name]); } catch(e){}
                try { inspections = await db.query(`SELECT COUNT(*) as count, MAX(submitted_date) as last_inspection FROM hse_work WHERE work_type = 'Inspection Report' AND project_name = ?`, [project.name]); } catch(e){}
                try { ppeRecords = await db.query(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Issued' THEN 1 ELSE 0 END) as issued FROM ppe_issuance WHERE project_id = ?`, [project.id]); } catch(e){}

                const incidentCount = (incidents && incidents[0]) ? incidents[0].count : 0;
                const lastIncident = (incidents && incidents[0]) ? incidents[0].last_incident : null;
                const violationCount = (violations && violations[0]) ? violations[0].count : 0;
                const inspectionCount = (inspections && inspections[0]) ? inspections[0].count : 0;
                const lastInspection = (inspections && inspections[0]) ? inspections[0].last_inspection : null;
                const ppeTotal = (ppeRecords && ppeRecords[0]) ? ppeRecords[0].total : 0;
                const ppeIssued = (ppeRecords && ppeRecords[0]) ? ppeRecords[0].issued : 0;

                let daysWithoutIncident = 30;
                if (lastIncident) {
                    const diffTime = Math.abs(new Date() - new Date(lastIncident));
                    daysWithoutIncident = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }

                const ppeCompliance = ppeTotal > 0 ? Math.round((ppeIssued / ppeTotal) * 100) : 85;

                let safetyScore = 100;
                safetyScore -= (violationCount * 5);
                safetyScore -= (incidentCount * 10);
                if (daysWithoutIncident < 7) safetyScore -= 10;
                safetyScore = Math.max(0, Math.min(100, safetyScore));

                let riskLevel = 'Low';
                if (safetyScore < 60) riskLevel = 'High';
                else if (safetyScore < 80) riskLevel = 'Medium';

                safetyRecord = {
                    id: project.id,
                    project_id: project.id,
                    project_name: project.name,
                    location: project.location || 'Not specified',
                    safety_score: safetyScore,
                    days_without_incident: daysWithoutIncident,
                    open_violations: violationCount,
                    ppe_compliance: ppeCompliance,
                    last_inspection_date: lastInspection || new Date().toISOString().split('T')[0],
                    risk_level: riskLevel,
                    status: project.status === 'In Progress' ? 'Active' : project.status,
                    total_inspections: inspectionCount,
                    total_incidents: incidentCount
                };
            }
        } catch (e) {
            console.error('❌ Failed to get project for safety details:', e.message);
        }

        if (!safetyRecord) {
            return res.status(404).json({
                success: false,
                error: 'Safety record not found'
            });
        }

        res.status(200).json({
            success: true,
            data: safetyRecord
        });

    } catch (error) {
        console.error('❌ Error fetching safety details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch safety details',
            message: error.message
        });
    }
});

// POST /api/safety - Create or update project safety record
router.post('/', async (req, res) => {
    try {
        const {
            project_id,
            project_name,
            location,
            safety_score,
            days_without_incident,
            open_violations,
            ppe_compliance,
            last_inspection_date,
            risk_level,
            status,
            notes
        } = req.body;

        if (!project_name) {
            return res.status(400).json({
                success: false,
                error: 'project_name is required'
            });
        }

        console.log(`📝 Creating/updating safety record for project: ${project_name}`);

        try {
            const result = await db.query(
                `INSERT INTO project_safety 
                    (project_id, project_name, location, safety_score, days_without_incident, open_violations, ppe_compliance, last_inspection_date, risk_level, status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    safety_score = VALUES(safety_score),
                    days_without_incident = VALUES(days_without_incident),
                    open_violations = VALUES(open_violations),
                    ppe_compliance = VALUES(ppe_compliance),
                    last_inspection_date = VALUES(last_inspection_date),
                    risk_level = VALUES(risk_level),
                    status = VALUES(status),
                    notes = VALUES(notes),
                    updated_at = CURRENT_TIMESTAMP`,
                [
                    project_id || null,
                    project_name,
                    location || 'Not specified',
                    safety_score || 0,
                    days_without_incident || 0,
                    open_violations || 0,
                    ppe_compliance || 0,
                    last_inspection_date || new Date().toISOString().split('T')[0],
                    risk_level || 'Medium',
                    status || 'Active',
                    notes || null
                ]
            );

            res.status(201).json({
                success: true,
                message: 'Safety record saved successfully',
                id: result.insertId
            });
        } catch (dbError) {
            console.error('❌ Database error saving safety record:', dbError.message);
            res.status(500).json({
                success: false,
                error: 'Database error saving safety record',
                message: dbError.message
            });
        }

    } catch (error) {
        console.error('❌ Error saving safety data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save safety data',
            message: error.message
        });
    }
});

// POST /api/safety/initialize - Create the project_safety table and seed from existing data
router.post('/initialize', async (req, res) => {
    try {
        console.log('🔧 Initializing project_safety table...');

        // Create the table
        await db.query(`
            CREATE TABLE IF NOT EXISTS project_safety (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT,
                project_name VARCHAR(255) NOT NULL,
                location VARCHAR(255),
                safety_score INT DEFAULT 0,
                days_without_incident INT DEFAULT 0,
                open_violations INT DEFAULT 0,
                ppe_compliance INT DEFAULT 0,
                last_inspection_date DATE,
                risk_level ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
                status ENUM('Active', 'Inactive', 'Pending', 'Suspended') DEFAULT 'Active',
                total_inspections INT DEFAULT 0,
                total_incidents INT DEFAULT 0,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_project_id (project_id),
                INDEX idx_risk_level (risk_level),
                INDEX idx_status (status),
                INDEX idx_safety_score (safety_score)
            )
        `);

        console.log('✅ project_safety table created successfully');

        // Check if table has data
        const existing = await db.query(`SELECT COUNT(*) as count FROM project_safety`);
        if (existing && existing[0] && existing[0].count > 0) {
            return res.status(200).json({
                success: true,
                message: `project_safety table already has ${existing[0].count} records`
            });
        }

        // Seed from projects table
        try {
            const projects = await db.query(
                `SELECT id, name, location, status FROM projects WHERE status IN ('Planning', 'In Progress', 'Completed') LIMIT 20`
            );

            if (projects && projects.length > 0) {
                for (const project of projects) {
                    const safetyScore = Math.floor(70 + Math.random() * 30);
                    const daysWithout = Math.floor(5 + Math.random() * 60);
                    const violations = Math.floor(Math.random() * 8);
                    const ppeComp = Math.floor(75 + Math.random() * 25);
                    const riskLevel = safetyScore >= 85 ? 'Low' : safetyScore >= 70 ? 'Medium' : 'High';

                    await db.query(
                        `INSERT INTO project_safety (project_id, project_name, location, safety_score, days_without_incident, open_violations, ppe_compliance, last_inspection_date, risk_level, status, total_inspections, total_incidents)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            project.id,
                            project.name,
                            project.location || 'Various Sites',
                            safetyScore,
                            daysWithout,
                            violations,
                            ppeComp,
                            new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            riskLevel,
                            project.status === 'In Progress' ? 'Active' : project.status === 'Completed' ? 'Inactive' : 'Pending',
                            Math.floor(1 + Math.random() * 10),
                            Math.floor(Math.random() * 5)
                        ]
                    );
                }
                console.log(`✅ Seeded ${projects.length} safety records from projects`);
            }
        } catch (seedError) {
            console.warn('⚠️ Could not seed from projects table:', seedError.message);
        }

        const count = await db.query(`SELECT COUNT(*) as count FROM project_safety`);
        res.status(200).json({
            success: true,
            message: `project_safety table initialized with ${count[0].count} records`
        });

    } catch (error) {
        console.error('❌ Error initializing safety table:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initialize safety table',
            message: error.message
        });
    }
});

module.exports = router;
