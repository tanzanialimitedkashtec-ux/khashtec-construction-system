const notify = require('../utils/notify');
const express = require('express');
const router = express.Router();



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
            console.error('Database unavailable');
            return res.status(500).json({
                success: false,
                message: 'Database unavailable'
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
            data: rows,
            message: 'Transport costs retrieved successfully'
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
            return res.status(500).json({
                success: false,
                message: 'Database unavailable'
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
            data: rows,
            message: `${type} costs retrieved successfully`
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
            return res.status(500).json({
                success: false,
                message: 'Database unavailable'
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
            data: rows,
            message: `${category} costs retrieved successfully`
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
            return res.status(500).json({
                success: false,
                message: 'Database unavailable'
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
            data: rows,
            message: 'Vehicle transport costs retrieved successfully'
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
            return res.status(500).json({
                success: false,
                message: 'Database unavailable'
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
            return res.status(500).json({
                success: false,
                message: 'Database unavailable'
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

        notify('Transport Cost', 'New transport cost recorded: ' + (req.body.description || req.body.purpose || 'Transport') + ' - Amount: ' + (req.body.amount || req.body.cost || '0'), 'info', 'MD', 'Real Estate Manager');
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
            return res.status(500).json({
                success: false,
                message: 'Database unavailable'
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
            return res.status(500).json({
                success: false,
                message: 'Database unavailable'
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
