const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('🚀 Office portal route file is being loaded...');

// Normalize legacy/absolute upload paths to web-accessible relative URLs.
// Handles values like:
//   /app/uploads/profileImage-123.jpg  -> /uploads/profileImage-123.jpg
//   uploads/profiles/file.jpg          -> /uploads/profiles/file.jpg
//   C:\\path\\to\\uploads\\file.jpg    -> /uploads/file.jpg
//   null/empty                         -> default avatar
function normalizeImagePath(p, fallback = '/assets/images/default-avatar.png') {
    if (!p || typeof p !== 'string') return fallback;
    let s = p.replace(/\\/g, '/').trim();
    // Strip everything up to and including 'uploads/'
    const idx = s.toLowerCase().lastIndexOf('uploads/');
    if (idx !== -1) {
        s = '/' + s.slice(idx);
    } else if (!s.startsWith('/') && !/^https?:\/\//i.test(s)) {
        s = '/' + s;
    }
    return s;
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = file.fieldname === 'profileImage' ? 'uploads/profiles' : 'uploads/passports';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, req.body.employeeId + '-' + file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Office portal test endpoint accessed');
    res.json({ 
        message: 'Office portal API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully'
    });
});

// Get all personnel (employees + workers)
router.get('/users', async (req, res) => {
    try {
        console.log('👥 Fetching all personnel for office portal...');
        
        const { department, role, status } = req.query;
        
        let personnel = [];
        
        try {
            const db = require('../../database/config/database');
            
            // Get employees from users table
            const [employees] = await db.execute(`
                SELECT u.*, e.position, e.department as emp_department, e.salary, e.hire_date,
                       ed.full_name, ed.gmail, ed.phone, ed.nida, ed.passport, ed.profile_image,
                       ed.contract_type
                FROM users u
                LEFT JOIN employees e ON u.id = e.user_id
                LEFT JOIN employee_details ed ON e.id = ed.employee_id
                WHERE u.role IN ('Employee', 'Worker', 'HR Manager', 'Finance Manager', 'Project Manager', 'Real Estate Manager', 'HSE Manager', 'Office Assistant')
                ORDER BY u.created_at DESC
            `);
            
            // Transform data for frontend
            personnel = employees.map(emp => ({
                id: emp.id,
                name: emp.name || emp.full_name,
                email: emp.email || emp.gmail,
                phone: emp.phone,
                role: emp.role,
                department: emp.emp_department || emp.department,
                position: emp.position,
                salary: emp.salary,
                hireDate: emp.hire_date,
                status: emp.status,
                nida: emp.nida,
                passport: emp.passport,
                profileImage: `/api/profile-image/${emp.id}`,
                passportImage: emp.passport ? `/uploads/passports/${emp.passport}.jpg` : null,
                contractType: emp.contract_type,
                registrationDate: emp.registration_date || emp.created_at,
                type: emp.role === 'Worker' ? 'worker' : 'employee',
                // Additional fields for office portal
                accessLevel: emp.role === 'Managing Director' ? 'full' : 'standard',
                lastLogin: emp.last_login,
                permissions: getPermissionsForRole(emp.role),
                documents: [],
                certifications: [],
                trainingCompleted: []
            }));
            
            console.log('✅ Personnel fetched from database:', personnel.length);
            
        } catch (dbError) {
            console.error('❌ Database error:', dbError);
            throw dbError;
        }
        
        // Apply filters if provided
        if (department) {
            personnel = personnel.filter(p => p.department === department);
        }
        
        if (role) {
            personnel = personnel.filter(p => p.role === role);
        }
        
        if (status) {
            personnel = personnel.filter(p => p.status === status);
        }
        
        // Calculate statistics
        const stats = {
            totalStaff: personnel.length,
            totalEmployees: personnel.filter(p => p.type === 'employee').length,
            totalWorkers: personnel.filter(p => p.type === 'worker').length,
            activeStaff: personnel.filter(p => p.status === 'Active').length,
            byDepartment: personnel.reduce((acc, person) => {
                acc[person.department] = (acc[person.department] || 0) + 1;
                return acc;
            }, {}),
            byRole: personnel.reduce((acc, person) => {
                acc[person.role] = (acc[person.role] || 0) + 1;
                return acc;
            }, {})
        };
        
        res.json({
            success: true,
            personnel: personnel,
            statistics: stats,
            total: personnel.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching personnel:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch personnel',
            details: error.message 
        });
    }
});

// Permissions are defined in the shared canonical role model.
const { getPermissionsForRole } = require('../config/roles');

// Get documents for office portal
router.get('/documents', async (req, res) => {
    try {
        console.log('📄 Fetching documents for office portal...');
        
        const { category, department, status } = req.query;
        
        let documents = [];
        
        try {
            const db = require('../../database/config/database');
            
            // Get documents from admin_work table (document uploads)
            const [docItems] = await db.execute(`
                SELECT * FROM admin_work 
                WHERE work_type IN ('Document Management', 'Document Upload')
                ORDER BY submitted_date DESC
            `);
            
            // Get documents from documents table
            const [docRecords] = await db.execute(`
                SELECT * FROM documents 
                ORDER BY created_at DESC
            `);
            
            // Combine and transform data
            documents = [
                ...docItems.map(item => ({
                    id: item.id,
                    title: item.work_title,
                    description: item.work_description,
                    category: item.work_type === 'Document Upload' ? 'Uploaded' : 'Management',
                    type: 'PDF',
                    uploadedBy: item.submitted_by,
                    uploadedDate: item.submitted_date,
                    status: item.status || 'active',
                    fileName: `${item.work_title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                    filePath: `/uploads/documents/${item.id}`,
                    department: item.affected_department || 'admin'
                })),
                ...docRecords.map(doc => ({
                    id: doc.id,
                    title: doc.title,
                    description: doc.description,
                    category: doc.category,
                    type: doc.file_type || 'PDF',
                    uploadedBy: doc.uploaded_by,
                    uploadedDate: doc.created_at,
                    status: doc.status,
                    fileName: doc.file_name,
                    filePath: doc.file_path,
                    department: 'general'
                }))
            ];
            
            console.log('✅ Documents fetched from database:', documents.length);
            
        } catch (dbError) {
            console.error('❌ Database error:', dbError);
            throw dbError;
        }
        
        // Apply filters
        if (category) {
            documents = documents.filter(d => d.category === category);
        }
        
        if (department) {
            documents = documents.filter(d => d.department === department);
        }
        
        if (status) {
            documents = documents.filter(d => d.status === status);
        }
        
        // Calculate statistics
        const stats = {
            totalDocuments: documents.length,
            activeDocuments: documents.filter(d => d.status === 'active').length,
            categories: [...new Set(documents.map(d => d.category))].length
        };
        
        res.json({
            success: true,
            documents: documents,
            statistics: stats,
            total: documents.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching documents:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch documents',
            details: error.message 
        });
    }
});

// Get policies for office portal
router.get('/policies', async (req, res) => {
    try {
        console.log('📋 Fetching policies for office portal...');
        
        const { status, impact, submittedBy } = req.query;
        
        let policies = [];
        
        try {
            const db = require('../../database/config/database');
            
            const [policyItems] = await db.execute(`
                SELECT * FROM policies 
                ORDER BY submission_date DESC
            `);
            
            // Transform data for frontend
            policies = policyItems.map(policy => ({
                id: policy.id,
                title: policy.title,
                description: policy.description,
                submittedBy: policy.submitted_by,
                submittedByRole: policy.submitted_by_role,
                submissionDate: policy.submission_date,
                impact: policy.impact,
                status: policy.status,
                approvedBy: policy.approved_by,
                approvedDate: policy.approved_date,
                rejectionReason: policy.rejection_reason,
                revisionRequest: policy.revision_request,
                createdAt: policy.created_at
            }));
            
            console.log('✅ Policies fetched from database:', policies.length);
            
        } catch (dbError) {
            console.error('❌ Database error:', dbError);
            throw dbError;
        }
        
        // Apply filters
        if (status) {
            policies = policies.filter(p => p.status === status);
        }
        
        if (impact) {
            policies = policies.filter(p => p.impact === impact);
        }
        
        if (submittedBy) {
            policies = policies.filter(p => p.submittedBy === submittedBy);
        }
        
        // Calculate statistics
        const stats = {
            totalPolicies: policies.length,
            activePolicies: policies.filter(p => p.status === 'Approved').length,
            pendingPolicies: policies.filter(p => p.status === 'Pending').length,
            draftPolicies: policies.filter(p => p.status === 'Revision Requested').length
        };
        
        res.json({
            success: true,
            policies: policies,
            statistics: stats,
            total: policies.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching policies:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch policies',
            details: error.message 
        });
    }
});

// Get contracts for office portal
router.get('/contracts', async (req, res) => {
    try {
        console.log('📝 Fetching contracts for office portal...');
        
        const { status, contractType, department } = req.query;
        
        let contracts = [];
        
        try {
            const db = require('../../database/config/database');
            
            const [contractItems] = await db.execute(`
                SELECT * FROM contracts 
                ORDER BY start_date DESC
            `);
            
            // Transform data for frontend
            contracts = contractItems.map(contract => ({
                id: contract.id,
                employeeId: contract.employee_id,
                employeeName: contract.employee_name,
                contractType: contract.contract_type,
                startDate: contract.start_date,
                endDate: contract.end_date,
                salary: contract.salary,
                contractStatus: contract.contract_status,
                contractTerms: contract.contract_terms,
                contractDocument: contract.contract_document,
                createdBy: contract.created_by,
                createdAt: contract.created_at,
                updatedAt: contract.updated_at
            }));
            
            console.log('✅ Contracts fetched from database:', contracts.length);
            
        } catch (dbError) {
            console.error('❌ Database error:', dbError);
            throw dbError;
        }
        
        // Apply filters
        if (status) {
            contracts = contracts.filter(c => c.contractStatus === status);
        }
        
        if (contractType) {
            contracts = contracts.filter(c => c.contractType === contractType);
        }
        
        // Calculate statistics
        const stats = {
            totalContracts: contracts.length,
            activeContracts: contracts.filter(c => c.contractStatus === 'active').length,
            permanentContracts: contracts.filter(c => c.contractType === 'permanent').length,
            temporaryContracts: contracts.filter(c => c.contractType === 'temporary').length
        };
        
        res.json({
            success: true,
            contracts: contracts,
            statistics: stats,
            total: contracts.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching contracts:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch contracts',
            details: error.message 
        });
    }
});

// Get analytics data for office portal
router.get('/analytics', async (req, res) => {
    try {
        console.log('📊 Fetching analytics data for office portal...');
        
        let analytics = {
            personnel: {
                totalStaff: 0,
                totalEmployees: 0,
                totalWorkers: 0,
                activeStaff: 0,
                byDepartment: {},
                byRole: {}
            },
            documents: {
                totalDocuments: 0,
                activeDocuments: 0,
                byCategory: {},
                byDepartment: {}
            },
            policies: {
                totalPolicies: 0,
                activePolicies: 0,
                pendingPolicies: 0,
                draftPolicies: 0,
                byImpact: {}
            },
            contracts: {
                totalContracts: 0,
                activeContracts: 0,
                byType: {},
                byStatus: {}
            }
        };
        
        try {
            const db = require('../../database/config/database');
            
            // Get personnel analytics
            const [personnel] = await db.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN role = 'Worker' THEN 1 ELSE 0 END) as workers,
                    SUM(CASE WHEN role != 'Worker' THEN 1 ELSE 0 END) as employees,
                    SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
                    COUNT(CASE WHEN department IS NOT NULL THEN 1 END) as with_dept,
                    department,
                    role
                FROM users 
                WHERE role IN ('Employee', 'Worker', 'HR Manager', 'Finance Manager', 'Project Manager', 'Real Estate Manager', 'HSE Manager', 'Office Assistant')
                GROUP BY department, role WITH ROLLUP
            `);
            
            personnel.totalStaff = personnel[0]?.total || 0;
            personnel.totalWorkers = personnel[0]?.workers || 0;
            personnel.totalEmployees = personnel[0]?.employees || 0;
            personnel.activeStaff = personnel[0]?.active || 0;
            
            // Get documents analytics
            const [documents] = await db.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                    category,
                    department
                FROM documents 
                GROUP BY category, department WITH ROLLUP
            `);
            
            analytics.documents.totalDocuments = documents[0]?.total || 0;
            analytics.documents.activeDocuments = documents[0]?.active || 0;
            
            // Get policies analytics
            const [policies] = await db.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'Revision Requested' THEN 1 ELSE 0 END) as draft,
                    impact
                FROM policies 
                GROUP BY impact WITH ROLLUP
            `);
            
            analytics.policies.totalPolicies = policies[0]?.total || 0;
            analytics.policies.activePolicies = policies[0]?.active || 0;
            analytics.policies.pendingPolicies = policies[0]?.pending || 0;
            analytics.policies.draftPolicies = policies[0]?.draft || 0;
            
            // Get contracts analytics
            const [contracts] = await db.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN contract_status = 'active' THEN 1 ELSE 0 END) as active,
                    contract_type,
                    contract_status
                FROM contracts 
                GROUP BY contract_type, contract_status WITH ROLLUP
            `);
            
            analytics.contracts.totalContracts = contracts[0]?.total || 0;
            analytics.contracts.activeContracts = contracts[0]?.active || 0;
            
            console.log('✅ Analytics fetched from database');
            
        } catch (dbError) {
            console.error('❌ Database error:', dbError);
            throw dbError;
        }
        
        res.json({
            success: true,
            analytics: analytics,
            lastUpdated: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error fetching analytics:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch analytics',
            details: error.message 
        });
    }
});

// Upload profile image
router.post('/upload/profile-image', upload.single('profileImage'), async (req, res) => {
    try {
        console.log('📸 Uploading profile image...');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }
        
        const { employeeId } = req.body;
        
        if (!employeeId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required'
            });
        }
        
        try {
            const db = require('../../database/config/database');

            // Read uploaded bytes for permanent DB storage (survives Railway redeploys)
            let imageBuffer = null;
            let imageMime = req.file.mimetype || 'image/jpeg';
            try { imageBuffer = fs.readFileSync(req.file.path); }
            catch (readErr) { console.warn('⚠️ Could not read uploaded file for BLOB:', readErr.message); }

            // Prefer DB-backed URL so it works after redeploys; fall back to disk URL
            const isLeader = req.body.type === 'leader';
            const filePath = imageBuffer
                ? `/api/profile-image/${isLeader ? 'lead-' + employeeId : employeeId}${isLeader ? '?type=leader' : ''}`
                : `/uploads/profiles/${req.file.filename}`;

            // Try BLOB-aware update first; gracefully fall back if columns aren't present
            try {
                if (isLeader) {
                    await db.execute(
                        'UPDATE leadership_management SET profile_image = ?, profile_image_data = ?, profile_image_mime = ? WHERE id = ?',
                        [filePath, imageBuffer, imageMime, employeeId]
                    );
                } else {
                    await db.execute(
                        'UPDATE employee_details SET profile_image = ?, profile_image_data = ?, profile_image_mime = ? WHERE employee_id = ?',
                        [filePath, imageBuffer, imageMime, employeeId]
                    );
                }
            } catch (blobErr) {
                console.warn('⚠️ BLOB update failed, retrying path-only:', blobErr.message);
                if (isLeader) {
                    await db.execute('UPDATE leadership_management SET profile_image = ? WHERE id = ?', [filePath, employeeId]);
                } else {
                    await db.execute('UPDATE employee_details SET profile_image = ? WHERE employee_id = ?', [filePath, employeeId]);
                }
            }

            // Also update users table if needed
            try {
                await db.execute(
                    'UPDATE users SET profile_image = ? WHERE id = ?',
                    [filePath, employeeId]
                );
            } catch (uErr) { /* users.profile_image may not exist */ }

            console.log('✅ Profile image uploaded successfully:', filePath, 'BLOB stored:', !!imageBuffer);

            res.json({
                success: true,
                message: 'Profile image uploaded successfully',
                filePath: filePath,
                employeeId: employeeId,
                persisted: !!imageBuffer
            });
            
        } catch (dbError) {
            console.error('❌ Database error:', dbError);
            res.status(500).json({ success: false, error: 'Database error', details: dbError.message || dbError });
        }
        
    } catch (error) {
        console.error('❌ Error uploading profile image:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to upload profile image',
            details: error.message 
        });
    }
});

// Upload passport image
router.post('/upload/passport-image', upload.single('passportImage'), async (req, res) => {
    try {
        console.log('📄 Uploading passport image...');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }
        
        const { employeeId, passportNumber } = req.body;
        
        if (!employeeId || !passportNumber) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID and passport number are required'
            });
        }
        
        try {
            const db = require('../../database/config/database');
            
            // Update employee details with passport image path
            const filePath = `/uploads/passports/${req.file.filename}`;
            
            await db.execute(
                'UPDATE employee_details SET passport_image = ? WHERE employee_id = ?',
                [filePath, employeeId]
            );
            
            // Update passport number if provided
            await db.execute(
                'UPDATE employee_details SET passport = ? WHERE employee_id = ?',
                [passportNumber, employeeId]
            );
            
            console.log('✅ Passport image uploaded successfully:', filePath);
            
            res.json({
                success: true,
                message: 'Passport image uploaded successfully',
                filePath: filePath,
                employeeId: employeeId,
                passportNumber: passportNumber
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock response:', dbError);
            
            // Fallback to mock response
            res.json({
                success: true,
                message: 'Passport image uploaded successfully (mock)',
                filePath: `/uploads/passports/${req.file.filename}`,
                employeeId: employeeId,
                passportNumber: passportNumber,
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error uploading passport image:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to upload passport image',
            details: error.message 
        });
    }
});

// Get employee by ID with full details
router.get('/users/:id', async (req, res) => {
    try {
        const employeeId = req.params.id;
        console.log('🔍 Fetching employee details:', employeeId);
        
        let employee = null;
        
        try {
            const db = require('../../database/config/database');
            
            const [employees] = await db.execute(`
                SELECT u.*, e.position, e.department as emp_department, e.salary, e.hire_date,
                       ed.full_name, ed.gmail, ed.phone, ed.nida, ed.passport, ed.profile_image,
                       ed.contract_type, ed.passport_image
                FROM users u
                LEFT JOIN employees e ON u.id = e.user_id
                LEFT JOIN employee_details ed ON e.id = ed.employee_id
                WHERE u.id = ? OR ed.employee_id = ?
                ORDER BY u.created_at DESC
                LIMIT 1
            `, [employeeId, employeeId]);
            
            if (employees.length > 0) {
                const emp = employees[0];
                employee = {
                    id: emp.id,
                    name: emp.name || emp.full_name,
                    email: emp.email || emp.gmail,
                    phone: emp.phone,
                    role: emp.role,
                    department: emp.emp_department || emp.department,
                    position: emp.position,
                    salary: emp.salary,
                    hireDate: emp.hire_date,
                    status: emp.status,
                    nida: emp.nida,
                    passport: emp.passport,
                    profileImage: `/api/profile-image/${emp.id}`,
                    passportImage: normalizeImagePath(emp.passport_image, emp.passport ? `/uploads/passports/${emp.passport}.jpg` : null),
                    contractType: emp.contract_type,
                    registrationDate: emp.registration_date || emp.created_at,
                    type: emp.role === 'Worker' ? 'worker' : 'employee',
                    accessLevel: emp.role === 'Managing Director' ? 'full' : 'standard',
                    lastLogin: emp.last_login,
                    permissions: getPermissionsForRole(emp.role)
                };
                console.log('✅ Employee found:', employee);
            }
            
        } catch (dbError) {
            console.error('❌ Database error, using fallback employee:', dbError);
            
            // Fallback to mock employee
            if (employeeId === '1') {
                employee = {
                    id: 1,
                    name: 'John Doe',
                    email: 'john.doe@kashtec.com',
                    phone: '+255 712 345 678',
                    role: 'Employee',
                    department: 'HR',
                    position: 'HR Manager',
                    salary: 2500000,
                    hireDate: '2024-01-15',
                    status: 'Active',
                    nida: '1990010112345678',
                    passport: 'PA1234567',
                    profileImage: '/assets/images/john-doe.jpg',
                    passportImage: '/uploads/passports/PA1234567.jpg',
                    contractType: 'permanent',
                    registrationDate: '2024-01-15',
                    type: 'employee',
                    accessLevel: 'standard',
                    lastLogin: '2024-04-04',
                    permissions: ['view_documents', 'view_policies', 'manage_personnel'],
                    mock: true
                };
            }
        }
        
        if (!employee) {
            return res.status(404).json({ 
                success: false,
                error: 'Employee not found' 
            });
        }
        
        res.json({
            success: true,
            employee: employee
        });
        
    } catch (error) {
        console.error('❌ Error fetching employee:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch employee',
            details: error.message 
        });
    }
});

module.exports = router;
