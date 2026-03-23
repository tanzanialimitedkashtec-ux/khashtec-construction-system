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

// Upload new document (JSON version for frontend forms)
router.post('/', upload.single('file'), async (req, res) => {
    try {
        console.log('📝 Document upload request received');
        console.log('📋 Request body:', req.body);
        console.log('📁 File info:', req.file);
        
        // Handle both file upload and JSON-only submissions
        if (req.body.work_type && req.body.work_title) {
            // This is a work item submission from frontend forms
            console.log('🔄 Processing work item submission...');
            
            const db = require('../src/config/database');
            const {
                work_type,
                work_title,
                work_description,
                priority = 'Medium',
                due_date,
                assigned_to,
                submitted_by
            } = req.body;
            
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
            
        } else if (!req.file) {
            // Traditional file upload without file
            return res.status(400).json({
                error: 'No file uploaded'
            });
        } else {
            // Traditional file upload with file
            const { title, category, description, uploadedBy } = req.body;
            
            // Validate input
            if (!title || !category || !uploadedBy) {
                return res.status(400).json({
                    error: 'Title, category, and uploadedBy are required'
                });
            }
            
            // Get file type
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
            
            // Create new document record
            const newDocument = {
                id: documents.length + 1,
                title,
                type: fileType,
                category,
                uploadedBy: parseInt(uploadedBy),
                uploadedDate: new Date().toISOString().split('T')[0],
                fileName: req.file.filename,
                filePath: `/uploads/documents/${req.file.filename}`,
                size: req.file.size,
                status: 'active',
                description: description || ''
            };
            
            documents.push(newDocument);
            
            res.status(201).json({
                message: 'Document uploaded successfully',
                document: newDocument
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
router.put('/:id', (req, res) => {
    const documentIndex = documents.findIndex(doc => doc.id === parseInt(req.params.id));
    
    if (documentIndex === -1) {
        return res.status(404).json({
            error: 'Document not found'
        });
    }
    
    const { title, category, description, status } = req.body;
    
    // Update document
    documents[documentIndex] = {
        ...documents[documentIndex],
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
    const documentIndex = documents.findIndex(doc => doc.id === parseInt(req.params.id));
    
    if (documentIndex === -1) {
        return res.status(404).json({
            error: 'Document not found'
        });
    }
    
    const deletedDocument = documents.splice(documentIndex, 1)[0];
    
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
