const express = require('express');
const router = express.Router();

var notify = require('../utils/notify');
console.log('Materials route file is being loaded...');

let db;
try {
    db = require('../../database/config/database');
    console.log('✅ Materials database connection loaded successfully');
} catch (error) {
    console.error('⚠️ Materials database not available, will use mock data:', error.message);
    db = null;
}



// ===== HELPER FUNCTIONS =====

function generateTrackNumber(type) {
    const prefix = type === 'in' ? 'MIN' : 'MOUT';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${prefix}-${year}${month}${day}-${hours}${minutes}${seconds}-${ms}`;
}

function updateMaterialStock(materialId, quantity, type) {
    if (!db) return;
    const sql = `UPDATE materials_inventory SET current_stock = current_stock ${type === 'in' ? '+' : '-'} ? WHERE id = ?`;
    db.execute(sql, [quantity, materialId]).catch(err => console.error('Error updating stock:', err));
}

// ===== ROUTES =====

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ message: '✅ Materials API is working!', timestamp: new Date().toISOString() });
});

// Get all materials inventory
router.get('/inventory', async (req, res) => {
    try {
        if (!db) throw new Error('Database not available');
        const rows = await db.execute('SELECT * FROM materials_inventory ORDER BY material_name ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching inventory:', error.message);
        res.status(500).json({ success: false, error: 'Database error', details: error.message || error });
    }
});

// Get single material by ID
router.get('/inventory/:id', async (req, res) => {
    try {
        if (!db) throw new Error('Database not available');
        const rows = await db.execute('SELECT * FROM materials_inventory WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Material not found' });
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching material:', error.message);
        res.status(500).json({ success: false, error: 'Database error', details: error.message || error });
    }
});

// Create new material
router.post('/inventory', async (req, res) => {
    try {
        const { material_code, material_name, material_category, description, unit_of_measure, min_stock_level, max_stock_level, reorder_point, storage_location, supplier_name, supplier_contact, unit_cost } = req.body;
        if (!material_name) return res.status(400).json({ success: false, message: 'Material name is required' });

        const code = material_code || `MAT-${Date.now()}`;

        if (!db) throw new Error('Database not available');

        const [result] = await db.execute(
            `INSERT INTO materials_inventory (material_code, material_name, material_category, description, unit_of_measure, min_stock_level, max_stock_level, reorder_point, storage_location, supplier_name, supplier_contact, unit_cost)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [code, material_name, material_category || 'Other', description || '', unit_of_measure || 'Piece', min_stock_level || 10, max_stock_level || 1000, reorder_point || 50, storage_location || '', supplier_name || '', supplier_contact || '', unit_cost || 0]
        );

        notify('New Material Added', material_name + ' (' + code + ') added to inventory', 'info');
        res.status(201).json({ success: true, message: 'Material created successfully', data: { id: result.insertId, material_code: code, material_name } });
    } catch (error) {
        console.error('Error creating material:', error.message);
        res.status(500).json({ success: false, error: 'Database error', details: error.message || error });
    }
});

// Get all materials in records
router.get('/in', async (req, res) => {
    try {
        if (!db) throw new Error('Database not available');
        const rows = await db.execute(`
            SELECT mi.*, inv.material_name, inv.material_code
            FROM materials_in mi
            JOIN materials_inventory inv ON mi.material_id = inv.id
            ORDER BY mi.receipt_date DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching materials in:', error.message);
        res.status(500).json({ success: false, error: 'Database error', details: error.message || error });
    }
});

// Create materials in record
router.post('/in', async (req, res) => {
    try {
        var { material_id, material_name, material_category, description, track_number, receipt_date, quantity_received, unit_of_measure, unit_price, transport_cost, transport_issue, supplier_name, supplier_contact, invoice_number, purchase_order_number, delivery_note_number, delivery_condition, quality_check_status, quality_remarks, received_by, received_by_role, project_id, project_name, warehouse_location, notes } = req.body;

        if (!quantity_received || !supplier_name || !received_by) {
            return res.status(400).json({ success: false, message: 'Quantity, supplier name, and received by are required' });
        }
        if (!material_id && !material_name) {
            return res.status(400).json({ success: false, message: 'Material name is required' });
        }

        if (!db) throw new Error('Database not available');

        // If material_name is provided (manual input), find or create in materials_inventory
        if (!material_id && material_name) {
            // Check if material already exists by name (case-insensitive)
            var existingRows = await db.execute(
                'SELECT id FROM materials_inventory WHERE LOWER(material_name) = LOWER(?)',
                [material_name.trim()]
            );
            var existing = Array.isArray(existingRows) && Array.isArray(existingRows[0]) ? existingRows[0] : (Array.isArray(existingRows) ? existingRows : []);

            if (existing.length > 0) {
                material_id = existing[0].id;
            } else {
                // Auto-create new material in inventory
                var code = 'MAT-' + Date.now();
                var createResult = await db.execute(
                    `INSERT INTO materials_inventory (material_code, material_name, material_category, description, unit_of_measure, current_stock, min_stock_level, max_stock_level, reorder_point, supplier_name, supplier_contact, unit_cost)
                     VALUES (?, ?, ?, ?, ?, 0, 10, 10000, 50, ?, ?, ?)`,
                    [code, material_name.trim(), material_category || 'Other', description || '', unit_of_measure || 'Piece', supplier_name || '', supplier_contact || '', unit_price || 0]
                );
                material_id = createResult.insertId || (createResult[0] && createResult[0].insertId) || null;
                console.log('✅ Auto-created material in inventory: ' + material_name + ' (id: ' + material_id + ')');
            }
        }

        const track = track_number || generateTrackNumber('in');
        const totalCost = (quantity_received * (unit_price || 0));
        const date = receipt_date || new Date().toISOString().split('T')[0];

        const result = await db.execute(
            `INSERT INTO materials_in (material_id, track_number, receipt_date, quantity_received, unit_of_measure, unit_price, total_cost, transport_cost, transport_issue, supplier_name, supplier_contact, invoice_number, purchase_order_number, delivery_note_number, delivery_condition, quality_check_status, quality_remarks, received_by, received_by_role, project_id, project_name, warehouse_location, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [material_id, track, date, quantity_received, unit_of_measure || 'Piece', unit_price || 0, totalCost, transport_cost || 0, transport_issue || '', supplier_name, supplier_contact || '', invoice_number || '', purchase_order_number || '', delivery_note_number || '', delivery_condition || 'Good', quality_check_status || 'Pending', quality_remarks || '', received_by, received_by_role || '', project_id || null, project_name || '', warehouse_location || '', notes || '']
        );

        updateMaterialStock(material_id, quantity_received, 'in');

        notify('Materials Received', 'Track ' + track + ': ' + quantity_received + ' ' + (unit_of_measure || 'units') + ' of ' + (material_name || 'material') + ' received from ' + supplier_name, 'success');
        res.status(201).json({ success: true, message: 'Material received recorded successfully', data: { id: result.insertId || (result[0] && result[0].insertId), track_number: track } });
    } catch (error) {
        console.error('Error creating materials in:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Failed to save record to database' });
    }
});

// Get all materials out records
router.get('/out', async (req, res) => {
    try {
        if (!db) throw new Error('Database not available');
        const rows = await db.execute(`
            SELECT mo.*, inv.material_name, inv.material_code
            FROM materials_out mo
            JOIN materials_inventory inv ON mo.material_id = inv.id
            ORDER BY mo.issue_date DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching materials out:', error.message);
        res.status(500).json({ success: false, error: 'Database error', details: error.message || error });
    }
});

// Create materials out record
router.post('/out', async (req, res) => {
    try {
        const { material_id, track_number, issue_date, quantity_out, unit_of_measure, unit_price, issue_type, issued_to, issued_to_role, issued_to_department, project_id, project_name, destination, purpose, authorized_by, authorized_by_role, delivery_method, delivery_receipt_number, condition_on_issue, return_expected, expected_return_date, notes } = req.body;

        if (!material_id || !quantity_out || !issued_to || !authorized_by) {
            return res.status(400).json({ success: false, message: 'Material ID, quantity, issued to, and authorized by are required' });
        }

        const track = track_number || generateTrackNumber('out');
        const totalValue = (quantity_out * (unit_price || 0));
        const date = issue_date || new Date().toISOString().split('T')[0];

        if (!db) throw new Error('Database not available');

        const result = await db.execute(
            `INSERT INTO materials_out (material_id, track_number, issue_date, quantity_out, unit_of_measure, unit_price, total_value, issue_type, issued_to, issued_to_role, issued_to_department, project_id, project_name, destination, purpose, authorized_by, authorized_by_role, delivery_method, delivery_receipt_number, condition_on_issue, return_expected, expected_return_date, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [material_id, track, date, quantity_out, unit_of_measure || 'Piece', unit_price || 0, totalValue, issue_type || 'Project Use', issued_to, issued_to_role || '', issued_to_department || 'Project Management', project_id || null, project_name || '', destination || '', purpose || '', authorized_by, authorized_by_role || '', delivery_method || 'Company Vehicle', delivery_receipt_number || '', condition_on_issue || 'New', return_expected || false, expected_return_date || null, notes || '']
        );

        updateMaterialStock(material_id, quantity_out, 'out');

        notify('Materials Issued', 'Track ' + track + ': ' + quantity_out + ' ' + (unit_of_measure || 'units') + ' issued to ' + issued_to, 'info');
        res.status(201).json({ success: true, message: 'Material out recorded successfully', data: { id: result.insertId, track_number: track } });
    } catch (error) {
        console.error('Error creating materials out:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Failed to save record to database' });
    }
});

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
    try {
        if (!db) throw new Error('Database not available');

        const [[inventoryCount]] = await db.execute('SELECT COUNT(*) as count FROM materials_inventory');
        const [[totalStock]] = await db.execute('SELECT SUM(current_stock * unit_cost) as value FROM materials_inventory');
        const [[inCount]] = await db.execute('SELECT COUNT(*) as count FROM materials_in');
        const [[outCount]] = await db.execute('SELECT COUNT(*) as count FROM materials_out');
        const [[lowStock]] = await db.execute('SELECT COUNT(*) as count FROM materials_inventory WHERE current_stock <= reorder_point');
        const [[recentIn]] = await db.execute('SELECT SUM(total_cost) as total FROM materials_in WHERE receipt_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
        const [[recentOut]] = await db.execute('SELECT SUM(total_value) as total FROM materials_out WHERE issue_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)');

        res.json({
            success: true,
            data: {
                totalMaterials: inventoryCount.count,
                totalStockValue: totalStock.value || 0,
                totalInTransactions: inCount.count,
                totalOutTransactions: outCount.count,
                lowStockItems: lowStock.count,
                recentInValue: recentIn.total || 0,
                recentOutValue: recentOut.total || 0
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error.message);
        res.status(500).json({ success: false, error: 'Database error', details: error.message || error });
    }
});

// Get stock alerts
router.get('/alerts', async (req, res) => {
    try {
        if (!db) throw new Error('Database not available');
        const rows = await db.execute('SELECT * FROM materials_inventory WHERE current_stock <= reorder_point OR current_stock = 0 ORDER BY material_name ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching alerts:', error.message);
        res.status(500).json({ success: false, error: 'Database error', details: error.message || error });
    }
});

// Get materials by category
router.get('/by-category/:category', async (req, res) => {
    try {
        if (!db) throw new Error('Database not available');
        const rows = await db.execute('SELECT * FROM materials_inventory WHERE material_category = ?', [req.params.category]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching by category:', error.message);
        res.status(500).json({ success: false, error: 'Database error', details: error.message || error });
    }
});

// Search materials
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, data: [] });

        if (!db) throw new Error('Database not available');
        const rows = await db.execute(
            'SELECT * FROM materials_inventory WHERE material_name LIKE ? OR material_code LIKE ? OR material_category LIKE ?',
            [`%${q}%`, `%${q}%`, `%${q}%`]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error searching materials:', error.message);
        res.status(500).json({ success: false, error: 'Database error', details: error.message || error });
    }
});

module.exports = router;
console.log('✅ Materials routes module exported successfully');
