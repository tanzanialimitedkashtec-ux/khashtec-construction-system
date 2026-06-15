const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Helper function to strip HTML tags from text
const stripHtmlTags = (text) => {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '').trim();
};

// Try to load database, but don't fail if it's not available
let db;
try {
    db = require('../../database/config/database');
} catch (error) {
    console.warn('⚠️ Database module not available in documents route:', error.message);
    db = null;
}

// Simple PDF generation utility
const generatePDF = (documentData) => {
    // For now, we'll create a simple HTML-to-PDF conversion
    // In a production environment, you might use libraries like puppeteer or pdfkit
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${documentData.work_title}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #333; }
            .meta { margin: 10px 0; color: #666; }
            .content { line-height: 1.6; margin-top: 30px; }
            .footer { margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px; font-size: 12px; color: #888; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">${documentData.work_title}</div>
            <div class="meta">Document Type: ${documentData.work_type}</div>
            <div class="meta">Department: ${documentData.department_code || 'Admin'}</div>
            <div class="meta">Status: ${documentData.status}</div>
            <div class="meta">Submitted: ${new Date(documentData.submitted_date).toLocaleDateString()}</div>
        </div>
        <div class="content">
            <h3>Description</h3>
            <p>${documentData.work_description || 'No description available'}</p>
        </div>
        <div class="footer">
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>KashTec Construction System - Document Download</p>
        </div>
    </body>
    </html>
    `;
    
    return htmlContent;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/documents');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        var allowedExt = /jpeg|jpg|png|gif|bmp|webp|svg|pdf|doc|docx|xls|xlsx|ppt|pptx|mp4|avi|mov|wmv|webm|mkv|mp3|wav/;
        var allowedMime = /image\/|video\/|audio\/|application\/pdf|application\/msword|application\/vnd\.|text\//;
        var extOk = allowedExt.test(path.extname(file.originalname).toLowerCase());
        var mimeOk = allowedMime.test(file.mimetype);
        if (extOk || mimeOk) {
            return cb(null, true);
        } else {
            cb(new Error('File type not supported: ' + file.mimetype));
        }
    }
});

// Test endpoint to isolate the issue
router.get('/test-upload', (req, res) => {
    try {
        console.log('🧪 Test upload endpoint accessed');
        console.log('🔍 Documents array exists:', !!documents);
        console.log('🔍 Documents array type:', typeof documents);
        console.log('🔍 Documents array length:', documents ? documents.length : 'undefined');
        
        // Test safe array operations
        if (Array.isArray(documents)) {
            console.log('✅ Documents array is valid array');
            res.json({ 
                message: 'Upload test endpoint working',
                documentsCount: documents.length,
                status: 'success'
            });
        } else {
            console.log('❌ Documents array is not a valid array');
            res.status(500).json({ 
                error: 'Documents array not initialized',
                type: typeof documents,
                isArray: Array.isArray(documents)
            });
        }
    } catch (error) {
        console.error('❌ Test endpoint error:', error);
        res.status(500).json({ 
            error: 'Test endpoint failed',
            details: error.message
        });
    }
});

// Mock document data (in production, use real database)
let documents = [
    {
        id: 1,
        title: 'Project Proposal - Kigali Tower',
        type: 'PDF',
        category: 'Project Documents',
        uploadedBy: 1,
        uploadedDate: '2024-01-15',
        fileName: 'kigali-tower-proposal.pdf',
        filePath: '/uploads/documents/kigali-tower-proposal.pdf',
        size: 2048576,
        status: 'active',
        description: 'Initial project proposal for Kigali Tower Complex'
    },
    {
        id: 2,
        title: 'Safety Manual 2024',
        type: 'PDF',
        category: 'Safety Documents',
        uploadedBy: 2,
        uploadedDate: '2024-01-20',
        fileName: 'safety-manual-2024.pdf',
        filePath: '/uploads/documents/safety-manual-2024.pdf',
        size: 5242880,
        status: 'active',
        description: 'Updated safety procedures and guidelines'
    }
];

router.get('/debug', async (req, res) => {
    try {
        const db = require('../../database/config/database');
        const [rows] = await db.execute('SELECT id, title, file_name, file_size, LENGTH(file_data) as blob_length FROM documents ORDER BY id DESC LIMIT 10');
        const [adminRows] = await db.execute('SELECT id, work_title FROM admin_work ORDER BY id DESC LIMIT 10');
        res.json({ documents: rows, admin_work: adminRows });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get all documents
router.get('/', async (req, res) => {
    try {
        const { category, type, uploadedBy, search } = req.query;
        
        // Try to fetch from both documents and admin_work tables
        let documents = [];
        
        try {
            const db = require('../../database/config/database');
            
            // Fetch from documents table first
            let realDocuments = [];
            try {
                const documentsItems = await db.execute(`
                    SELECT d.*, u.name as uploaded_by_name 
                    FROM documents d 
                    LEFT JOIN users u ON d.uploaded_by = u.id 
                    ORDER BY d.created_at DESC
                `);
                
                console.log('🔍 Documents query result type:', typeof documentsItems);
                console.log('🔍 Documents query result:', documentsItems);
                
                // Handle different database response formats
                let documentsArray = [];
                if (Array.isArray(documentsItems)) {
                    documentsArray = documentsItems;
                } else if (documentsItems && Array.isArray(documentsItems[0])) {
                    documentsArray = documentsItems[0];
                } else if (documentsItems && documentsItems.rows) {
                    documentsArray = documentsItems.rows;
                } else {
                    console.warn('⚠️ Unexpected documents query result format:', documentsItems);
                    documentsArray = [];
                }
                
                console.log('🔍 Documents array length:', documentsArray.length);
                
                realDocuments = documentsArray.map(item => ({
                    id: item.id,
                    title: item.title,
                    name: item.title,
                    description: item.description,
                    category: item.category,
                    type: item.file_type,
                    uploadedBy: item.uploaded_by,
                    uploadedByName: item.uploaded_by_name,
                    uploadedDate: item.created_at,
                    status: item.status,
                    fileName: item.file_name,
                    filename: item.file_name,
                    filePath: item.file_path,
                    fileSize: item.file_size,
                    expiry_date: item.expiry_date,
                    source: 'documents'
                }));
                
                console.log('✅ Documents fetched from documents table:', realDocuments.length);
            } catch (docError) {
                console.error('❌ Error fetching from documents table:', docError);
            }
            
            // Also fetch from admin_work table
            let adminWorkDocuments = [];
            try {
                const adminWorkItems = await db.execute(`
                    SELECT * FROM admin_work 
                    WHERE work_type LIKE '%Document%' OR work_title LIKE '%Document%'
                    ORDER BY submitted_date DESC
                `);
                
                console.log('🔍 Admin work query result type:', typeof adminWorkItems);
                console.log('🔍 Admin work query result:', adminWorkItems);
                
                // Handle different database response formats
                let adminWorkArray = [];
                if (Array.isArray(adminWorkItems)) {
                    adminWorkArray = adminWorkItems;
                } else if (adminWorkItems && Array.isArray(adminWorkItems[0])) {
                    adminWorkArray = adminWorkItems[0];
                } else if (adminWorkItems && adminWorkItems.rows) {
                    adminWorkArray = adminWorkItems.rows;
                } else {
                    console.warn('⚠️ Unexpected admin_work query result format:', adminWorkItems);
                    adminWorkArray = [];
                }
                
                console.log('🔍 Admin work array length:', adminWorkArray.length);
                
                adminWorkDocuments = adminWorkArray.map(item => ({
                    id: item.id,
                    title: item.work_title,
                    description: stripHtmlTags(item.work_description),
                    category: item.work_type || 'general',
                    type: 'PDF', // Default type
                    uploadedBy: item.assigned_to || 1,
                    uploadedDate: item.submitted_date,
                    status: item.status || 'active',
                    fileName: `${item.work_title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                    filePath: `/uploads/documents/${item.id}`,
                    department: item.department_code || 'admin',
                    source: 'admin_work'
                }));
                
                console.log('✅ Documents fetched from admin_work:', adminWorkDocuments.length);
            } catch (adminError) {
                console.error('❌ Error fetching from admin_work table:', adminError);
            }
            
            // Fetch employee agreements and CVs from employee_details
            let employeeDocuments = [];
            try {
                const empItems = await db.execute(`
                    SELECT employee_id, full_name, contract_type, created_at, 
                           cv_data IS NOT NULL as has_cv, cv_mime,
                           agreement_data IS NOT NULL as has_agreement, agreement_mime 
                    FROM employee_details 
                    WHERE cv_data IS NOT NULL OR agreement_data IS NOT NULL
                `);
                
                let empArray = [];
                if (Array.isArray(empItems)) {
                    empArray = empItems;
                } else if (empItems && Array.isArray(empItems[0])) {
                    empArray = empItems[0];
                } else if (empItems && empItems.rows) {
                    empArray = empItems.rows;
                }
                
                empArray.forEach(item => {
                    if (item.has_agreement) {
                        employeeDocuments.push({
                            id: `emp_agr_${item.employee_id}`,
                            title: `Employment Contract - ${item.full_name}`,
                            name: `Employment Contract - ${item.full_name}`,
                            description: `Employment agreement/contract for ${item.full_name} (${item.contract_type || 'Employee'})`,
                            category: 'Contract',
                            type: item.agreement_mime === 'application/pdf' ? 'PDF' : 'Image',
                            uploadedBy: 1,
                            uploadedByName: 'System',
                            uploadedDate: item.created_at,
                            status: 'active',
                            fileName: `agreement_${item.employee_id}`,
                            filePath: `/api/employee-file/${item.employee_id}/agreement`,
                            fileSize: 0,
                            expiry_date: null,
                            source: 'employee_details'
                        });
                    }
                    if (item.has_cv) {
                        employeeDocuments.push({
                            id: `emp_cv_${item.employee_id}`,
                            title: `CV - ${item.full_name}`,
                            name: `CV - ${item.full_name}`,
                            description: `Curriculum Vitae for ${item.full_name}`,
                            category: 'Other',
                            type: item.cv_mime === 'application/pdf' ? 'PDF' : 'Image',
                            uploadedBy: 1,
                            uploadedByName: 'System',
                            uploadedDate: item.created_at,
                            status: 'active',
                            fileName: `cv_${item.employee_id}`,
                            filePath: `/api/employee-file/${item.employee_id}/cv`,
                            fileSize: 0,
                            expiry_date: null,
                            source: 'employee_details'
                        });
                    }
                });
                
                console.log('✅ Documents fetched from employee_details:', employeeDocuments.length);
            } catch (empError) {
                console.error('❌ Error fetching from employee_details table:', empError);
            }
            
            // Fetch from worker_accounts
            let workerDocuments = [];
            try {
                const workerItems = await db.execute(`
                    SELECT id, full_name, created_at,
                           id_document, contract_document
                    FROM worker_accounts 
                    WHERE id_document IS NOT NULL OR contract_document IS NOT NULL
                `);
                
                let workerArray = [];
                if (Array.isArray(workerItems)) {
                    workerArray = workerItems;
                } else if (workerItems && Array.isArray(workerItems[0])) {
                    workerArray = workerItems[0];
                } else if (workerItems && workerItems.rows) {
                    workerArray = workerItems.rows;
                }
                
                workerArray.forEach(item => {
                    var contDoc = typeof item.contract_document === 'string' ? item.contract_document : '';
                    var idDoc = typeof item.id_document === 'string' ? item.id_document : '';
                    if (contDoc) {
                        workerDocuments.push({
                            id: `work_cont_${item.id}`,
                            title: `Contract - ${item.full_name}`,
                            name: `Contract - ${item.full_name}`,
                            description: `Worker contract for ${item.full_name}`,
                            category: 'Contract',
                            type: contDoc.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Other',
                            uploadedBy: 1,
                            uploadedByName: 'System',
                            uploadedDate: item.created_at,
                            status: 'active',
                            fileName: contDoc.split('/').pop() || `contract_${item.id}`,
                            filePath: contDoc,
                            fileSize: 0,
                            expiry_date: null,
                            source: 'worker_accounts'
                        });
                    }
                    if (idDoc) {
                        workerDocuments.push({
                            id: `work_id_${item.id}`,
                            title: `ID - ${item.full_name}`,
                            name: `ID - ${item.full_name}`,
                            description: `ID document for ${item.full_name}`,
                            category: 'Identification',
                            type: idDoc.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Image',
                            uploadedBy: 1,
                            uploadedByName: 'System',
                            uploadedDate: item.created_at,
                            status: 'active',
                            fileName: idDoc.split('/').pop() || `id_${item.id}`,
                            filePath: idDoc,
                            fileSize: 0,
                            expiry_date: null,
                            source: 'worker_accounts'
                        });
                    }
                });
                
                console.log('✅ Documents fetched from worker_accounts:', workerDocuments.length);
            } catch (workerError) {
                console.error('❌ Error fetching from worker_accounts table:', workerError);
            }
            
            // Combine all sources
            documents = [...realDocuments, ...adminWorkDocuments, ...employeeDocuments, ...workerDocuments];
            
            // Sort by date (newest first)
            documents.sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate));
            
            console.log('✅ Total documents fetched:', documents.length);
            
        } catch (dbError) {
            console.error('❌ Database error, using fallback documents:', dbError);
            
            // Fallback to mock documents
            documents = [
                {
                    id: 1,
                    title: 'Project Proposal - Kigali Tower',
                    type: 'PDF',
                    category: 'Project Documents',
                    uploadedBy: 1,
                    uploadedDate: '2024-01-15',
                    fileName: 'kigali-tower-proposal.pdf',
                    filePath: '/uploads/documents/kigali-tower-proposal.pdf',
                    size: 2048576,
                    status: 'active',
                    description: 'Initial project proposal for Kigali Tower Complex',
                    source: 'fallback'
                },
                {
                    id: 2,
                    title: 'Safety Manual 2024',
                    type: 'PDF',
                    category: 'Safety Documents',
                    uploadedBy: 2,
                    uploadedDate: '2024-01-20',
                    fileName: 'safety-manual-2024.pdf',
                    filePath: '/uploads/documents/safety-manual-2024.pdf',
                    size: 5242880,
                    status: 'active',
                    description: 'Updated safety procedures and guidelines',
                    source: 'fallback'
                }
            ];
        }
        
        // Apply filters
        if (category) {
            documents = documents.filter(doc => 
                doc.category.toLowerCase() === category.toLowerCase()
            );
        }
        
        if (type) {
            documents = documents.filter(doc => 
                doc.type.toLowerCase() === type.toLowerCase()
            );
        }
        
        if (uploadedBy) {
            documents = documents.filter(doc => 
                doc.uploadedBy === parseInt(uploadedBy)
            );
        }
        
        if (search) {
            const searchTerm = search.toLowerCase();
            documents = documents.filter(doc => 
                doc.title.toLowerCase().includes(searchTerm) ||
                doc.description.toLowerCase().includes(searchTerm) ||
                doc.category.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort by upload date (newest first)
        documents.sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate));
        
        res.json({
            documents: documents,
            total: documents.length
        });
        
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ 
            error: 'Failed to fetch documents',
            details: error.message 
        });
    }
});

// Get document by ID
router.get('/:id', async (req, res) => {
    const docId = req.params.id;
    try {
        const db = require('../../database/config/database');

        // Handle special employee documents
        if (typeof docId === 'string' && (docId.startsWith('emp_agr_') || docId.startsWith('emp_cv_'))) {
            const isCV = docId.startsWith('emp_cv_');
            const empIdStr = docId.replace('emp_agr_', '').replace('emp_cv_', '');
            const empId = parseInt(empIdStr, 10);
            
            if (!isNaN(empId)) {
                try {
                    const empRows = await db.execute(
                        'SELECT employee_id, full_name, contract_type, created_at, cv_mime, agreement_mime FROM employee_details WHERE employee_id = ?', [empId]
                    );
                    if (Array.isArray(empRows) && empRows.length > 0) {
                        const item = empRows[0];
                        if (isCV) {
                            return res.json({
                                id: `emp_cv_${item.employee_id}`,
                                title: `CV - ${item.full_name}`,
                                description: `Curriculum Vitae for ${item.full_name}`,
                                category: 'Other',
                                type: item.cv_mime === 'application/pdf' ? 'PDF' : 'Image',
                                uploadedBy: 1,
                                uploadedDate: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : null,
                                status: 'active',
                                fileName: `cv_${item.employee_id}`,
                                filePath: `/api/employee-file/${item.employee_id}/cv`,
                                size: 0,
                                department: 'admin',
                                source: 'employee_details'
                            });
                        } else {
                            return res.json({
                                id: `emp_agr_${item.employee_id}`,
                                title: `Employment Contract - ${item.full_name}`,
                                description: `Employment agreement/contract for ${item.full_name} (${item.contract_type || 'Employee'})`,
                                category: 'Contract',
                                type: item.agreement_mime === 'application/pdf' ? 'PDF' : 'Image',
                                uploadedBy: 1,
                                uploadedDate: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : null,
                                status: 'active',
                                fileName: `agreement_${item.employee_id}`,
                                filePath: `/api/employee-file/${item.employee_id}/agreement`,
                                size: 0,
                                department: 'admin',
                                source: 'employee_details'
                            });
                        }
                    }
                } catch (empErr) {
                    console.warn('⚠️ employee_details lookup failed:', empErr.message);
                }
            }
        } else if (docId.startsWith('work_')) {
            const isIdDoc = docId.startsWith('work_id_');
            const isContDoc = docId.startsWith('work_cont_');
            const workerIdStr = isIdDoc ? docId.replace('work_id_', '') : docId.replace('work_cont_', '');
            const workerId = parseInt(workerIdStr, 10);
            
            if (!isNaN(workerId)) {
                try {
                    const workerRows = await db.execute(
                        'SELECT id, full_name, created_at, id_document, contract_document FROM worker_accounts WHERE id = ?', [workerId]
                    );
                    if (Array.isArray(workerRows) && workerRows.length > 0) {
                        const item = workerRows[0];
                        if (isIdDoc && item.id_document) {
                            return res.json({
                                id: `work_id_${item.id}`,
                                title: `ID - ${item.full_name}`,
                                description: `ID document for ${item.full_name}`,
                                category: 'Identification',
                                type: item.id_document.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Image',
                                uploadedBy: 1,
                                uploadedDate: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : null,
                                status: 'active',
                                fileName: item.id_document.split('/').pop() || `id_${item.id}`,
                                filePath: item.id_document,
                                size: 0,
                                department: 'admin',
                                source: 'worker_accounts'
                            });
                        } else if (isContDoc && item.contract_document) {
                            return res.json({
                                id: `work_cont_${item.id}`,
                                title: `Contract - ${item.full_name}`,
                                description: `Worker contract for ${item.full_name}`,
                                category: 'Contract',
                                type: item.contract_document.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Other',
                                uploadedBy: 1,
                                uploadedDate: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : null,
                                status: 'active',
                                fileName: item.contract_document.split('/').pop() || `contract_${item.id}`,
                                filePath: item.contract_document,
                                size: 0,
                                department: 'admin',
                                source: 'worker_accounts'
                            });
                        }
                    }
                } catch (workErr) {
                    console.warn('⚠️ worker_accounts lookup failed:', workErr.message);
                }
            }
        }

        // 1) Try the `documents` table first (this is where the upload endpoint
        //    stores the record and returns its insertId to the frontend).
        // NOTE: db.execute() already destructures internally and returns the rows array directly.
        try {
            const docRows = await db.execute(
                'SELECT * FROM documents WHERE id = ?', [docId]
            );
            if (Array.isArray(docRows) && docRows.length > 0) {
                const d = docRows[0];
                return res.json({
                    id: d.id,
                    title: d.title,
                    description: stripHtmlTags(d.description || ''),
                    category: d.category || 'Other',
                    type: d.file_type || 'PDF',
                    uploadedBy: d.uploaded_by,
                    uploadedDate: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : null,
                    status: d.status || 'Pending',
                    fileName: d.file_name,
                    filePath: `/uploads/documents/${d.file_name}`,
                    size: d.file_size || 0,
                    department: d.department || 'admin',
                    source: 'documents_table'
                });
            }
        } catch (docTableErr) {
            console.warn('⚠️ documents table lookup failed, will try admin_work:', docTableErr.message);
        }

        // 2) Fallback: try admin_work (legacy / work-item documents)
        try {
            const adminWorkItems = await db.execute(
                'SELECT * FROM admin_work WHERE id = ?', [docId]
            );
            if (Array.isArray(adminWorkItems) && adminWorkItems.length > 0) {
                const item = adminWorkItems[0];
                return res.json({
                    id: item.id,
                    title: item.work_title,
                    description: stripHtmlTags(item.work_description || ''),
                    category: item.work_type || 'general',
                    type: 'PDF',
                    uploadedBy: item.assigned_to || 1,
                    uploadedDate: item.submitted_date,
                    status: item.status || 'active',
                    fileName: `${(item.work_title || 'document').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                    filePath: `/uploads/documents/${item.id}`,
                    department: item.department_code || 'admin',
                    source: 'admin_work_table'
                });
            }
        } catch (awErr) {
            console.warn('⚠️ admin_work lookup failed:', awErr.message);
        }

        // 3) Genuinely not found in either table
        return res.status(404).json({ error: 'Document not found', id: docId });

    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({
            error: 'Failed to fetch document',
            details: error.message
        });
    }
});

// Test POST endpoint to isolate the issue
router.post('/test-upload', (req, res) => {
    try {
        console.log('🧪 Test POST upload endpoint accessed');
        console.log('📋 Request body:', req.body);
        console.log('📁 File info:', req.file);
        console.log('🔍 Content-Type:', req.get('Content-Type'));
        
        // Simple test without any database operations
        res.json({ 
            message: 'Test POST upload endpoint working',
            receivedBody: !!req.body,
            receivedFile: !!req.file,
            contentType: req.get('Content-Type'),
            status: 'success'
        });
    } catch (error) {
        console.error('❌ Test POST endpoint error:', error);
        res.status(500).json({ 
            error: 'Test POST endpoint failed',
            details: error.message
        });
    }
});

// Upload new document endpoint (matches frontend call to /api/documents/upload)
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        console.log('📤 Certificate upload request received');
        console.log('📋 Request body keys:', Object.keys(req.body));
        console.log('📁 Request file:', req.file ? req.file.originalname : 'none (check body for base64)');
        
        const {
            type,
            name,
            expiry_date,
            description,
            uploaded_by
        } = req.body;
        
        // Determine file details and binary data
        let fileData = null;
        let fileMime = req.body.mime_type || 'application/pdf';
        let filename = req.body.filename || `${type}_certificate.pdf`;
        let fileSize = parseInt(req.body.file_size, 10) || 0;

        if (req.file) {
            // Multer file upload path
            const fsSync = require('fs');
            const filePath = req.file.path;
            fileData = fsSync.readFileSync(filePath);
            fileMime = req.file.mimetype;
            filename = req.file.originalname;
            fileSize = req.file.size;
            // Remove temp file after reading into memory
            try { fsSync.unlinkSync(filePath); } catch (_) {}
        } else if (req.body.file_base64) {
            // Base64 upload from frontend FormData alternative
            fileData = Buffer.from(req.body.file_base64, 'base64');
            fileSize = fileData.length;
        }
        
        // Validate required fields
        if (!type) {
            return res.status(400).json({
                error: 'Certificate type is required'
            });
        }
        
        if (!name) {
            return res.status(400).json({
                error: 'Certificate name is required'
            });
        }
        
        console.log('🔍 Extracted certificate data:', {
            type, name, filename, fileSize, fileMime, expiry_date, description, uploaded_by,
            hasFileData: !!fileData, fileDataSize: fileData ? fileData.length : 0
        });
        
        try {
            const db = require('../../database/config/database');
            
            // Ensure documents table exists
            await db.execute(`
                CREATE TABLE IF NOT EXISTS documents (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    file_name VARCHAR(255) NOT NULL,
                    file_path VARCHAR(500),
                    file_size BIGINT DEFAULT 0,
                    file_type VARCHAR(100) DEFAULT 'PDF',
                    file_data LONGBLOB,
                    file_mime VARCHAR(100),
                    category ENUM('Contract', 'Plan', 'Report', 'Invoice', 'Permit', 'Certificate', 'Other') DEFAULT 'Other',
                    uploaded_by INT NOT NULL,
                    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                    expiry_date DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_category (category),
                    INDEX idx_status (status),
                    INDEX idx_uploaded_by (uploaded_by),
                    INDEX idx_created_at (created_at)
                )
            `);
            console.log('✅ Documents table verified/created successfully');
            
            // Ensure file_data and file_mime columns exist (for tables created before this update)
            try {
                await db.execute(`ALTER TABLE documents ADD COLUMN file_data LONGBLOB AFTER file_type`);
                console.log('✅ Added file_data column');
            } catch (e) { /* column already exists */ }
            try {
                await db.execute(`ALTER TABLE documents ADD COLUMN file_mime VARCHAR(100) AFTER file_data`);
                console.log('✅ Added file_mime column');
            } catch (e) { /* column already exists */ }
            try {
                await db.execute(`ALTER TABLE documents ADD COLUMN file_path VARCHAR(500) AFTER file_name`);
                console.log('✅ Added file_path column');
            } catch (e) { /* column already exists */ }

            // Check if expiry_date column exists, if not add it
            try {
                const [columns] = await db.execute(`
                    SHOW COLUMNS FROM documents LIKE 'expiry_date'
                `);
                
                if (columns.length === 0) {
                    console.log('🔧 Adding expiry_date column to documents table...');
                    await db.execute(`
                        ALTER TABLE documents ADD COLUMN expiry_date DATE AFTER status
                    `);
                    await db.execute(`
                        ALTER TABLE documents ADD INDEX idx_expiry_date (expiry_date)
                    `);
                    console.log('✅ expiry_date column added successfully');
                } else {
                    console.log('✅ expiry_date column already exists');
                }
            } catch (alterError) {
                console.log('⚠️ Could not add expiry_date column (may already exist):', alterError.message);
            }
            
            // Map certificate types to categories
            const categoryMap = {
                'tin': 'Certificate',
                'vrn': 'Certificate', 
                'crb': 'Certificate',
                'license': 'Permit',
                'osha': 'Certificate',
                'nssf': 'Certificate',
                'wcf': 'Certificate'
            };
            
            const category = categoryMap[type.toLowerCase()] || 'Certificate';
            
            // Insert certificate into documents table WITH file binary data
            const documentsQuery = `
                INSERT INTO documents (
                    title,
                    description,
                    file_name,
                    file_size,
                    file_type,
                    file_data,
                    file_mime,
                    category,
                    uploaded_by,
                    status,
                    expiry_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
            `;
            
            const documentsValues = [
                name,
                description || `${type} certificate uploaded via form`,
                filename || `${type}_certificate.pdf`,
                fileSize || 0,
                fileMime || 'application/pdf',
                fileData,
                fileMime || 'application/pdf',
                category,
                uploaded_by || 1,
                expiry_date || null
            ];
            
            console.log('🔍 Inserting certificate (file_data size:', fileData ? fileData.length : 0, 'bytes)');
            
            const documentsResult = await db.execute(documentsQuery, documentsValues);
            console.log('✅ Certificate inserted successfully:', documentsResult);
            
            res.json({
                success: true,
                message: 'Certificate uploaded successfully',
                id: documentsResult.insertId,
                status: 'pending',
                certificate: {
                    id: documentsResult.insertId,
                    title: name,
                    type: type,
                    category: category,
                    fileName: filename,
                    status: 'pending'
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error:', dbError);
            console.error('❌ Error details:', {
                message: dbError.message,
                code: dbError.code,
                errno: dbError.errno,
                sqlState: dbError.sqlState,
                sqlMessage: dbError.sqlMessage
            });
            
            res.status(500).json({
                error: 'Failed to save certificate to database',
                details: dbError.message
            });
        }

        
    } catch (error) {
        console.error('❌ Certificate upload error:', error);
        res.status(500).json({
            error: 'Certificate upload failed',
            details: error.message
        });
    }
});

// Upload new document (JSON version for frontend forms)
router.post('/', function(req, res, next) {
    upload.single('file')(req, res, function(err) {
        if (err) {
            console.error('Multer upload error:', err.message);
            return res.status(400).json({ success: false, error: 'Upload failed: ' + err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        console.log('Document upload request received');
        console.log('File info:', req.file ? req.file.originalname : 'none');
        
        // Handle both file upload and JSON-only submissions
        if (req.body.work_type && req.body.work_title) {
            // This is a work item submission from frontend forms
            console.log('🔄 Processing work item submission...');
            
            const db = require('../../database/config/database');
            const {
                work_type,
                work_title,
                work_description,
                priority = 'Medium',
                due_date,
                assigned_to,
                submitted_by,
                docType,
                docDepartment,
                docPriority,
                docDescription,
                docFileName,
                docFileSize,
                file_base64
            } = req.body;
            
            // Handle binary data from frontend
            let fileData = null;
            let fileMime = 'application/pdf';
            if (file_base64) {
                try {
                    fileData = Buffer.from(file_base64, 'base64');
                    if (docFileName && docFileName.toLowerCase().endsWith('.png')) fileMime = 'image/png';
                    else if (docFileName && (docFileName.toLowerCase().endsWith('.jpg') || docFileName.toLowerCase().endsWith('.jpeg'))) fileMime = 'image/jpeg';
                    else fileMime = 'application/pdf';
                } catch (e) {
                    console.error('Error parsing base64:', e);
                }
            }
            
            // Get user ID from JWT token or fallback to submitted_by
            let userId = 1; // Default fallback
            try {
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    const token = authHeader.substring(7);
                    const jwt = require('jsonwebtoken');
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                    userId = decoded.id || 1;
                    console.log('🔍 Extracted user ID from JWT:', userId);
                }
            } catch (tokenError) {
                console.warn('⚠️ Could not extract user ID from token, using fallback:', tokenError.message);
            }
            
            console.log('🔍 Final user ID for upload:', userId);
            
            console.log('🔍 Extracted work_type:', work_type);
            console.log('🔍 Extracted work_title:', work_title);
            console.log('🔍 Extracted priority:', priority);
            
            // Insert into admin_work table
            const adminWorkQuery = `
                INSERT INTO admin_work (
                    department_code,
                    work_type,
                    work_title,
                    work_description,
                    priority,
                    due_date,
                    assigned_to,
                    submitted_by,
                    submitted_date,
                    status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')
            `;
            
            const adminWorkValues = [
                'admin',
                work_type,
                work_title,
                work_description,
                priority,
                due_date,
                assigned_to,
                submitted_by
            ];
            
            console.log('🔍 Inserting work item with values:', adminWorkValues);
            
            const adminWorkResult = await db.execute(adminWorkQuery, adminWorkValues);
            console.log('✅ Work item inserted successfully:', adminWorkResult);
            
            // Also insert into documents table
            try {
                // Map department to valid category ENUM values
                const categoryMap = {
                    'finance': 'Invoice',
                    'hr': 'Other',
                    'projects': 'Plan',
                    'operations': 'Other',
                    'management': 'Other',
                    'realestate': 'Contract',
                    'policy': 'Other',
                    'procedure': 'Other',
                    'report': 'Report',
                    'contract': 'Contract',
                    'memo': 'Other',
                    'other': 'Other'
                };
                
                const mappedCategory = categoryMap[docDepartment?.toLowerCase()] || 'Other';
                
                // Ensure documents table exists
                try {
                    await db.execute(`
                        CREATE TABLE IF NOT EXISTS documents (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            title VARCHAR(255) NOT NULL,
                            description TEXT,
                            file_name VARCHAR(255) NOT NULL,
                            file_size BIGINT DEFAULT 0,
                            file_type VARCHAR(100) DEFAULT 'PDF',
                            category ENUM('Contract', 'Plan', 'Report', 'Invoice', 'Permit', 'Certificate', 'Other') DEFAULT 'Other',
                            uploaded_by INT NOT NULL,
                            status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            INDEX idx_category (category),
                            INDEX idx_status (status),
                            INDEX idx_uploaded_by (uploaded_by),
                            INDEX idx_created_at (created_at)
                        )
                    `);
                    console.log('✅ Documents table verified/created successfully');
                } catch (tableError) {
                    console.log('⚠️ Could not create documents table:', tableError.message);
                }
                
                const documentsQuery = `
                    INSERT INTO documents (
                        title,
                        description,
                        file_name,
                        file_size,
                        file_type,
                        file_data,
                        file_mime,
                        category,
                        uploaded_by,
                        status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
                `;
                
                const documentsValues = [
                    work_title,
                    docDescription || work_description,
                    docFileName || `${work_title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                    docFileSize || 0,
                    docType || 'PDF',
                    fileData,
                    fileMime,
                    mappedCategory,
                    userId
                ];
                
                console.log('🔍 Inserting document with values:', documentsValues);
                console.log('🔍 Mapped category:', docDepartment, '→', mappedCategory);
                
                const documentsResult = await db.execute(documentsQuery, documentsValues);
                console.log('✅ Document inserted successfully:', documentsResult);
                
                res.json({
                    success: true,
                    message: 'Document uploaded successfully',
                    id: documentsResult.insertId,
                    adminWorkId: adminWorkResult.insertId,
                    status: 'pending'
                });
                
            } catch (docError) {
                console.error('❌ Error inserting into documents table:', docError);
                console.error('❌ Error details:', {
                    message: docError.message,
                    code: docError.code,
                    errno: docError.errno,
                    sqlState: docError.sqlState,
                    sqlMessage: docError.sqlMessage
                });
                // Still return success for admin_work insertion
                res.json({
                    success: true,
                    message: 'Work item uploaded successfully (document table error)',
                    id: adminWorkResult.insertId,
                    status: 'pending',
                    warning: 'Document table insertion failed',
                    error: docError.message
                });
            }
            
            return;
        } else if (!req.file) {
            // Traditional file upload without file
            return res.status(400).json({
                error: 'No file uploaded'
            });
        } else {
            // Traditional file upload with file — save to database
            console.log('Processing traditional file upload...');
            
            var { title, category, description, uploaded_by } = req.body;
            var fileMime = req.file.mimetype;
            var fileName = req.file.originalname;
            var fileSize = req.file.size;
            var fileData = null;

            // Read file data into memory for DB storage
            try {
                var fsSync = require('fs');
                fileData = fsSync.readFileSync(req.file.path);
                try { fsSync.unlinkSync(req.file.path); } catch (_) {}
            } catch (e) {
                console.warn('Could not read uploaded file:', e.message);
            }

            var validCategories = ['Contract', 'Plan', 'Report', 'Invoice', 'Permit', 'Certificate', 'Other'];
            var mappedCategory = validCategories.includes(category) ? category : 'Other';

            var theDb = require('../../database/config/database');
            await theDb.execute(`
                CREATE TABLE IF NOT EXISTS documents (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    file_name VARCHAR(255) NOT NULL,
                    file_path VARCHAR(500),
                    file_size BIGINT DEFAULT 0,
                    file_type VARCHAR(100) DEFAULT 'PDF',
                    file_data LONGBLOB,
                    file_mime VARCHAR(100),
                    category ENUM('Contract','Plan','Report','Invoice','Permit','Certificate','Other') DEFAULT 'Other',
                    uploaded_by INT NOT NULL,
                    status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
                    expiry_date DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            var result = await theDb.execute(
                'INSERT INTO documents (title, description, file_name, file_size, file_type, file_data, file_mime, category, uploaded_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [title || fileName, description || '', fileName, fileSize, fileMime, fileData, fileMime, mappedCategory, parseInt(uploaded_by) || 1, 'Pending']
            );

            var insertId = result ? (Array.isArray(result) ? result[0]?.insertId : result.insertId) : null;
            console.log('Document saved to database, id:', insertId);

            res.status(201).json({
                success: true,
                message: 'Document uploaded successfully',
                id: insertId,
                document: { id: insertId, title: title || fileName, category: mappedCategory, file_name: fileName, file_size: fileSize }
            });
        }
        
    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({
            error: 'File upload failed',
            details: error.message
        });
    }
});

// Update document
router.put('/:id', async (req, res) => {
    try {
        const docId = req.params.id;
        const { title, category, description, status } = req.body;
        
        // Try database first
        let db;
        try {
            db = require('../../database/config/database');
        } catch (e) {
            console.warn('⚠️ Database module not available for PUT /:id', e.message);
        }

        if (db) {
            let updated = false;

            // 1. Try updating documents table
            let updateDocsQuery = 'UPDATE documents SET ';
            let docsParams = [];
            if (title) { updateDocsQuery += 'title = ?, '; docsParams.push(title); }
            if (category) { updateDocsQuery += 'category = ?, '; docsParams.push(category); }
            if (description !== undefined) { updateDocsQuery += 'description = ?, '; docsParams.push(description); }
            if (status) { 
                let docsStatus = status;
                if (status.toLowerCase() === 'active' || status.toLowerCase() === 'completed') {
                    docsStatus = 'Approved';
                }
                updateDocsQuery += 'status = ?, '; 
                docsParams.push(docsStatus); 
            }

            if (docsParams.length > 0) {
                updateDocsQuery = updateDocsQuery.slice(0, -2) + ' WHERE id = ?';
                docsParams.push(docId);
                try {
                    const result = await db.execute(updateDocsQuery, docsParams);
                    const affected = Array.isArray(result) && result[0] ? result[0].affectedRows : (result && result.affectedRows);
                    if (affected > 0) updated = true;
                } catch (e) {
                    console.error('Error updating documents table:', e);
                }
            }

            // 2. Try updating admin_work table
            let updateAdminQuery = 'UPDATE admin_work SET ';
            let adminParams = [];
            if (title) { updateAdminQuery += 'work_title = ?, '; adminParams.push(title); }
            if (category) { updateAdminQuery += 'work_type = ?, '; adminParams.push(category); }
            if (description !== undefined) { updateAdminQuery += 'work_description = ?, '; adminParams.push(description); }
            if (status) { 
                let adminStatus = status;
                if (status.toLowerCase() === 'active' || status.toLowerCase() === 'approved') {
                    adminStatus = 'Completed';
                }
                updateAdminQuery += 'status = ?, '; 
                adminParams.push(adminStatus); 
            }

            if (adminParams.length > 0) {
                updateAdminQuery = updateAdminQuery.slice(0, -2) + ' WHERE id = ?';
                adminParams.push(docId);
                try {
                    const result = await db.execute(updateAdminQuery, adminParams);
                    const affected = Array.isArray(result) && result[0] ? result[0].affectedRows : (result && result.affectedRows);
                    if (affected > 0) updated = true;
                } catch (e) {
                    console.error('Error updating admin_work table:', e);
                }
            }

            if (updated) {
                return res.json({ message: 'Document updated successfully in database' });
            }
        }

        // Fallback to memory array if DB is not available or no rows updated
        if (!documents || !Array.isArray(documents)) {
            return res.status(500).json({ error: 'Document storage not initialized' });
        }
        
        const documentIndex = documents.findIndex(doc => doc.id === parseInt(docId));
        
        if (documentIndex === -1) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        const existingDocument = documents[documentIndex];
        documents[documentIndex] = {
            ...existingDocument,
            ...(title && { title }),
            ...(category && { category }),
            ...(description !== undefined && { description }),
            ...(status && { status })
        };
        
        res.json({
            message: 'Document updated successfully',
            document: documents[documentIndex]
        });
    } catch (err) {
        console.error('Error in PUT /api/documents/:id:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete document
router.delete('/:id', async (req, res) => {
    try {
        const docId = req.params.id;
        console.log(`🗑️ Delete request for document ID: ${docId}`);

        // Try database first
        const db = require('../../database/config/database');

        // Run delete and normalize result because different DB libs return
        // different shapes (mysql2 returns [result, fields], some wrappers
        // may return result directly).
        const execResult = await db.execute(
            'DELETE FROM admin_work WHERE id = ?', [docId]
        );

        // Determine affectedRows in a robust way
        let affectedRows;
        if (Array.isArray(execResult)) {
            // Common pattern: [result, fields]
            const first = execResult[0];
            if (first && typeof first === 'object' && ('affectedRows' in first)) {
                affectedRows = first.affectedRows;
            }
        } else if (execResult && typeof execResult === 'object' && ('affectedRows' in execResult)) {
            affectedRows = execResult.affectedRows;
        }

        // Fallback: if we couldn't read affectedRows, check if the record still exists
        if (typeof affectedRows !== 'number') {
            try {
                const check = await db.execute('SELECT id FROM admin_work WHERE id = ?', [docId]);
                let rows = Array.isArray(check) && Array.isArray(check[0]) ? check[0] : check;
                if (rows && rows.length > 0) {
                    // Record still exists and delete did not report affectedRows
                    console.error('❌ Delete returned unexpected result and document still exists:', execResult);
                    return res.status(500).json({
                        error: 'Failed to delete document',
                        details: 'Delete returned unexpected result and document still exists'
                    });
                } else {
                    // No rows => treat as deleted
                    affectedRows = 1;
                }
            } catch (chkErr) {
                console.error('❌ Error verifying deletion:', chkErr);
                return res.status(500).json({ error: 'Failed to delete document', details: chkErr.message });
            }
        }

        if (affectedRows === 0) {
            return res.status(404).json({
                error: 'Document not found',
                details: `No document found with ID: ${docId}`
            });
        }

        console.log(`✅ Document deleted from database: ${docId}`);

        res.json({
            message: 'Document deleted successfully',
            documentId: docId
        });

    } catch (error) {
        console.error('❌ Error deleting document:', error);
        res.status(500).json({ 
            error: 'Failed to delete document',
            details: error.message 
        });
    }
});

// Download document
router.get('/:id/download', async (req, res) => {
    try {
        const docId = req.params.id;
        console.log(`📄 Download request for document ID: ${docId}`);
        
        // Handle employee document downloads (CV / Agreement from employee_details LONGBLOB)
        if (typeof docId === 'string' && (docId.startsWith('emp_agr_') || docId.startsWith('emp_cv_'))) {
            const isCV = docId.startsWith('emp_cv_');
            const empId = parseInt(docId.replace('emp_agr_', '').replace('emp_cv_', ''), 10);
            
            if (!isNaN(empId) && db) {
                const column = isCV ? 'cv_data' : 'agreement_data';
                const mimeCol = isCV ? 'cv_mime' : 'agreement_mime';
                const dbResult = await db.execute(
                    `SELECT full_name, ${column}, ${mimeCol} FROM employee_details WHERE employee_id = ?`, [empId]
                );
                
                let empRows = Array.isArray(dbResult) ? (Array.isArray(dbResult[0]) ? dbResult[0] : dbResult) : (dbResult && dbResult.rows ? dbResult.rows : []);
                
                if (empRows && empRows.length > 0 && empRows[0][column]) {
                    const emp = empRows[0];
                    const mime = emp[mimeCol] || 'application/octet-stream';
                    const ext = mime === 'application/pdf' ? '.pdf' : mime.includes('png') ? '.png' : '.jpg';
                    const label = isCV ? 'CV' : 'Agreement';
                    const fileName = `${label}_${emp.full_name.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;
                    
                    res.set('Content-Type', mime);
                    res.set('Content-Disposition', `${req.query.view === 'true' ? 'inline' : 'attachment'}; filename="${fileName}"`);
                    return res.send(Buffer.from(emp[column]));
                }
            }
            
            return res.status(404).json({ error: 'Employee document not found' });
        }

        // Handle worker account document downloads (ID / Contract from worker_accounts)
        if (typeof docId === 'string' && (docId.startsWith('work_id_') || docId.startsWith('work_cont_'))) {
            const isIdDoc = docId.startsWith('work_id_');
            const workerId = parseInt(docId.replace('work_id_', '').replace('work_cont_', ''), 10);
            
            if (!isNaN(workerId) && db) {
                const dataCol = isIdDoc ? 'id_document_data' : 'contract_document_data';
                const mimeCol = isIdDoc ? 'id_document_mime' : 'contract_document_mime';
                const pathCol = isIdDoc ? 'id_document' : 'contract_document';
                
                try {
                    const dbResult = await db.execute(
                        `SELECT full_name, ${pathCol}, ${dataCol}, ${mimeCol} FROM worker_accounts WHERE id = ?`, [workerId]
                    );
                    
                    let workRows = Array.isArray(dbResult) ? (Array.isArray(dbResult[0]) ? dbResult[0] : dbResult) : (dbResult && dbResult.rows ? dbResult.rows : []);
                    
                    if (workRows && workRows.length > 0) {
                        const worker = workRows[0];
                        const label = isIdDoc ? 'ID' : 'Contract';
                        
                        // 1) Try BLOB data from database first (survives Railway redeploys)
                        if (worker[dataCol]) {
                            const mime = worker[mimeCol] || 'application/octet-stream';
                            const ext = mime.includes('pdf') ? '.pdf' : mime.includes('doc') ? '.docx' : mime.includes('png') ? '.png' : mime.includes('jpeg') || mime.includes('jpg') ? '.jpg' : '';
                            const fileName = `${label}_${(worker.full_name || 'worker').replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;
                            
                            res.set('Content-Type', mime);
                            res.set('Content-Disposition', `${req.query.view === 'true' ? 'inline' : 'attachment'}; filename="${fileName}"`);
                            return res.send(Buffer.from(worker[dataCol]));
                        }
                        
                        // 2) Fallback: try filesystem (works during same deploy session)
                        if (worker[pathCol]) {
                            const filePath = worker[pathCol];
                            const fileName = filePath.split('/').pop() || `worker_${label}_${workerId}`;
                            const fsCheck = require('fs');
                            const pathMod = require('path');
                            const absolutePath = pathMod.resolve(__dirname, '../../', filePath.replace(/^\//, ''));
                            
                            if (fsCheck.existsSync(absolutePath)) {
                                return req.query.view === 'true' ? res.sendFile(absolutePath) : res.download(absolutePath, fileName);
                            }
                        }
                        
                        return res.status(404).json({ error: `Worker ${label} document file data not found. The file may have been lost during a server restart. Please re-upload the document.` });
                    }
                } catch (blobErr) {
                    console.error('❌ Error fetching worker document BLOB:', blobErr.message);
                }
            }
            
            return res.status(404).json({ error: 'Worker document not found in database.' });
        }

        // Try to fetch from documents table first
        if (db && !isNaN(parseInt(docId, 10))) {
            try {
                const docRows = await db.execute(
                    'SELECT * FROM documents WHERE id = ?', [docId]
                );
                const items = Array.isArray(docRows) ? (Array.isArray(docRows[0]) ? docRows[0] : docRows) : [];
                
                if (items.length > 0) {
                    const doc = items[0];
                    console.log(`✅ Found document in documents table: ${doc.title}`);
                    
                    // 1) Try BLOB data from database first (survives Railway redeploys)
                    if (doc.file_data) {
                        const mime = doc.file_mime || doc.file_type || 'application/octet-stream';
                        const ext = mime.includes('pdf') ? '.pdf' : mime.includes('png') ? '.png' : mime.includes('jpeg') || mime.includes('jpg') ? '.jpg' : '';
                        const fileName = doc.file_name || `${(doc.title || 'document').replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;
                        
                        console.log(`📤 Serving document BLOB: ${fileName} (${mime}, ${doc.file_data.length} bytes)`);
                        res.set('Content-Type', mime);
                        res.set('Content-Disposition', `${req.query.view === 'true' ? 'inline' : 'attachment'}; filename="${fileName}"`);
                        return res.send(Buffer.from(doc.file_data));
                    }
                    
                    // 2) Fallback: try filesystem (works during same deploy session)
                    if (doc.file_path) {
                        const fs = require('fs');
                        const path = require('path');
                        const absolutePath = path.resolve(__dirname, '../../', doc.file_path.replace(/^\//, ''));
                        
                        if (fs.existsSync(absolutePath)) {
                            return req.query.view === 'true' ? res.sendFile(absolutePath) : res.download(absolutePath, doc.file_name);
                        } else {
                            console.error('❌ Physical file not found at:', absolutePath);
                        }
                    }
                    
                    // 3) Last resort: if file is completely missing, return an error rather than generating a description
                    // Users expect the actual uploaded binary file. If it's missing (e.g. uploaded before file_data was supported), tell them.
                    return res.status(404).send("The original uploaded file could not be found. If this was uploaded before binary storage was enabled, please re-upload the document.");
                }
            } catch (docError) {
                console.error('❌ Database error querying documents table:', docError);
            }
        }


        let adminWorkItems;
        
        // Try to fetch from database if available
        if (db) {
            try {
                adminWorkItems = await db.execute(
                    'SELECT * FROM admin_work WHERE id = ?', [docId]
                );
            } catch (dbError) {
                console.error('❌ Database error in download:', dbError);
                // Fallback to mock data for testing
                adminWorkItems = [[{
                    id: docId,
                    work_title: `Sample Document ${docId}`,
                    work_description: 'This is a sample document for download testing',
                    work_type: 'Document',
                    department_code: 'admin',
                    status: 'active',
                    submitted_date: new Date().toISOString().split('T')[0]
                }]];
            }
        } else {
            console.log('⚠️ Database not available, using fallback data');
            // Fallback to mock data
            adminWorkItems = [[{
                id: docId,
                work_title: `Sample Document ${docId}`,
                work_description: 'This is a sample document for download testing',
                work_type: 'Document',
                department_code: 'admin',
                status: 'active',
                submitted_date: new Date().toISOString().split('T')[0]
            }]];
        }
        
        // Handle different response formats
        let items = [];
        if (Array.isArray(adminWorkItems)) {
            if (adminWorkItems.length > 0 && Array.isArray(adminWorkItems[0])) {
                items = adminWorkItems[0];
            } else {
                items = adminWorkItems;
            }
        }
        
        if (items.length === 0) {
            console.log(`❌ Document not found: ${docId}`);
            return res.status(404).json({
                error: 'Document not found',
                details: `No document found with ID: ${docId}`
            });
        }
        
        const item = items[0];
        console.log(`✅ Found document: ${item.work_title}`);
        
        // Generate PDF content as HTML
        const pdfContent = generatePDF(item);
        
        // Create a proper filename
        const fileName = `${item.work_title.replace(/[^a-zA-Z0-9\s]/g, '_').trim()}.pdf`;
        
        // Set headers - serve as HTML for QR/mobile viewing, PDF for downloads
        if (req.query.view === 'true') {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
        } else {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        }
        res.setHeader('Content-Length', Buffer.byteLength(pdfContent, 'utf8'));
        
        console.log(`📤 Sending document: ${fileName}`);
        res.send(pdfContent);
        
    } catch (error) {
        console.error('❌ Error downloading document:', error);
        res.status(500).json({ 
            error: 'Failed to download document',
            details: error.message 
        });
    }
});

// Get document statistics
router.get('/stats/overview', (req, res) => {
    const totalDocuments = documents.length;
    const activeDocuments = documents.filter(doc => doc.status === 'active').length;
    
    // Category breakdown
    const categoryStats = {};
    documents.forEach(doc => {
        categoryStats[doc.category] = (categoryStats[doc.category] || 0) + 1;
    });
    
    // Type breakdown
    const typeStats = {};
    documents.forEach(doc => {
        typeStats[doc.type] = (typeStats[doc.type] || 0) + 1;
    });
    
    // Storage statistics
    const totalStorage = documents.reduce((sum, doc) => sum + doc.size, 0);
    
    // Recent uploads
    const recentUploads = documents
        .sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate))
        .slice(0, 10);
    
    res.json({
        total: totalDocuments,
        active: activeDocuments,
        categories: categoryStats,
        types: typeStats,
        totalStorage,
        recentUploads
    });
});

module.exports = router;
