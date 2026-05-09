const express = require('express');
const router = express.Router();

// Mock data for transport costs (fallback when database is unavailable)
const mockTransportCosts = [
    {
        id: 1,
        cost_type: 'maintenance',
        category: 'service_maintenance',
        description: 'Regular service for Toyota Hilux - Oil change and filter replacement',
        vehicle_id: 1,
        vehicle_name: 'Toyota Hilux',
        track_number: 'TK001',
        amount: 250000,
        currency: 'TZS',
        date_incurred: '2026-05-01',
        provider: 'Toyota Tanzania Service Center',
        invoice_number: 'INV-2026-001',
        payment_status: 'paid',
        approved_by: 'Finance Manager',
        notes: 'Quarterly maintenance service completed'
    },
    {
        id: 2,
        cost_type: 'maintenance',
        category: 'repair',
        description: 'Brake pad replacement for Nissan Patrol',
        vehicle_id: 2,
        vehicle_name: 'Nissan Patrol',
        track_number: 'TK002',
        amount: 450000,
        currency: 'TZS',
        date_incurred: '2026-05-03',
        provider: 'Auto Care Garage',
        invoice_number: 'INV-2026-002',
        payment_status: 'pending',
        approved_by: 'Operations Manager',
        notes: 'Emergency brake repair due to wear and tear'
    },
    {
        id: 3,
        cost_type: 'extra',
        category: 'fuel',
        description: 'Additional fuel for site visit - Dar es Salaam to Bagamoyo',
        vehicle_id: 1,
        vehicle_name: 'Toyota Hilux',
        track_number: 'TK001',
        amount: 120000,
        currency: 'TZS',
        date_incurred: '2026-05-05',
        provider: 'BP Station - Kawe',
        invoice_number: 'REC-2026-003',
        payment_status: 'paid',
        approved_by: 'Site Manager',
        notes: 'Extra fuel for unplanned site inspection'
    },
    {
        id: 4,
        cost_type: 'extra',
        category: 'toll_fees',
        description: 'Toll fees for multiple site visits',
        vehicle_id: 2,
        vehicle_name: 'Nissan Patrol',
        track_number: 'TK002',
        amount: 85000,
        currency: 'TZS',
        date_incurred: '2026-05-07',
        provider: 'Tanzania Toll Gates',
        invoice_number: 'TOLL-2026-004',
        payment_status: 'paid',
        approved_by: 'Project Manager',
        notes: 'Monthly toll fees accumulation'
    },
    {
        id: 5,
        cost_type: 'maintenance',
        category: 'tyre_replacement',
        description: 'New set of tyres for Toyota Hilux',
        vehicle_id: 1,
        vehicle_name: 'Toyota Hilux',
        track_number: 'TK001',
        amount: 1200000,
        currency: 'TZS',
        date_incurred: '2026-05-10',
        provider: 'Yamaha Tyre Center',
        invoice_number: 'INV-2026-005',
        payment_status: 'approved',
        approved_by: 'Managing Director',
        notes: 'Complete tyre replacement due to worn out treads'
    }
];

// Database connection helper
async function getDatabase() {
    try {
        if (global.dbConnection) {
            return global.dbConnection;
        }
        
        const mysql = require('mysql2/promise');
        const db = await mysql.createConnection({
            host: process.env.MYSQLHOST || 'localhost',
            user: process.env.MYSQLUSER || 'root',
            password: process.env.MYSQLPASSWORD || '',
            database: process.env.MYSQLDATABASE || 'construction_system',
            port: process.env.MYSQLPORT || 3306
        });
        
        global.dbConnection = db;
        return db;
    } catch (error) {
        console.error('Database connection error:', error);
        return null;
    }
}

// Test endpoint
router.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Transport costs API working',
        data: mockTransportCosts.slice(0, 2)
    });
});

// Get all transport costs
router.get('/', async (req, res) => {
    try {
        const db = await getDatabase();
        
        if (!db) {
            console.log('Database unavailable, returning mock transport costs data');
            return res.status(200).json({
                success: true,
                data: mockTransportCosts,
                message: 'Mock data: Database unavailable'
            });
        }

        const [rows] = await db.execute(`
            SELECT 
                tc.*,
                v.car_name,
                v.track_number,
                v.registration_number,
                u.name as approved_by_name
            FROM transport_costs tc
            LEFT JOIN vehicles v ON tc.vehicle_id = v.id
            LEFT JOIN users u ON tc.approved_by = u.id
            ORDER BY tc.date_incurred DESC
        `);

        res.status(200).json({
            success: true,
            data: rows.length > 0 ? rows : mockTransportCosts,
            message: rows.length > 0 ? 'Transport costs retrieved successfully' : 'No transport costs found, returning mock data'
        });

    } catch (error) {
        console.error('Error fetching transport costs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transport costs',
            error: error.message
        });
    }
});

// Get transport costs by type (maintenance/extra)
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        
        if (!['maintenance', 'extra'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cost type. Must be "maintenance" or "extra"'
            });
        }

        const db = await getDatabase();
        
        if (!db) {
            const filteredData = mockTransportCosts.filter(cost => cost.cost_type === type);
            return res.status(200).json({
                success: true,
                data: filteredData,
                message: 'Mock data: Database unavailable'
            });
        }

        const [rows] = await db.execute(`
            SELECT 
                tc.*,
                v.car_name,
                v.track_number,
                v.registration_number,
                u.name as approved_by_name
            FROM transport_costs tc
            LEFT JOIN vehicles v ON tc.vehicle_id = v.id
            LEFT JOIN users u ON tc.approved_by = u.id
            WHERE tc.cost_type = ?
            ORDER BY tc.date_incurred DESC
        `, [type]);

        res.status(200).json({
            success: true,
            data: rows.length > 0 ? rows : mockTransportCosts.filter(cost => cost.cost_type === type),
            message: rows.length > 0 ? `${type} costs retrieved successfully` : 'No costs found, returning mock data'
        });

    } catch (error) {
        console.error('Error fetching transport costs by type:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transport costs by type',
            error: error.message
        });
    }
});

// Get transport costs by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ['service_maintenance', 'repair', 'fuel', 'toll_fees', 'tyre_replacement', 'insurance', 'other'];
        
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        const db = await getDatabase();
        
        if (!db) {
            const filteredData = mockTransportCosts.filter(cost => cost.category === category);
            return res.status(200).json({
                success: true,
                data: filteredData,
                message: 'Mock data: Database unavailable'
            });
        }

        const [rows] = await db.execute(`
            SELECT 
                tc.*,
                v.car_name,
                v.track_number,
                v.registration_number,
                u.name as approved_by_name
            FROM transport_costs tc
            LEFT JOIN vehicles v ON tc.vehicle_id = v.id
            LEFT JOIN users u ON tc.approved_by = u.id
            WHERE tc.category = ?
            ORDER BY tc.date_incurred DESC
        `, [category]);

        res.status(200).json({
            success: true,
            data: rows.length > 0 ? rows : mockTransportCosts.filter(cost => cost.category === category),
            message: rows.length > 0 ? `${category} costs retrieved successfully` : 'No costs found, returning mock data'
        });

    } catch (error) {
        console.error('Error fetching transport costs by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transport costs by category',
            error: error.message
        });
    }
});

// Get transport costs by vehicle
router.get('/vehicle/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const db = await getDatabase();
        
        if (!db) {
            const filteredData = mockTransportCosts.filter(cost => cost.vehicle_id == vehicleId);
            return res.status(200).json({
                success: true,
                data: filteredData,
                message: 'Mock data: Database unavailable'
            });
        }

        const [rows] = await db.execute(`
            SELECT 
                tc.*,
                v.car_name,
                v.track_number,
                v.registration_number,
                u.name as approved_by_name
            FROM transport_costs tc
            LEFT JOIN vehicles v ON tc.vehicle_id = v.id
            LEFT JOIN users u ON tc.approved_by = u.id
            WHERE tc.vehicle_id = ?
            ORDER BY tc.date_incurred DESC
        `, [vehicleId]);

        res.status(200).json({
            success: true,
            data: rows.length > 0 ? rows : mockTransportCosts.filter(cost => cost.vehicle_id == vehicleId),
            message: rows.length > 0 ? 'Vehicle transport costs retrieved successfully' : 'No costs found, returning mock data'
        });

    } catch (error) {
        console.error('Error fetching transport costs by vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transport costs by vehicle',
            error: error.message
        });
    }
});

// Get transport costs summary
router.get('/summary', async (req, res) => {
    try {
        const db = await getDatabase();
        
        if (!db) {
            const summary = {
                total_costs: mockTransportCosts.reduce((sum, cost) => sum + cost.amount, 0),
                maintenance_costs: mockTransportCosts.filter(c => c.cost_type === 'maintenance').reduce((sum, cost) => sum + cost.amount, 0),
                extra_costs: mockTransportCosts.filter(c => c.cost_type === 'extra').reduce((sum, cost) => sum + cost.amount, 0),
                total_records: mockTransportCosts.length,
                paid_amount: mockTransportCosts.filter(c => c.payment_status === 'paid').reduce((sum, cost) => sum + cost.amount, 0),
                pending_amount: mockTransportCosts.filter(c => c.payment_status === 'pending').reduce((sum, cost) => sum + cost.amount, 0)
            };
            
            return res.status(200).json({
                success: true,
                data: summary,
                message: 'Mock data: Database unavailable'
            });
        }

        const [rows] = await db.execute(`
            SELECT 
                COUNT(*) as total_records,
                SUM(amount) as total_costs,
                SUM(CASE WHEN cost_type = 'maintenance' THEN amount ELSE 0 END) as maintenance_costs,
                SUM(CASE WHEN cost_type = 'extra' THEN amount ELSE 0 END) as extra_costs,
                SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as paid_amount,
                SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending_amount
            FROM transport_costs
        `);

        const summary = {
            total_costs: rows[0].total_costs || 0,
            maintenance_costs: rows[0].maintenance_costs || 0,
            extra_costs: rows[0].extra_costs || 0,
            total_records: rows[0].total_records || 0,
            paid_amount: rows[0].paid_amount || 0,
            pending_amount: rows[0].pending_amount || 0
        };

        res.status(200).json({
            success: true,
            data: summary,
            message: 'Transport costs summary retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching transport costs summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transport costs summary',
            error: error.message
        });
    }
});

// Create new transport cost
router.post('/', async (req, res) => {
    try {
        const {
            cost_type,
            category,
            description,
            vehicle_id,
            amount,
            currency,
            date_incurred,
            provider,
            invoice_number,
            payment_status,
            approved_by,
            notes
        } = req.body;

        // Validation
        if (!cost_type || !category || !description || !vehicle_id || !amount || !date_incurred) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: cost_type, category, description, vehicle_id, amount, date_incurred'
            });
        }

        if (!['maintenance', 'extra'].includes(cost_type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cost type. Must be "maintenance" or "extra"'
            });
        }

        const db = await getDatabase();
        
        if (!db) {
            // Return mock success response
            const newCost = {
                id: mockTransportCosts.length + 1,
                cost_type,
                category,
                description,
                vehicle_id,
                vehicle_name: `Vehicle ${vehicle_id}`,
                track_number: `TK${String(vehicle_id).padStart(3, '0')}`,
                amount: parseFloat(amount),
                currency: currency || 'TZS',
                date_incurred,
                provider: provider || 'Unknown Provider',
                invoice_number: invoice_number || `INV-${Date.now()}`,
                payment_status: payment_status || 'pending',
                approved_by: approved_by || 'System',
                notes: notes || ''
            };

            mockTransportCosts.push(newCost);

            return res.status(201).json({
                success: true,
                data: newCost,
                message: 'Transport cost created successfully (mock data)'
            });
        }

        const [result] = await db.execute(`
            INSERT INTO transport_costs (
                cost_type, category, description, vehicle_id, amount, currency,
                date_incurred, provider, invoice_number, payment_status,
                approved_by, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            cost_type, category, description, vehicle_id, parseFloat(amount), currency || 'TZS',
            date_incurred, provider, invoice_number, payment_status || 'pending',
            approved_by, notes
        ]);

        const [newRow] = await db.execute(`
            SELECT 
                tc.*,
                v.car_name,
                v.track_number,
                v.registration_number,
                u.name as approved_by_name
            FROM transport_costs tc
            LEFT JOIN vehicles v ON tc.vehicle_id = v.id
            LEFT JOIN users u ON tc.approved_by = u.id
            WHERE tc.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            data: newRow[0],
            message: 'Transport cost created successfully'
        });

    } catch (error) {
        console.error('Error creating transport cost:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating transport cost',
            error: error.message
        });
    }
});

// Update transport cost
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = req.body;

        const db = await getDatabase();
        
        if (!db) {
            const costIndex = mockTransportCosts.findIndex(cost => cost.id == id);
            if (costIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Transport cost not found'
                });
            }

            Object.assign(mockTransportCosts[costIndex], updateFields);
            return res.status(200).json({
                success: true,
                data: mockTransportCosts[costIndex],
                message: 'Transport cost updated successfully (mock data)'
            });
        }

        const [result] = await db.execute(`
            UPDATE transport_costs 
            SET ${Object.keys(updateFields).map(key => `${key} = ?`).join(', ')}
            WHERE id = ?
        `, [...Object.values(updateFields), id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transport cost not found'
            });
        }

        const [updatedRow] = await db.execute(`
            SELECT 
                tc.*,
                v.car_name,
                v.track_number,
                v.registration_number,
                u.name as approved_by_name
            FROM transport_costs tc
            LEFT JOIN vehicles v ON tc.vehicle_id = v.id
            LEFT JOIN users u ON tc.approved_by = u.id
            WHERE tc.id = ?
        `, [id]);

        res.status(200).json({
            success: true,
            data: updatedRow[0],
            message: 'Transport cost updated successfully'
        });

    } catch (error) {
        console.error('Error updating transport cost:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating transport cost',
            error: error.message
        });
    }
});

// Delete transport cost
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const db = await getDatabase();
        
        if (!db) {
            const costIndex = mockTransportCosts.findIndex(cost => cost.id == id);
            if (costIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Transport cost not found'
                });
            }

            mockTransportCosts.splice(costIndex, 1);
            return res.status(200).json({
                success: true,
                message: 'Transport cost deleted successfully (mock data)'
            });
        }

        const [result] = await db.execute('DELETE FROM transport_costs WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transport cost not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Transport cost deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting transport cost:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting transport cost',
            error: error.message
        });
    }
});

module.exports = router;
