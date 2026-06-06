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
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, PDFs, and Office documents are allowed.'));
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
            
            // Combine both sources
            documents = [...realDocuments, ...adminWorkDocuments];
            
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
router.post('/upload', async (req, res) => {
    try {
        console.log('📤 Certificate upload request received');
        console.log('📋 Request body:', req.body);
        console.log('🔍 Request method:', req.method);
        console.log('🔍 Request URL:', req.url);
        console.log('🔍 Content-Type:', req.get('Content-Type'));
        
        const {
            type,
            name,
            filename,
            file_size,
            mime_type,
            expiry_date,
            description,
            uploaded_by
        } = req.body;
        
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
            type, name, filename, file_size, mime_type, expiry_date, description, uploaded_by
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
                    file_size BIGINT DEFAULT 0,
                    file_type VARCHAR(100) DEFAULT 'PDF',
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
            
            // Insert certificate into documents table
            const documentsQuery = `
                INSERT INTO documents (
                    title,
                    description,
                    file_name,
                    file_size,
                    file_type,
                    category,
                    uploaded_by,
                    status,
                    expiry_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
            `;
            
            const documentsValues = [
                name,
                description || `${type} certificate uploaded via form`,
                filename || `${type}_certificate.pdf`,
                file_size || 0,
                mime_type || 'application/pdf',
                category,
                uploaded_by || 1,
                expiry_date || null
            ];
            
            console.log('🔍 Inserting certificate with values:', documentsValues);
            
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
router.post('/', upload.single('file'), async (req, res) => {
    try {
        console.log('📝 Document upload request received');
        console.log('📋 Request body:', req.body);
        console.log('📁 File info:', req.file);
        console.log('🔍 Request method:', req.method);
        console.log('🔍 Request URL:', req.url);
        console.log('🔍 Content-Type:', req.get('Content-Type'));
        
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
                docFileSize
            } = req.body;
            
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
                        category,
                        uploaded_by,
                        status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
                `;
                
                const documentsValues = [
                    work_title,
                    docDescription || work_description,
                    docFileName || `${work_title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                    docFileSize || 0,
                    docType || 'PDF',
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
            // Traditional file upload with file
            console.log('🔄 Processing traditional file upload...');
            
            const { title, category, description, uploadedBy = 'Admin Assistant' } = req.body;
            const fileExt = path.extname(req.file.originalname).toLowerCase();
            let fileType = 'Document';
            
            if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExt)) {
                fileType = 'Image';
            } else if (fileExt === '.pdf') {
                fileType = 'PDF';
            } else if (['.doc', '.docx'].includes(fileExt)) {
                fileType = 'Word';
            } else if (['.xls', '.xlsx'].includes(fileExt)) {
                fileType = 'Excel';
            } else if (['.ppt', '.pptx'].includes(fileExt)) {
                fileType = 'PowerPoint';
            }
            
            // Create document record
            const newDocument = {
                id: documents.length + 1,
                title: title || req.file.originalname,
                category: category || 'General',
                description: description || '',
                type: fileType,
                uploadedBy: parseInt(uploadedBy),
                uploadedDate: new Date().toISOString().split('T')[0],
                fileName: req.file.filename,
                filePath: `/uploads/documents/${req.file.filename}`,
                size: req.file.size,
                status: 'pending'
            };
            
            // Safe array push with validation
            if (Array.isArray(documents)) {
                documents.push(newDocument);
                console.log('✅ Document uploaded successfully:', newDocument);
                
                res.status(201).json({
                    message: 'Document uploaded successfully',
                    document: newDocument
                });
            } else {
                throw new Error('Documents array not initialized');
            }
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
router.put('/:id', (req, res) => {
    // Ensure documents array exists
    if (!documents || !Array.isArray(documents)) {
        return res.status(500).json({
            error: 'Document storage not initialized'
        });
    }
    
    const documentIndex = documents.findIndex(doc => doc.id === parseInt(req.params.id));
    
    if (documentIndex === -1) {
        return res.status(404).json({
            error: 'Document not found'
        });
    }
    
    // Ensure the document exists before spreading
    const existingDocument = documents[documentIndex];
    if (!existingDocument) {
        return res.status(404).json({
            error: 'Document not found at index'
        });
    }
    
    const { title, category, description, status } = req.body;
    
    // Update document with safe spread
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
        
        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', Buffer.byteLength(pdfContent, 'utf8'));
        
        console.log(`📤 Sending PDF: ${fileName}`);
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
