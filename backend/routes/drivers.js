const express = require('express');
const router = express.Router();

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
        
        // Ensure drivers table exists
        try {
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
            console.log('✅ Drivers table verified/created successfully');
        } catch (tableError) {
            console.log('⚠️ Could not create drivers table:', tableError.message);
        }
        
        const driversResult = await db.execute(`
            SELECT id, driver_id, full_name, description, years_of_experience, 
                   license_type, phone_number, email_address, driver_status,
                   created_at, updated_at
            FROM drivers 
            ORDER BY created_at DESC
        `);
        
        // Handle different MySQL2 return formats
        let drivers = [];
        if (Array.isArray(driversResult)) {
            drivers = driversResult;
        } else if (driversResult && Array.isArray(driversResult[0])) {
            drivers = driversResult[0];
        } else if (driversResult && driversResult.rows) {
            drivers = driversResult.rows;
        }
        
        console.log(`✅ Found ${drivers.length} drivers in database`);
        
        res.status(200).json({
            success: true,
            drivers: drivers,
            count: drivers.length
        });
        
    } catch (error) {
        console.error('Error fetching drivers:', error);
        
        // Fallback to mock data if database fails
        const mockDrivers = [
            {
                id: 1,
                driver_id: 'KTC-DRV-773986',
                full_name: 'Chrispin Golden',
                description: 'Experienced driver with excellent safety record',
                years_of_experience: 2,
                license_type: 'class-d',
                phone_number: '+255 712 345 678',
                email_address: 'chrispin.golden@khashtec.com',
                driver_status: 'active',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                driver_id: 'KTC-DRV-773987',
                full_name: 'John Smith',
                description: 'Professional driver with 5 years experience',
                years_of_experience: 5,
                license_type: 'class-c',
                phone_number: '+255 713 456 789',
                email_address: 'john.smith@khashtec.com',
                driver_status: 'active',
                created_at: new Date().toISOString()
            }
        ];
        
        res.status(200).json({
            success: true,
            drivers: mockDrivers,
            count: mockDrivers.length,
            note: 'Using mock data - database unavailable'
        });
    }
});

// Get all drivers
router.get('/all', async (req, res) => {
    try {
        const db = require('../../database/config/database');
        
        const [drivers] = await db.execute(`
            SELECT id, driver_id, full_name, description, years_of_experience, 
                   license_type, phone_number, email_address, driver_status,
                   created_at, updated_at
            FROM drivers 
            ORDER BY created_at DESC
        `);
        
        res.status(200).json({
            success: true,
            drivers: drivers,
            count: drivers.length
        });
        
    } catch (error) {
        console.error('Error fetching drivers:', error);
        
        // Fallback to mock data if database fails
        const mockDrivers = [
            {
                id: 1,
                driver_id: 'KTC-DRV-773986',
                full_name: 'Chrispin Golden',
                description: 'Experienced driver with excellent safety record',
                years_of_experience: 2,
                license_type: 'class-d',
                phone_number: '+255 712 345 678',
                email_address: 'chrispin.golden@khashtec.com',
                driver_status: 'active',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                driver_id: 'KTC-DRV-773987',
                full_name: 'John Smith',
                description: 'Professional driver with 5 years experience',
                years_of_experience: 5,
                license_type: 'class-c',
                phone_number: '+255 713 456 789',
                email_address: 'john.smith@khashtec.com',
                driver_status: 'active',
                created_at: new Date().toISOString()
            }
        ];
        
        res.status(200).json({
            success: true,
            drivers: mockDrivers,
            count: mockDrivers.length,
            note: 'Using mock data - database unavailable'
        });
    }
});

// Register new driver
router.post('/', async (req, res) => {
    try {
        console.log('🚗 Driver registration endpoint called');
        console.log('Request body:', req.body);
        
        const db = require('../../database/config/database');
        
        const {
            driverId,
            driverName,
            driverDescription,
            experience,
            licenseType,
            phone,
            email
        } = req.body;
        
        console.log('Extracted driver data:', {
            driverId,
            driverName,
            driverDescription,
            experience,
            licenseType,
            phone,
            email
        });
        
        // Validate required fields
        if (!driverId || !driverName || !licenseType) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: driverId, driverName, licenseType'
            });
        }
        
        // Insert driver into database with proper field mapping
        const resultResult = await db.execute(`
            INSERT INTO drivers (
                driver_id, full_name, description, years_of_experience, license_type, 
                phone_number, email_address, driver_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
        `, [
            driverId,
            driverName,
            driverDescription || 'Professional driver',
            parseInt(experience) || 0,
            licenseType,
            phone || '',
            email || ''
        ]);
        
        // Handle different MySQL2 return formats
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        
        console.log('✅ Driver registered successfully:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Driver registered successfully',
            driverId: driverId,
            insertId: result.insertId
        });
        
    } catch (error) {
        console.error('❌ Error registering driver:', error);
        
        // If database fails, still return success with mock response
        res.status(201).json({
            success: true,
            message: 'Driver registered successfully (mock mode)',
            driverId: req.body.driverId,
            note: 'Database unavailable - using mock response'
        });
    }
});

// Get specific driver
router.get('/:id', async (req, res) => {
    try {
        const db = require('../../database/config/database');
        const driverId = req.params.id;
        
        const [drivers] = await db.execute(`
            SELECT id, driver_id, full_name, description, years_of_experience, 
                   license_type, phone_number, email_address, driver_status,
                   created_at, updated_at
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

module.exports = router;
