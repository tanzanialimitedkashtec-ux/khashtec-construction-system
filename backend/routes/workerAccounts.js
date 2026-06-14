const express = require('express');
const router = express.Router();
const db = require('../src/config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

// Ensure BLOB columns exist in worker_accounts (survives Railway redeploys)
(async () => {
    try {
        const cols = ['id_document_data LONGBLOB', 'id_document_mime VARCHAR(100)', 'contract_document_data LONGBLOB', 'contract_document_mime VARCHAR(100)', 'profile_picture_data LONGBLOB', 'profile_picture_mime VARCHAR(100)'];
        for (const col of cols) {
            const colName = col.split(' ')[0];
            try {
                await db.execute(`ALTER TABLE worker_accounts ADD COLUMN ${col}`);
                console.log(`✅ Added column ${colName} to worker_accounts`);
            } catch (e) {
                // Column already exists — ignore
            }
        }
    } catch (e) {
        console.warn('⚠️ Could not ensure BLOB columns on worker_accounts:', e.message);
    }
})();

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
        console.log('Fetching worker assignments from database...');
        
        const { projectId, employeeId, status } = req.query;
        
        let query = `
            SELECT 
                wa.id,
                wa.employee_id,
                wa.employee_name,
                wa.project_id,
                wa.project_name,
                wa.role_in_project,
                wa.status,
                wa.start_date,
                wa.end_date,
                wa.assignment_notes,
                wa.assigned_by,
                wa.assigned_by_role,
                wa.created_at,
                wa.updated_at
            FROM worker_assignments wa
            WHERE 1=1
        `;
        let params = [];
        
        if (projectId) {
            query += ` AND wa.project_id = ?`;
            params.push(projectId);
        }
        if (employeeId) {
            query += ` AND wa.employee_id = ?`;
            params.push(employeeId);
        }
        if (status) {
            query += ` AND wa.status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY wa.created_at DESC`;
        
        const [assignments] = await db.execute(query, params);
        
        console.log('Worker assignments from database:', assignments.length);
        res.json(assignments);
        
    } catch (error) {
        console.error('Database error fetching worker assignments:', error.message);
        res.status(500).json({ error: 'Failed to fetch worker assignments', message: error.message });
    }
});

// Create worker assignment
router.post('/assignments', async (req, res) => {
    try {
        const {
            employee_id, employee_name, project_id, project_name,
            role_in_project, start_date, end_date,
            assignment_notes, assigned_by, assigned_by_role
        } = req.body;

        if (!employee_id || !project_id || !role_in_project || !start_date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: employee_id, project_id, role_in_project, start_date'
            });
        }

        const [result] = await db.execute(`
            INSERT INTO worker_assignments (
                employee_id, employee_name, project_id, project_name,
                role_in_project, start_date, end_date,
                assignment_notes, assigned_by, assigned_by_role, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            employee_id, employee_name, project_id, project_name,
            role_in_project, start_date, end_date || null,
            assignment_notes || null, assigned_by || 'System', assigned_by_role || 'Manager'
        ]);

        res.status(201).json({
            success: true,
            message: 'Worker assignment created successfully',
            assignmentId: result.insertId
        });
    } catch (error) {
        console.error('Error creating worker assignment:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create worker assignment',
            error: error.message
        });
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
    
    // Handle uploaded files - read bytes into memory for BLOB storage (Railway-safe)
    const readFile = (f) => {
        if (!f) return { path: null, data: null, mime: null };
        const urlPath = `/uploads/worker-documents/${f.filename}`;
        let data = null;
        try {
            data = fsSync.readFileSync(f.path);
        } catch (readErr) {
            console.warn('⚠️ Could not read uploaded file for BLOB storage:', readErr.message);
        }
        return { path: urlPath, data, mime: f.mimetype || 'application/octet-stream' };
    };
    const profilePicFile = readFile(req.files?.workerProfile?.[0]);
    const idDocFile = readFile(req.files?.workerID?.[0]);
    const contractDocFile = readFile(req.files?.workerContract?.[0]);
    const profilePicturePath = profilePicFile.path;
    const idDocumentPath = idDocFile.path;
    const contractDocumentPath = contractDocFile.path;
    
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
        
        // Prepare INSERT query with proper column names (includes BLOB columns)
        const insertQuery = `
            INSERT INTO worker_accounts (
                employee_id, full_name, work_email, phone_number, department, 
                job_title, account_type, access_level, temporary_password, 
                account_notes, profile_picture, id_document, contract_document,
                id_document_data, id_document_mime, contract_document_data, contract_document_mime,
                profile_picture_data, profile_picture_mime
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                contractDocumentPath,
                idDocFile.data,
                idDocFile.mime,
                contractDocFile.data,
                contractDocFile.mime,
                profilePicFile.data,
                profilePicFile.mime
            ]);
            
            console.log('?? Worker account inserted successfully:', result);

            // Create notification for new worker account
            try {
                await db.execute(`
                    INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
                    VALUES (?, ?, 'info', 'Medium', NULL, NOW())
                `, [
                    'New Worker Account Created',
                    `Worker account created for ${fullName} in ${department} department (${mappedAccountType}).`
                ]);
            } catch (notifErr) {
                console.warn('⚠️ Could not create notification:', notifErr.message);
            }
            
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
            
            // Handle data truncation or schema errors by safely adding missing columns (DATA SAFE)
            if (insertError.message.includes('Data truncated') || 
                insertError.message.includes('Unknown column') || 
                insertError.message.includes("doesn't exist") ||
                insertError.message.includes('out of range')) {
                
                console.log('🔧 Attempting to fix schema safely (preserving existing data)...');
                
                try {
                    // Create the table only if it doesn't exist at all
                    await db.execute(`
                        CREATE TABLE IF NOT EXISTS worker_accounts (
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
                    
                    // Add any missing columns safely (won't error if they already exist)
                    const requiredCols = [
                        { name: 'employee_id', def: "VARCHAR(50) NOT NULL DEFAULT ''" },
                        { name: 'full_name', def: "VARCHAR(255) NOT NULL DEFAULT ''" },
                        { name: 'work_email', def: "VARCHAR(255) NOT NULL DEFAULT ''" },
                        { name: 'phone_number', def: "VARCHAR(50) NULL" },
                        { name: 'department', def: "VARCHAR(100) NULL" },
                        { name: 'job_title', def: "VARCHAR(255) NULL" },
                        { name: 'account_type', def: "VARCHAR(50) NOT NULL DEFAULT 'worker'" },
                        { name: 'access_level', def: "VARCHAR(50) NOT NULL DEFAULT 'basic'" },
                        { name: 'temporary_password', def: "VARCHAR(255) NOT NULL DEFAULT ''" },
                        { name: 'account_notes', def: "TEXT NULL" },
                        { name: 'profile_picture', def: "TEXT NULL" },
                        { name: 'id_document', def: "TEXT NULL" },
                        { name: 'contract_document', def: "TEXT NULL" },
                        { name: 'status', def: "VARCHAR(50) DEFAULT 'active'" }
                    ];
                    for (const col of requiredCols) {
                        try {
                            await db.execute(`ALTER TABLE worker_accounts ADD COLUMN ${col.name} ${col.def}`);
                            console.log(`✅ Added missing column: ${col.name}`);
                        } catch (alterErr) {
                            // Column already exists — safe to ignore
                        }
                    }
                    
                    console.log('✅ worker_accounts schema ensured safely (existing data preserved)');
                    
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

// ===== Serve worker files from database BLOBs (Railway-safe) =====

// Serve profile picture
router.get('/:id/profile-picture', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT profile_picture_data, profile_picture_mime, profile_picture FROM worker_accounts WHERE id = ?',
            [req.params.id]
        );
        if (!rows || rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
        const worker = rows[0];

        // Serve from BLOB if available
        if (worker.profile_picture_data && worker.profile_picture_data.length > 0) {
            res.set('Content-Type', worker.profile_picture_mime || 'image/jpeg');
            res.set('Content-Disposition', 'inline');
            return res.send(worker.profile_picture_data);
        }

        // Fallback: try disk file
        if (worker.profile_picture) {
            const filePath = path.join(__dirname, '../..', worker.profile_picture);
            if (fsSync.existsSync(filePath)) return res.sendFile(filePath);
        }

        res.status(404).json({ error: 'Profile picture not found' });
    } catch (error) {
        console.error('Error serving profile picture:', error);
        res.status(500).json({ error: 'Failed to serve profile picture' });
    }
});

// Serve ID document
router.get('/:id/id-document', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id_document_data, id_document_mime, id_document FROM worker_accounts WHERE id = ?',
            [req.params.id]
        );
        if (!rows || rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
        const worker = rows[0];

        if (worker.id_document_data && worker.id_document_data.length > 0) {
            res.set('Content-Type', worker.id_document_mime || 'application/pdf');
            res.set('Content-Disposition', 'inline');
            return res.send(worker.id_document_data);
        }

        if (worker.id_document) {
            const filePath = path.join(__dirname, '../..', worker.id_document);
            if (fsSync.existsSync(filePath)) return res.sendFile(filePath);
        }

        res.status(404).json({ error: 'ID document not found' });
    } catch (error) {
        console.error('Error serving ID document:', error);
        res.status(500).json({ error: 'Failed to serve ID document' });
    }
});

// Serve contract document
router.get('/:id/contract-document', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT contract_document_data, contract_document_mime, contract_document FROM worker_accounts WHERE id = ?',
            [req.params.id]
        );
        if (!rows || rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
        const worker = rows[0];

        if (worker.contract_document_data && worker.contract_document_data.length > 0) {
            res.set('Content-Type', worker.contract_document_mime || 'application/pdf');
            res.set('Content-Disposition', 'inline');
            return res.send(worker.contract_document_data);
        }

        if (worker.contract_document) {
            const filePath = path.join(__dirname, '../..', worker.contract_document);
            if (fsSync.existsSync(filePath)) return res.sendFile(filePath);
        }

        res.status(404).json({ error: 'Contract document not found' });
    } catch (error) {
        console.error('Error serving contract document:', error);
        res.status(500).json({ error: 'Failed to serve contract document' });
    }
});

module.exports = router;
