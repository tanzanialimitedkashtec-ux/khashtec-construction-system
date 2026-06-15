const express = require('express');
const router = express.Router();
const { sendAssignmentNotification } = require('../utils/emailService');

console.log('📋 Tasks route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Tasks test endpoint accessed');
    res.json({ 
        message: 'Tasks API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully',
        debug: 'Tasks routes are loaded and responding'
    });
});

// Root endpoint - get all tasks
router.get('/', async (req, res) => {
    try {
        console.log('📋 Tasks root endpoint accessed');
        
        let tasks = [];
        
        try {
            const db = require('../../database/config/database');
            
            // Ensure tasks table exists
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS tasks (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        project_id INT NOT NULL,
                        task_name VARCHAR(255) NOT NULL,
                        task_description TEXT NULL,
                        assigned_to VARCHAR(255) NOT NULL,
                        task_priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
                        task_status ENUM('Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled') DEFAULT 'Not Started',
                        start_date DATE NOT NULL,
                        due_date DATE NOT NULL,
                        estimated_hours DECIMAL(5,2) NULL,
                        actual_hours DECIMAL(5,2) NULL,
                        completion_percentage DECIMAL(5,2) DEFAULT 0,
                        required_skills TEXT NULL,
                        task_materials TEXT NULL,
                        dependencies TEXT NULL,
                        created_by VARCHAR(255) NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_project_id (project_id),
                        INDEX idx_assigned_to (assigned_to),
                        INDEX idx_status (task_status),
                        INDEX idx_priority (task_priority),
                        INDEX idx_due_date (due_date),
                        INDEX idx_created_at (created_at)
                    )
                `);
                console.log('✅ Tasks table verified/created successfully');
            } catch (tableError) {
                console.log('⚠️ Could not create tasks table:', tableError.message);
            }
            
            const tasksResult = await db.execute(`
                SELECT t.*, p.name as project_name, p.project_code 
                FROM tasks t 
                LEFT JOIN projects p ON t.project_id = p.id 
                ORDER BY t.due_date ASC, t.task_priority DESC
            `);
            
            // Handle MySQL2 [rows, fields] format — check rows array FIRST
            if (tasksResult && Array.isArray(tasksResult[0])) {
                tasks = tasksResult[0];  // MySQL2: [rows, fields] → take rows
            } else if (tasksResult && tasksResult.rows) {
                tasks = tasksResult.rows; // PostgreSQL format
            } else if (Array.isArray(tasksResult)) {
                tasks = tasksResult;      // direct array fallback
            } else {
                tasks = [];
            }
            
            console.log('✅ Tasks fetched from DB:', tasks.length, 'records');
            
            console.log('✅ Tasks records fetched from database:', tasks.length);
        } catch (dbError) {
            console.error('❌ Database error fetching tasks:', dbError.message);
            // Return empty — never show fake/mock data
            tasks = [];
        }
        
        // Ensure all tasks have proper default values to prevent frontend errors
        const sanitizedTasks = tasks.map(task => ({
            id: task.id || 0,
            project_id: task.project_id || 0,
            task_name: task.task_name || 'Unknown Task',
            task_description: task.task_description || '',
            assigned_to: task.assigned_to || 'Unassigned',
            task_priority: task.task_priority || 'Medium',
            task_status: task.task_status || 'Not Started',
            start_date: task.start_date || '',
            due_date: task.due_date || '',
            estimated_hours: task.estimated_hours || 0,
            actual_hours: task.actual_hours || 0,
            completion_percentage: task.completion_percentage || 0,
            required_skills: task.required_skills || '',
            task_materials: task.task_materials || '',
            dependencies: task.dependencies || '',
            created_by: task.created_by || '',
            project_name: task.project_name || 'Unknown Project',
            project_code: task.project_code || '',
            created_at: task.created_at || '',
            updated_at: task.updated_at || ''
        }));
        
        res.json({
            success: true,
            tasks: sanitizedTasks,
            total: sanitizedTasks.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching tasks:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch tasks',
            details: error.message 
        });
    }
});

// Get task by ID
router.get('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        console.log('🔍 Fetching task:', taskId);
        
        let task = null;
        
        try {
            const db = require('../../database/config/database');
            const taskResult = await db.execute(`
                SELECT t.*, p.name as project_name, p.project_code 
                FROM tasks t 
                LEFT JOIN projects p ON t.project_id = p.id 
                WHERE t.id = ?
            `, [taskId]);
            
            // Fix: handle both MySQL2 [[rows],[fields]] and plain [rows] formats
            let taskRows;
            if (taskResult && Array.isArray(taskResult[0])) {
                taskRows = taskResult[0]; // MySQL2: [[row1,...], [fields]]
            } else if (Array.isArray(taskResult)) {
                taskRows = taskResult;    // Plain array: [row1, row2, ...]
            } else {
                taskRows = [];
            }

            console.log('🔍 GET /:id taskRows length:', taskRows.length);

            if (taskRows.length > 0) {
                task = taskRows[0];
                console.log('✅ Task found:', task.task_name);
            }
        } catch (dbError) {
            console.error('❌ Database error fetching task by ID:', dbError.message);
            task = null;
        }
        
        if (!task) {
            return res.status(404).json({ 
                success: false,
                error: 'Task not found' 
            });
        }
        
        res.json({
            success: true,
            task: task
        });
        
    } catch (error) {
        console.error('❌ Error fetching task:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch task',
            details: error.message 
        });
    }
});

// Create new task
router.post('/', async (req, res) => {
    try {
        console.log('📝 Task creation request received');
        console.log('📝 Request body:', req.body);
        
        const {
            project_id,
            task_name,
            task_description,
            assigned_to,
            task_priority,
            start_date,
            due_date,
            estimated_hours,
            required_skills,
            task_materials,
            dependencies,
            created_by
        } = req.body;
        
        // Validate required fields
        if (!project_id || !task_name || !assigned_to || !start_date || !due_date) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'project_id, task_name, assigned_to, start_date, and due_date are required'
            });
        }
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            const query = `
                INSERT INTO tasks (
                    project_id, task_name, task_description, assigned_to, task_priority,
                    task_status, start_date, due_date, estimated_hours, required_skills,
                    task_materials, dependencies, created_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            // Normalize priority to match DB Enum
            const priorityMap = {
                'urgent': 'Critical',
                'critical': 'Critical',
                'high': 'High',
                'medium': 'Medium',
                'low': 'Low'
            };
            const normalizedPriority = priorityMap[(task_priority || '').toLowerCase()] || 'Medium';

            const values = [
                project_id,
                task_name,
                task_description || null,
                assigned_to,
                normalizedPriority,
                'Not Started',
                start_date,
                due_date,
                estimated_hours || null,
                required_skills || null,
                task_materials || null,
                dependencies || null,
                created_by || null
            ];
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Task created successfully:', result);
            
            // Fetch the created task
            const createdTaskResult = await db.execute(`
                SELECT t.*, p.name as project_name, p.project_code 
                FROM tasks t 
                LEFT JOIN projects p ON t.project_id = p.id 
                WHERE t.id = ?
            `, [result.insertId]);
            
            const createdTask = Array.isArray(createdTaskResult) ? createdTaskResult[0] : createdTaskResult;
            
            try {
                let recipientEmail = null;
                if (assigned_to && assigned_to.includes('@')) {
                    recipientEmail = assigned_to;
                } else {
                    const [empRows] = await db.execute('SELECT gmail FROM employee_details WHERE full_name = ? OR gmail = ?', [assigned_to, assigned_to]);
                    if (empRows && empRows.length > 0 && empRows[0].gmail) {
                        recipientEmail = empRows[0].gmail;
                    }
                }

                if (recipientEmail) {
                    const details = [
                        { label: 'Task Name', value: task_name },
                        { label: 'Priority', value: normalizedPriority },
                        { label: 'Due Date', value: due_date },
                        { label: 'Project Name', value: (createdTask && createdTask[0] && createdTask[0].project_name) || 'Unknown' },
                        { label: 'Assigned By', value: created_by }
                    ];
                    sendAssignmentNotification(recipientEmail, details);
                }
            } catch (emailErr) {
                console.error('Failed to lookup email or send notification:', emailErr);
            }
            
            res.status(201).json({
                success: true,
                message: 'Task created successfully',
                taskId: result.insertId,
                task: createdTask[0]
            });
            
        } catch (dbError) {
            console.error('❌ Database error creating task:', dbError.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to save task to database',
                details: dbError.message
            });
        }
        
    } catch (error) {
        console.error('❌ Error creating task:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create task',
            details: error.message 
        });
    }
});

// Update task
router.put('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const updateData = req.body;
        
        console.log('🔄 Updating task:', taskId);
        console.log('📝 Update data:', updateData);
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Normalize priority to match DB Enum
            if (updateData.task_priority) {
                const priorityMap = {
                    'urgent': 'Critical',
                    'critical': 'Critical',
                    'high': 'High',
                    'medium': 'Medium',
                    'low': 'Low'
                };
                updateData.task_priority = priorityMap[updateData.task_priority.toLowerCase()] || 'Medium';
            }
            
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
            updateValues.push(taskId);
            
            const updateQuery = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`;
            
            const resultResult = await db.execute(updateQuery, updateValues);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Task updated successfully:', result);
            
            res.json({
                success: true,
                message: 'Task updated successfully',
                affected_rows: result.affectedRows
            });
            
        } catch (dbError) {
            console.error('❌ Database error updating task:', dbError.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to update task in database',
                details: dbError.message
            });
        }
        
    } catch (error) {
        console.error('❌ Error updating task:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update task',
            details: error.message 
        });
    }
});

// Delete task
router.delete('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        console.log('🗑️ Deleting task:', taskId);
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Check if task exists
            const taskResult = await db.execute('SELECT task_name FROM tasks WHERE id = ?', [taskId]);

            // Fix: handle both MySQL2 [[rows],[fields]] and plain [rows] formats
            let taskRows;
            if (taskResult && Array.isArray(taskResult[0])) {
                taskRows = taskResult[0]; // MySQL2 [[row1,...],[fields]]
            } else if (Array.isArray(taskResult)) {
                taskRows = taskResult;    // Plain [row1,...]
            } else {
                taskRows = [];
            }

            console.log('🗑️ DELETE taskRows length:', taskRows.length);

            if (taskRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }

            // Delete task
            const resultResult = await db.execute('DELETE FROM tasks WHERE id = ?', [taskId]);
            const result = Array.isArray(resultResult) && Array.isArray(resultResult[0])
                ? resultResult[0]
                : (Array.isArray(resultResult) ? resultResult : resultResult);

            console.log('✅ Task deleted successfully');

            res.json({
                success: true,
                message: 'Task deleted successfully',
                deleted_task: {
                    id: taskId,
                    task_name: (taskRows[0] && taskRows[0].task_name) || `Task #${taskId}`
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error deleting task:', dbError.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete task from database',
                details: dbError.message
            });
        }
        
    } catch (error) {
        console.error('❌ Error deleting task:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete task',
            details: error.message 
        });
    }
});

module.exports = router;
