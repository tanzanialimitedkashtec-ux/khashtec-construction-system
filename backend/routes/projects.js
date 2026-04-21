const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all projects
router.get('/', async (req, res) => {
    try {
        const { status, manager, search } = req.query;
        
        let query = `
            SELECT p.*, 
                   c.name as client_name,
                   m.name as manager_name
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            LEFT JOIN employees m ON p.manager_id = m.id
            WHERE 1=1
        `;
        const params = [];
        
        if (status) {
            query += ` AND p.status = ?`;
            params.push(status);
        }
        
        if (search) {
            query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.location LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        query += ` ORDER BY p.created_at DESC`;
        
        const projects = await db.execute(query, params);
        
        res.json({
            projects: projects,
            total: projects.length
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            error: 'Failed to fetch projects',
            details: error.message
        });
    }
});

// Get project by ID
router.get('/:id', async (req, res) => {
    try {
        const projects = await db.execute(`
            SELECT p.*, 
                   c.name as client_name,
                   m.name as manager_name
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            LEFT JOIN employees m ON p.manager_id = m.id
            WHERE p.id = ?
        `, [req.params.id]);
        
        if (projects.length === 0) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }
        
        res.json(projects[0]);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({
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
                start_date, end_date, status, budget, 
                manager_id, client_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            name, 
            description || '', 
            location, 
            startDate, 
            endDate, 
            'planning', 
            parseFloat(budget), 
            1, // manager_id (temporary - should be resolved from manager name)
            1  // client_id (temporary - should be resolved from client name)
        ]);
        
        // Get the created project
        const newProject = await db.execute(`
            SELECT p.*, 
                   c.name as client_name,
                   m.name as manager_name
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            LEFT JOIN employees m ON p.manager_id = m.id
            WHERE p.id = ?
        `, [result.insertId]);
        
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
            updateFields.push('budget = ?');
            updateValues.push(parseFloat(budget));
        }
        if (progress !== undefined) {
            updateFields.push('actual_cost = ?'); // Using actual_cost field for progress temporarily
            updateValues.push(parseFloat(progress));
        }
        
        updateFields.push('updated_at = NOW()');
        updateValues.push(req.params.id);
        
        const updateQuery = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`;
        
        await db.execute(updateQuery, updateValues);
        
        // Get updated project
        const updatedProjects = await db.execute(`
            SELECT p.*, 
                   c.name as client_name,
                   m.name as manager_name
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            LEFT JOIN employees m ON p.manager_id = m.id
            WHERE p.id = ?
        `, [req.params.id]);
        
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

module.exports = router;
