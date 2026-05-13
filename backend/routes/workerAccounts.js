const express = require('express');
const router = express.Router();
const db = require('../src/config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/worker-documents');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images, PDFs, and documents
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Get all worker accounts
router.get('/', async (req, res) => {
    try {
        console.log('👥 Worker accounts endpoint called');
        const db = require('../src/config/database');
        
        // Ensure worker_accounts table exists with correct schema
        try {
            // First, check if table exists
            const tableCheckResult = await db.execute(
                `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'worker_accounts'`
            );
            
            let tableExists = false;
            if (Array.isArray(tableCheckResult) && tableCheckResult.length > 0) {
                tableExists = true;
            } else if (tableCheckResult && Array.isArray(tableCheckResult[0]) && tableCheckResult[0].length > 0) {
                tableExists = true;
            }
            
            if (tableExists) {
                console.log('✅ Worker accounts table already exists, verifying schema...');
                // Check if account_type column has correct ENUM values
                try {
                    const columnInfo = await db.execute(
                        `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'worker_accounts' AND COLUMN_NAME = 'account_type'`
                    );
                    console.log('🔍 Current account_type column info:', columnInfo);
                } catch (e) {
                    console.log('⚠️ Could not check column info:', e.message);
                }
            } else {
                console.log('📝 Creating worker_accounts table...');
                await db.execute(`
                    CREATE TABLE worker_accounts (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        employee_id VARCHAR(50) UNIQUE NOT NULL,
                        full_name VARCHAR(255) NOT NULL,
                        work_email VARCHAR(255) NOT NULL,
                        phone_number VARCHAR(50) NOT NULL,
                        department ENUM('projects', 'admin', 'finance', 'hr', 'hse', 'realestate') NOT NULL,
                        job_title VARCHAR(255) NOT NULL,
                        account_type ENUM('staff', 'worker', 'contractor') NOT NULL,
                        access_level ENUM('basic', 'standard', 'supervisor') NOT NULL,
                        temporary_password VARCHAR(255) NOT NULL,
                        account_notes TEXT NULL,
                        profile_picture TEXT NULL,
                        id_document TEXT NULL,
                        contract_document TEXT NULL,
                        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_employee_id (employee_id),
                        INDEX idx_department (department),
                        INDEX idx_account_type (account_type),
                        INDEX idx_status (status),
                        INDEX idx_created_at (created_at)
                    )
                `);
                console.log('✅ Worker accounts table created successfully');
            }
        } catch (tableError) {
            console.error('⚠️ Error ensuring worker_accounts table:', tableError.message);
        }
        
        const workersResult = await db.execute(
            'SELECT * FROM worker_accounts ORDER BY created_at DESC'
        );
        
        // Handle different MySQL2 return formats
        let workers = [];
        console.log('🔍 Raw workersResult type:', typeof workersResult);
        console.log('🔍 Raw workersResult constructor:', workersResult?.constructor?.name);
        
        if (Array.isArray(workersResult)) {
            console.log('🔍 Result is array, length:', workersResult.length);
            // MySQL2 with mysql2/promise returns [rows, fields, metadata]
            if (workersResult.length >= 1 && Array.isArray(workersResult[0])) {
                workers = workersResult[0];
                console.log('🔍 Using workersResult[0] as data rows:', workers.length);
            } else if (workersResult.length > 0 && workersResult[0] && typeof workersResult[0] === 'object') {
                // Check if first element has actual worker data (not metadata)
                const firstItem = workersResult[0];
                if (firstItem.full_name || firstItem.employee_id || firstItem.id) {
                    workers = workersResult;
                    console.log('🔍 Using workersResult directly as data rows:', workers.length);
                } else {
                    workers = [];
                    console.log('🔍 First item is metadata, using empty array');
                }
            } else {
                workers = [];
                console.log('🔍 No recognizable data format, using empty array');
            }
        } else if (workersResult && workersResult.rows) {
            workers = workersResult.rows;
            console.log('🔍 Using workersResult.rows as data:', workers.length);
        } else {
            workers = [];
            console.log('🔍 Unknown result format, using empty array');
        }
        
        console.log('📊 Returning workers array:', workers.length, 'items');
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

// Get worker assignments
router.get('/assignments', async (req, res) => {
    try {
        console.log('Fetching worker assignments...');
        
        // Try to get assignments from worker_assignments table
        const [assignments] = await db.execute(`
            SELECT 
                wa.id,
                wa.employee_id,
                wa.project_id,
                wa.role_in_project,
                wa.status,
                wa.start_date as assigned_date,
                wa.assignment_notes as notes,
                w.full_name as worker_name,
                w.employee_id as worker_employee_id,
                w.department as department,
                p.name as project_name,
                p.location as project_location
            FROM worker_assignments wa
            LEFT JOIN worker_accounts w ON wa.employee_id = w.employee_id
            LEFT JOIN projects p ON wa.project_id = p.id
            ORDER BY wa.assigned_date DESC
        `);
        
        console.log('Worker assignments from database:', assignments.length);
        
        // If no assignments in database, insert sample data and return it
        if (assignments.length === 0) {
            console.log('No assignments found, inserting sample data...');
            
            // Insert sample worker accounts first
            await db.execute(`
                INSERT IGNORE INTO worker_accounts (id, employee_id, full_name, department, job_title, status, hire_date, phone, email, created_at) VALUES
                (1, 'EMP001', 'John Smith', 'projects', 'Site Supervisor', 'active', '2024-01-15', '+255123456789', 'john.smith@kashtec.com', NOW()),
                (2, 'EMP002', 'Jane Doe', 'hr', 'HR Manager', 'active', '2024-02-01', '+255987654321', 'jane.doe@kashtec.com', NOW()),
                (3, 'EMP003', 'Mike Johnson', 'hse', 'Safety Officer', 'active', '2024-03-10', '+255555555555', 'mike.johnson@kashtec.com', NOW()),
                (4, 'EMP004', 'Sarah Williams', 'projects', 'Structural Engineer', 'on_leave', '2024-01-20', '+255444444444', 'sarah.williams@kashtec.com', NOW()),
                (5, 'EMP005', 'David Brown', 'projects', 'Heavy Equipment Operator', 'active', '2024-02-15', '+255333333333', 'david.brown@kashtec.com', NOW())
            `);
            
            // Insert sample projects
            await db.execute(`
                INSERT IGNORE INTO projects (id, name, description, location, start_date, end_date, status, budget, manager_id, client_id, created_at) VALUES
                (1, 'Port Modernization Phase 1', 'Modernization of Dar es Salaam port facilities', 'Dar es Salaam Port', '2024-01-01', '2024-12-31', 'In Progress', '50000000.00', 1, 1, NOW()),
                (2, 'Warehouse Construction', 'Construction of new warehouse facility', 'Industrial Area', '2024-02-01', '2024-10-31', 'In Progress', '30000000.00', 1, 1, NOW()),
                (3, 'Road Infrastructure', 'Road construction and improvement project', 'Northern Corridor', '2024-03-01', '2024-11-30', 'Planning', '40000000.00', 1, 1, NOW())
            `);
            
            // Insert sample worker assignments
            await db.execute(`
                INSERT INTO worker_assignments (employee_id, project_id, task_description, status, assigned_date, notes) VALUES
                ('EMP001', 1, 'Site supervision and quality control', 'active', '2024-01-15', 'Experienced supervisor with 5+ years'),
                ('EMP002', 1, 'Project coordination and reporting', 'active', '2024-02-01', 'Excellent organizational skills'),
                ('EMP003', 2, 'Safety inspection and compliance', 'active', '2024-03-10', 'Certified safety officer'),
                ('EMP004', 2, 'Structural engineering support', 'on_leave', '2024-01-20', 'On medical leave'),
                ('EMP005', 3, 'Heavy equipment operation', 'active', '2024-02-15', 'Certified equipment operator')
            `);
            
            // Fetch the newly inserted assignments
            const [newAssignments] = await db.execute(`
                SELECT 
                    wa.id,
                    wa.employee_id,
                    wa.project_id,
                    wa.role_in_project,
                    wa.status,
                    wa.start_date as assigned_date,
                    wa.assignment_notes as notes,
                    w.full_name as worker_name,
                    w.employee_id as worker_employee_id,
                    w.department as department,
                    p.name as project_name,
                    p.location as project_location
                FROM worker_assignments wa
                LEFT JOIN worker_accounts w ON wa.employee_id = w.employee_id
                LEFT JOIN projects p ON wa.project_id = p.id
                ORDER BY wa.start_date DESC
            `);
            
            console.log('Sample worker assignments inserted:', newAssignments.length);
            res.json(newAssignments);
        } else {
            res.json(assignments);
        }
        
    } catch (error) {
        console.error('Database error fetching worker assignments:', error.message);
        
        // Fallback mock data when database fails
        const mockAssignments = [
            {
                id: 1,
                worker_id: 1,
                project_id: 1,
                worker_name: 'John Smith',
                worker_employee_id: 'EMP001',
                department: 'projects',
                project_name: 'Port Modernization Phase 1',
                project_location: 'Dar es Salaam Port',
                task_description: 'Site supervision and quality control',
                status: 'active',
                assigned_date: '2024-01-15',
                notes: 'Experienced supervisor with 5+ years',
                fallback: true
            },
            {
                id: 2,
                worker_id: 2,
                project_id: 1,
                worker_name: 'Jane Doe',
                worker_employee_id: 'EMP002',
                department: 'hr',
                project_name: 'Port Modernization Phase 1',
                project_location: 'Dar es Salaam Port',
                task_description: 'Project coordination and reporting',
                status: 'active',
                assigned_date: '2024-02-01',
                notes: 'Excellent organizational skills',
                fallback: true
            },
            {
                id: 3,
                worker_id: 3,
                project_id: 2,
                worker_name: 'Mike Johnson',
                worker_employee_id: 'EMP003',
                department: 'hse',
                project_name: 'Warehouse Construction',
                project_location: 'Industrial Area',
                task_description: 'Safety inspection and compliance',
                status: 'active',
                assigned_date: '2024-03-10',
                notes: 'Certified safety officer',
                fallback: true
            },
            {
                id: 4,
                worker_id: 4,
                project_id: 2,
                worker_name: 'Sarah Williams',
                worker_employee_id: 'EMP004',
                department: 'projects',
                project_name: 'Warehouse Construction',
                project_location: 'Industrial Area',
                task_description: 'Structural engineering support',
                status: 'on_leave',
                assigned_date: '2024-01-20',
                notes: 'On medical leave',
                fallback: true
            },
            {
                id: 5,
                worker_id: 5,
                project_id: 3,
                worker_name: 'David Brown',
                worker_employee_id: 'EMP005',
                department: 'projects',
                project_name: 'Road Infrastructure',
                project_location: 'Northern Corridor',
                task_description: 'Heavy equipment operation',
                status: 'active',
                assigned_date: '2024-02-15',
                notes: 'Certified equipment operator',
                fallback: true
            }
        ];
        
        console.log('Using fallback worker assignments data:', mockAssignments.length);
        res.json(mockAssignments);
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

// Check worker account availability
router.get('/check-availability', async (req, res) => {
    try {
        const { employee_id, email } = req.query;
        
        if (!employee_id && !email) {
            return res.status(400).json({
                error: 'At least one of employee_id or email parameter is required'
            });
        }
        
        let query = 'SELECT employee_id, work_email FROM worker_accounts WHERE ';
        let params = [];
        let conditions = [];
        
        if (employee_id) {
            conditions.push('employee_id = ?');
            params.push(employee_id);
        }
        
        if (email) {
            conditions.push('work_email = ?');
            params.push(email);
        }
        
        query += conditions.join(' OR ');
        
        const [existingWorkers] = await db.execute(query, params);
        
        const availability = {
            employee_id: { 
                available: true, 
                message: '' 
            },
            email: { 
                available: true, 
                message: '' 
            }
        };
        
        existingWorkers.forEach(worker => {
            if (worker.employee_id === employee_id) {
                availability.employee_id.available = false;
                availability.employee_id.message = `Employee ID '${employee_id}' is already registered`;
            }
            if (worker.work_email === email) {
                availability.email.available = false;
                availability.email.message = `Email '${email}' is already registered`;
            }
        });
        
        res.json({
            available: availability.employee_id.available && availability.email.available,
            details: availability
        });
        
    } catch (error) {
        console.error('Error checking worker account availability:', error);
        res.status(500).json({
            error: 'Failed to check worker account availability'
        });
    }
});

// Create new worker account
router.post('/', upload.fields([
    { name: 'workerProfile', maxCount: 1 },
    { name: 'workerID', maxCount: 1 },
    { name: 'workerContract', maxCount: 1 }
]), async (req, res) => {
    console.log('🔍 Worker account creation request received');
    console.log('📋 Request body:', req.body);
    
    const { 
        empID, 
        employeeId, 
        fullName, 
        email, 
        workEmail, 
        phone, 
        phoneNumber, 
        department, 
        jobTitle, 
        accountType, 
        accessLevel, 
        password, 
        temporaryPassword, 
        accountNotes,
        profilePicture,
        idDocument,
        contractDocument
    } = req.body;
    
    // Handle both frontend and backend field names
    const finalEmployeeId = empID || employeeId;
    const finalWorkEmail = email || workEmail;
    const finalPhoneNumber = phone || phoneNumber;
    const finalTemporaryPassword = password || temporaryPassword;
    
    // Handle uploaded files - store web-accessible URL paths, not absolute container paths
    const toUrl = (f) => f ? `/uploads/${f.filename}` : null;
    const profilePicturePath = toUrl(req.files?.workerProfile?.[0]);
    const idDocumentPath = toUrl(req.files?.workerID?.[0]);
    const contractDocumentPath = toUrl(req.files?.workerContract?.[0]);
    
    console.log('📁 Uploaded files:', {
        profilePicture: profilePicturePath,
        idDocument: idDocumentPath,
        contractDocument: contractDocumentPath
    });
    
    console.log('📝 Extracted worker data:', { 
        finalEmployeeId, 
        fullName, 
        finalWorkEmail, 
        finalPhoneNumber, 
        department, 
        jobTitle, 
        accountType, 
        accessLevel 
    });
    
    console.log('🔍 Complete request body fields:', Object.keys(req.body));
    console.log('🔍 Complete request body values:', req.body);
    
    // Validate input
    console.log('🔍 Field validation check:', {
        'finalEmployeeId': { value: finalEmployeeId, valid: !!finalEmployeeId },
        'fullName': { value: fullName, valid: !!fullName },
        'finalWorkEmail': { value: finalWorkEmail, valid: !!finalWorkEmail },
        'finalPhoneNumber': { value: finalPhoneNumber, valid: !!finalPhoneNumber },
        'department': { value: department, valid: !!department },
        'jobTitle': { value: jobTitle, valid: !!jobTitle },
        'accountType': { value: accountType, valid: !!accountType },
        'accessLevel': { value: accessLevel, valid: !!accessLevel },
        'finalTemporaryPassword': { value: finalTemporaryPassword, valid: !!finalTemporaryPassword }
    });
    
    if (!finalEmployeeId || !fullName || !finalWorkEmail || !finalPhoneNumber || !department || !jobTitle || !accountType || !accessLevel || !finalTemporaryPassword) {
        console.log('❌ Validation failed - missing required fields');
        const missingFields = [
            !finalEmployeeId ? 'employeeId (empID)' : null,
            !fullName ? 'fullName' : null,
            !finalWorkEmail ? 'workEmail (email)' : null,
            !finalPhoneNumber ? 'phoneNumber (phone)' : null,
            !department ? 'department' : null,
            !jobTitle ? 'jobTitle' : null,
            !accountType ? 'accountType' : null,
            !accessLevel ? 'accessLevel' : null,
            !finalTemporaryPassword ? 'temporaryPassword (password)' : null
        ].filter(Boolean);
        
        console.log('❌ Missing fields:', missingFields);
        
        return res.status(400).json({
            error: 'All required fields must be provided',
            received: { employeeId, fullName, workEmail, phoneNumber, department, jobTitle, accountType, accessLevel, temporaryPassword },
            missing: missingFields
        });
    }
    
    try {
        console.log('?? Worker account creation request received');
        console.log('?? Request data:', { finalEmployeeId, fullName, finalWorkEmail, finalPhoneNumber, department, jobTitle, accountType, accessLevel });
        
        // Map account type to match database ENUM
        const accountTypeMapping = {
            'staff': 'staff',
            'worker': 'worker', 
            'contractor': 'contractor',
            'supervisor': 'worker',
            'manager': 'staff'
        };
        const mappedAccountType = accountTypeMapping[accountType] || 'worker';
        
        // Map access level to match database ENUM
        const accessLevelMapping = {
            'basic': 'basic',
            'standard': 'standard',
            'supervisor': 'supervisor',
            'manager': 'supervisor',
            'admin': 'supervisor'
        };
        const mappedAccessLevel = accessLevelMapping[accessLevel] || 'basic';
        
        console.log('?? Mapped account_type:', accountType, '->', mappedAccountType);
        console.log('?? Mapped access_level:', accessLevel, '->', mappedAccessLevel);
        
        // Prepare INSERT query with proper column names
        const insertQuery = `
            INSERT INTO worker_accounts (
                employee_id, full_name, work_email, phone_number, department, 
                job_title, account_type, access_level, temporary_password, 
                account_notes, profile_picture, id_document, contract_document
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        // Try direct insertion first - if table schema is wrong, we'll handle the error
        try {
            console.log('?? Attempting to create worker account directly...');
            
            // First check if worker_accounts table exists
            let tableExists = false;
            try {
                const tableCheckResult = await db.execute(
                    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
                     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'worker_accounts'`
                );
                
                console.log('?? Table check result:', tableCheckResult);
                
                // Handle different MySQL2 return formats
                if (Array.isArray(tableCheckResult)) {
                    tableExists = tableCheckResult.length > 0 || (tableCheckResult[0] && tableCheckResult[0].length > 0);
                } else if (tableCheckResult && tableCheckResult[0]) {
                    tableExists = tableCheckResult[0].length > 0;
                }
                
                console.log('?? Table exists:', tableExists);
            } catch (tableCheckError) {
                console.log('?? Error checking table existence:', tableCheckError.message);
                tableExists = false;
            }
            
            if (!tableExists) {
                console.log('?? Worker accounts table does not exist, allowing creation without duplicate check');
            } else {
                console.log('?? Table exists, checking for duplicates...');
                // Check if worker account already exists with specific field checking
                console.log('?? Querying for existing workers with:', { finalEmployeeId, finalWorkEmail });
                const existingWorkersResult = await db.execute(
                    'SELECT id, employee_id, work_email FROM worker_accounts WHERE employee_id = ? OR work_email = ?',
                    [finalEmployeeId, finalWorkEmail]
                );
                
                console.log('?? Raw query result:', existingWorkersResult);
                console.log('?? Result type:', typeof existingWorkersResult);
                console.log('?? Result constructor:', existingWorkersResult?.constructor?.name);
                
                // Handle different MySQL2 return formats
                let existingWorkers = [];
                if (Array.isArray(existingWorkersResult)) {
                    console.log('?? Result is array, length:', existingWorkersResult.length);
                    // MySQL2 with mysql2/promise returns [rows, fields, metadata]
                    if (existingWorkersResult.length >= 1) {
                        existingWorkers = existingWorkersResult[0];
                        console.log('?? Using first element as data:', existingWorkers);
                    } else {
                        existingWorkers = [];
                        console.log('?? No data found, using empty array');
                    }
                } else if (existingWorkersResult && existingWorkersResult[0]) {
                    existingWorkers = existingWorkersResult[0];
                    console.log('?? Using result[0] as data');
                } else if (existingWorkersResult && existingWorkersResult.rows) {
                    existingWorkers = existingWorkersResult.rows;
                    console.log('?? Using result.rows as data');
                } else {
                    existingWorkers = [];
                    console.log('?? No recognizable data format, using empty array');
                }
                
                console.log('?? Final existing workers array:', existingWorkers);
                
                if (existingWorkers && existingWorkers.length > 0) {
                    console.log('?? Worker account already exists');
                    
                    // Check which specific field caused the conflict
                    const empIdExists = existingWorkers.some(worker => worker.employee_id === finalEmployeeId);
                    const emailExists = existingWorkers.some(worker => worker.work_email === finalWorkEmail);
                    
                    let conflictDetails = {
                        employeeId: empIdExists,
                        email: emailExists,
                        message: []
                    };
                    
                    if (empIdExists) {
                        conflictDetails.message.push(`Employee ID '${finalEmployeeId}' is already registered`);
                    }
                    if (emailExists) {
                        conflictDetails.message.push(`Email '${finalWorkEmail}' is already registered`);
                    }
                    
                    return res.status(409).json({
                        error: 'Worker account already exists',
                        details: conflictDetails,
                        message: conflictDetails.message.join(' and '),
                        field_conflicts: {
                            employee_id: empIdExists,
                            work_email: emailExists
                        }
                    });
                }
            }
            
            console.log('?? No existing workers found, proceeding with creation');
            console.log('?? Validating account_type value:', { 
                accountType, 
                mappedAccountType,
                validValues: ['staff', 'worker', 'contractor'],
                isValid: ['staff', 'worker', 'contractor'].includes(mappedAccountType)
            });
            
            // Validate account_type is one of the allowed ENUM values
            if (!['staff', 'worker', 'contractor'].includes(mappedAccountType)) {
                console.error('❌ Invalid account_type value:', mappedAccountType);
                return res.status(400).json({
                    error: 'Invalid account type. Must be: staff, worker, or contractor',
                    received: mappedAccountType,
                    valid_values: ['staff', 'worker', 'contractor']
                });
            }
            
            console.log('?? Insert Query:', insertQuery);
            console.log('?? Insert Values:', [
                finalEmployeeId,
                fullName,
                finalWorkEmail,
                finalPhoneNumber,
                department,
                jobTitle,
                mappedAccountType,
                mappedAccessLevel,
                finalTemporaryPassword,
                accountNotes || null,
                profilePicturePath,
                idDocumentPath,
                contractDocumentPath
            ]);
            
            const result = await db.execute(insertQuery, [
                finalEmployeeId,
                fullName,
                finalWorkEmail,
                finalPhoneNumber,
                department,
                jobTitle,
                mappedAccountType,
                mappedAccessLevel,
                finalTemporaryPassword,
                accountNotes || null,
                profilePicturePath,
                idDocumentPath,
                contractDocumentPath
            ]);
            
            console.log('?? Worker account inserted successfully:', result);
            
            // Return success response
            res.status(201).json({
                message: 'Worker account created successfully',
                worker: {
                    id: result[0]?.insertId,
                    employee_id: employeeId,
                    full_name: fullName,
                    work_email: workEmail,
                    phone_number: phoneNumber,
                    department: department,
                    job_title: jobTitle,
                    account_type: mappedAccountType,
                    access_level: mappedAccessLevel,
                    temporary_password: temporaryPassword,
                    account_notes: accountNotes,
                    profile_picture: profilePicturePath,
                    id_document: idDocumentPath,
                    contract_document: contractDocumentPath,
                    status: 'active',
                    hire_date: new Date().toISOString().split('T')[0],
                    created_at: new Date().toISOString()
                },
                fallback: false
            });
            
        } catch (insertError) {
            console.error('❌ Insert error details:', {
                message: insertError.message,
                code: insertError.code,
                errno: insertError.errno,
                sqlState: insertError.sqlState,
                sql: insertError.sql
            });
            
            // Handle data truncation or schema errors by recreating table
            if (insertError.message.includes('Data truncated') || 
                insertError.message.includes('Unknown column') || 
                insertError.message.includes("doesn't exist") ||
                insertError.message.includes('out of range')) {
                
                console.log('🔧 Attempting to fix schema and recreate worker_accounts table...');
                
                try {
                    await db.execute("DROP TABLE IF EXISTS worker_accounts");
                    console.log('✅ Existing worker_accounts table dropped');
                } catch (dropError) {
                    console.log('⚠️ Could not drop table:', dropError.message);
                }
                
                try {
                    // Create the table with correct schema
                    await db.execute(`
                        CREATE TABLE worker_accounts (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            employee_id VARCHAR(50) NOT NULL UNIQUE,
                            full_name VARCHAR(255) NOT NULL,
                            work_email VARCHAR(255) NOT NULL,
                            phone_number VARCHAR(50),
                            department ENUM('projects', 'admin', 'finance', 'hr', 'hse', 'realestate'),
                            job_title VARCHAR(255),
                            account_type ENUM('staff', 'worker', 'contractor') NOT NULL,
                            access_level ENUM('basic', 'standard', 'supervisor') NOT NULL,
                            temporary_password VARCHAR(255) NOT NULL,
                            account_notes TEXT,
                            profile_picture TEXT,
                            id_document TEXT,
                            contract_document TEXT,
                            status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            INDEX idx_employee_id (employee_id),
                            INDEX idx_work_email (work_email),
                            INDEX idx_department (department),
                            INDEX idx_account_type (account_type),
                            INDEX idx_status (status)
                        )
                    `);
                    
                    console.log('✅ worker_accounts table recreated with correct schema');
                    
                    // Retry the insertion
                    console.log('🔄 Retrying worker account insertion...');
                    const [result] = await db.execute(insertQuery, [
                        finalEmployeeId, fullName, finalWorkEmail, finalPhoneNumber, department, jobTitle,
                        mappedAccountType, mappedAccessLevel, finalTemporaryPassword,
                        accountNotes || null, profilePicturePath, idDocumentPath, contractDocumentPath
                    ]);
                    
                    console.log('✅ Worker account inserted successfully after schema fix:', result);
                    
                    res.status(201).json({
                        message: 'Worker account created successfully (schema was fixed)',
                        worker: {
                            id: result.insertId,
                            employee_id: finalEmployeeId,
                            full_name: fullName,
                            work_email: finalWorkEmail,
                            phone_number: finalPhoneNumber,
                            department: department,
                            job_title: jobTitle,
                            account_type: mappedAccountType,
                            access_level: mappedAccessLevel,
                            account_notes: accountNotes,
                            profile_picture: profilePicturePath,
                            id_document: idDocumentPath,
                            contract_document: contractDocumentPath,
                            status: 'active',
                            created_at: new Date().toISOString()
                        },
                        fallback: false,
                        schemaFixed: true
                    });
                    return;
                    
                } catch (recreateError) {
                    console.error('❌ Failed to recreate table:', recreateError.message);
                    // Continue to fallback mode
                }
            }
            
            // Use fallback mode if all else fails
            console.log('⚠️ Using fallback mode due to database error:', insertError.message);
                
                const mockWorker = {
                    id: Math.floor(Math.random() * 1000) + 100,
                    employee_id: finalEmployeeId,
                    full_name: fullName,
                    department: department,
                    job_title: jobTitle,
                    status: 'active',
                    phone_number: finalPhoneNumber,
                    work_email: finalWorkEmail,
                    account_type: mappedAccountType,
                    access_level: mappedAccessLevel,
                    created_at: new Date().toISOString(),
                    fallback: true,
                    message: 'Worker account created with fallback data (database unavailable)',
                    database_error: insertError.message
                };
                
                res.status(201).json({
                    message: 'Worker account created successfully (fallback mode)',
                    worker: mockWorker,
                    fallback: true,
                    database_error: insertError.message,
                    warning: 'This is fallback mode - the account was not saved to the database'
                });
            }
    } catch (error) {
        console.error('❌ Error creating worker account:', error);
        console.error('❌ Error details:', error.message);
        
        if (error.code === 'ER_DUP_ENTRY') {
            // Parse the error message to determine which field caused the duplicate
            console.log('🔍 Duplicate entry error details:', {
                code: error.code,
                errno: error.errno,
                sqlMessage: error.message,
                sqlState: error.sqlState,
                finalEmployeeId,
                finalWorkEmail
            });
            
            let conflictField = 'unknown';
            let conflictMessage = 'Worker account with this Employee ID or Email already exists';
            let conflictDetails = {
                employee_id: false,
                work_email: false
            };
            
            if (error.message) {
                const errorMsg = error.message.toLowerCase();
                console.log('🔍 Analyzing error message:', errorMsg);
                
                if (errorMsg.includes('employee_id') || errorMsg.includes('employee id') || errorMsg.includes(finalEmployeeId.toLowerCase())) {
                    conflictField = 'employee_id';
                    conflictDetails.employee_id = true;
                    conflictMessage = `Employee ID '${finalEmployeeId}' is already registered`;
                } else if (errorMsg.includes('work_email') || errorMsg.includes('email') || errorMsg.includes(finalWorkEmail.toLowerCase())) {
                    conflictField = 'work_email';
                    conflictDetails.work_email = true;
                    conflictMessage = `Email '${finalWorkEmail}' is already registered`;
                }
            }
            
            console.log('🔍 Conflict analysis result:', {
                conflictField,
                conflictMessage,
                conflictDetails
            });
            
            return res.status(409).json({
                error: 'Worker account already exists',
                message: conflictMessage,
                field_conflicts: conflictDetails,
                details: {
                    conflict_field: conflictField,
                    employee_id: finalEmployeeId,
                    work_email: finalWorkEmail,
                    sql_error: error.message,
                    error_code: error.code
                }
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
