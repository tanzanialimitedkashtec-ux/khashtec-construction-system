const express = require('express');
const router = express.Router();
const db = require('../../../database/config/database');

// Get all employees
router.get('/', async (req, res) => {
    try {
        const [employees] = await db.execute('SELECT * FROM employees ORDER BY registration_date DESC');
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Create new employee
router.post('/', async (req, res) => {
    console.log('🔍 Employee registration request received');
    console.log('📋 Request body:', req.body);
    console.log('📋 Request headers:', req.headers);
    console.log('🌐 Request URL:', req.url);
    console.log('📝 Request method:', req.method);
    
    const { fullName, gmail, phone, department, jobCategory, status = 'active', nida, passport, contract } = req.body;
    
    console.log('📝 Extracted employee data:', { fullName, gmail, phone, department, jobCategory, status, nida, passport, contract });
    
    // Validate input
    if (!fullName || !gmail || !phone || !department || !jobCategory || !nida || !contract) {
        console.log('❌ Validation failed - missing required fields');
        console.log('📝 Missing fields:', {
            fullName: !fullName,
            gmail: !gmail,
            phone: !phone,
            department: !department,
            jobCategory: !jobCategory,
            nida: !nida,
            contract: !contract
        });
        return res.status(400).json({
            error: 'All required fields must be provided',
            received: { fullName, gmail, phone, department, jobCategory, nida, contract }
        });
    }
    
    try {
        console.log('🔍 Checking if employee already exists...');
        // Check if employee already exists
        const [existingEmployees] = await db.execute(
            'SELECT id FROM employees WHERE gmail = ? OR nida = ?',
            [gmail, nida]
        );
        
        console.log('📊 Existing employees check result:', existingEmployees);
        
        if (existingEmployees.length > 0) {
            console.log('❌ Employee already exists');
            return res.status(409).json({
                error: 'Employee with this email or NIDA number already exists'
            });
        }
        
        console.log('✅ Creating new employee...');
        // Create new employee
        const [result] = await db.execute(
            `INSERT INTO employees (full_name, gmail, phone, department, job_category, status, nida, passport, contract_type, registration_date, profile_image)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
            [
                fullName,
                gmail,
                phone,
                department,
                jobCategory,
                status,
                nida,
                passport || '',
                contract,
                ''
            ]
        );
        
        console.log('✅ Employee created successfully:', result);
        console.log('🆔 New employee ID:', result.insertId);
        
        // Return the created employee
        const [newEmployee] = await db.execute(
            'SELECT * FROM employees WHERE id = ?',
            [result.insertId]
        );
        
        console.log('📋 Retrieved new employee:', newEmployee[0]);
        
        res.status(201).json({
            message: 'Employee created successfully',
            employee: newEmployee[0],
            id: result.insertId
        });
        
    } catch (error) {
        console.error('❌ Error creating employee:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ 
            error: 'Failed to create employee',
            details: error.message 
        });
    }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
    try {
        const [employees] = await db.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);
        
        if (employees.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.json(employees[0]);
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

// Update employee
router.put('/:id', async (req, res) => {
    const { fullName, gmail, phone, department, jobCategory, status, nida, passport, contract } = req.body;
    
    try {
        // Check if employee exists
        const [existingEmployees] = await db.execute('SELECT id FROM employees WHERE id = ?', [req.params.id]);
        
        if (existingEmployees.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        // Build dynamic update query
        const updates = [];
        const values = [];
        
        if (fullName) {
            updates.push('full_name = ?');
            values.push(fullName);
        }
        if (gmail) {
            updates.push('gmail = ?');
            values.push(gmail);
        }
        if (phone) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (department) {
            updates.push('department = ?');
            values.push(department);
        }
        if (jobCategory) {
            updates.push('job_category = ?');
            values.push(jobCategory);
        }
        if (status) {
            updates.push('status = ?');
            values.push(status);
        }
        if (nida) {
            updates.push('nida = ?');
            values.push(nida);
        }
        if (passport !== undefined) {
            updates.push('passport = ?');
            values.push(passport);
        }
        if (contract) {
            updates.push('contract_type = ?');
            values.push(contract);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        values.push(req.params.id);
        
        await db.execute(
            `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        // Return updated employee
        const [updatedEmployee] = await db.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);
        
        res.json({
            message: 'Employee updated successfully',
            employee: updatedEmployee[0]
        });
        
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// Delete employee
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM employees WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.json({ message: 'Employee deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

// Get employee statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [totalEmployees] = await db.execute('SELECT COUNT(*) as total FROM employees');
        const [activeEmployees] = await db.execute('SELECT COUNT(*) as active FROM employees WHERE status = "active"');
        const [inactiveEmployees] = await db.execute('SELECT COUNT(*) as inactive FROM employees WHERE status = "inactive"');
        
        // Department breakdown
        const [departmentStats] = await db.execute('SELECT department, COUNT(*) as count FROM employees GROUP BY department');
        
        // Job category breakdown
        const [jobStats] = await db.execute('SELECT job_category, COUNT(*) as count FROM employees GROUP BY job_category');
        
        // Recent registrations
        const [recentRegistrations] = await db.execute('SELECT * FROM employees ORDER BY registration_date DESC LIMIT 5');
        
        res.json({
            total: totalEmployees[0].total,
            active: activeEmployees[0].active,
            inactive: inactiveEmployees[0].inactive,
            departments: departmentStats,
            jobCategories: jobStats,
            recentRegistrations: recentRegistrations
        });
    } catch (error) {
        console.error('Error fetching employee statistics:', error);
        res.status(500).json({ error: 'Failed to fetch employee statistics' });
    }
});

module.exports = router;
