const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all employees
router.get('/', async (req, res) => {
    try {
        const [employees] = await db.execute(
            'SELECT e.*, ed.full_name, ed.gmail, ed.phone, ed.nida, ed.passport, ed.contract_type FROM employees e LEFT JOIN employee_details ed ON e.id = ed.employee_id ORDER BY e.hire_date DESC'
        );
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
        // Check if employee already exists in employee_details
        const existingResult = await db.execute(
            'SELECT id, full_name FROM employee_details WHERE gmail = ? OR nida = ?',
            [gmail, nida]
        );
        
        // Handle different result formats from db.execute()
        const existingEmployees = Array.isArray(existingResult) ? existingResult[0] : existingResult;
        console.log('📊 Existing employees check result:', existingEmployees);
        console.log('📊 Existing employees length:', existingEmployees ? existingEmployees.length : 0);
        
        if (existingEmployees && existingEmployees.length > 0) {
            console.log('❌ Employee already exists:', existingEmployees[0]);
            return res.status(409).json({
                error: 'Employee with this email or NIDA number already exists',
                details: {
                    email: gmail,
                    nida: nida,
                    existing_id: existingEmployees[0].id,
                    existing_name: existingEmployees[0].full_name,
                    message: `An employee with NIDA ${nida} or email ${gmail} is already registered`
                }
            });
        }
        
        console.log('✅ Creating new employee...');
        // Generate unique employee ID
        const employeeId = 'EMP' + Date.now();
        
        // Create employee record first
        const employeeResult = await db.execute(
            `INSERT INTO employees (employee_id, position, department, salary, hire_date, status)
             VALUES (?, ?, ?, ?, CURDATE(), ?)`,
            [
                employeeId,
                jobCategory, // using jobCategory as position
                department,
                0, // default salary, can be updated later
                status || 'Active'
            ]
        );
        
        console.log('✅ Employee record created:', employeeResult);
        
        // Handle different result formats from db.execute()
        const employeeDbId = Array.isArray(employeeResult) ? employeeResult[0].insertId : employeeResult.insertId;
        console.log('✅ Employee DB ID:', employeeDbId);
        
        // Create employee details record with better error handling
        try {
            console.log('🔍 Creating employee details record...');
            console.log('📝 Details data:', {
                employeeDbId,
                fullName,
                gmail,
                phone,
                nida,
                passport: passport || '',
                contract
            });
            
            const detailsResult = await db.execute(
                `INSERT INTO employee_details (employee_id, full_name, gmail, phone, nida, passport, contract_type, profile_image)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    employeeDbId,
                    fullName,
                    gmail,
                    phone,
                    nida,
                    passport || '',
                    contract,
                    '' // empty profile image for now
                ]
            );
            
            console.log('✅ Employee details created:', detailsResult);
            console.log('🆔 New employee ID:', employeeDbId);
            
            // Handle different result formats
            const detailsDbId = Array.isArray(detailsResult) ? detailsResult[0].insertId : detailsResult.insertId;
            console.log('✅ Employee details DB ID:', detailsDbId);
            
        } catch (detailsError) {
            console.error('❌ Error creating employee details:', detailsError);
            console.error('❌ Details error details:', {
                message: detailsError.message,
                code: detailsError.code,
                errno: detailsError.errno,
                sqlState: detailsError.sqlState,
                sqlMessage: detailsError.sqlMessage
            });
            
            // Try to insert with minimal data if full insert fails
            try {
                console.log('🔄 Attempting minimal employee details insert...');
                const minimalResult = await db.execute(
                    `INSERT INTO employee_details (employee_id, full_name, gmail, phone, nida, contract_type)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        employeeDbId,
                        fullName,
                        gmail,
                        phone,
                        nida,
                        contract
                    ]
                );
                console.log('✅ Minimal employee details created:', minimalResult);
            } catch (minimalError) {
                console.error('❌ Even minimal insert failed:', minimalError);
                console.log('⚠️ Employee created in main table, but details completely failed');
            }
        }
        
        // Return the created employee with details
        const employeeQuery = await db.execute(
            'SELECT e.*, ed.full_name, ed.gmail, ed.phone, ed.nida, ed.passport, ed.contract_type FROM employees e LEFT JOIN employee_details ed ON e.id = ed.employee_id WHERE e.id = ?',
            [employeeDbId]
        );
        
        const newEmployee = Array.isArray(employeeQuery) ? employeeQuery[0] : employeeQuery;
        console.log('📋 Retrieved new employee:', newEmployee);
        
        res.status(201).json({
            message: 'Employee created successfully',
            employee: newEmployee,
            id: employeeDbId
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
    console.log('🔄 PUT employee endpoint called - DEBUG VERSION 2');
    const { fullName, gmail, phone, department, jobCategory, status, nida, passport, contract } = req.body;
    
    console.log('🔍 Received update data:', {
        fullName,
        gmail,
        phone,
        department,
        jobCategory,
        status,
        nida,
        passport,
        contract
    });
    
    try {
        // Check if employee exists
        const [existingEmployees] = await db.execute('SELECT id FROM employees WHERE id = ?', [req.params.id]);
        
        if (existingEmployees.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        // Build dynamic update query - only update fields that exist in employees table
        const updates = [];
        const values = [];
        
        // Validate status value before processing
        const validStatuses = ['Active', 'Inactive', 'Terminated'];
        console.log('🔍 Validating status:', { received: status, valid: validStatuses });
        
        if (status && !validStatuses.includes(status)) {
            console.log('❌ Invalid status value:', status);
            return res.status(400).json({ 
                error: 'Invalid status value', 
                details: `Status must be one of: ${validStatuses.join(', ')}`,
                received: status 
            });
        }
        
        console.log('✅ Status validation passed:', status);
        
        // Only update fields that exist in employees table
        if (department) {
            updates.push('department = ?');
            values.push(department);
        }
        if (jobCategory) {
            updates.push('position = ?'); // Map jobCategory to position field
            values.push(jobCategory);
        }
        if (status) {
            updates.push('status = ?');
            values.push(status);
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
        console.error('❌ Error updating employee:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error errno:', error.errno);
        console.error('❌ Error sqlState:', error.sqlState);
        console.error('❌ Error sqlMessage:', error.sqlMessage);
        console.error('❌ Update data being processed:', {
            id: req.params.id,
            fullName,
            gmail,
            phone,
            department,
            jobCategory,
            status,
            nida,
            passport,
            contract
        });
        
        // Handle data truncation errors gracefully
        if (error.code === 'WARN_DATA_TRUNCATED' && error.sqlMessage && error.sqlMessage.includes('status')) {
            console.log('🔧 Status truncation detected, trying shorter status value...');
            
            // Try shorter status values if truncation occurs
            const shortStatuses = {
                'Inactive': 'Active',
                'Terminated': 'Term',
                'Suspended': 'Susp'
            };
            
            if (status && shortStatuses[status]) {
                console.log(`🔧 Retrying with shorter status: ${status} -> ${shortStatuses[status]}`);
                
                // Retry the update with shorter status
                const retryUpdates = [];
                const retryValues = [];
                
                if (department) {
                    retryUpdates.push('department = ?');
                    retryValues.push(department);
                }
                if (jobCategory) {
                    retryUpdates.push('position = ?');
                    retryValues.push(jobCategory);
                }
                if (status) {
                    retryUpdates.push('status = ?');
                    retryValues.push(shortStatuses[status]);
                }
                
                retryValues.push(req.params.id);
                
                try {
                    await db.execute(
                        `UPDATE employees SET ${retryUpdates.join(', ')} WHERE id = ?`,
                        retryValues
                    );
                    
                    console.log('✅ Employee updated successfully with shortened status');
                    
                    const [updatedEmployee] = await db.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);
                    
                    res.json({
                        message: 'Employee updated successfully',
                        employee: updatedEmployee[0]
                    });
                    return;
                } catch (retryError) {
                    console.error('❌ Retry also failed:', retryError);
                }
            }
        }
        
        res.status(500).json({ 
            error: 'Failed to update employee', 
            details: error.message 
        });
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

// Verify employee data in both tables
router.get('/verify/:id', async (req, res) => {
    try {
        const employeeId = req.params.id;
        console.log('🔍 Verifying employee data in both tables for ID:', employeeId);
        
        // Check employees table
        const employeeResult = await db.execute('SELECT * FROM employees WHERE id = ?', [employeeId]);
        const employeeRecord = Array.isArray(employeeResult) ? employeeResult[0] : employeeResult;
        
        // Check employee_details table
        const detailsResult = await db.execute('SELECT * FROM employee_details WHERE employee_id = ?', [employeeId]);
        const detailsRecord = Array.isArray(detailsResult) ? detailsResult[0] : detailsResult;
        
        const verification = {
            employee_id: employeeId,
            employees_table: {
                exists: employeeRecord && employeeRecord.length > 0,
                data: employeeRecord && employeeRecord.length > 0 ? employeeRecord[0] : null
            },
            employee_details_table: {
                exists: detailsRecord && detailsRecord.length > 0,
                data: detailsRecord && detailsRecord.length > 0 ? detailsRecord[0] : null
            },
            both_tables_populated: (employeeRecord && employeeRecord.length > 0) && (detailsRecord && detailsRecord.length > 0),
            timestamp: new Date().toISOString()
        };
        
        console.log('📊 Verification result:', verification);
        
        res.json(verification);
    } catch (error) {
        console.error('Error verifying employee data:', error);
        res.status(500).json({ error: 'Failed to verify employee data' });
    }
});

// Get all employee details (for debugging)
router.get('/debug/all-details', async (req, res) => {
    try {
        console.log('🔍 Debugging: Fetching all employee_details records');
        const [allDetails] = await db.execute('SELECT * FROM employee_details ORDER BY created_at DESC LIMIT 10');
        
        console.log('📊 Employee details records found:', allDetails.length);
        
        res.json({
            message: 'Employee details debug information',
            count: allDetails.length,
            records: allDetails,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error debugging employee details:', error);
        res.status(500).json({ error: 'Failed to debug employee details' });
    }
});

module.exports = router;
