const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await db.execute('SELECT id, name, email, role, department, status FROM users');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all projects
router.get('/projects', async (req, res) => {
    try {
        const projects = await db.execute(`
            SELECT p.*, u.name as manager_name 
            FROM projects p 
            LEFT JOIN users u ON p.manager_id = u.id
        `);
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all employees
router.get('/employees', async (req, res) => {
    try {
        const employees = await db.execute(`
            SELECT e.*, u.name, u.email, u.phone 
            FROM employees e 
            LEFT JOIN users u ON e.user_id = u.id
        `);
        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all properties
router.get('/properties', async (req, res) => {
    try {
        const properties = await db.execute(`
            SELECT p.*, u.name as agent_name 
            FROM properties p 
            LEFT JOIN users u ON p.agent_id = u.id
        `);
        res.json({ success: true, data: properties });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get financial transactions
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await db.execute(`
            SELECT ft.*, u1.name as created_by_name, u2.name as approved_by_name 
            FROM financial_transactions ft 
            LEFT JOIN users u1 ON ft.created_by = u1.id 
            LEFT JOIN users u2 ON ft.approved_by = u2.id
            ORDER BY ft.date DESC
        `);
        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get HSE incidents
router.get('/incidents', async (req, res) => {
    try {
        const incidents = await db.execute(`
            SELECT hi.*, u.name as reported_by_name, p.name as project_name 
            FROM hse_incidents hi 
            LEFT JOIN users u ON hi.reported_by = u.id 
            LEFT JOIN projects p ON hi.project_id = p.id
            ORDER BY hi.incident_date DESC
        `);
        res.json({ success: true, data: incidents });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add new user
router.post('/users', async (req, res) => {
    try {
        const { name, email, phone, location, role, department, password } = req.body;
        
        // Check if user exists
        const existing = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }
        
        const result = await db.execute(`
            INSERT INTO users (name, email, phone, location, role, department, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [name, email, phone, location, role, department, password]);
        
        res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all projects
router.get('/projects', async (req, res) => {
    try {
        console.log(' Fetching all projects...');
        
        const [projects] = await db.execute(`
            SELECT p.id, p.name, p.code, p.client_name, p.type, p.start_date, p.end_date, 
                   p.contract_value, p.manager, p.status, p.created_at,
                   COALESCE(ppu.progress_percentage, 0) as progress_percentage
            FROM projects p
            LEFT JOIN project_progress_updates ppu ON p.id = ppu.project_id
            LEFT JOIN (
                SELECT project_id, MAX(update_date) as latest_update
                FROM project_progress_updates
                GROUP BY project_id
            ) latest ON p.id = latest.project_id AND ppu.update_date = latest.latest_update
            ORDER BY p.created_at DESC
        `);
        
        console.log(' Projects retrieved successfully:', projects.length);
        
        res.json({ 
            success: true, 
            projects: projects 
        });
        
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add new project
router.post('/projects', async (req, res) => {
    try {
        const { 
            name, 
            code, 
            client_name, 
            type, 
            start_date, 
            end_date, 
            contract_value, 
            manager, 
            description,
            key_deliverables,
            priority_level,
            site_location
        } = req.body;
        
        console.log(' Creating new project...', req.body);
        
        // Validate required fields
        if (!name || !code || !client_name || !type || !start_date || !contract_value || !manager) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields',
                required: ['name', 'code', 'client_name', 'type', 'start_date', 'contract_value', 'manager']
            });
        }
        
        const result = await db.execute(`
            INSERT INTO projects (name, code, client_name, type, start_date, end_date, contract_value, manager, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, code, client_name, type, start_date, end_date, contract_value, manager, description]);
        
        const projectId = result.insertId;
        
        console.log(' Project created successfully:', projectId);
        
        res.status(201).json({ 
            success: true, 
            message: 'Project created successfully',
            project: {
                id: projectId,
                name,
                code,
                client_name,
                type,
                start_date,
                end_date,
                contract_value,
                manager,
                description,
                status: 'planning',
                created_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get project by ID
router.get('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(' Fetching project details for ID:', id);
        
        // Get project details
        const [projects] = await db.execute(`
            SELECT id, name, code, client_name, type, start_date, end_date, 
                   contract_value, manager, description, status, created_at, updated_at
            FROM projects 
            WHERE id = ?
        `, [id]);
        
        if (projects.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Project not found' 
            });
        }
        
        const project = projects[0];
        
        // Get latest progress update
        const [progressUpdates] = await db.execute(`
            SELECT progress_percentage, status, progress_report, 
                   completed_milestones, next_milestones, budget_used, issues, 
                   update_date, updated_by
            FROM project_progress_updates 
            WHERE project_id = ? 
            ORDER BY update_date DESC 
            LIMIT 1
        `, [id]);
        
        // Add progress data to project
        if (progressUpdates.length > 0) {
            project.progress_percentage = progressUpdates[0].progress_percentage;
            project.progress_status = progressUpdates[0].status;
            project.progress_report = progressUpdates[0].progress_report;
            project.completed_milestones = progressUpdates[0].completed_milestones;
            project.next_milestones = progressUpdates[0].next_milestones;
            project.budget_used = progressUpdates[0].budget_used;
            project.issues = progressUpdates[0].issues;
            project.last_update_date = progressUpdates[0].update_date;
            project.last_updated_by = progressUpdates[0].updated_by;
        } else {
            project.progress_percentage = 0;
            project.progress_status = 'on-track';
            project.progress_report = null;
            project.completed_milestones = null;
            project.next_milestones = null;
            project.budget_used = 0;
            project.issues = null;
            project.last_update_date = null;
            project.last_updated_by = null;
        }
        
        console.log(' Project details retrieved successfully:', project.name);
        
        res.json({ 
            success: true, 
            project: project 
        });
        
    } catch (error) {
        console.error('Error fetching project details:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update project status
router.put('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, actual_cost } = req.body;
        
        await db.execute(`
            UPDATE projects SET status = ?, actual_cost = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [status, actual_cost, id]);
        
        res.json({ success: true, message: 'Project updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update project progress
router.put('/projects/:id/progress', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            progressPercentage, 
            status, 
            progressReport, 
            completedMilestones, 
            nextMilestones, 
            budgetUsed, 
            issues,
            updateDate,
            updatedBy = 'Project Manager'
        } = req.body;
        
        console.log(' Updating project progress for project:', id, req.body);
        
        // Validate required fields
        if (!progressPercentage || !status) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields',
                required: ['progressPercentage', 'status']
            });
        }
        
        // Insert progress update
        const result = await db.execute(`
            INSERT INTO project_progress_updates (
                project_id, progress_percentage, status, progress_report, 
                completed_milestones, next_milestones, budget_used, issues, 
                update_date, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, 
            progressPercentage, 
            status, 
            progressReport, 
            completedMilestones, 
            nextMilestones, 
            budgetUsed, 
            issues, 
            updateDate || new Date().toISOString(), 
            updatedBy
        ]);
        
        // Update main project status and progress
        await db.execute(`
            UPDATE projects 
            SET status = CASE 
                WHEN ? = 'completed' THEN 'completed'
                WHEN ? = 'on-hold' THEN 'on_hold'
                WHEN ? = 'delayed' THEN 'in_progress'
                ELSE 'in_progress'
            END,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [status, status, status, id]);
        
        const progressId = result.insertId;
        
        console.log(' Project progress updated successfully:', progressId);
        
        res.json({ 
            success: true, 
            message: 'Project progress updated successfully',
            progress: {
                id: progressId,
                project_id: parseInt(id),
                progress_percentage: progressPercentage,
                status,
                progress_report: progressReport,
                completed_milestones: completedMilestones,
                next_milestones: nextMilestones,
                budget_used: budgetUsed,
                issues,
                updated_by: updatedBy,
                update_date: updateDate || new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error updating project progress:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add financial transaction
router.post('/transactions', async (req, res) => {
    try {
        const { type, category, description, amount, date, created_by } = req.body;
        
        const result = await db.execute(`
            INSERT INTO financial_transactions (type, category, description, amount, date, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [type, category, description, amount, date, created_by]);
        
        res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        const [userCount, projectCount, propertyCount, transactionSum] = await Promise.all([
            db.execute('SELECT COUNT(*) as count FROM users'),
            db.execute('SELECT COUNT(*) as count FROM projects'),
            db.execute('SELECT COUNT(*) as count FROM properties'),
            db.execute('SELECT SUM(amount) as total FROM financial_transactions WHERE type = "Income"')
        ]);
        
        res.json({
            success: true,
            data: {
                users: userCount[0].count,
                projects: projectCount[0].count,
                properties: propertyCount[0].count,
                total_income: transactionSum[0].total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
