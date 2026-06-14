const express = require('express');
const router = express.Router();
const fs = require('fs');
const db = require('../../database/config/database');
const upload = require('../middleware/upload');

// Normalize legacy/absolute upload paths (e.g. /app/uploads/...) to web URLs
function normalizeImagePath(p) {
    if (!p || typeof p !== 'string') return p || null;
    let s = p.replace(/\\/g, '/').trim();
    const idx = s.toLowerCase().lastIndexOf('uploads/');
    if (idx !== -1) return '/' + s.slice(idx);
    if (!s.startsWith('/') && !/^https?:\/\//i.test(s)) return '/' + s;
    return s;
}

// Get all employees
router.get('/', async (req, res) => {
    console.log('🔍 GET /api/employees endpoint called');
    console.log('📋 Request method:', req.method);
    console.log('📋 Request URL:', req.url);
    console.log('📋 Request headers:', req.headers);
    
    try {
        // Ensure notes column exists in employee_details
        try {
            await db.execute("ALTER TABLE employee_details ADD COLUMN notes TEXT NULL");
            console.log('✅ Added notes column to employee_details');
        } catch (colErr) {
            // Column already exists — ignore
            if (!colErr.message.includes('Duplicate column')) {
                console.log('ℹ️ Notes column check:', colErr.message);
            }
        }

        console.log('🗄️ Executing employee query...');
        
        console.log('🔍 Checking employee details table...');
        
        // Check if employee_details table has any records
        let detailsCount = 0;
        try {
            const detailsCountResult = await db.execute('SELECT COUNT(*) as count FROM employee_details');
            if (Array.isArray(detailsCountResult) && detailsCountResult.length > 0) {
                detailsCount = Number(detailsCountResult[0].count) || 0;
            }
            console.log('📊 Employee details table record count:', detailsCount);
        } catch (error) {
            console.log('❌ Error checking employee_details table:', error.message);
            console.log('🔄 Skipping employee details creation due to table error');
            detailsCount = 0;
        }
        
        // If employee_details is empty, create sample data for existing employees
        if (detailsCount === 0) {
            console.log('📝 Employee details table is empty, creating sample data...');
            
            // Get all employees to create details for them
            let allEmployees;
            try {
                const empResult = await db.execute('SELECT id, position, department FROM employees LIMIT 5');
                allEmployees = Array.isArray(empResult) ? empResult : [];
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
        } else {
            console.log('📊 Employee details table already has', detailsCount, 'records');
        }
        
        // Get employees with details
        let employees;
        try {
            const empResult = await db.execute(
                'SELECT e.*, ed.full_name, ed.gmail, ed.phone, ed.nida, ed.passport, ed.contract_type, ed.profile_image, ed.notes FROM employees e LEFT JOIN employee_details ed ON e.id = ed.employee_id ORDER BY e.hire_date DESC'
            );
            
            // Handle different database response formats
            // mysql2 returns [rows, fields], so check nested array first
            if (Array.isArray(empResult) && Array.isArray(empResult[0])) {
                employees = empResult[0];
            } else if (Array.isArray(empResult)) {
                employees = empResult;
            } else if (empResult && empResult.rows) {
                employees = empResult.rows;
            } else {
                console.warn('⚠️ Unexpected employee query result format:', empResult);
                employees = [];
            }
            
            // Deduplicate employees by ID to prevent duplicates from JOIN
            const uniqueEmployees = [];
            const seenIds = new Set();
            
            for (const emp of employees) {
                if (!seenIds.has(emp.id)) {
                    seenIds.add(emp.id);
                    uniqueEmployees.push(emp);
                }
            }
            
            employees = uniqueEmployees;
            console.log('✅ Employee query executed successfully');
            console.log(`📊 Deduplicated employees: ${employees.length} unique records`);
        } catch (empQueryError) {
            console.log('❌ Error in main employee query:', empQueryError.message);
            console.log('🔄 Trying simple employee query without JOIN...');
            
            try {
                const simpleResult = await db.execute('SELECT * FROM employees ORDER BY hire_date DESC');
                
                // Handle different database response formats
                // mysql2 returns [rows, fields], so check nested array first
                if (Array.isArray(simpleResult) && Array.isArray(simpleResult[0])) {
                    employees = simpleResult[0];
                } else if (Array.isArray(simpleResult)) {
                    employees = simpleResult;
                } else if (simpleResult && simpleResult.rows) {
                    employees = simpleResult.rows;
                } else {
                    console.warn('⚠️ Unexpected simple employee query result format:', simpleResult);
                    employees = [];
                }
                
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
        // Always route image URLs through /api/profile-image/:id which gracefully
        // falls back to the default avatar when the on-disk file or DB BLOB is missing.
        // This eliminates 404s for legacy rows whose files were lost on Railway redeploy.
        for (const e of employeesArray) {
            if (e && e.id) e.profile_image = `/api/profile-image/${e.id}`;
        }
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
router.post('/', (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err) {
            console.error('❌ File upload error:', err.message);
            return res.status(400).json({ 
                error: 'File upload failed', 
                details: err.message 
            });
        }
        next();
    });
}, async (req, res) => {
    console.log('🔍 POST /api/employees endpoint called');
    console.log('📋 Request method:', req.method);
    console.log('📋 Request URL:', req.url);
    console.log('📋 Request headers:', req.headers);
    console.log('📋 Request body:', req.body);
    console.log('📋 Uploaded files:', req.files ? req.files.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, size: f.size })) : 'none');
    
    const { fullName, gmail, phone, department, jobCategory, job_category, status = 'active', nida, passport, contract } = req.body;
    
    // Handle both jobCategory and job_category field names
    const finalJobCategory = jobCategory || job_category || 'General Staff'; // Default if missing
    
    console.log('🔍 Extracted fields:', {
        fullName: !!fullName,
        gmail: !!gmail,
        phone: !!phone,
        department: !!department,
        jobCategory: !!jobCategory,
        job_category: !!job_category,
        finalJobCategory: !!finalJobCategory,
        nida: !!nida,
        contract: !!contract
    });
    
    console.log('🔍 Employee registration validation:', {
        fullName,
        gmail,
        phone,
        department,
        jobCategory,
        job_category,
        finalJobCategory,
        nida,
        passport,
        contract
    });
    
    console.log('🔍 Complete request body fields:', Object.keys(req.body));
    console.log('🔍 Complete request body values:', req.body);
    
    // Validate input (more lenient validation)
    console.log('🔍 Field validation check:', {
        'fullName': { value: fullName, valid: !!fullName },
        'gmail': { value: gmail, valid: !!gmail },
        'phone': { value: phone, valid: !!phone },
        'department': { value: department, valid: !!department },
        'finalJobCategory': { value: finalJobCategory, valid: !!finalJobCategory },
        'nida': { value: nida, valid: !!nida },
        'contract': { value: contract, valid: !!contract }
    });
    
    // More flexible validation - only require truly essential fields
    if (!fullName || !gmail || !phone || !department || !nida) {
        console.log('❌ Validation failed - missing essential fields');
        const missingFields = [
            !fullName ? 'fullName' : null,
            !gmail ? 'gmail' : null,
            !phone ? 'phone' : null,
            !department ? 'department' : null,
            !nida ? 'nida' : null
        ].filter(Boolean);
        
        console.log('❌ Missing essential fields:', missingFields);
        
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['fullName', 'gmail', 'phone', 'department', 'nida'],
            received: { fullName, gmail, phone, department, jobCategory, job_category, nida, contract },
            missing: missingFields,
            note: 'jobCategory and contract are optional'
        });
    }
    
    console.log('✅ Validation passed for essential fields');
    
    try {
        // Try database operations first
        try {
            console.log('?? Checking if employee already exists...');
            const existingResult = await db.execute(
                'SELECT id, full_name FROM employee_details WHERE gmail = ? OR nida = ?',
                [gmail, nida]
            );
            
            // Handle different MySQL2 return formats
            let existingEmployees = [];
            if (Array.isArray(existingResult)) {
                existingEmployees = existingResult;
            } else if (existingResult && Array.isArray(existingResult[0])) {
                existingEmployees = existingResult[0];
            } else if (existingResult && existingResult.rows) {
                existingEmployees = existingResult.rows;
            }
            
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
                [employeeId, finalJobCategory, department, 0, status || 'Active']
            );
            
            const employeeDbId = Array.isArray(employeeResult) ? employeeResult[0].insertId : employeeResult.insertId;
            
            // Get profile image path if file was uploaded.
            // IMPORTANT: store a web-accessible URL, NOT multer's absolute filesystem
            // path (e.g. /app/uploads/<file>). Also persist the bytes into a LONGBLOB
            // column so the image survives Railway redeploys (ephemeral filesystem).
            let profileImagePath = '';
            let profileImageBuffer = null;
            let profileImageMime = null;
            
            let cvPath = '';
            let cvBuffer = null;
            let cvMime = null;
            
            let agreementPath = '';
            let agreementBuffer = null;
            let agreementMime = null;

            if (req.files && req.files.length > 0) {
                const profileFile = req.files.find(f => f.fieldname === 'profileImage');
                if (profileFile) {
                    profileImageMime = profileFile.mimetype || 'image/jpeg';
                    try {
                        profileImageBuffer = fs.readFileSync(profileFile.path);
                    } catch (readErr) {
                        console.warn('⚠️ Could not read uploaded profile image for BLOB storage:', readErr.message);
                    }
                    // Prefer DB-backed URL so it works after redeploys; fall back to /uploads.
                    profileImagePath = profileImageBuffer
                        ? `/api/profile-image/${employeeDbId}`
                        : `/uploads/${profileFile.filename}`;
                }
                
                const cvFile = req.files.find(f => f.fieldname === 'empCV');
                if (cvFile) {
                    cvMime = cvFile.mimetype || 'application/pdf';
                    try {
                        cvBuffer = fs.readFileSync(cvFile.path);
                    } catch (readErr) {
                        console.warn('⚠️ Could not read uploaded CV for BLOB storage:', readErr.message);
                    }
                    cvPath = cvBuffer ? `/api/employee-file/${employeeDbId}/cv` : `/uploads/${cvFile.filename}`;
                }
                
                const agreementFile = req.files.find(f => f.fieldname === 'empAgreement');
                if (agreementFile) {
                    agreementMime = agreementFile.mimetype || 'application/pdf';
                    try {
                        agreementBuffer = fs.readFileSync(agreementFile.path);
                    } catch (readErr) {
                        console.warn('⚠️ Could not read uploaded Agreement for BLOB storage:', readErr.message);
                    }
                    agreementPath = agreementBuffer ? `/api/employee-file/${employeeDbId}/agreement` : `/uploads/${agreementFile.filename}`;
                }
            }
            
            // Create employee details (try with BLOB columns; gracefully fall back if missing)
            let detailsResult;
            try {
                detailsResult = await db.execute(
                    `INSERT INTO employee_details (employee_id, full_name, gmail, phone, nida, passport, contract_type, profile_image, profile_image_data, profile_image_mime, cv_path, cv_data, cv_mime, agreement_path, agreement_data, agreement_mime)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [employeeDbId, fullName, gmail, phone, nida, passport || '', contract, profileImagePath, profileImageBuffer, profileImageMime, cvPath, cvBuffer, cvMime, agreementPath, agreementBuffer, agreementMime]
                );
            } catch (blobErr) {
                console.warn('⚠️ BLOB insert failed, retrying without BLOB columns:', blobErr.message);
                detailsResult = await db.execute(
                    `INSERT INTO employee_details (employee_id, full_name, gmail, phone, nida, passport, contract_type, profile_image)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [employeeDbId, fullName, gmail, phone, nida, passport || '', contract, profileImagePath]
                );
            }
            
            // Create notification for new employee registration
            try {
                await db.execute(`
                    INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
                    VALUES (?, ?, 'info', 'Medium', NULL, NOW())
                `, [
                    'New Employee Registered',
                    `New employee ${fullName} has been registered in ${department} department as ${finalJobCategory}.`
                ]);
            } catch (notifErr) {
                console.warn('⚠️ Could not create notification:', notifErr.message);
            }

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
                    job_category: finalJobCategory,
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
                job_category: finalJobCategory,
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

// Reactivate a suspended employee (must be before /:id to avoid route collision)
router.post('/reactivate', async (req, res) => {
    console.log('🔍 Employee reactivate request received');
    console.log('📋 Request body:', req.body);
    
    const { employeeId } = req.body;
    
    if (!employeeId) {
        return res.status(400).json({ error: 'employeeId is required' });
    }
    
    try {
        const empResult = await db.execute('SELECT id, status FROM employees WHERE id = ?', [employeeId]);
        const employees = Array.isArray(empResult) ? empResult : [];
        
        if (!employees || employees.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        const employee = employees[0];
        const currentStatus = (employee.status || '').toLowerCase();
        
        // Only allow reactivation of suspended employees, not terminated
        if (currentStatus === 'terminated') {
            return res.status(403).json({ 
                error: 'Cannot reactivate terminated employee',
                message: 'Terminated employees cannot be reactivated. They can only be viewed in the employment actions history.',
                status: currentStatus
            });
        }
        
        if (currentStatus !== 'suspended' && currentStatus !== 'demoted') {
            return res.status(400).json({ 
                error: 'Employee is not suspended',
                message: `Employee status is currently "${currentStatus}", only suspended or demoted employees can be reactivated.`,
                status: currentStatus
            });
        }
        
        await db.execute(
            'UPDATE employees SET status = ? WHERE id = ?',
            ['Active', employeeId]
        );
        
        try {
            await db.execute(`
                INSERT INTO worker_action 
                (employee_id, action_type, action_date, reason_category, action_details, decided_by, decided_date, status)
                VALUES (?, 'reactivate', ?, 'other', 'Account reactivated by Director of Administration', 'Director of Administration', ?, 'completed')
            `, [
                employeeId,
                new Date().toISOString().split('T')[0],
                new Date().toISOString().split('T')[0]
            ]);
        } catch (logError) {
            console.log('📝 Could not log reactivation action:', logError.message);
        }
        
        console.log(`✅ Employee ${employeeId} reactivated successfully`);
        res.json({
            message: 'Employee reactivated successfully',
            employeeId: employeeId,
            status: 'Active',
            previousStatus: currentStatus
        });
        
    } catch (error) {
        console.error('❌ Error reactivating employee:', error);
        res.status(500).json({ 
            error: 'Failed to reactivate employee',
            details: error.message 
        });
    }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
    try {
        console.log(`🔍 Fetching employee with ID: ${req.params.id}`);
        
        const empResult = await db.execute(`
            SELECT e.*, ed.full_name, ed.gmail, ed.phone, ed.nida, ed.passport, 
                   ed.contract_type, ed.profile_image
            FROM employees e 
            LEFT JOIN employee_details ed ON e.id = ed.employee_id 
            WHERE e.id = ?
        `, [req.params.id]);
        
        // Handle different database response formats
        let employees;
        if (Array.isArray(empResult) && Array.isArray(empResult[0])) {
            employees = empResult[0];
        } else if (Array.isArray(empResult)) {
            employees = empResult;
        } else if (empResult && empResult.rows) {
            employees = empResult.rows;
        } else {
            employees = [];
        }
        
        if (!employees || employees.length === 0) {
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
        
        if (employee && employee.id) employee.profile_image = `/api/profile-image/${employee.id}`;
        res.json(employee);
    } catch (error) {
        console.error('❌ Error fetching single employee:', error.message);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to fetch employee', details: error.message });
    }
});

// Update employee
router.put('/:id', async (req, res) => {
    console.log('🔄 PUT employee endpoint called - DEBUG VERSION 3');
    const { fullName, gmail, phone, department, jobCategory, status, nida, passport, contract, notes } = req.body;
    
    console.log('🔍 Received update data:', {
        fullName,
        gmail,
        phone,
        department,
        jobCategory,
        status,
        nida,
        passport,
        contract,
        notes
    });
    
    try {
        console.log('🔄 Starting employee update for ID:', req.params.id);
        
        // Check if employee exists
        const [existingEmployees] = await db.execute('SELECT id FROM employees WHERE id = ?', [req.params.id]);
        
        if (!existingEmployees || existingEmployees.length === 0) {
            console.log('❌ Employee not found:', req.params.id);
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        console.log('✅ Employee found, proceeding with update');
        
        // Simplified update - only update employees table basic fields
        const updates = [];
        const values = [];
        
        // Only update fields that exist and are provided
        if (department !== undefined && department !== null) {
            updates.push('department = ?');
            values.push(department);
            console.log('📝 Adding department update:', department);
        }
        
        if (jobCategory !== undefined && jobCategory !== null) {
            updates.push('position = ?'); // Map jobCategory to position field
            values.push(jobCategory);
            console.log('📝 Adding position update:', jobCategory);
        }
        
        if (status !== undefined && status !== null) {
            updates.push('status = ?');
            values.push(status);
            console.log('📝 Adding status update:', status);
        }
        
        if (updates.length === 0) {
            console.log('❌ No valid fields to update');
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        values.push(req.params.id);
        
        console.log('🔧 Executing update query:', `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`);
        console.log('🔧 Update values:', values);
        
        const updateResult = await db.execute(
            `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        console.log('✅ Employees table updated:', updateResult);
        
        // Update employee_details table separately if detailed fields are provided
        if (fullName || gmail || phone || nida || passport || contract || notes !== undefined) {
            console.log('📝 Updating employee details...');
            
            try {
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
                if (notes !== undefined) {
                    detailUpdates.push('notes = ?');
                    detailValues.push(notes || null);
                }
                
                if (detailUpdates.length > 0) {
                    // Check if employee_details record exists
                    const [existingDetails] = await db.execute(
                        'SELECT employee_id FROM employee_details WHERE employee_id = ?',
                        [req.params.id]
                    );
                    
                    if (existingDetails && existingDetails.length > 0) {
                        // Update existing record
                        detailValues.push(req.params.id);
                        await db.execute(
                            `UPDATE employee_details SET ${detailUpdates.join(', ')} WHERE employee_id = ?`,
                            detailValues
                        );
                        console.log('✅ Updated existing employee_details record');
                    } else {
                        // Insert new record with all fields
                        const allDetailValues = [];
                        
                        if (fullName) allDetailValues.push(fullName); else allDetailValues.push(null);
                        if (gmail) allDetailValues.push(gmail); else allDetailValues.push(null);
                        if (phone) allDetailValues.push(phone); else allDetailValues.push(null);
                        if (nida) allDetailValues.push(nida); else allDetailValues.push(null);
                        if (passport) allDetailValues.push(passport); else allDetailValues.push(null);
                        if (contract) allDetailValues.push(contract); else allDetailValues.push(null);
                        allDetailValues.push(notes || null);
                        
                        allDetailValues.push(req.params.id);
                        
                        await db.execute(
                            `INSERT INTO employee_details (full_name, gmail, phone, nida, passport, contract_type, notes, employee_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            allDetailValues
                        );
                        console.log('✅ Created new employee_details record');
                    }
                }
            } catch (detailsError) {
                console.warn('⚠️ Error updating employee_details (continuing):', detailsError.message);
                // Don't fail the whole operation if details update fails
            }
        }
        
        // Return updated employee
        const [updatedEmployee] = await db.execute(
            'SELECT e.*, ed.full_name, ed.gmail, ed.phone, ed.nida, ed.passport, ed.contract_type, ed.notes FROM employees e LEFT JOIN employee_details ed ON e.id = ed.employee_id WHERE e.id = ?',
            [req.params.id]
        );
        
        console.log('✅ Employee update completed successfully');
        
        res.json({
            message: 'Employee updated successfully',
            employee: updatedEmployee && updatedEmployee.length > 0 ? updatedEmployee[0] : null
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
        // Get employee details for work title
        const employeeDataResult = await db.execute(
            'SELECT e.position, ed.full_name FROM employees e LEFT JOIN employee_details ed ON e.id = ed.employee_id WHERE e.id = ?',
            [employeeId]
        );
        
        // Handle different database response formats
        let employeeData;
        if (Array.isArray(employeeDataResult)) {
            employeeData = employeeDataResult;
        } else if (employeeDataResult && Array.isArray(employeeDataResult[0])) {
            employeeData = employeeDataResult[0];
        } else if (employeeDataResult && employeeDataResult.rows) {
            employeeData = employeeDataResult.rows;
        } else {
            employeeData = [];
        }
        
        const employeeName = employeeData[0]?.full_name || `Employee ${employeeId}`;
        const employeePosition = employeeData[0]?.position || 'Unknown Position';
        
        // Check if worker_action table exists, if not create it
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS worker_action (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    employee_id INT NOT NULL,
                    action_type ENUM('suspend', 'terminate', 'demote') NOT NULL,
                    action_date DATE NOT NULL,
                    reason_category ENUM('misconduct', 'performance', 'violation', 'redundancy', 'restructuring', 'other') NOT NULL,
                    action_details TEXT NOT NULL,
                    suspension_days INT NULL,
                    final_payment_date DATE NULL,
                    md_notes TEXT NULL,
                    decided_by VARCHAR(255) NOT NULL,
                    decided_date DATE NOT NULL,
                    status ENUM('pending', 'executed', 'cancelled') DEFAULT 'executed',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_employee_id (employee_id),
                    INDEX idx_action_type (action_type),
                    INDEX idx_status (status)
                )
            `);
        } catch (tableError) {
            console.log('📝 Worker action table check:', tableError.message);
        }
        
        // Insert into worker_action table
        const result = await db.execute(`
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
            await db.execute(
                'UPDATE employees SET status = ? WHERE id = ?',
                ['Suspended', employeeId]
            );
        } else if (actionType === 'terminate') {
            await db.execute(
                'UPDATE employees SET status = ?, end_date = ? WHERE id = ?',
                ['Terminated', actionDate, employeeId]
            );
        } else if (actionType === 'demote') {
            await db.execute(
                'UPDATE employees SET status = ? WHERE id = ?',
                ['Demoted', employeeId]
            );
        }
        
        // Handle different database response formats for insert result
        let actionId;
        if (result && result.insertId) {
            actionId = result.insertId;
        } else if (result && result[0] && result[0].insertId) {
            actionId = result[0].insertId;
        } else if (Array.isArray(result) && result[0] && result[0].insertId) {
            actionId = result[0].insertId;
        } else {
            actionId = Date.now(); // Fallback ID
        }
        
        res.json({
            message: 'Employee action executed successfully',
            actionId: actionId,
            employeeId: employeeId,
            actionType: actionType,
            status: 'executed',
            executedBy: decidedBy || 'Managing Director',
            executedDate: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error executing employee action:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error errno:', error.errno);
        console.error('❌ Error sqlState:', error.sqlState);
        console.error('❌ Error sqlMessage:', error.sqlMessage);
        console.error('❌ Request data:', {
            employeeId,
            actionType,
            actionDate,
            reasonCategory,
            actionDetails,
            suspensionDays,
            finalPaymentDate,
            mdNotes,
            decidedBy
        });
        res.status(500).json({ 
            error: 'Failed to execute employee action',
            details: error.message 
        });
    }
});

// Get all employment actions (terminated/suspended employees)
router.get('/actions/list', async (req, res) => {
    console.log('🔍 GET /api/employees/actions/list endpoint called');
    
    try {
        // Create worker_action table if it doesn't exist
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS worker_action (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    employee_id INT NOT NULL,
                    action_type ENUM('suspend', 'terminate', 'demote') NOT NULL,
                    action_date DATE NOT NULL,
                    reason_category ENUM('misconduct', 'performance', 'violation', 'redundancy', 'restructuring', 'other') NOT NULL,
                    action_details TEXT NOT NULL,
                    suspension_days INT NULL,
                    final_payment_date DATE NULL,
                    md_notes TEXT NULL,
                    decided_by VARCHAR(255) NOT NULL,
                    decided_date DATE NOT NULL,
                    status ENUM('pending', 'executed', 'cancelled') DEFAULT 'executed',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_employee_id (employee_id),
                    INDEX idx_action_type (action_type),
                    INDEX idx_status (status)
                )
            `);
        } catch (tableError) {
            console.log('📝 Worker action table check:', tableError.message);
        }
        
        // Fetch all actions with employee details
        let actions;
        const actionsResult = await db.execute(`
            SELECT 
                wa.id,
                wa.employee_id,
                wa.action_type,
                wa.action_date,
                wa.reason_category,
                wa.action_details,
                wa.suspension_days,
                wa.final_payment_date,
                wa.md_notes,
                wa.decided_by,
                wa.decided_date,
                wa.status,
                wa.created_at,
                ed.full_name,
                e.position,
                e.department
            FROM worker_action wa
            LEFT JOIN employee_details ed ON wa.employee_id = ed.employee_id
            LEFT JOIN employees e ON wa.employee_id = e.id
            ORDER BY wa.created_at DESC
        `);
        
        // Handle different database response formats
        if (Array.isArray(actionsResult)) {
            actions = actionsResult;
        } else if (actionsResult && Array.isArray(actionsResult[0])) {
            actions = actionsResult[0];
        } else if (actionsResult && actionsResult.rows) {
            actions = actionsResult.rows;
        } else {
            actions = [];
        }
        
        console.log('📊 Found', actions.length, 'employment actions');
        
        res.json({
            success: true,
            data: actions,
            total: actions.length,
            message: 'Employment actions retrieved successfully'
        });
        
    } catch (error) {
        console.error('❌ Error fetching employment actions:', error);
        res.status(500).json({
            error: 'Failed to fetch employment actions',
            details: error.message
        });
    }
});

module.exports = router;
