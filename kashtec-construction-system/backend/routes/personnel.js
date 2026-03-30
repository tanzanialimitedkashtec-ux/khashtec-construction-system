const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function(req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Get all personnel with full details
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching all personnel data...');
        
        // Get employees
        const [employees] = await db.execute(`
            SELECT 
                e.employee_id, e.first_name, e.last_name, e.email, e.phone, 
                e.position, e.department, e.hire_date, e.salary, e.status,
                e.profile_image, e.passport_image, e.emergency_contact,
                ed.document_type, ed.document_number, ed.document_expiry,
                ed.uphold_reason, ed.uphold_date, ed.status as document_status
            FROM employees e
            LEFT JOIN employee_documents ed ON e.employee_id = ed.employee_id
            ORDER BY e.last_name, e.first_name
        `);
        
        // Get workers
        const [workers] = await db.execute(`
            SELECT 
                w.worker_id, w.full_name, w.phone, w.position,
                w.department, w.hire_date, w.hourly_rate, w.status,
                w.profile_image, w.id_document, w.id_document_expiry,
                w.safety_training, w.safety_cert_expiry, w.emergency_contact
            FROM workers w
            ORDER BY w.last_name, w.first_name
        `);
        
        // Get documents
        const [documents] = await db.execute(`
            SELECT 
                d.document_id, d.title, d.category, d.description,
                d.file_path, d.uploaded_by, d.upload_date,
                d.status, d.expiry_date, d.version
            FROM documents d
            ORDER BY d.upload_date DESC
        `);
        
        // Get policies
        const [policies] = await db.execute(`
            SELECT 
                p.policy_id, p.title, p.category, p.description,
                p.status, p.created_by, p.created_date,
                p.approved_by, p.approved_date, p.version,
                p.is_active, p.uphold_count, p.last_review_date
            FROM policies p
            ORDER BY p.category, p.title
        `);
        
        // Calculate total staff
        const totalStaff = (employees?.length || 0) + (workers?.length || 0);
        
        // Get department stats
        const [deptStats] = await db.execute(`
            SELECT 
                department, 
                COUNT(*) as count,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
            FROM employees
            GROUP BY department
            UNION ALL
            SELECT 
                department, 
                COUNT(*) as count,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
            FROM workers
            GROUP BY department
        `);
        
        console.log('✅ Personnel data fetched successfully');
        
        res.json({
            success: true,
            data: {
                employees: employees || [],
                workers: workers || [],
                documents: documents || [],
                policies: policies || [],
                statistics: {
                    total_staff: totalStaff,
                    total_employees: employees?.length || 0,
                    total_workers: workers?.length || 0,
                    departments: deptStats || []
                }
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error fetching personnel data:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch personnel data',
            details: error.message
        });
    }
});

// Get employee details with documents
router.get('/employee/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [employee] = await db.execute(`
            SELECT 
                e.employee_id, e.first_name, e.last_name, e.email, e.phone, 
                e.position, e.department, e.hire_date, e.salary, e.status,
                e.profile_image, e.passport_image, e.emergency_contact,
                ed.document_type, ed.document_number, ed.document_expiry,
                ed.uphold_reason, ed.uphold_date, ed.status as document_status
            FROM employees e
            LEFT JOIN employee_documents ed ON e.employee_id = ed.employee_id
            WHERE e.employee_id = ?
            ORDER BY ed.document_expiry DESC
        `, [id]);
        
        if (employee.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        // Get employee documents only
        const [documents] = await db.execute(`
            SELECT 
                d.document_id, d.title, d.category, d.description,
                d.file_path, d.uploaded_by, d.upload_date,
                d.status, d.expiry_date, d.version
            FROM documents d
            WHERE d.uploaded_by = ?
            ORDER BY d.upload_date DESC
        `, [id]);
        
        console.log('✅ Employee details fetched successfully');
        res.json({
            success: true,
            data: {
                employee: employee[0],
                documents: documents || []
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching employee details:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch employee details',
            details: error.message
        });
    }
});

// Get worker details with documents
router.get('/worker/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [worker] = await db.execute(`
            SELECT 
                w.worker_id, w.full_name, w.phone, w.position,
                w.department, w.hire_date, w.hourly_rate, w.status,
                w.profile_image, w.id_document, w.id_document_expiry,
                w.safety_training, w.safety_cert_expiry, w.emergency_contact
            FROM workers w
            WHERE w.worker_id = ?
        `, [id]);
        
        if (worker.length === 0) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        
        console.log('✅ Worker details fetched successfully');
        res.json({
            success: true,
            data: {
                worker: worker[0]
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching worker details:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch worker details',
            details: error.message
        });
    }
});

// Upload employee document
router.post('/employee/:id/documents', upload.single('document'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, description, expiry_date } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const documentPath = req.file.filename;
        const uploadedBy = req.body.uploaded_by || 'System';
        
        // Insert document record
        const result = await db.execute(`
            INSERT INTO employee_documents (
                employee_id, document_type, document_number, document_path,
                uploaded_by, upload_date, expiry_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
        `, [
            id, title, 'Uploaded Document', documentPath, uploadedBy, 
            new Date().toISOString().split('T')[0], expiry_date || null
        ]);
        
        console.log('✅ Employee document uploaded successfully');
        res.json({
            success: true,
            message: 'Document uploaded successfully',
            document_id: result.insertId
        });
        
    } catch (error) {
        console.error('❌ Error uploading employee document:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to upload document',
            details: error.message
        });
    }
});

// Upload worker ID document
router.post('/worker/:id/documents', upload.single('document'), async (req, res) => {
    try {
        const { id } = req.params;
        const { document_type, expiry_date } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const documentPath = req.file.filename;
        const uploadedBy = req.body.uploaded_by || 'System';
        
        // Insert document record
        const result = await db.execute(`
            INSERT INTO workers (
                worker_id, id_document, id_document_expiry, updated_by
            ) VALUES (?, ?, ?, ?)
        `, [id, documentPath, expiry_date || null, uploadedBy]);
        
        console.log('✅ Worker ID document uploaded successfully');
        res.json({
            success: true,
            message: 'ID document uploaded successfully',
            document_id: result.insertId
        });
        
    } catch (error) {
        console.error('❌ Error uploading worker ID document:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to upload ID document',
            details: error.message
        });
    }
});

// Update employee profile image
router.put('/employee/:id/image', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        
        const imagePath = req.file.filename;
        
        // Update employee profile image
        const result = await db.execute(`
            UPDATE employees SET profile_image = ? WHERE employee_id = ?
        `, [imagePath, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        console.log('✅ Employee profile image updated successfully');
        res.json({
            success: true,
            message: 'Profile image updated successfully'
        });
        
    } catch (error) {
        console.error('❌ Error updating employee profile image:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update profile image',
            details: error.message
        });
    }
});

// Update worker profile image
router.put('/worker/:id/image', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        
        const imagePath = req.file.filename;
        
        // Update worker profile image
        const result = await db.execute(`
            UPDATE workers SET profile_image = ? WHERE worker_id = ?
        `, [imagePath, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        
        console.log('✅ Worker profile image updated successfully');
        res.json({
            success: true,
            message: 'Profile image updated successfully'
        });
        
    } catch (error) {
        console.error('❌ Error updating worker profile image:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update profile image',
            details: error.message
        });
    }
});

// Get personnel analytics
router.get('/analytics', async (req, res) => {
    try {
        console.log('📊 Generating personnel analytics...');
        
        // Employee analytics
        const [employeeAnalytics] = await db.execute(`
            SELECT 
                COUNT(*) as total_employees,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
                COUNT(CASE WHEN status = 'on_leave' THEN 1 END) as on_leave,
                AVG(salary) as average_salary,
                COUNT(CASE WHEN hire_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) THEN 1 END) as new_hires
            FROM employees
        `);
        
        // Worker analytics
        const [workerAnalytics] = await db.execute(`
            SELECT 
                COUNT(*) as total_workers,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_workers,
                AVG(hourly_rate) as average_hourly_rate,
                COUNT(CASE WHEN safety_cert_expiry > CURDATE() THEN 1 END) as expired_certifications
            FROM workers
        `);
        
        // Document analytics
        const [documentAnalytics] = await db.execute(`
            SELECT 
                COUNT(*) as total_documents,
                COUNT(CASE WHEN expiry_date <= CURDATE() THEN 1 END) as expiring_soon,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_documents,
                COUNT(CASE WHEN status = 'upheld' THEN 1 END) as upheld_documents
            FROM documents
        `);
        
        // Policy analytics
        const [policyAnalytics] = await db.execute(`
            SELECT 
                COUNT(*) as total_policies,
                COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_policies,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_policies,
                COUNT(CASE WHEN status = 'under_review' THEN 1 END) as review_policies,
                AVG(uphold_count) as avg_uphold_count
            FROM policies
        `);
        
        console.log('✅ Personnel analytics generated successfully');
        
        res.json({
            success: true,
            data: {
                employees: employeeAnalytics[0] || {},
                workers: workerAnalytics[0] || {},
                documents: documentAnalytics[0] || {},
                policies: policyAnalytics[0] || {},
                summary: {
                    total_personnel: (employeeAnalytics[0]?.total_employees || 0) + (workerAnalytics[0]?.total_workers || 0),
                    active_employees: (employeeAnalytics[0]?.active_employees || 0) + (workerAnalytics[0]?.active_workers || 0),
                    total_documents: documentAnalytics[0]?.total_documents || 0,
                    active_documents: documentAnalytics[0]?.active_documents || 0,
                    total_policies: policyAnalytics[0]?.total_policies || 0,
                    active_policies: policyAnalytics[0]?.active_policies || 0
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error generating personnel analytics:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate analytics',
            details: error.message
        });
    }
});

// Get department breakdown
router.get('/departments', async (req, res) => {
    try {
        console.log('📊 Generating department breakdown...');
        
        const [departments] = await db.execute(`
            SELECT 
                department,
                COUNT(*) as total_employees,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
                AVG(salary) as average_salary
            FROM employees
            GROUP BY department
            UNION ALL
            SELECT 
                department,
                COUNT(*) as total_workers,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_workers,
                AVG(hourly_rate) as average_hourly_rate
            FROM workers
            GROUP BY department
        `);
        
        console.log('✅ Department breakdown generated successfully');
        res.json({
            success: true,
            data: departments || []
        });
        
    } catch (error) {
        console.error('❌ Error generating department breakdown:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate department breakdown',
            details: error.message
        });
    }
});

// Export personnel data
router.get('/export', async (req, res) => {
    try {
        console.log('📄 Exporting personnel data...');
        
        // Get all data for export
        const [employees] = await db.execute('SELECT * FROM employees ORDER BY last_name, first_name');
        const [workers] = await db.execute('SELECT * FROM workers ORDER BY last_name, first_name');
        const [documents] = await db.execute('SELECT * FROM documents ORDER BY upload_date DESC');
        const [policies] = await db.execute('SELECT * FROM policies ORDER BY category, title');
        
        const exportData = {
            employees: employees || [],
            workers: workers || [],
            documents: documents || [],
            policies: policies || [],
            export_date: new Date().toISOString()
        };
        
        console.log('✅ Personnel data exported successfully');
        res.json({
            success: true,
            data: exportData
        });
        
    } catch (error) {
        console.error('❌ Error exporting personnel data:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to export data',
            details: error.message
        });
    }
});

// Auto-analysis endpoint
router.get('/auto-analysis', async (req, res) => {
    try {
        console.log('🤖 Running auto-analysis...');
        
        // Get contradictory data
        const [contradictions] = await db.execute(`
            SELECT 
                'Employee with expired documents' as issue_type,
                COUNT(*) as count,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                e.employee_id,
                GROUP_CONCAT(ed.document_type) as expired_documents
            FROM employees e
            JOIN employee_documents ed ON e.employee_id = ed.employee_id
            WHERE ed.expiry_date < CURDATE() AND ed.status = 'active'
            
            UNION ALL
            
            SELECT 
                'Worker with expired certifications' as issue_type,
                COUNT(*) as count,
                CONCAT(w.first_name, ' ', w.last_name) as worker_name,
                w.worker_id,
                w.id_document_expiry
            FROM workers w
            WHERE w.safety_cert_expiry < CURDATE() AND w.status = 'active'
            
            UNION ALL
            
            SELECT 
                'Policy with high uphold count' as issue_type,
                COUNT(*) as count,
                p.title,
                p.policy_id,
                p.uphold_count
            FROM policies p
            WHERE p.uphold_count > 5 AND p.status = 'active'
        `);
        
        // Get personnel trends
        const [trends] = await db.execute(`
            SELECT 
                DATE_FORMAT(hire_date, '%Y-%m') as month,
                COUNT(*) as hires,
                'employee' as type
            FROM employees
            WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
            GROUP BY DATE_FORMAT(hire_date, '%Y-%m'), 'employee'
            
            UNION ALL
            
            SELECT 
                DATE_FORMAT(hire_date, '%Y-%m') as month,
                COUNT(*) as hires,
                'worker' as type
            FROM workers
            WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
            GROUP BY DATE_FORMAT(hire_date, '%Y-%m'), 'worker'
        `);
        
        const analysis = {
            contradictions: contradictions || [],
            trends: trends || [],
            summary: {
                total_issues: (contradictions?.length || 0),
                critical_issues: (contradictions?.filter(c => c.count > 2) || []).length,
                recommendations: [
                    'Review expired employee documents immediately',
                    'Update worker safety certifications',
                    'Address policies with excessive uphold counts',
                    'Implement automated expiry notifications'
                ]
            }
        };
        
        console.log('✅ Auto-analysis completed successfully');
        res.json({
            success: true,
            data: analysis
        });
        
    } catch (error) {
        console.error('❌ Error running auto-analysis:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to run auto-analysis',
            details: error.message
        });
    }
});

module.exports = router;
