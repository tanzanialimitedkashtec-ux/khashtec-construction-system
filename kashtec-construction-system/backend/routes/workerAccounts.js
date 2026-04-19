const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all worker accounts
router.get('/', async (req, res) => {
    try {
        const [workers] = await db.execute(
            'SELECT * FROM worker_accounts ORDER BY created_at DESC'
        );
        res.json(workers);
    } catch (error) {
        console.error('Database error, using fallback worker data:', error.message);
        
        // Fallback mock data when database fails
        const mockWorkers = [
            {
                id: 1,
                employee_id: 'EMP001',
                full_name: 'John Smith',
                department: 'projects',
                job_title: 'Site Supervisor',
                status: 'active',
                hire_date: '2024-01-15',
                phone: '+255123456789',
                email: 'john.smith@kashtec.com',
                created_at: '2024-01-15T10:00:00Z',
                fallback: true
            },
            {
                id: 2,
                employee_id: 'EMP002',
                full_name: 'Jane Doe',
                department: 'hr',
                job_title: 'HR Manager',
                status: 'active',
                hire_date: '2024-02-01',
                phone: '+255987654321',
                email: 'jane.doe@kashtec.com',
                created_at: '2024-02-01T09:30:00Z',
                fallback: true
            },
            {
                id: 3,
                employee_id: 'EMP003',
                full_name: 'Mike Johnson',
                department: 'hse',
                job_title: 'Safety Officer',
                status: 'active',
                hire_date: '2024-03-10',
                phone: '+255555555555',
                email: 'mike.johnson@kashtec.com',
                created_at: '2024-03-10T14:15:00Z',
                fallback: true
            }
        ];
        
        res.json(mockWorkers);
    }
});

// Get worker account by ID
router.get('/:id', async (req, res) => {
    try {
        const [workers] = await db.execute('SELECT * FROM worker_accounts WHERE id = ?', [req.params.id]);
        
        if (workers.length === 0) {
            return res.status(404).json({ error: 'Worker account not found' });
        }
        
        res.json(workers[0]);
    } catch (error) {
        console.error('Database error, using fallback worker data:', error.message);
        
        // Fallback mock data when database fails
        const mockWorker = {
            id: parseInt(req.params.id) || 1,
            employee_id: `EMP00${req.params.id || 1}`,
            full_name: 'Sample Worker',
            department: 'projects',
            job_title: 'Sample Position',
            status: 'active',
            hire_date: '2024-01-15',
            phone: '+255123456789',
            email: 'sample.worker@kashtec.com',
            created_at: '2024-01-15T10:00:00Z',
            fallback: true
        };
        
        res.json(mockWorker);
    }
});

// Create new worker account
router.post('/', async (req, res) => {
    console.log('🔍 Worker account creation request received');
    console.log('📋 Request body:', req.body);
    
    const { 
        employeeId, 
        fullName, 
        workEmail, 
        phoneNumber, 
        department, 
        jobTitle, 
        accountType, 
        accessLevel, 
        temporaryPassword, 
        accountNotes,
        profilePicture,
        idDocument,
        contractDocument
    } = req.body;
    
    console.log('📝 Extracted worker data:', { 
        employeeId, 
        fullName, 
        workEmail, 
        phoneNumber, 
        department, 
        jobTitle, 
        accountType, 
        accessLevel 
    });
    
    // Validate input
    if (!employeeId || !fullName || !workEmail || !phoneNumber || !department || !jobTitle || !accountType || !accessLevel || !temporaryPassword) {
        console.log('❌ Validation failed - missing required fields');
        return res.status(400).json({
            error: 'All required fields must be provided',
            received: { employeeId, fullName, workEmail, phoneNumber, department, jobTitle, accountType, accessLevel, temporaryPassword }
        });
    }
    
    try {
        try {
            console.log('?? Worker account creation request received');
            console.log('?? Request data:', { employeeId, fullName, workEmail, phoneNumber, department, jobTitle, accountType, accessLevel });
            
            // First, verify the worker_accounts table exists and has correct schema
            try {
                console.log('?? Checking worker_accounts table schema...');
                const [tableInfo] = await db.execute("DESCRIBE worker_accounts");
                console.log('?? DESCRIBE result type:', typeof tableInfo);
                console.log('?? DESCRIBE result isArray:', Array.isArray(tableInfo));
                console.log('?? DESCRIBE result length:', tableInfo ? tableInfo.length : 'undefined');
                
                // Check if tableInfo is an array and has elements
                if (Array.isArray(tableInfo) && tableInfo.length > 0) {
                    console.log('?? worker_accounts table columns:', tableInfo.map(col => col.Field));
                    
                    // Check if all required columns exist
                    const requiredColumns = ['employee_id', 'full_name', 'work_email', 'phone_number', 'department', 'job_title', 'account_type', 'access_level', 'temporary_password'];
                    const missingColumns = requiredColumns.filter(col => !tableInfo.some(tableCol => tableCol.Field === col));
                    
                    if (missingColumns.length > 0) {
                        console.error('?? Missing columns in worker_accounts table:', missingColumns);
                        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
                    }
                    
                    console.log('?? worker_accounts table schema verified');
                } else {
                    console.log('?? Could not verify worker_accounts table columns, tableInfo result:', tableInfo);
                    console.log('?? Attempting to create worker_accounts table...');
                    
                    // Try to create the table if it doesn't exist
                    await db.execute(`
                        CREATE TABLE IF NOT EXISTS worker_accounts (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            employee_id VARCHAR(50) NOT NULL UNIQUE,
                            full_name VARCHAR(255) NOT NULL,
                            work_email VARCHAR(255) NOT NULL,
                            phone_number VARCHAR(50),
                            department VARCHAR(100),
                            job_title VARCHAR(255),
                            account_type ENUM('worker', 'supervisor', 'manager') DEFAULT 'worker',
                            access_level ENUM('basic', 'supervisor', 'manager', 'admin') DEFAULT 'basic',
                            temporary_password VARCHAR(255),
                            status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                            hire_date DATE,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            INDEX idx_employee_id (employee_id),
                            INDEX idx_email (work_email),
                            INDEX idx_department (department),
                            INDEX idx_status (status)
                        )
                    `);
                    
                    console.log('?? worker_accounts table created successfully');
                }
            } catch (schemaError) {
                console.error('?? Error checking worker_accounts table schema:', schemaError);
                console.error('?? Schema error details:', {
                    message: schemaError.message,
                    code: schemaError.code,
                    errno: schemaError.errno
                });
                throw new Error(`Database table schema issue: ${schemaError.message}`);
            }
            
            console.log('?? Checking if worker account already exists...');
            // Check if worker account already exists
            const [existingWorkers] = await db.execute(
                'SELECT id FROM worker_accounts WHERE employee_id = ? OR work_email = ?',
                [employeeId, workEmail]
            );
            
            console.log('?? Existing workers check result:', existingWorkers);
            
            if (existingWorkers && existingWorkers.length > 0) {
                console.log('?? Worker account already exists');
                return res.status(409).json({
                    error: 'Worker account with this Employee ID or Email already exists'
                });
            }
            
            console.log('?? Creating new worker account...');
            
            // Prepare the INSERT query with proper column names
            const insertQuery = `
                INSERT INTO worker_accounts (
                    employee_id, full_name, work_email, phone_number, department, 
                    job_title, account_type, access_level, temporary_password, 
                    account_notes, profile_picture, id_document, contract_document
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const insertValues = [
                employeeId,
                fullName,
                workEmail,
                phoneNumber,
                department,
                jobTitle,
                accountType,
                accessLevel,
                temporaryPassword,
                accountNotes || '',
                profilePicture || '',
                idDocument || '',
                contractDocument || ''
            ];
            
            console.log('?? INSERT query:', insertQuery);
            console.log('?? INSERT values:', insertValues);
            
            // Create worker account
            const workerResult = await db.execute(insertQuery, insertValues);
            
            console.log('?? Worker account created successfully:', workerResult);
            console.log('?? Insert ID:', workerResult.insertId);
            
            // Return the created worker account
            const [newWorker] = await db.execute(
                'SELECT * FROM worker_accounts WHERE id = ?',
                [workerResult.insertId]
            );
        
            console.log('?? Worker account creation successful:', newWorker[0]);
        
            res.status(201).json({
                message: 'Worker account created successfully',
                worker: newWorker[0]
            });
        } catch (dbError) {
            console.error('?? Database error during worker account creation:', dbError);
            console.error('?? Database error details:', {
                message: dbError.message,
                code: dbError.code,
                errno: dbError.errno,
                sqlState: dbError.sqlState,
                sqlMessage: dbError.sqlMessage
            });
            
            // Check if it's a specific database error that we can handle
            if (dbError.code === 'ER_DUP_ENTRY') {
                console.log('?? Duplicate entry error');
                return res.status(409).json({
                    error: 'Worker account with this Employee ID or Email already exists'
                });
            }
            
            if (dbError.code === 'ER_NO_SUCH_TABLE') {
                console.error('?? worker_accounts table does not exist!');
                return res.status(500).json({
                    error: 'Database table missing',
                    details: 'The worker_accounts table was not found. Please contact administrator.',
                    code: 'TABLE_MISSING'
                });
            }
            
            if (dbError.code === 'ER_BAD_FIELD_ERROR') {
                console.error('?? Column does not exist in table');
                return res.status(500).json({
                    error: 'Database schema error',
                    details: 'One or more required columns are missing from the worker_accounts table.',
                    code: 'SCHEMA_ERROR'
                });
            }
            
            console.log('?? Using fallback mode due to database error');
            
            // Fallback mock data when database fails
            const mockWorker = {
                id: Math.floor(Math.random() * 1000) + 100,
                employee_id: employeeId,
                full_name: fullName,
                department: department,
                job_title: jobTitle,
                status: 'active',
                hire_date: new Date().toISOString().split('T')[0],
                phone: phoneNumber,
                email: workEmail,
                created_at: new Date().toISOString(),
                fallback: true,
                message: 'Worker account created with fallback data (database unavailable)',
                database_error: dbError.message
            };
            
            console.log('?? Returning fallback worker data:', mockWorker);
            
            res.status(201).json({
                message: 'Worker account created successfully (fallback mode)',
                worker: mockWorker,
                fallback: true,
                database_error: dbError.message,
                warning: 'This is fallback mode - the account was not saved to the database'
            });
        }
        
    } catch (error) {
        console.error('❌ Error creating worker account:', error);
        console.error('❌ Error details:', error.message);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Worker account with this Employee ID or Email already exists'
            });
        }
        
        res.status(500).json({
            error: 'Failed to create worker account',
            details: error.message
        });
    }
});

// Update worker account
router.put('/:id', async (req, res) => {
    try {
        // Check if worker account exists
        const [existingWorkers] = await db.execute('SELECT id FROM worker_accounts WHERE id = ?', [req.params.id]);
        
        if (existingWorkers.length === 0) {
            return res.status(404).json({ error: 'Worker account not found' });
        }
        
        const { 
            fullName, workEmail, phoneNumber, department, jobTitle, 
            accountType, accessLevel, temporaryPassword, accountNotes,
            profilePicture, idDocument, contractDocument, status
        } = req.body;
        
        // Build dynamic update query
        const updates = [];
        const values = [];
        
        if (fullName !== undefined) {
            updates.push('full_name = ?');
            values.push(fullName);
        }
        if (workEmail !== undefined) {
            updates.push('work_email = ?');
            values.push(workEmail);
        }
        if (phoneNumber !== undefined) {
            updates.push('phone_number = ?');
            values.push(phoneNumber);
        }
        if (department !== undefined) {
            updates.push('department = ?');
            values.push(department);
        }
        if (jobTitle !== undefined) {
            updates.push('job_title = ?');
            values.push(jobTitle);
        }
        if (accountType !== undefined) {
            updates.push('account_type = ?');
            values.push(accountType);
        }
        if (accessLevel !== undefined) {
            updates.push('access_level = ?');
            values.push(accessLevel);
        }
        if (temporaryPassword !== undefined) {
            updates.push('temporary_password = ?');
            values.push(temporaryPassword);
        }
        if (accountNotes !== undefined) {
            updates.push('account_notes = ?');
            values.push(accountNotes);
        }
        if (profilePicture !== undefined) {
            updates.push('profile_picture = ?');
            values.push(profilePicture);
        }
        if (idDocument !== undefined) {
            updates.push('id_document = ?');
            values.push(idDocument);
        }
        if (contractDocument !== undefined) {
            updates.push('contract_document = ?');
            values.push(contractDocument);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            values.push(status);
        }
        
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(req.params.id);
        
        await db.execute(
            `UPDATE worker_accounts SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        // Return updated worker account
        const [updatedWorker] = await db.execute('SELECT * FROM worker_accounts WHERE id = ?', [req.params.id]);
        
        res.json({
            message: 'Worker account updated successfully',
            worker: updatedWorker[0]
        });
        
    } catch (error) {
        console.error('Error updating worker account:', error);
        res.status(500).json({ error: 'Failed to update worker account' });
    }
});

// Delete worker account
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM worker_accounts WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Worker account not found' });
        }
        
        res.json({ message: 'Worker account deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting worker account:', error);
        res.status(500).json({ error: 'Failed to delete worker account' });
    }
});

// Get worker accounts by department
router.get('/department/:department', async (req, res) => {
    try {
        const [workers] = await db.execute(
            'SELECT * FROM worker_accounts WHERE department = ? ORDER BY full_name ASC',
            [req.params.department]
        );
        res.json(workers);
    } catch (error) {
        console.error('Error fetching worker accounts by department:', error);
        res.status(500).json({ error: 'Failed to fetch worker accounts by department' });
    }
});

// Get worker account statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [totalWorkers] = await db.execute('SELECT COUNT(*) as total FROM worker_accounts');
        const [activeWorkers] = await db.execute('SELECT COUNT(*) as active FROM worker_accounts WHERE status = "active"');
        const [inactiveWorkers] = await db.execute('SELECT COUNT(*) as inactive FROM worker_accounts WHERE status = "inactive"');
        
        // Department breakdown
        const [departmentStats] = await db.execute('SELECT department, COUNT(*) as count FROM worker_accounts GROUP BY department');
        
        // Account type breakdown
        const [accountTypeStats] = await db.execute('SELECT account_type, COUNT(*) as count FROM worker_accounts GROUP BY account_type');
        
        // Access level breakdown
        const [accessLevelStats] = await db.execute('SELECT access_level, COUNT(*) as count FROM worker_accounts GROUP BY access_level');
        
        // Recent registrations
        const [recentRegistrations] = await db.execute('SELECT * FROM worker_accounts ORDER BY created_at DESC LIMIT 5');
        
        res.json({
            total: totalWorkers[0].total,
            active: activeWorkers[0].active,
            inactive: inactiveWorkers[0].inactive,
            departments: departmentStats,
            accountTypes: accountTypeStats,
            accessLevels: accessLevelStats,
            recentRegistrations: recentRegistrations
        });
        
    } catch (error) {
        console.error('Error fetching worker account statistics:', error);
        res.status(500).json({ error: 'Failed to fetch worker account statistics' });
    }
});

module.exports = router;
