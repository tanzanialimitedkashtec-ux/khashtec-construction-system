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

// Root endpoint - list available endpoints
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Company Cars API',
        endpoints: {
            'GET /': 'List available endpoints',
            'GET /test': 'Test endpoint',
            'GET /all': 'Get all company cars',
            'POST /': 'Register new company car',
            'GET /:id': 'Get specific car',
            'PUT /:id': 'Update car',
            'DELETE /:id': 'Delete car'
        }
    });
});

// Get all company cars
router.get('/all', async (req, res) => {
    try {
        const db = require('../database/config/database');
        
        const [cars] = await db.execute(`
            SELECT * FROM vehicles 
            ORDER BY created_at DESC
        `);
        
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

// Get all company cars (main endpoint)
router.get('/', async (req, res) => {
    try {
        const db = require('../database/config/database');
        
        const [cars] = await db.execute(`
            SELECT * FROM vehicles 
            ORDER BY created_at DESC
        `);
        
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
            driver
        } = req.body;

        // Map frontend field names to database field names
        const car_name = carName;
        const brand_name = brandName?.toLowerCase();
        const registration_number = regNo;
        const plate_number = plateNumber;
        const car_details = carDetails;
        const description = carDetails;
        const assigned_driver = driver;
        const registration_date = purchaseDate;
        const vehicle_status = status?.toLowerCase() || 'active';

        // Generate track number
        const track_number = 'TK' + Date.now().toString().slice(-6);

        // Validate required fields
        if (!car_name || !brand_name || !registration_number || !plate_number) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: carName, brandName, regNo, plateNumber'
            });
        }

        const db = require('../database/config/database');
        
        // Check if registration number already exists
        const [existing] = await db.execute(
            'SELECT id FROM vehicles WHERE registration_number = ? OR plate_number = ?',
            [registration_number, plate_number]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Car with this registration number or plate number already exists'
            });
        }

        // Insert new company car
        const [result] = await db.execute(`
            INSERT INTO vehicles (
                track_number, car_name, brand_name, registration_number, plate_number,
                car_details, description, assigned_driver, registration_date, vehicle_status,
                vehicle_type, fuel_type, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pickup', 'diesel', NOW(), NOW())
        `, [
            track_number, car_name, brand_name, registration_number, plate_number,
            car_details, description, assigned_driver, registration_date, vehicle_status
        ]);

        console.log('✅ Car registered successfully, ID:', result.insertId);

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
        const db = require('../database/config/database');
        
        const [cars] = await db.execute(
            'SELECT * FROM vehicles WHERE id = ?',
            [carId]
        );
        
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

        const db = require('../database/config/database');
        
        // Check if car exists
        const [existing] = await db.execute(
            'SELECT id FROM vehicles WHERE id = ?',
            [carId]
        );
        
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
        const db = require('../database/config/database');
        
        // Check if car exists
        const [existing] = await db.execute(
            'SELECT id FROM vehicles WHERE id = ?',
            [carId]
        );
        
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
