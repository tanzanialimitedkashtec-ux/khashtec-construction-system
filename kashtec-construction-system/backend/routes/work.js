const express = require('express');
const router = express.Router();
const db = require('../src/config/database');

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

// Get all work items for a specific department
router.get('/:department', async (req, res) => {
    try {
        const { department } = req.params;
        console.log(`📋 Fetching ${department} work items`);
        const [workItems] = await db.execute(
            `SELECT * FROM ${department}_work ORDER BY submitted_date DESC`
        );
        console.log(`📊 Found ${workItems.length} ${department} work items`);
        res.json(workItems);
    } catch (error) {
        console.error(`Error fetching ${department} work items:`, error);
        res.status(500).json({ error: `Failed to fetch ${department} work items` });
    }
});

// Create new work item
router.post('/:department', async (req, res) => {
    try {
        console.log('🔍 Received work request:', req.params.department, req.body);
        console.log('📋 Request headers:', req.headers);
        console.log('🌐 Request URL:', req.url);
        console.log('📝 Request method:', req.method);
        
        const { department } = req.params;
        const {
            work_type,
            work_title,
            work_description,
            priority = 'Medium',
            due_date,
            assigned_to,
            // Department-specific fields
            amount, // Finance
            incident_type, severity, // HSE
            project_name, client_name, // Project
            property_address, property_type, sale_amount, // Real Estate
            affected_department, deadline // Admin
        } = req.body;
        
        console.log('📝 Extracted data:', { work_type, work_title, work_description, priority, incident_type, severity });
        
        // Validate required fields
        if (!work_type || !work_title || !work_description) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({
                error: 'Work type, title, and description are required',
                received: { work_type, work_title, work_description }
            });
        }
        
        // Build the INSERT query dynamically based on department
        let query = '';
        let values = [];
        let fields = [];
        
        // Common fields for all departments
        fields.push('department_code', 'work_type', 'work_title', 'work_description', 'priority', 'submitted_by', 'submitted_date');
        values.push(department.toUpperCase(), work_type, work_title, work_description, priority, 'System', new Date());
        
        // Add department-specific fields
        if (department === 'finance' && amount !== undefined) {
            fields.push('amount');
            values.push(amount);
        }
        
        if (department === 'hse') {
            if (incident_type) {
                fields.push('incident_type');
                values.push(incident_type);
            }
            if (severity) {
                fields.push('severity');
                values.push(severity);
            }
        }
        
        if (department === 'project') {
            if (project_name) {
                fields.push('project_name');
                values.push(project_name);
            }
            if (client_name) {
                fields.push('client_name');
                values.push(client_name);
            }
        }
        
        if (department === 'realestate') {
            if (property_address) {
                fields.push('property_address');
                values.push(property_address);
            }
            if (property_type) {
                fields.push('property_type');
                values.push(property_type);
            }
            if (sale_amount) {
                fields.push('sale_amount');
                values.push(sale_amount);
            }
        }
        
        if (department === 'admin') {
            if (affected_department) {
                fields.push('affected_department');
                values.push(affected_department);
            }
            if (deadline) {
                fields.push('deadline');
                values.push(deadline);
            }
        }
        
        // Optional common fields
        if (assigned_to) {
            fields.push('assigned_to');
            values.push(assigned_to);
        }
        
        if (due_date) {
            fields.push('due_date');
            values.push(due_date);
        }
        
        // Build the query
        const placeholders = fields.map(() => '?').join(', ');
        query = `INSERT INTO ${department}_work (${fields.join(', ')}) VALUES (${placeholders})`;
        
        console.log('🔨 Executing query:', query);
        console.log('📊 With values:', values);
        
        const [result] = await db.execute(query, values);
        
        console.log('✅ Database insert result:', result);
        
        // Return the created work item
        const [newWorkItem] = await db.execute(
            `SELECT * FROM ${department}_work WHERE id = ?`,
            [result.insertId]
        );
        
        console.log('📋 Retrieved new work item:', newWorkItem[0]);
        
        res.status(201).json({
            message: `${department} work item created successfully`,
            workItem: newWorkItem[0]
        });
        
    } catch (error) {
        console.error('❌ Error creating work item:', error);
        res.status(500).json({ 
            error: 'Failed to create work item',
            details: error.message 
        });
    }
});

// Update work item
router.put('/:department/:id', async (req, res) => {
    try {
        const { department, id } = req.params;
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

module.exports = router;
