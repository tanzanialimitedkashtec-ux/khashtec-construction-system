const express = require('express');
const router = express.Router();
const db = require('../src/config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { sendAssignmentNotification } = require('../utils/emailService');

// Ensure BLOB columns exist (runs once, non-blocking)
var _blobColsChecked = false;
function ensureBlobCols() {
    if (_blobColsChecked) return;
    _blobColsChecked = true;
    var cols = ['id_document_data LONGBLOB', 'id_document_mime VARCHAR(100)', 'contract_document_data LONGBLOB', 'contract_document_mime VARCHAR(100)', 'profile_picture_data LONGBLOB', 'profile_picture_mime VARCHAR(100)'];
    cols.forEach(function(col) {
        db.execute('ALTER TABLE worker_accounts ADD COLUMN ' + col).catch(function() {});
    });
}

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

        try {
            let recipientEmail = null;
            if (employee_name && employee_name.includes('@')) {
                recipientEmail = employee_name;
            } else {
                const [empRows] = await db.execute('SELECT gmail FROM employee_details WHERE full_name = ? OR gmail = ?', [employee_name, employee_name]);
                if (empRows && empRows.length > 0 && empRows[0].gmail) {
                    recipientEmail = empRows[0].gmail;
                }
            }

            if (recipientEmail) {
                const details = [
                    { label: 'Project Name', value: project_name },
                    { label: 'Role', value: role_in_project },
                    { label: 'Start Date', value: start_date },
                    { label: 'Assigned By', value: assigned_by || 'System' }
                ];
                sendAssignmentNotification(recipientEmail, details);
            }
        } catch (emailErr) {
            console.error('Failed to lookup email or send notification:', emailErr);
        }

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
    var notify = require('../utils/notify');
    const {
        empID, employeeId, fullName, email, workEmail, phone, phoneNumber,
        department, jobTitle, accountType, accessLevel, password,
        temporaryPassword, accountNotes
    } = req.body;

    var finalEmployeeId = empID || employeeId;
    var finalWorkEmail = email || workEmail;
    var finalPhoneNumber = phone || phoneNumber;
    var finalTemporaryPassword = password || temporaryPassword;

    if (!finalEmployeeId || !fullName || !finalWorkEmail || !finalPhoneNumber || !department || !jobTitle || !accountType || !accessLevel || !finalTemporaryPassword) {
        var missingFields = [
            !finalEmployeeId ? 'employeeId' : null,
            !fullName ? 'fullName' : null,
            !finalWorkEmail ? 'workEmail' : null,
            !finalPhoneNumber ? 'phoneNumber' : null,
            !department ? 'department' : null,
            !jobTitle ? 'jobTitle' : null,
            !accountType ? 'accountType' : null,
            !accessLevel ? 'accessLevel' : null,
            !finalTemporaryPassword ? 'temporaryPassword' : null
        ].filter(Boolean);
        return res.status(400).json({ error: 'All required fields must be provided', missing: missingFields });
    }

    var typeMap = { 'staff': 'staff', 'worker': 'worker', 'contractor': 'contractor', 'supervisor': 'worker', 'manager': 'staff' };
    var levelMap = { 'basic': 'basic', 'standard': 'standard', 'supervisor': 'supervisor', 'manager': 'supervisor', 'admin': 'supervisor' };
    var mappedAccountType = typeMap[accountType] || 'worker';
    var mappedAccessLevel = levelMap[accessLevel] || 'basic';

    if (!['staff', 'worker', 'contractor'].includes(mappedAccountType)) {
        return res.status(400).json({ error: 'Invalid account type. Must be: staff, worker, or contractor', received: mappedAccountType });
    }

    var profilePicturePath = req.files?.workerProfile?.[0] ? '/uploads/worker-documents/' + req.files.workerProfile[0].filename : null;
    var idDocumentPath = req.files?.workerID?.[0] ? '/uploads/worker-documents/' + req.files.workerID[0].filename : null;
    var contractDocumentPath = req.files?.workerContract?.[0] ? '/uploads/worker-documents/' + req.files.workerContract[0].filename : null;

    try {
        var result = await db.execute(
            'INSERT INTO worker_accounts (employee_id, full_name, work_email, phone_number, department, job_title, account_type, access_level, temporary_password, account_notes, profile_picture, id_document, contract_document) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [finalEmployeeId, fullName, finalWorkEmail, finalPhoneNumber, department, jobTitle, mappedAccountType, mappedAccessLevel, finalTemporaryPassword, accountNotes || null, profilePicturePath, idDocumentPath, contractDocumentPath]
        );

        var insertId = Array.isArray(result) ? (result[0]?.insertId || result.insertId) : result.insertId;

        notify('New Worker Account', fullName + ' (' + finalEmployeeId + ') - ' + department, 'success');

        res.status(201).json({
            message: 'Worker account created successfully',
            worker: {
                id: insertId,
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
            fallback: false
        });

        // Store file BLOBs in background (non-blocking) so response is instant
        if (insertId && (req.files?.workerProfile?.[0] || req.files?.workerID?.[0] || req.files?.workerContract?.[0])) {
            ensureBlobCols();
            setImmediate(async () => {
                try {
                    var updates = [];
                    var vals = [];
                    if (req.files?.workerProfile?.[0]) {
                        try { var d = fsSync.readFileSync(req.files.workerProfile[0].path); updates.push('profile_picture_data = ?, profile_picture_mime = ?'); vals.push(d, req.files.workerProfile[0].mimetype); } catch (e) {}
                    }
                    if (req.files?.workerID?.[0]) {
                        try { var d = fsSync.readFileSync(req.files.workerID[0].path); updates.push('id_document_data = ?, id_document_mime = ?'); vals.push(d, req.files.workerID[0].mimetype); } catch (e) {}
                    }
                    if (req.files?.workerContract?.[0]) {
                        try { var d = fsSync.readFileSync(req.files.workerContract[0].path); updates.push('contract_document_data = ?, contract_document_mime = ?'); vals.push(d, req.files.workerContract[0].mimetype); } catch (e) {}
                    }
                    if (updates.length > 0) {
                        vals.push(insertId);
                        await db.execute('UPDATE worker_accounts SET ' + updates.join(', ') + ' WHERE id = ?', vals);
                    }
                } catch (e) {
                    console.error('Background BLOB save error:', e.message);
                }
            });
        }
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            var msg = (error.message || '').toLowerCase();
            var empConflict = msg.includes('employee_id') || msg.includes(finalEmployeeId.toLowerCase());
            var emailConflict = msg.includes('work_email') || msg.includes('email');
            return res.status(409).json({
                error: 'Worker account already exists',
                message: empConflict ? 'Employee ID \'' + finalEmployeeId + '\' is already registered' : 'Email \'' + finalWorkEmail + '\' is already registered',
                field_conflicts: { employee_id: empConflict, work_email: emailConflict }
            });
        }

        if (error.message && (error.message.includes("doesn't exist") || error.message.includes('Unknown column'))) {
            try {
                await db.execute('CREATE TABLE IF NOT EXISTS worker_accounts (id INT AUTO_INCREMENT PRIMARY KEY, employee_id VARCHAR(50) NOT NULL UNIQUE, full_name VARCHAR(255) NOT NULL, work_email VARCHAR(255) NOT NULL, phone_number VARCHAR(50), department VARCHAR(100), job_title VARCHAR(255), account_type VARCHAR(50) NOT NULL DEFAULT \'worker\', access_level VARCHAR(50) NOT NULL DEFAULT \'basic\', temporary_password VARCHAR(255) NOT NULL, account_notes TEXT, profile_picture TEXT, id_document TEXT, contract_document TEXT, status VARCHAR(50) DEFAULT \'active\', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
                var retryResult = await db.execute(
                    'INSERT INTO worker_accounts (employee_id, full_name, work_email, phone_number, department, job_title, account_type, access_level, temporary_password, account_notes, profile_picture, id_document, contract_document) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [finalEmployeeId, fullName, finalWorkEmail, finalPhoneNumber, department, jobTitle, mappedAccountType, mappedAccessLevel, finalTemporaryPassword, accountNotes || null, profilePicturePath, idDocumentPath, contractDocumentPath]
                );
                var retryId = Array.isArray(retryResult) ? (retryResult[0]?.insertId || retryResult.insertId) : retryResult.insertId;
                return res.status(201).json({
                    message: 'Worker account created successfully',
                    worker: { id: retryId, employee_id: finalEmployeeId, full_name: fullName, status: 'active' },
                    fallback: false, schemaFixed: true
                });
            } catch (retryErr) {
                console.error('Schema fix retry failed:', retryErr.message);
            }
        }

        console.error('Error creating worker account:', error.message);
        res.status(500).json({ error: 'Failed to create worker account', details: error.message });
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
