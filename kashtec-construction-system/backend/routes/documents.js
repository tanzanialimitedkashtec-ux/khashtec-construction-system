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
router.get('/', (req, res) => {
    const { category, type, uploadedBy, search } = req.query;
    
    let filteredDocuments = documents;
    
    if (category) {
        filteredDocuments = filteredDocuments.filter(doc => 
            doc.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    if (type) {
        filteredDocuments = filteredDocuments.filter(doc => 
            doc.type.toLowerCase() === type.toLowerCase()
        );
    }
    
    if (uploadedBy) {
        filteredDocuments = filteredDocuments.filter(doc => 
            doc.uploadedBy === parseInt(uploadedBy)
        );
    }
    
    if (search) {
        const searchTerm = search.toLowerCase();
        filteredDocuments = filteredDocuments.filter(doc => 
            doc.title.toLowerCase().includes(searchTerm) ||
            doc.description.toLowerCase().includes(searchTerm) ||
            doc.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by upload date (newest first)
    filteredDocuments.sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate));
    
    res.json({
        documents: filteredDocuments,
        total: filteredDocuments.length
    });
});

// Get document by ID
router.get('/:id', (req, res) => {
    const document = documents.find(doc => doc.id === parseInt(req.params.id));
    
    if (!document) {
        return res.status(404).json({
            error: 'Document not found'
        });
    }
    
    res.json(document);
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
        console.log('📝 DOCUMENT UPLOAD ROUTE STARTED');
        console.log('📝 Request method:', req.method);
        console.log('📝 Request URL:', req.url);
        console.log('📝 Request headers:', req.headers);
        console.log('📝 Content-Type:', req.get('Content-Type'));
        
        // IMMEDIATE TEST: Try simple response
        console.log('🧪 IMMEDIATE TEST: Returning simple response');
        return res.status(200).json({
            message: 'IMMEDIATE TEST - Route reached successfully',
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url
        });
        
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
            
            // TEMPORARY: Bypass database to isolate error
            console.log('🔧 TEMPORARY: Bypassing database operations to isolate error');
            
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
            
            // TEMPORARY: Return success without database operations
            console.log('🔧 TEMPORARY: Returning success without database insert');
            return res.status(201).json({
                message: 'Document work item created successfully (TEMP)',
                id: 'temp-' + Date.now(),
                work_type,
                work_title,
                status: 'pending'
            });
            
            /* ORIGINAL CODE (commented out temporarily)
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
                'User Account Management', 'System Administration', 'Department Coordination'
            ];
            
            if (!validWorkTypes.includes(work_type)) {
                console.error('❌ Invalid work_type:', work_type);
                console.error('❌ Valid work types:', validWorkTypes);
                return res.status(400).json({
                    error: 'Invalid work type',
                    details: `Work type "${work_type}" is not valid. Valid types: ${validWorkTypes.join(', ')}`
                });
            }
            
            const [result] = await db.execute(query, values);
            console.log('✅ Admin work item created:', result);
            
            // Return success response
            res.status(201).json({
                message: 'Document work item created successfully',
                id: result.insertId,
                work_type,
                work_title,
                status: 'pending'
            });
            */
            
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
router.get('/:id/download', (req, res) => {
    const document = documents.find(doc => doc.id === parseInt(req.params.id));
    
    if (!document) {
        return res.status(404).json({
            error: 'Document not found'
        });
    }
    
    const filePath = path.join(__dirname, '../../uploads/documents', document.fileName);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            error: 'File not found on server'
        });
    }
    
    res.download(filePath, document.title + path.extname(document.fileName));
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
