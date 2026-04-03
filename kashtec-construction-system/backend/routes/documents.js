const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

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
        
        // Try to fetch from admin_work table first
        let documents = [];
        
        try {
            const db = require('../database/config/database');
            const [adminWorkItems] = await db.execute(`
                SELECT * FROM admin_work 
                ORDER BY submitted_date DESC
            `);
            
            // Transform admin_work data to document format
            documents = adminWorkItems.map(item => ({
                id: item.id,
                title: item.work_title,
                description: item.work_description,
                category: item.work_type || 'general',
                type: 'PDF', // Default type
                uploadedBy: item.assigned_to || 1,
                uploadedDate: item.submitted_date,
                status: item.status || 'active',
                fileName: `${item.work_title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                filePath: `/uploads/documents/${item.id}`,
                department: item.department_code || 'admin'
            }));
            
            console.log('✅ Documents fetched from admin_work:', documents.length);
            
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
    try {
        const docId = req.params.id;
        
        // Fetch from admin_work table
        const db = require('../database/config/database');
        const [adminWorkItems] = await db.execute(
            'SELECT * FROM admin_work WHERE id = ?', [docId]
        );
        
        if (adminWorkItems.length === 0) {
            return res.status(404).json({
                error: 'Document not found'
            });
        }
        
        const item = adminWorkItems[0];
        
        // Transform admin_work data to document format
        const document = {
            id: item.id,
            title: item.work_title,
            description: item.work_description,
            category: item.work_type || 'general',
            type: 'PDF',
            uploadedBy: item.assigned_to || 1,
            uploadedDate: item.submitted_date,
            status: item.status || 'active',
            fileName: `${item.work_title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            filePath: `/uploads/documents/${item.id}`,
            department: item.department_code || 'admin'
        };
        
        res.json(document);
        
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
                submitted_by
            } = req.body;
            
            console.log('🔍 Extracted work_type:', work_type);
            console.log('🔍 Extracted work_title:', work_title);
            console.log('🔍 Extracted priority:', priority);
            
            // Insert into admin_work table
            const query = `
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
            
            const values = [
                'admin',
                work_type,
                work_title,
                work_description,
                priority,
                due_date,
                assigned_to,
                submitted_by
            ];
            
            console.log('🔍 Executing admin work query:', query);
            console.log('📊 Query values:', values);
            console.log('🔍 Work type value being inserted:', work_type);
            console.log('🔍 Work type value length:', work_type ? work_type.length : 'null');
            
            // Check if work_type is valid before inserting
            const validWorkTypes = [
                'Administrative Operations', 'Compliance Management', 'Staff Oversight', 
                'Policy Implementation', 'Document Management', 'Document Upload', 
                'Project Creation', 'Safety Policy Upload', 'Toolbox Meeting', 'PPE Issuance', 'Safety Violation', 'Inspection Report', 'Budget Management', 'Expense Report', 'Property Management', 'Client Registration', 'User Account Management', 'System Administration', 'Department Coordination'
            ];
            
            if (!validWorkTypes.includes(work_type)) {
                console.error('❌ Invalid work_type:', work_type);
                console.error('❌ Valid work types:', validWorkTypes);
                return res.status(400).json({
                    error: 'Invalid work type',
                    details: `Work type "${work_type}" is not valid. Valid types: ${validWorkTypes.join(', ')}`
                });
            }
            
            try {
                console.log('🔍 About to execute database query...');
                console.log('🔍 Query:', query);
                console.log('🔍 Values:', values);
                console.log('🔍 Values type:', typeof values);
                console.log('🔍 Values is array:', Array.isArray(values));
                console.log('🔍 Values length:', values ? values.length : 'null');
                
                // Try to execute query with detailed error handling
                const result = await db.execute(query, values);
                console.log('🔍 Query result type:', typeof result);
                console.log('🔍 Query result is array:', Array.isArray(result));
                console.log('🔍 Query result:', result);
                
                // MySQL2 returns [rows, fields] or just rows depending on configuration
                let insertResult;
                if (Array.isArray(result)) {
                    insertResult = result[0]; // First element is usually the rows/result
                } else {
                    insertResult = result; // Use result directly if it's not an array
                }
                
                console.log('🔍 Insert result:', insertResult);
                console.log('✅ Admin work item created:', insertResult);
                
                // Return success response
                res.status(201).json({
                    message: 'Document work item created successfully',
                    id: insertResult.insertId,
                    work_type,
                    work_title,
                    status: 'pending'
                });
            } catch (dbError) {
                console.error('❌ Database error details:', {
                    message: dbError.message,
                    stack: dbError.stack,
                    code: dbError.code,
                    errno: dbError.errno,
                    sqlState: dbError.sqlState,
                    sqlMessage: dbError.sqlMessage
                });
                throw dbError;
            }
            
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
router.delete('/:id', (req, res) => {
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
    
    // Safe splice with check
    const deletedDocuments = documents.splice(documentIndex, 1);
    const deletedDocument = deletedDocuments.length > 0 ? deletedDocuments[0] : null;
    
    if (!deletedDocument) {
        return res.status(404).json({
            error: 'Document could not be deleted'
        });
    }
    
    // Delete actual file
    const filePath = path.join(__dirname, '../../uploads/documents', deletedDocument.fileName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    
    res.json({
        message: 'Document deleted successfully',
        document: deletedDocument
    });
});

// Download document
router.get('/:id/download', async (req, res) => {
    try {
        const docId = req.params.id;
        
        // Fetch from admin_work table
        const db = require('../database/config/database');
        const [adminWorkItems] = await db.execute(
            'SELECT * FROM admin_work WHERE id = ?', [docId]
        );
        
        if (adminWorkItems.length === 0) {
            return res.status(404).json({
                error: 'Document not found'
            });
        }
        
        const item = adminWorkItems[0];
        
        // For admin work items, create a simple text file as placeholder
        const content = `Document: ${item.work_title}\nDescription: ${item.work_description}\nType: ${item.work_type}\nSubmitted: ${item.submitted_date}\nStatus: ${item.status}\nDepartment: ${item.department_code || 'admin'}`;
        
        const fileName = `${item.work_title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(content);
        
    } catch (error) {
        console.error('Error downloading document:', error);
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
