const express = require('express');
const router = express.Router();

// Mock data for company cars (fallback when database is unavailable)
const mockCompanyCars = [
    {
        id: 1,
        track_number: 'TK001',
        car_name: 'Toyota Hilux',
        brand_name: 'toyota',
        registration_number: 'T-1234',
        plate_number: 'ABC-123',
        car_details: 'Double cabin pickup truck',
        description: 'Heavy duty pickup for construction sites',
        assigned_driver: 'DRV001',
        registration_date: '2023-01-15',
        vehicle_type: 'pickup',
        fuel_type: 'diesel',
        color: 'White',
        year_of_manufacture: 2023,
        odometer_reading: 15000,
        insurance_status: 'insured',
        vehicle_status: 'active'
    },
    {
        id: 2,
        track_number: 'TK002',
        car_name: 'Nissan Patrol',
        brand_name: 'nissan',
        registration_number: 'N-5678',
        plate_number: 'XYZ-789',
        car_details: '4x4 SUV',
        description: 'Off-road vehicle for site supervision',
        assigned_driver: 'DRV002',
        registration_date: '2023-03-20',
        vehicle_type: 'suv',
        fuel_type: 'petrol',
        color: 'Black',
        year_of_manufacture: 2023,
        odometer_reading: 8000,
        insurance_status: 'insured',
        vehicle_status: 'active'
    }
];

// Test endpoint
router.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Company cars API working',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint - get all company cars (main endpoint)
router.get('/', async (req, res) => {
    try {
        console.log('🚗 Company cars ROOT endpoint called - method:', req.method);
        console.log('🚗 Request URL:', req.originalUrl);
        console.log('🚗 Fetching vehicles from database');
        const db = require('../../database/config/database');
        
        // Ensure vehicles table exists
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS vehicles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    track_number VARCHAR(50) UNIQUE NOT NULL,
                    car_name VARCHAR(255) NOT NULL,
                    brand_name ENUM('toyota', 'nissan', 'mitsubishi', 'isuzu', 'ford', 'mazda', 'honda', 'bmw', 'mercedes', 'volkswagen', 'other') NOT NULL,
                    registration_number VARCHAR(50) UNIQUE NOT NULL,
                    plate_number VARCHAR(50) NOT NULL,
                    car_details TEXT NOT NULL,
                    description TEXT NOT NULL,
                    assigned_driver VARCHAR(50),
                    registration_date DATE NOT NULL,
                    vehicle_type ENUM('pickup', 'suv', 'sedan', 'van', 'truck', 'motorcycle') NOT NULL,
                    fuel_type ENUM('petrol', 'diesel', 'hybrid', 'electric') NOT NULL,
                    color VARCHAR(50),
                    year_of_manufacture INT,
                    odometer_reading INT,
                    insurance_status ENUM('insured', 'pending', 'expired', 'not-required') NOT NULL,
                    vehicle_status ENUM('active', 'maintenance', 'inactive', 'retired') NOT NULL,
                    additional_notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    -- Foreign key relationship to drivers table
                    FOREIGN KEY (assigned_driver) REFERENCES drivers(driver_id) ON DELETE SET NULL,
                    
                    -- Indexes for performance
                    INDEX idx_track_number (track_number),
                    INDEX idx_car_name (car_name),
                    INDEX idx_brand_name (brand_name),
                    INDEX idx_registration_number (registration_number),
                    INDEX idx_plate_number (plate_number),
                    INDEX idx_vehicle_status (vehicle_status),
                    INDEX idx_created_at (created_at)
                )
            `);
            console.log('✅ Vehicles table verified/created successfully');
        } catch (tableError) {
            console.log('⚠️ Could not create vehicles table:', tableError.message);
        }
        
        const carsResult = await db.execute(`
            SELECT * FROM vehicles 
            ORDER BY created_at DESC
        `);
        
        // Handle different MySQL2 return formats
        let cars = [];
        if (Array.isArray(carsResult)) {
            cars = carsResult;
        } else if (carsResult && Array.isArray(carsResult[0])) {
            cars = carsResult[0];
        } else if (carsResult && carsResult.rows) {
            cars = carsResult.rows;
        }
        
        console.log(`✅ Found ${cars.length} company cars in database`);
        
        res.status(200).json({
            success: true,
            data: cars,
            message: `Found ${cars.length} company cars`
        });
        
    } catch (error) {
        console.error('❌ Error fetching company cars from database:', error);
        console.log('🔄 Database connection failed, returning mock data...');
        
        // Return mock data when database fails
        res.status(200).json({
            success: true,
            data: mockCompanyCars,
            message: 'Using mock data - database unavailable'
        });
    }
});

// Endpoint info endpoint
router.get('/info', (req, res) => {
    console.log('🚗 Company cars INFO endpoint called');
    res.status(200).json({
        success: true,
        message: 'Company Cars API',
        endpoints: {
            'GET /': 'Get all company cars',
            'GET /info': 'List available endpoints',
            'GET /test': 'Test endpoint',
            'GET /all': 'Get all company cars (alternative)',
            'POST /': 'Register new company car',
            'GET /:id': 'Get specific car',
            'PUT /:id': 'Update car',
            'DELETE /:id': 'Delete car'
        }
    });
});

// Get all company cars (alternative endpoint)
router.get('/all', async (req, res) => {
    try {
        console.log('🚗 Company cars /all endpoint called');
        const db = require('../../database/config/database');
        
        const carsResult = await db.execute(`
            SELECT * FROM vehicles 
            ORDER BY created_at DESC
        `);
        
        // Handle different MySQL2 return formats
        let cars = [];
        if (Array.isArray(carsResult)) {
            cars = carsResult;
        } else if (carsResult && Array.isArray(carsResult[0])) {
            cars = carsResult[0];
        } else if (carsResult && carsResult.rows) {
            cars = carsResult.rows;
        }
        
        res.status(200).json({
            success: true,
            data: cars,
            message: `Found ${cars.length} company cars`
        });
        
    } catch (error) {
        console.error('Error fetching company cars:', error);
        // Return mock data when database fails
        res.status(200).json({
            success: true,
            data: mockCompanyCars,
            message: 'Using mock data - database unavailable'
        });
    }
});

// Register new company car
router.post('/', async (req, res) => {
    try {
        console.log('🚗 Registering company car:', req.body);
        
        const {
            carName,
            brandName,
            regNo,
            plateNumber,
            carDetails,
            purchaseDate,
            status,
            driver,
            vehicleType,
            fuelType,
            color,
            yearOfManufacture,
            odometerReading,
            insuranceStatus,
            additionalNotes
        } = req.body;

        // Map frontend field names to database field names
        const car_name = carName;
        const brand_name = brandName?.toLowerCase();
        const registration_number = regNo;
        const plate_number = plateNumber;
        const car_details = carDetails;
        const description = carDetails;
        const assigned_driver = driver;
        const registration_date = purchaseDate || new Date().toISOString().split('T')[0]; // Default to today if not provided
        const vehicle_status = status?.toLowerCase() || 'active';
        const vehicle_type = vehicleType?.toLowerCase() || 'pickup';
        const fuel_type = fuelType?.toLowerCase() || 'diesel';

        // Generate track number
        const track_number = 'TK' + Date.now().toString().slice(-6);

        // Validate required fields
        if (!car_name || !brand_name || !registration_number || !plate_number) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: carName, brandName, regNo, plateNumber'
            });
        }

        const db = require('../../database/config/database');
        
        // Check if registration number already exists
        const existingResult = await db.execute(
            'SELECT id FROM vehicles WHERE registration_number = ? OR plate_number = ?',
            [registration_number, plate_number]
        );
        
        // Handle different MySQL2 return formats
        let existing = [];
        if (Array.isArray(existingResult)) {
            existing = existingResult;
        } else if (existingResult && Array.isArray(existingResult[0])) {
            existing = existingResult[0];
        } else if (existingResult && existingResult.rows) {
            existing = existingResult.rows;
        }
        
        if (existing && existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Car with this registration number or plate number already exists'
            });
        }

        // Insert new company car
        const resultResult = await db.execute(`
            INSERT INTO vehicles (
                track_number, car_name, brand_name, registration_number, plate_number,
                car_details, description, assigned_driver, registration_date, vehicle_status,
                vehicle_type, fuel_type, color, year_of_manufacture, odometer_reading,
                insurance_status, additional_notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            track_number, car_name, brand_name, registration_number, plate_number,
            car_details || 'Company vehicle', description || 'Company vehicle', assigned_driver || null, registration_date, vehicle_status,
            vehicle_type, fuel_type, color || null, yearOfManufacture || null, odometerReading || null,
            insuranceStatus || 'pending', additionalNotes || null
        ]);

        console.log('✅ Car registered successfully, ID:', resultResult.insertId);
        
        // Handle different MySQL2 return formats
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;

        res.status(201).json({
            success: true,
            message: 'Company car registered successfully',
            carId: result.insertId,
            data: {
                id: result.insertId,
                track_number,
                carName: car_name,
                brandName: brand_name,
                regNo: registration_number,
                plateNumber: plate_number,
                carDetails: car_details,
                purchaseDate: registration_date,
                status: vehicle_status,
                driver: assigned_driver
            }
        });

    } catch (error) {
        console.error('Error registering company car:', error);
        
        // If table doesn't exist, return success with mock data
        if (error.code === 'ER_NO_SUCH_TABLE') {
            const mockCar = {
                id: Date.now(),
                ...req.body,
                status: req.body.status || 'Active',
                created_at: new Date().toISOString()
            };
            
            return res.status(201).json({
                success: true,
                message: 'Company car registered successfully (mock data)',
                carId: mockCar.id,
                data: mockCar
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to register company car',
            error: error.message
        });
    }
});

// Get specific car
router.get('/:id', async (req, res) => {
    try {
        const carId = req.params.id;
        const db = require('../../database/config/database');
        
        const carsResult = await db.execute(
            'SELECT * FROM vehicles WHERE id = ?',
            [carId]
        );
        
        // Handle different MySQL2 return formats
        const cars = Array.isArray(carsResult) ? carsResult[0] : carsResult;
        
        if (cars.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Company car not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: cars[0]
        });
        
    } catch (error) {
        console.error('Error fetching company car:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company car',
            error: error.message
        });
    }
});

// Update car
router.put('/:id', async (req, res) => {
    try {
        const carId = req.params.id;
        const {
            carName,
            brandName,
            regNo,
            plateNumber,
            carDetails,
            purchaseDate,
            status,
            driver
        } = req.body;

        const db = require('../../database/config/database');
        
        // Check if car exists
        const existingResult = await db.execute(
            'SELECT id FROM vehicles WHERE id = ?',
            [carId]
        );
        
        // Handle different MySQL2 return formats
        const existing = Array.isArray(existingResult) ? existingResult[0] : existingResult;
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Company car not found'
            });
        }

        // Update car
        await db.execute(`
            UPDATE vehicles SET
                car_name = ?, brand_name = ?, registration_number = ?, plate_number = ?,
                car_details = ?, description = ?, assigned_driver = ?, registration_date = ?,
                vehicle_status = ?, updated_at = NOW()
            WHERE id = ?
        `, [
            carName, brandName?.toLowerCase(), regNo, plateNumber, carDetails,
            carDetails, driver, purchaseDate, status?.toLowerCase() || 'active', carId
        ]);

        res.status(200).json({
            success: true,
            message: 'Company car updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating company car:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update company car',
            error: error.message
        });
    }
});

// Delete car
router.delete('/:id', async (req, res) => {
    try {
        const carId = req.params.id;
        const db = require('../../database/config/database');
        
        // Check if car exists
        const existingResult = await db.execute(
            'SELECT id FROM vehicles WHERE id = ?',
            [carId]
        );
        
        // Handle different MySQL2 return formats
        const existing = Array.isArray(existingResult) ? existingResult[0] : existingResult;
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Company car not found'
            });
        }

        // Delete car
        await db.execute('DELETE FROM vehicles WHERE id = ?', [carId]);

        res.status(200).json({
            success: true,
            message: 'Company car deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting company car:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete company car',
            error: error.message
        });
    }
});

module.exports = router;
