const notify = require('../utils/notify');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const upload = require('../middleware/upload');

// Test endpoint
router.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Drivers API is working',
        timestamp: new Date().toISOString()
    });
});

// GET /api/drivers - for frontend compatibility (same as /all)
router.get('/', async (req, res) => {
    try {
        console.log('👤 Drivers endpoint called - fetching from database');
        const db = require('../../database/config/database');
        
        // Ensure drivers table exists and has all required columns
        try {
            // First create the table if it doesn't exist
            await db.execute(`
                CREATE TABLE IF NOT EXISTS drivers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    driver_id VARCHAR(50) UNIQUE NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    description TEXT NULL,
                    years_of_experience INT NULL,
                    license_type VARCHAR(50) NULL,
                    phone_number VARCHAR(50) NULL,
                    email_address VARCHAR(255) NULL,
                    driver_status ENUM('Active', 'Inactive', 'On Leave', 'Suspended') DEFAULT 'Active',
                    hire_date DATE NULL,
                    registration_date DATE NULL,
                    assigned_vehicle VARCHAR(100) NULL,
                    license_number VARCHAR(100) NULL,
                    license_expiry DATE NULL,
                    emergency_contact VARCHAR(255) NULL,
                    emergency_phone VARCHAR(50) NULL,
                    address TEXT NULL,
                    city VARCHAR(100) NULL,
                    country VARCHAR(100) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_driver_id (driver_id),
                    INDEX idx_driver_status (driver_status),
                    INDEX idx_license_type (license_type),
                    INDEX idx_created_at (created_at)
                )
            `);
            
            // Now add missing columns if they don't exist
            const alterStatements = [
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS nida_number VARCHAR(100) NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS date_of_birth DATE NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS gender ENUM("male", "female", "other") NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS residential_address TEXT NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS region VARCHAR(100) NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255) NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS emergency_contact_number VARCHAR(50) NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS emergency_relationship VARCHAR(50) NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10) NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_issue_date DATE NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS employment_status ENUM("full-time", "part-time", "contract", "temporary") NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS salary DECIMAL(10,2) NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS bank_details TEXT NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS medical_certificate VARCHAR(50) NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS medical_expiry_date DATE NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS skills TEXT NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS employment_history TEXT NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS additional_notes TEXT NULL',
                'ALTER TABLE drivers ADD COLUMN IF NOT EXISTS passport_number VARCHAR(100) NULL'
            ];
            
            for (const sql of alterStatements) {
                try {
                    await db.execute(sql);
                    console.log('✅ Column added successfully:', sql);
                } catch (alterError) {
                    // Column might already exist, which is fine
                    if (!alterError.message.includes('Duplicate column name') && !alterError.message.includes('already exists')) {
                        console.log('⚠️ Could not add column:', alterError.message);
                    }
                }
            }
            
            console.log('✅ Drivers table schema updated successfully');
        } catch (tableError) {
            console.log('⚠️ Could not update drivers table:', tableError.message);
        }
        
        const [drivers] = await db.execute(`
            SELECT *
            FROM drivers 
            ORDER BY created_at DESC
        `);
        
        let finalDrivers = drivers;
        if (!Array.isArray(finalDrivers)) {
            if (finalDrivers && typeof finalDrivers === 'object') {
                finalDrivers = [finalDrivers];
            } else {
                finalDrivers = [];
            }
        }
        
        console.log(`✅ Found ${finalDrivers.length} drivers in database`);
        
        if (finalDrivers.length === 0) {
            console.log('🌱 Drivers table exists but contains no records. Returning an empty list.');
        }
        
        console.log('📊 Drivers data structure:', {
            isArray: Array.isArray(finalDrivers),
            length: finalDrivers.length,
            firstItem: finalDrivers[0] || 'No items',
            sampleKeys: finalDrivers[0] ? Object.keys(finalDrivers[0]) : 'No keys'
        });
        
        res.status(200).json({
            success: true,
            drivers: finalDrivers,
            count: finalDrivers.length
        });
        
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({
            success: false,
            drivers: [],
            count: 0,
            message: 'Unable to load drivers from database'
        });
    }
});

// Get all drivers
router.get('/all', async (req, res) => {
    try {
        const db = require('../../database/config/database');
        
        const [drivers] = await db.execute(`
            SELECT *
            FROM drivers 
            ORDER BY created_at DESC
        `);
        
        let finalDrivers = drivers;
        if (!Array.isArray(finalDrivers)) {
            if (finalDrivers && typeof finalDrivers === 'object') {
                finalDrivers = [finalDrivers];
            } else {
                finalDrivers = [];
            }
        }
        
        if (finalDrivers.length === 0) {
            console.log('🌱 Drivers table exists but contains no records in /all. Returning an empty list.');
        }
        
        res.status(200).json({
            success: true,
            drivers: finalDrivers,
            count: finalDrivers.length
        });
        
    } catch (error) {
        console.error('Error fetching drivers /all:', error);
        res.status(500).json({
            success: false,
            drivers: [],
            count: 0,
            message: 'Unable to load drivers from database'
        });
    }
});

// Register new driver
router.post('/', async (req, res) => {
    try {
        console.log('🚗 Driver registration endpoint called');
        console.log('Request body:', req.body);
        
        const db = require('../../database/config/database');
        
        // Ensure drivers table has all required columns before inserting
        try {
            console.log('🔧 Checking and updating drivers table schema...');
            
            // First, get existing columns
            const columnsResult = await db.execute(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'drivers'
            `);
            
            const existingColumns = columnsResult.map(row => row.COLUMN_NAME);
            console.log('📋 Existing columns:', existingColumns);
            
            // Define required columns with their SQL definitions
            const requiredColumns = {
                'nida_number': 'VARCHAR(100) NULL',
                'date_of_birth': 'DATE NULL',
                'gender': "ENUM('male', 'female', 'other') NULL",
                'residential_address': 'TEXT NULL',
                'region': 'VARCHAR(100) NULL',
                'emergency_contact_name': 'VARCHAR(255) NULL',
                'emergency_contact_number': 'VARCHAR(50) NULL',
                'emergency_relationship': 'VARCHAR(50) NULL',
                'blood_group': 'VARCHAR(10) NULL',
                'license_issue_date': 'DATE NULL',
                'employment_status': "ENUM('full-time', 'part-time', 'contract', 'temporary') NULL",
                'salary': 'DECIMAL(10,2) NULL',
                'payment_method': 'VARCHAR(50) NULL',
                'bank_details': 'TEXT NULL',
                'medical_certificate': 'VARCHAR(50) NULL',
                'medical_expiry_date': 'DATE NULL',
                'skills': 'TEXT NULL',
                'employment_history': 'TEXT NULL',
                'additional_notes': 'TEXT NULL',
                'passport_number': 'VARCHAR(100) NULL'
            };
            
            // Add missing columns
            for (const [columnName, columnDefinition] of Object.entries(requiredColumns)) {
                if (!existingColumns.includes(columnName)) {
                    try {
                        const alterSql = `ALTER TABLE drivers ADD COLUMN ${columnName} ${columnDefinition}`;
                        await db.execute(alterSql);
                        console.log(`✅ Column added: ${columnName}`);
                    } catch (alterError) {
                        console.log(`⚠️ Could not add column ${columnName}:`, alterError.message);
                    }
                } else {
                    console.log(`✅ Column already exists: ${columnName}`);
                }
            }
            
            console.log('✅ Drivers table schema verified/updated');
        } catch (schemaError) {
            console.log('⚠️ Schema update failed:', schemaError.message);
        }
        
        const {
            driverId,
            driverName,
            driverDescription,
            experience,
            licenseType,
            phone,
            email,
            nidaNumber,
            passportNumber,
            dateOfBirth,
            gender,
            address,
            region,
            emergencyContactName,
            emergencyContactNumber,
            emergencyRelationship,
            bloodGroup,
            licenseIssueDate,
            licenseExpiryDate,
            employmentStatus,
            hireDate,
            salary,
            paymentMethod,
            bankDetails,
            medicalCertificate,
            medicalExpiryDate,
            driverStatus,
            assignedVehicle,
            skills,
            employmentHistory,
            additionalNotes
        } = req.body;
        
        console.log('Extracted driver data:', {
            driverId,
            driverName,
            driverDescription,
            experience,
            licenseType,
            phone,
            email,
            nidaNumber,
            dateOfBirth,
            gender,
            address,
            region,
            emergencyContactName,
            emergencyContactNumber,
            emergencyRelationship,
            licenseIssueDate,
            licenseExpiryDate,
            employmentStatus,
            hireDate,
            driverStatus
        });
        
        // Validate required fields
        if (!driverId || !driverName || !licenseType) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: driverId, driverName, licenseType'
            });
        }
        
        // Test database connection first
        console.log('🔍 Testing database connection before driver registration...');
        try {
            const testResult = await db.execute('SELECT 1 as test');
            console.log('✅ Database connection test successful:', testResult);
        } catch (testError) {
            console.error('❌ Database connection test failed:', testError);
            throw new Error('Database connection failed: ' + testError.message);
        }
        
        // Insert driver into database with proper field mapping
        console.log('💾 Executing driver INSERT with ALL field values:', {
            driverId,
            driverName,
            driverDescription,
            experience: parseInt(experience) || 0,
            licenseType,
            phone,
            email,
            nidaNumber,
            dateOfBirth,
            gender,
            address,
            region,
            emergencyContactName,
            emergencyContactNumber,
            emergencyRelationship,
            bloodGroup,
            licenseIssueDate,
            licenseExpiryDate,
            employmentStatus,
            hireDate,
            salary,
            paymentMethod,
            bankDetails,
            medicalCertificate,
            medicalExpiryDate,
            driverStatus,
            assignedVehicle,
            skills,
            employmentHistory,
            additionalNotes,
            passportNumber
        });
        
        const resultResult = await db.execute(`
            INSERT IGNORE INTO drivers (
                driver_id, full_name, description, years_of_experience, 
                license_type, phone_number, email_address, nida_number, 
                date_of_birth, gender, residential_address, region,
                emergency_contact_name, emergency_contact_number, emergency_relationship,
                blood_group, license_issue_date, license_expiry_date, employment_status, 
                hire_date, salary, payment_method, bank_details, medical_certificate,
                medical_expiry_date, driver_status, assigned_vehicle, skills,
                employment_history, additional_notes, passport_number, registration_date,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            driverId || null,
            driverName || null,
            driverDescription || null,
            parseInt(experience) || 0,
            licenseType || null,
            phone || null,
            email || null,
            nidaNumber || null,
            dateOfBirth || null,
            gender || null,
            address || null,
            region || null,
            emergencyContactName || null,
            emergencyContactNumber || null,
            emergencyRelationship || null,
            bloodGroup || null,
            licenseIssueDate || null,
            licenseExpiryDate || null,
            employmentStatus || null,
            hireDate || null,
            salary || null,
            paymentMethod || null,
            bankDetails || null,
            medicalCertificate || null,
            medicalExpiryDate || null,
            driverStatus || 'active',
            assignedVehicle || null,
            skills || null,
            employmentHistory || null,
            additionalNotes || null,
            passportNumber || null,
            new Date().toISOString().split('T')[0], // Registration date (today)
        ]);
        
        console.log('💾 Driver data inserted successfully with all fields');
        
        // Handle different MySQL2 return formats
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        
        console.log('✅ Driver registered successfully:', result.insertId);
        
        notify('Driver Update', 'New driver registered: ' + (req.body.full_name || req.body.name || req.body.fullName || 'Driver') + ' - License: ' + (req.body.license_number || req.body.licenseNumber || 'N/A'), 'info', 'MD', 'Real Estate Manager');
        res.status(201).json({
            success: true,
            message: 'Driver registered successfully',
            driverId: driverId,
            insertId: result.insertId
        });
        
    } catch (error) {
        console.error('❌ Error registering driver:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sql: error.sql
        });
        
        // If database fails, return error response instead of mock success
        res.status(500).json({
            success: false,
            message: 'Failed to register driver',
            error: error.message,
            driverId: req.body.driverId,
            note: 'Database error occurred'
        });
    }
});

// Get specific driver
router.get('/:id', async (req, res) => {
    try {
        const db = require('../../database/config/database');
        const driverId = req.params.id;
        
        const [drivers] = await db.execute(`
            SELECT *
            FROM drivers 
            WHERE driver_id = ?
        `, [driverId]);
        
        if (drivers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        
        res.status(200).json({
            success: true,
            driver: drivers[0]
        });
        
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch driver',
            error: error.message
        });
    }
});

// Update driver
router.put('/:id', async (req, res) => {
    try {
        const db = require('../../database/config/database');
        const driverId = req.params.id;
        
        const {
            driverName,
            driverDescription,
            experience,
            licenseType,
            phone,
            email,
            status
        } = req.body;
        
        const [result] = await db.execute(`
            UPDATE drivers SET 
                full_name = ?, description = ?, years_of_experience = ?, license_type = ?,
                phone_number = ?, email_address = ?, driver_status = ?, updated_at = NOW()
            WHERE driver_id = ?
        `, [
            driverName,
            driverDescription,
            parseInt(experience) || 0,
            licenseType,
            phone,
            email,
            status || 'active',
            driverId
        ]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Driver updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update driver',
            error: error.message
        });
    }
});

// Delete driver
router.delete('/:id', async (req, res) => {
    try {
        const db = require('../../database/config/database');
        const driverId = req.params.id;
        
        const [result] = await db.execute(`
            DELETE FROM drivers WHERE driver_id = ?
        `, [driverId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Driver deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete driver',
            error: error.message
        });
    }
});

// Upload driver photo
router.post('/:id/upload-photo', (req, res, next) => {
    upload.single('profileImage')(req, res, (err) => {
        if (err) {
            console.error('❌ File upload error:', err.message);
            return res.status(400).json({ error: 'File upload failed', details: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const db = require('../../database/config/database');

        const mimeType = file.mimetype;
        let fileBuffer = null;
        try { fileBuffer = fs.readFileSync(file.path); } catch (readErr) { console.warn('⚠️ Could not read uploaded file for BLOB:', readErr.message); }

        const profileImagePath = `/uploads/${file.filename}`;

        // Try to store BLOB & path if possible, otherwise path-only
        try {
            await db.execute(
                'UPDATE drivers SET profile_image = ?, profile_image_data = ?, profile_image_mime = ? WHERE id = ? OR driver_id = ?',
                [profileImagePath, fileBuffer, mimeType, id, id]
            );
        } catch (blobErr) {
            console.warn('⚠️ BLOB update failed for drivers, retrying path-only:', blobErr.message);
            try {
                await db.execute(
                    'UPDATE drivers SET profile_image = ? WHERE id = ? OR driver_id = ?',
                    [profileImagePath, id, id]
                );
            } catch (pathErr) {
                console.warn('⚠️ Path-only update also failed:', pathErr.message);
            }
        }

        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            imageUrl: profileImagePath + '?t=' + Date.now()
        });

    } catch (error) {
        console.error('❌ Error uploading driver photo:', error);
        res.status(500).json({ error: 'Failed to upload driver photo', details: error.message });
    }
});

module.exports = router;
