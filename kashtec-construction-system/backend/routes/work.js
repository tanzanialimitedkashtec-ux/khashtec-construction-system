const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

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

// Get all work items for a specific department
router.get('/:department', async (req, res) => {
    try {
        let department = req.params.department;
        
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
        
        console.log(`📋 Fetching ${department} work items`);
        const [workItems] = await db.execute(
            `SELECT * FROM ${department}_work ORDER BY submitted_date DESC`
        );
        console.log(`📊 Found ${workItems.length} ${department} work items`);
        res.json(workItems);
    } catch (error) {
        console.error(`Error fetching work items:`, error);
        res.status(500).json({ error: `Failed to fetch work items` });
    }
});

// Create new work item
router.post('/:department', async (req, res) => {
    try {
        console.log('🔍 Work request received');
        console.log('📋 Request headers:', req.headers);
        console.log('🌐 Request URL:', req.url);
        console.log('📝 Request method:', req.method);
        console.log('📂 Department parameter:', req.params.department);
        console.log('📊 Request body:', req.body);
        
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
        
        const {
            work_type,
            work_title,
            work_description,
            priority = 'Medium',
            due_date,
            assigned_to,
            submitted_by,
            // Department-specific fields
            amount, // Finance
            incident_type, severity, location, // HSE
            employee_name, employee_email, // HR
            project_name, client_name, // Project
            property_name, property_type, // Real Estate
            affected_systems, // Admin
            // Additional fields
            status = 'pending'
        } = req.body;
        
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
        
        // Validate required fields
        if (!work_type || !work_title || !work_description) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields: work_type, work_title, work_description',
                received: { work_type, work_title, work_description }
            });
        }
        
        const validDepartments = ['hr', 'hse', 'finance', 'projects', 'realestate', 'admin'];
        if (!validDepartments.includes(department)) {
            console.log('❌ Invalid department:', department);
            return res.status(400).json({ 
                error: 'Invalid department',
                department
            });
        }
        
        // Map frontend work types to database ENUM values
        const getMappedWorkType = (department, workType) => {
            const mappings = {
                'hr': {
                    'Attendance Management': 'Attendance Tracking',
                    'Employee Registration': 'Employee Registration',
                    'Worker Account Creation': 'Worker Account Creation',
                    'Project Assignment': 'Project Assignment',
                    'Leave Management': 'Leave Management',
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
                    'Project Assignment': 'Task Assignment', // Map to Task Assignment since Project Assignment doesn't exist
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
                    'Policy Implementation': 'Policy Implementation',
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
        console.log('🔍 Original work_type length:', work_type ? work_type.length : 'undefined');
        console.log('🔍 Mapped work_type length:', mapped_work_type ? mapped_work_type.length : 'undefined');
        console.log('🔍 Mapped work_type chars:', mapped_work_type ? mapped_work_type.split('').map(c => `${c}(${c.charCodeAt(0)})`).join(' ') : 'undefined');
        
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
        
        if (department === 'finance' && amount) {
            additionalFields.push('amount');
            additionalValues.push(amount);
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
        
        query = `
            INSERT INTO ${department}_work (
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
