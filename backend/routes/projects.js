const express = require('express');
const router = express.Router();

var notify = require('../utils/notify');
console.log('Projects route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Projects test endpoint accessed');
    res.json({ 
        message: 'Projects API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully',
        debug: 'Projects routes are loaded and responding'
    });
});

const db = require('../../database/config/database');

// Get all projects
router.get('/', async (req, res) => {
    try {
        console.log('🏗️ Fetching projects...');
        
        // Ensure projects table exists
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS projects (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT NULL,
                    location VARCHAR(255) NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE NULL,
                    status ENUM('Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled') DEFAULT 'Planning',
                    contract_value DECIMAL(15,2) NULL,
                    key_deliverables TEXT NULL,
                    priority_level ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
                    project_manager VARCHAR(255) NULL,
                    client_name VARCHAR(255) NULL,
                    project_code VARCHAR(50) UNIQUE NULL,
                    project_type VARCHAR(100) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_status (status),
                    INDEX idx_priority (priority_level),
                    INDEX idx_project_manager (project_manager),
                    INDEX idx_created_at (created_at)
                )
            `);
            console.log('✅ Projects table verified/created successfully');
        } catch (tableError) {
            console.log('⚠️ Could not create projects table:', tableError.message);
        }
        
        const { status, manager, search } = req.query;
        
        let query = `SELECT id, name, description, location, start_date, end_date, status, contract_value as budget, key_deliverables, priority_level, project_manager as manager_id, client_name as client_id, project_code, project_type, created_at, updated_at FROM projects WHERE 1=1`;
        const params = [];
        
        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }
        
        if (manager) {
            query += ` AND manager_id = ?`;
            params.push(manager);
        }
        
        if (search) {
            query += ` AND (name LIKE ? OR description LIKE ? OR location LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        query += ` ORDER BY created_at DESC`;
        
        const projectsResult = await db.execute(query, params);
        
        // Handle different MySQL2 return formats
        let projects = [];
        if (Array.isArray(projectsResult)) {
            projects = projectsResult;
        } else if (projectsResult && Array.isArray(projectsResult[0])) {
            projects = projectsResult[0];
        } else if (projectsResult && projectsResult.rows) {
            projects = projectsResult.rows;
        } else {
            projects = [];
        }
        
        console.log(`✅ Found ${projects.length} projects`);
        console.log('📊 Projects data structure:', {
            isArray: Array.isArray(projects),
            length: projects.length,
            firstItem: projects[0] || 'No items',
            sampleKeys: projects[0] ? Object.keys(projects[0]) : 'No keys',
            responseType: 'JSON object with success, projects, and total fields'
        });
        
        const response = {
            success: true,
            projects: projects,
            total: projects.length
        };
        
        console.log('📤 Sending response structure:', {
            hasSuccess: 'success' in response,
            hasProjects: 'projects' in response,
            projectsIsArray: Array.isArray(response.projects),
            projectsLength: response.projects.length,
            responseKeys: Object.keys(response)
        });
        
        res.json(response);
    } catch (error) {
        console.error('❌ Error fetching projects:', error);
        res.status(500).json({
            success: false,
            error: 'Database error',
            details: error.message || error
        });
    }
});

// Get project by ID
router.get('/:id', async (req, res) => {
    try {
        console.log('🔍 Fetching project by ID:', req.params.id);
        
        const projectsResult = await db.execute(`
            SELECT * FROM projects WHERE id = ?
        `, [req.params.id]);
        
        // Handle different MySQL2 return formats
        let projects = [];
        if (Array.isArray(projectsResult)) {
            projects = projectsResult;
        } else if (projectsResult && Array.isArray(projectsResult[0])) {
            projects = projectsResult[0];
        } else if (projectsResult && projectsResult.rows) {
            projects = projectsResult.rows;
        }
        
        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            project: projects[0]
        });
    } catch (error) {
        console.error('❌ Error fetching project:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch project',
            details: error.message
        });
    }
});

// Create new project
router.post('/', async (req, res) => {
    try {
        const { 
            name, code, client, type, location, 
            startDate, endDate, budget, manager, 
            description, keyDeliverables, priority 
        } = req.body;
        
        // Validate input
        if (!name || !client || !location || !startDate || !endDate || !budget || !manager) {
            return res.status(400).json({
                error: 'All required fields must be provided'
            });
        }
        
        // Insert project into database
        const result = await db.execute(`
            INSERT INTO projects (
                name, description, location, 
                start_date, end_date, status, contract_value, 
                key_deliverables, project_manager, client_name, project_code, project_type, 
                priority_level, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            name, 
            description || '', 
            location, 
            startDate, 
            endDate, 
            'Planning', 
            parseFloat(budget), 
            keyDeliverables || '',
            manager,
            client,
            code || null,
            type || null,
            priority || 'Medium'
        ]);
        
        // Get the created project
        const newProject = await db.execute(`
            SELECT * FROM projects WHERE id = ?
        `, [result.insertId]);
        
        notify('New Project Created', name + ' - Client: ' + client + ', Budget: TZS ' + parseFloat(budget).toLocaleString(), 'success');
        res.status(201).json({
            message: 'Project created successfully',
            project: {
                ...newProject[0],
                type: type || '',
                keyDeliverables: keyDeliverables || '',
                priority: priority || 'medium',
                milestones: [],
                progress: 0
            }
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            error: 'Failed to create project',
            details: error.message
        });
    }
});

// Update project
router.put('/:id', async (req, res) => {
    try {
        const { name, client, location, startDate, endDate, status, budget, progress, manager, description } = req.body;
        
        // Check if project exists
        const existingProjects = await db.execute('SELECT id FROM projects WHERE id = ?', [req.params.id]);
        
        if (existingProjects.length === 0) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }
        
        // Build dynamic update query
        const updateFields = [];
        const updateValues = [];
        
        if (name) {
            updateFields.push('name = ?');
            updateValues.push(name);
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }
        if (location) {
            updateFields.push('location = ?');
            updateValues.push(location);
        }
        if (startDate) {
            updateFields.push('start_date = ?');
            updateValues.push(startDate);
        }
        if (endDate) {
            updateFields.push('end_date = ?');
            updateValues.push(endDate);
        }
        if (status) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }
        if (budget) {
            updateFields.push('contract_value = ?');
            updateValues.push(parseFloat(budget));
        }
        if (progress !== undefined) {
            // Note: progress field doesn't exist in current table structure
            // This might need to be added to the table schema
            console.log('⚠️ Progress update requested but field not available in table');
        }
        
        updateFields.push('updated_at = NOW()');
        updateValues.push(req.params.id);
        
        const updateQuery = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`;
        
        await db.execute(updateQuery, updateValues);
        
        // Get updated project
        const updatedProjects = await db.execute(`
            SELECT * FROM projects WHERE id = ?
        `, [req.params.id]);
        
        notify('Project Updated', 'Project #' + req.params.id + ' updated' + (status ? ' - Status: ' + status : ''), 'info');
        res.json({
            message: 'Project updated successfully',
            project: updatedProjects[0]
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
            error: 'Failed to update project',
            details: error.message
        });
    }
});

// Delete project
router.delete('/:id', async (req, res) => {
    try {
        // Check if project exists
        const existingProjects = await db.execute('SELECT id FROM projects WHERE id = ?', [req.params.id]);
        
        if (existingProjects.length === 0) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }
        
        // Delete project
        await db.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
        
        notify('Project Deleted', 'Project #' + req.params.id + ' deleted', 'warning');
        res.json({
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({
            error: 'Failed to delete project',
            details: error.message
        });
    }
});

// Add milestone to project
router.post('/:id/milestones', async (req, res) => {
    try {
        const { name, date, description } = req.body;
        
        if (!name || !date) {
            return res.status(400).json({
                error: 'Milestone name and date are required'
            });
        }
        
        // Check if project exists
        const existingProjects = await db.execute('SELECT id FROM projects WHERE id = ?', [req.params.id]);
        
        if (existingProjects.length === 0) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }
        
        // For now, return a mock milestone since we don't have a milestones table
        const newMilestone = {
            id: Date.now(),
            name,
            date,
            description: description || '',
            completed: false
        };
        
        res.status(201).json({
            message: 'Milestone added successfully',
            milestone: newMilestone
        });
    } catch (error) {
        console.error('Error adding milestone:', error);
        res.status(500).json({
            error: 'Failed to add milestone',
            details: error.message
        });
    }
});

// Get project progress updates
router.get('/:id/progress', async (req, res) => {
    try {
        const projectId = req.params.id;
        
        // Check if project exists
        const projects = await db.execute('SELECT * FROM projects WHERE id = ?', [projectId]);
        
        if (projects.length === 0) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }
        
        // For now, return mock progress updates since we don't have a progress table
        const mockUpdates = [
            {
                id: 1,
                projectName: projects[0].name,
                progressPercentage: projects[0].actual_cost || 0,
                status: projects[0].status,
                report: 'Initial project setup completed',
                completedMilestones: 'Planning',
                nextMilestones: 'Foundation work',
                budgetUsed: projects[0].budget * 0.1,
                issues: 'None',
                createdAt: new Date().toISOString()
            }
        ];
        
        res.json({
            updates: mockUpdates,
            project: projects[0]
        });
    } catch (error) {
        console.error('Error fetching progress updates:', error);
        res.status(500).json({
            error: 'Failed to fetch progress updates',
            details: error.message
        });
    }
});

// Helper: ensure the project_progress_updates table exists AND has all required columns.
// Older deploys may have an earlier version of the table without some columns (e.g. `report`),
// and CREATE TABLE IF NOT EXISTS will not add them — so we explicitly ALTER for each.
async function ensureProgressUpdatesTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS project_progress_updates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT NOT NULL,
                progress_percentage DECIMAL(5,2) DEFAULT 0,
                status VARCHAR(50) NULL,
                report TEXT NULL,
                completed_milestones TEXT NULL,
                next_milestones TEXT NULL,
                budget_used DECIMAL(15,2) DEFAULT 0,
                issues TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_project_id (project_id),
                INDEX idx_created_at (created_at)
            )
        `);

        // Backfill missing columns on pre-existing tables
        const requiredCols = [
            { name: 'progress_percentage',  ddl: 'DECIMAL(5,2) DEFAULT 0' },
            { name: 'status',               ddl: 'VARCHAR(50) NULL' },
            { name: 'report',               ddl: 'TEXT NULL' },
            { name: 'completed_milestones', ddl: 'TEXT NULL' },
            { name: 'next_milestones',      ddl: 'TEXT NULL' },
            { name: 'budget_used',          ddl: 'DECIMAL(15,2) DEFAULT 0' },
            { name: 'issues',               ddl: 'TEXT NULL' },
            { name: 'created_at',           ddl: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
        ];
        const existing = asRows(await db.execute('SHOW COLUMNS FROM project_progress_updates'));
        const existingByName = new Map(existing.map(c => [c.Field, c]));
        for (const col of requiredCols) {
            const current = existingByName.get(col.name);
            if (!current) {
                try {
                    console.log(`🛠️ Adding missing column project_progress_updates.${col.name}`);
                    await db.execute(`ALTER TABLE project_progress_updates ADD COLUMN ${col.name} ${col.ddl}`);
                } catch (alterErr) {
                    console.warn(`⚠️ Could not add column ${col.name}:`, alterErr.message);
                }
            } else if (col.name === 'status') {
                // Old deploys defined `status` as a narrow ENUM/short VARCHAR which causes
                // "Data truncated for column 'status'" on insert. Widen it to VARCHAR(50) NULL.
                const type = String(current.Type || '').toLowerCase();
                if (type.startsWith('enum(') || (type.startsWith('varchar(') && !type.includes('(50)') && !type.includes('(100)') && !type.includes('(255)'))) {
                    try {
                        console.log(`🛠️ Widening project_progress_updates.status from ${current.Type} to VARCHAR(50) NULL`);
                        await db.execute('ALTER TABLE project_progress_updates MODIFY COLUMN status VARCHAR(50) NULL');
                    } catch (modErr) {
                        console.warn('⚠️ Could not widen status column:', modErr.message);
                    }
                }
            }
        }
    } catch (e) {
        console.warn('⚠️ Could not ensure project_progress_updates table:', e.message);
    }
}

// Normalize a MySQL2 result into a plain array of rows
function asRows(result) {
    if (Array.isArray(result) && Array.isArray(result[0])) return result[0];
    if (Array.isArray(result)) return result;
    if (result && Array.isArray(result.rows)) return result.rows;
    return [];
}

// Shared handler for saving a progress update (supports POST and PUT)
async function saveProgressUpdate(req, res) {
    try {
        const projectId = req.params.id;
        const {
            progressPercentage,
            status,
            report,
            progressReport,
            completedMilestones,
            nextMilestones,
            budgetUsed,
            issues
        } = req.body;

        await ensureProgressUpdatesTable();

        // Check if project exists
        const projects = asRows(await db.execute('SELECT * FROM projects WHERE id = ?', [projectId]));

        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const mappedStatus = status || projects[0].status;
        const finalReport = report || progressReport || null;
        const pct = parseFloat(progressPercentage);
        const budget = parseFloat(budgetUsed);

        // Insert into history table
        const insertResult = await db.execute(`
            INSERT INTO project_progress_updates
                (project_id, progress_percentage, status, report,
                 completed_milestones, next_milestones, budget_used, issues, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            projectId,
            isNaN(pct) ? 0 : pct,
            mappedStatus,
            finalReport,
            completedMilestones || null,
            nextMilestones || null,
            isNaN(budget) ? 0 : budget,
            issues || null
        ]);

        // Also update the parent project's latest status / actual_cost so the dashboard stays in sync
        try {
            await db.execute(`
                UPDATE projects SET
                    actual_cost = ?,
                    status = ?,
                    updated_at = NOW()
                WHERE id = ?
            `, [isNaN(pct) ? 0 : pct, mappedStatus, projectId]);
        } catch (e) {
            console.warn('⚠️ Could not update parent project row:', e.message);
        }

        res.status(201).json({
            success: true,
            message: 'Progress update saved successfully',
            projectId: projectId,
            updateId: insertResult && (insertResult.insertId || (insertResult[0] && insertResult[0].insertId)) || null,
            progressData: {
                projectId,
                projectName: projects[0].name,
                progressPercentage: pct,
                status: mappedStatus,
                report: finalReport,
                completedMilestones,
                nextMilestones,
                budgetUsed: budget,
                issues,
                createdAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error saving progress update:', error);
        res.status(500).json({
            error: 'Failed to save progress update',
            details: error.message
        });
    }
}

// Add project progress update (POST and PUT both supported)
router.post('/:id/progress', saveProgressUpdate);
router.put('/:id/progress', saveProgressUpdate);

// Get recent progress updates across all projects (joined with project name)
// NOTE: This path has two segments so it does NOT collide with GET /:id
router.get('/progress-updates/recent', async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    try {
        await ensureProgressUpdatesTable();

        // First try the full query with JOIN to projects for the project name
        let rows = [];
        try {
            rows = asRows(await db.execute(`
                SELECT
                    u.id,
                    u.project_id           AS projectId,
                    p.name                 AS projectName,
                    u.progress_percentage  AS progressPercentage,
                    u.status,
                    u.report,
                    u.completed_milestones AS completedMilestones,
                    u.next_milestones      AS nextMilestones,
                    u.budget_used          AS budgetUsed,
                    u.issues,
                    u.created_at           AS updateDate
                FROM project_progress_updates u
                LEFT JOIN projects p ON p.id = u.project_id
                ORDER BY u.created_at DESC
                LIMIT ${limit}
            `));
        } catch (joinErr) {
            // Fallback: query just the updates table without the JOIN (in case projects.name is missing)
            console.warn('⚠️ progress-updates JOIN query failed, retrying without join:', joinErr.message);
            rows = asRows(await db.execute(`
                SELECT
                    id,
                    project_id            AS projectId,
                    progress_percentage   AS progressPercentage,
                    status,
                    report,
                    completed_milestones  AS completedMilestones,
                    next_milestones       AS nextMilestones,
                    budget_used           AS budgetUsed,
                    issues,
                    created_at            AS updateDate
                FROM project_progress_updates
                ORDER BY created_at DESC
                LIMIT ${limit}
            `));
        }

        return res.json({
            success: true,
            updates: rows || [],
            total: (rows || []).length
        });
    } catch (error) {
        // Log full error server-side for Railway logs, but return 200 + empty list
        // so the frontend doesn't display a 500 in the console for an optional list.
        console.error('❌ Error fetching recent progress updates:', error && error.stack || error);
        return res.json({
            success: false,
            updates: [],
            total: 0,
            error: 'Failed to fetch recent progress updates',
            details: error && error.message
        });
    }
});

module.exports = router;
