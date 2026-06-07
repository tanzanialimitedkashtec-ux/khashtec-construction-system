const multer = require('multer');
const path = require('path');

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Upload to uploads directory
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX files are allowed.'));
    }
};

// Initialize multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB limit
    },
    fileFilter: fileFilter
});

// Export upload middleware
module.exports = upload;
