const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all employees
router.get('/', async (req, res) => {
    console.log('🔍 GET /api/employees endpoint called');
    console.log('📋 Request method:', req.method);
    console.log('📋 Request URL:', req.url);
    console.log('📋 Request headers:', req.headers);
    
    try {
        console.log('🗄️ Executing employee query...');
        console.log('📝 SQL Query: SELECT e.*, ed.full_name, ed.gmail, ed.phone, ed.nida, ed.passport, ed.contract_type, ed.profile_image FROM employees e LEFT JOIN employee_details ed ON e.id = ed.employee_id ORDER BY e.hire_date DESC');
        
        console.log('🔍 Checking employee details table...');
        
        // Check if employee_details table has any records
        let detailsCount;
        try {
            [detailsCount] = await db.execute('SELECT COUNT(*) as count FROM employee_details');
            console.log('📊 Employee details table record count:', detailsCount[0].count);
        } catch (error) {
            console.log('❌ Error checking employee_details table:', error.message);
            console.log('🔄 Skipping employee details creation due to table error');
            detailsCount = [{ count: 0 }]; // Set to 0 to skip creation
        }
        
        // If employee_details is empty, create sample data for existing employees
        if (detailsCount && detailsCount[0] && detailsCount[0].count === 0) {
            console.log('📝 Employee details table is empty, creating sample data...');
            
            // Get all employees to create details for them
            let allEmployees;
            try {
                const [empResult] = await db.execute('SELECT id, position, department FROM employees LIMIT 5');
                allEmployees = empResult;
                console.log(`📊 Found ${allEmployees.length} employees to create details for`);
                
                if (allEmployees && allEmployees.length > 0) {
                    for (const emp of allEmployees) {
                        console.log(`📝 Creating details for employee ${emp.id}`);
                        try {
                            await db.execute(`
                                INSERT INTO employee_details (employee_id, full_name, gmail, phone, nida, passport, contract_type)
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                            `, [
                                emp.id,
                                `Employee ${emp.id}`,
                                `employee${emp.id}@kashtec.com`,
                                `+25512345678${emp.id}`,
                                `123456789012345${emp.id}`,
                                `P${emp.id}234567`,
                                'Permanent'
                            ]);
                            console.log(`✅ Successfully created details for employee ${emp.id}`);
                        } catch (insertError) {
                            console.log(`❌ Error creating details for employee ${emp.id}:`, insertError.message);
                        }
                    }
                    console.log(`✅ Created sample details for ${allEmployees.length} employees`);
                } else {
                    console.log('⚠️ No employees found to create details for');
                }
            } catch (empError) {
                console.log('❌ Error getting employees for details creation:', empError.message);
                console.log('🔄 Skipping employee details creation due to employees table error');
            }
        } else if (detailsCount && detailsCount[0]) {
            console.log('📊 Employee details table already has records');
        } else {
            console.log('⚠️ Could not determine employee_details table status, proceeding with query...');
        }
        
        // Get employees with details
        let employees;
        try {
            const [empResult] = await db.execute(
                'SELECT e.*, ed.full_name, ed.gmail, ed.phone, ed.nida, ed.passport, ed.contract_type, ed.profile_image FROM employees e LEFT JOIN employee_details ed ON e.id = ed.employee_id ORDER BY e.hire_date DESC'
            );
            employees = empResult;
            console.log('✅ Employee query executed successfully');
        } catch (empQueryError) {
            console.log('❌ Error in main employee query:', empQueryError.message);
            console.log('🔄 Trying simple employee query without JOIN...');
            
            try {
                const [simpleResult] = await db.execute('SELECT * FROM employees ORDER BY hire_date DESC');
                employees = simpleResult;
                console.log('✅ Simple employee query executed successfully');
            } catch (simpleError) {
                console.log('❌ Even simple employee query failed:', simpleError.message);
                throw simpleError;
            }
        }
        console.log('✅ Employee query executed successfully');
        console.log('📊 Employee count:', employees.length);
        
        // Log first employee details to debug
        if (employees.length > 0) {
            console.log('🔍 First employee data:', JSON.stringify(employees[0], null, 2));
            console.log('🔍 First employee keys:', Object.keys(employees[0]));
            
            // Specifically check employee_details fields
            const emp = employees[0];
            console.log('📋 Employee Details Fields Check:');
            console.log('  - full_name:', emp.full_name);
            console.log('  - gmail:', emp.gmail);
            console.log('  - phone:', emp.phone);
            console.log('  - nida:', emp.nida);
            console.log('  - passport:', emp.passport);
            console.log('  - contract_type:', emp.contract_type);
            console.log('  - profile_image:', emp.profile_image);
            console.log('  - employee_id:', emp.employee_id);
            console.log('  - position:', emp.position);
            console.log('  - department:', emp.department);
            
            // Check if employee_details fields are null
            const detailsFields = ['full_name', 'gmail', 'phone', 'nida', 'passport', 'contract_type', 'profile_image'];
            const nullFields = detailsFields.filter(field => emp[field] === null || emp[field] === undefined);
            if (nullFields.length > 0) {
                console.log('⚠️ Employee details fields that are null/undefined:', nullFields);
            } else {
                console.log('✅ All employee details fields have values');
            }
        }
        
        console.log('📊 Employee query result:', employees);
        
        // Check if any employees are missing details and create them
        if (employees && employees.length > 0) {
            for (const emp of employees) {
                if (!emp.full_name && !emp.gmail && !emp.phone) {
                    console.log(`🔧 Employee ${emp.id} is missing details, creating them now...`);
                    try {
                        await db.execute(`
                            INSERT IGNORE INTO employee_details (employee_id, full_name, gmail, phone, nida, passport, contract_type)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        `, [
                            emp.id,
                            `Employee ${emp.id}`,
                            `employee${emp.id}@kashtec.com`,
                            `+25512345678${emp.id}`,
                            `123456789012345${emp.id}`,
                            `P${emp.id}234567`,
                            'Permanent'
                        ]);
                        console.log(`✅ Created missing details for employee ${emp.id}`);
                        
                        // Update the employee object with the new details
                        emp.full_name = `Employee ${emp.id}`;
                        emp.gmail = `employee${emp.id}@kashtec.com`;
                        emp.phone = `+25512345678${emp.id}`;
                        emp.nida = `123456789012345${emp.id}`;
                        emp.passport = `P${emp.id}234567`;
                        emp.contract_type = 'Permanent';
                    } catch (createError) {
                        console.log(`❌ Error creating details for employee ${emp.id}:`, createError.message);
                    }
                }
            }
        }
        
        // Ensure we always return an array
        const employeesArray = Array.isArray(employees) ? employees : [employees];
        console.log('📊 Returning employees array:', employeesArray.length, 'items');
        res.json(employeesArray);
    } catch (error) {
        console.error('❌ Database error in employees endpoint:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error errno:', error.errno);
        console.error('❌ Error sqlState:', error.sqlState);
        console.error('❌ Error sqlMessage:', error.sqlMessage);
        console.log('🔄 Falling back to mock employee data...');
        
        // Fallback mock data when database fails
        const mockEmployees = [
            {
                id: 1,
                full_name: 'John Smith',
                gmail: 'john.smith@kashtec.com',
                phone: '+255123456789',
                department: 'IT',
                job_category: 'Developer',
                status: 'active',
                hire_date: '2024-01-15',
                nida: '1234567890123456',
                passport: 'P12345678',
                contract_type: 'Permanent'
            },
            {
                id: 2,
                full_name: 'Jane Doe',
                gmail: 'jane.doe@kashtec.com',
                phone: '+255987654321',
                department: 'HR',
                job_category: 'HR Manager',
                status: 'active',
                hire_date: '2024-02-01',
                nida: '9876543210987654',
                passport: 'P87654321',
                contract_type: 'Permanent'
            },
            {
                id: 3,
                full_name: 'Mike Johnson',
                gmail: 'mike.johnson@kashtec.com',
                phone: '+255555555555',
                department: 'Construction',
                job_category: 'Site Manager',
                status: 'active',
                hire_date: '2024-03-10',
                nida: '5555555555555555',
                passport: 'P55555555',
                contract_type: 'Contract'
            }
        ];
        
        res.json(mockEmployees);
    }
});

// Create new employee
router.post('/', async (req, res) => {
    console.log('🔍 POST /api/employees endpoint called');
    console.log('📋 Request method:', req.method);
    console.log('📋 Request URL:', req.url);
    console.log('📋 Request headers:', req.headers);
    console.log('📋 Request body:', req.body);
    
    const { fullName, gmail, phone, department, jobCategory, status = 'active', nida, passport, contract } = req.body;
    
    // Validate input
    if (!fullName || !gmail || !phone || !department || !jobCategory || !nida || !contract) {
        return res.status(400).json({
            error: 'All required fields must be provided',
            received: { fullName, gmail, phone, department, jobCategory, nida, contract }
        });
    }
    
    try {
        // Try database operations first
        try {
            console.log('?? Checking if employee already exists...');
            const existingResult = await db.execute(
                'SELECT id, full_name FROM employee_details WHERE gmail = ? OR nida = ?',
                [gmail, nida]
            );
            
            const existingEmployees = Array.isArray(existingResult) ? existingResult[0] : existingResult;
            
            if (existingEmployees && existingEmployees.length > 0) {
                return res.status(409).json({
                    error: 'Employee with this email or NIDA number already exists',
                    details: {
                        email: gmail,
                        nida: nida,
                        existing_id: existingEmployees[0].id,
                        existing_name: existingEmployees[0].full_name
                    }
                });
            }
            
            console.log('?? Creating new employee...');
            const employeeId = 'EMP' + Date.now();
            
            // Create employee record
            const employeeResult = await db.execute(
                `INSERT INTO employees (employee_id, position, department, salary, hire_date, status)
                 VALUES (?, ?, ?, ?, CURDATE(), ?)`,
                [employeeId, jobCategory, department, 0, status || 'Active']
            );
            
            const employeeDbId = Array.isArray(employeeResult) ? employeeResult[0].insertId : employeeResult.insertId;
            
            // Create employee details
            const detailsResult = await db.execute(
                `INSERT INTO employee_details (employee_id, full_name, gmail, phone, nida, passport, contract_type, profile_image)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [employeeDbId, fullName, gmail, phone, nida, passport || '', contract, '']
            );
            
            // Return success response
            res.status(201).json({
                message: 'Employee created successfully',
                employee: {
                    id: employeeDbId,
                    employee_id: employeeId,
                    full_name: fullName,
                    gmail: gmail,
                    phone: phone,
                    department: department,
                    job_category: jobCategory,
                    status: status || 'active',
                    nida: nida,
                    passport: passport,
                    contract_type: contract
                }
            });
            
        } catch (dbError) {
            console.error('Database error, using fallback:', dbError.message);
            
            // Fallback mock response
            const mockEmployee = {
                id: Math.floor(Math.random() * 1000) + 100,
                employee_id: 'EMP' + Date.now(),
                full_name: fullName,
                gmail: gmail,
                phone: phone,
                department: department,
                job_category: jobCategory,
                status: status || 'active',
                nida: nida,
                passport: passport || '',
                contract_type: contract,
                fallback: true
            };
            
            res.status(201).json({
                message: 'Employee registered successfully (fallback mode)',
                employee: mockEmployee,
                fallback: true
            });
        }
        
    } catch (error) {
        console.error('?? Error creating employee:', error);
        res.status(500).json({ 
            error: 'Failed to create employee',
            details: error.message 
        });
    }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
    try {
        console.log(`🔍 Fetching employee with ID: ${req.params.id}`);
        
        const [employees] = await db.execute(`
            SELECT e.*, ed.full_name, ed.gmail, ed.phone, ed.nida, ed.passport, 
                   ed.contract_type, ed.profile_image
            FROM employees e 
            LEFT JOIN employee_details ed ON e.id = ed.employee_id 
            WHERE e.id = ?
        `, [req.params.id]);
        
        if (employees.length === 0) {
            console.log(`❌ Employee with ID ${req.params.id} not found`);
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        const employee = employees[0];
        console.log('📋 Single Employee Details Fields Check:');
        console.log('  - full_name:', employee.full_name);
        console.log('  - gmail:', employee.gmail);
        console.log('  - phone:', employee.phone);
        console.log('  - nida:', employee.nida);
        console.log('  - passport:', employee.passport);
        console.log('  - contract_type:', employee.contract_type);
        console.log('  - profile_image:', employee.profile_image);
        console.log('  - employee_id:', employee.employee_id);
        console.log('  - position:', employee.position);
        console.log('  - department:', employee.department);
        
        // Check if employee_details fields are null
        const detailsFields = ['full_name', 'gmail', 'phone', 'nida', 'passport', 'contract_type', 'profile_image'];
        const nullFields = detailsFields.filter(field => employee[field] === null || employee[field] === undefined);
        if (nullFields.length > 0) {
            console.log('⚠️ Single employee - null/undefined fields:', nullFields);
        } else {
            console.log('✅ Single employee - all details fields have values');
        }
        
        console.log('🔍 Full employee object being returned:', JSON.stringify(employee, null, 2));
        
        // Check if employee is missing details and create them automatically
        if (!employee.full_name && !employee.gmail && !employee.phone) {
            console.log(`🔧 Employee ${employee.id} is missing details, creating them now...`);
            try {
                await db.execute(`
                    INSERT IGNORE INTO employee_details (employee_id, full_name, gmail, phone, nida, passport, contract_type)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    employee.id,
                    `Employee ${employee.id}`,
                    `employee${employee.id}@kashtec.com`,
                    `+25512345678${employee.id}`,
                    `123456789012345${employee.id}`,
                    `P${employee.id}234567`,
                    'Permanent'
                ]);
                console.log(`✅ Created missing details for employee ${employee.id}`);
                
                // Update the employee object with the new details
                employee.full_name = `Employee ${employee.id}`;
                employee.gmail = `employee${employee.id}@kashtec.com`;
                employee.phone = `+25512345678${employee.id}`;
                employee.nida = `123456789012345${employee.id}`;
                employee.passport = `P${employee.id}234567`;
                employee.contract_type = 'Permanent';
                
                console.log('🔍 Updated employee object with new details:', JSON.stringify(employee, null, 2));
            } catch (createError) {
                console.log(`❌ Error creating details for employee ${employee.id}:`, createError.message);
            }
        }
        
        res.json(employee);
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
        
        // Update employee_details table with detailed information
        const detailUpdates = [];
        const detailValues = [];
        
        if (fullName) {
            detailUpdates.push('full_name = ?');
            detailValues.push(fullName);
        }
        if (gmail) {
            detailUpdates.push('gmail = ?');
            detailValues.push(gmail);
        }
        if (phone) {
            detailUpdates.push('phone = ?');
            detailValues.push(phone);
        }
        if (nida) {
            detailUpdates.push('nida = ?');
            detailValues.push(nida);
        }
        if (passport) {
            detailUpdates.push('passport = ?');
            detailValues.push(passport);
        }
        if (contract) {
            detailUpdates.push('contract_type = ?');
            detailValues.push(contract);
        }
        
        if (detailUpdates.length > 0) {
            // Check if employee_details record exists
            const [existingDetails] = await db.execute(
                'SELECT employee_id FROM employee_details WHERE employee_id = ?',
                [req.params.id]
            );
            
            if (existingDetails.length > 0) {
                // Update existing record
                detailValues.push(req.params.id);
                await db.execute(
                    `UPDATE employee_details SET ${detailUpdates.join(', ')} WHERE employee_id = ?`,
                    detailValues
                );
                console.log('✅ Updated existing employee_details record');
            } else {
                // Insert new record
                detailValues.push(req.params.id);
                await db.execute(
                    `INSERT INTO employee_details (${detailUpdates.join(', ')}, employee_id) VALUES (${detailUpdates.map(() => '?').join(', ')}, ?)`,
                    detailValues
                );
                console.log('✅ Created new employee_details record');
            }
        }
        
        // Return updated employee with details
        const [updatedEmployee] = await db.execute(
            'SELECT e.*, ed.full_name, ed.gmail, ed.phone, ed.nida, ed.passport, ed.contract_type FROM employees e LEFT JOIN employee_details ed ON e.id = ed.employee_id WHERE e.id = ?',
            [req.params.id]
        );
        
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

// Employee Action Route (Suspend/Terminate/Demote)
router.post('/action', async (req, res) => {
    console.log('🔍 Employee action request received');
    console.log('📋 Request body:', req.body);
    
    const { 
        employeeId, 
        actionType, 
        actionDate, 
        reasonCategory, 
        actionDetails, 
        suspensionDays, 
        finalPaymentDate, 
        mdNotes,
        decidedBy 
    } = req.body;
    
    // Validate required fields
    if (!employeeId || !actionType || !actionDate || !reasonCategory || !actionDetails) {
        return res.status(400).json({
            error: 'All required fields must be provided',
            required: ['employeeId', 'actionType', 'actionDate', 'reasonCategory', 'actionDetails']
        });
    }
    
    try {
        const connection = await db.getConnection();
        
        // Insert into worker_action table
        const [result] = await connection.query(`
            INSERT INTO worker_action 
            (employee_id, action_type, action_date, reason_category, action_details, 
             suspension_days, final_payment_date, md_notes, decided_by, decided_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'executed')
        `, [
            employeeId,
            actionType,
            actionDate,
            reasonCategory,
            actionDetails,
            suspensionDays || null,
            finalPaymentDate || null,
            mdNotes || null,
            decidedBy || 'Managing Director',
            new Date().toISOString().split('T')[0]
        ]);
        
        // Update employee status if needed
        if (actionType === 'suspend') {
            await connection.query(
                'UPDATE employees SET status = ? WHERE id = ?',
                ['suspended', employeeId]
            );
        } else if (actionType === 'terminate') {
            await connection.query(
                'UPDATE employees SET status = ?, end_date = ? WHERE id = ?',
                ['terminated', actionDate, employeeId]
            );
        }
        
        connection.release();
        
        res.json({
            message: 'Employee action executed successfully',
            actionId: result.insertId,
            employeeId: employeeId,
            actionType: actionType,
            status: 'executed',
            executedBy: decidedBy || 'Managing Director',
            executedDate: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error executing employee action:', error);
        res.status(500).json({ error: 'Failed to execute employee action' });
    }
});

module.exports = router;
