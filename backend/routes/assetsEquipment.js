const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Utility to always return an array
function asArray(rows) {
  if (!rows) return [];
  if (Array.isArray(rows)) return rows;
  return [rows];
}

// GET /api/assets-equipment - list all assets and equipment
router.get('/', async (req, res) => {
  try {
    const rows = await db.execute(`
      SELECT ae.*, e.employee_id, ed.full_name
      FROM assets_equipment ae
      LEFT JOIN employees e ON ae.assigned_to = e.id
      LEFT JOIN employee_details ed ON e.id = ed.employee_id
      ORDER BY ae.created_at DESC
    `);
    return res.json(asArray(rows));
  } catch (error) {
    console.error('Error fetching assets & equipment:', error);
    // Always return JSON
    return res.status(500).json({
      error: 'Failed to fetch assets & equipment',
      details: error.message
    });
  }
});

// GET /api/assets-equipment/:id - single asset
router.get('/:id', async (req, res) => {
  try {
    const rows = await db.execute(`
      SELECT ae.*, e.employee_id, ed.full_name
      FROM assets_equipment ae
      LEFT JOIN employees e ON ae.assigned_to = e.id
      LEFT JOIN employee_details ed ON e.id = ed.employee_id
      WHERE ae.id = ?
      LIMIT 1
    `, [req.params.id]);

    const data = asArray(rows);
    if (!data.length) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    return res.json(data[0]);
  } catch (error) {
    console.error('Error fetching asset:', error);
    return res.status(500).json({ error: 'Failed to fetch asset', details: error.message });
  }
});

// POST /api/assets-equipment - create
router.post('/', async (req, res) => {
  try {
    const {
      asset_code,
      asset_name,
      category,
      asset_type,
      serial_number,
      purchase_date,
      purchase_cost,
      current_value,
      depreciation_method,
      useful_life_years,
      condition,
      location,
      department,
      status,
      supplier,
      warranty_expiry,
      maintenance_schedule,
      notes
    } = req.body || {};

    if (!asset_code || !asset_name || !category) {
      return res.status(400).json({ error: 'asset_code, asset_name and category are required' });
    }

    const createdBy = (req.user && req.user.id) ? req.user.id : null;

    const result = await db.execute(`
      INSERT INTO assets_equipment (
        asset_code, asset_name, category, asset_type, serial_number,
        purchase_date, purchase_cost, current_value, depreciation_method, useful_life_years,
        ` + '`condition`' + `, location, department, status,
        supplier, warranty_expiry, maintenance_schedule, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      asset_code,
      asset_name,
      category,
      asset_type || null,
      serial_number || null,
      purchase_date || null,
      purchase_cost || null,
      current_value || null,
      depreciation_method || null,
      useful_life_years || null,
      condition || 'Good',
      location || null,
      department || null,
      status || 'Available',
      supplier || null,
      warranty_expiry || null,
      maintenance_schedule ? JSON.stringify(maintenance_schedule) : null,
      notes || null,
      createdBy
    ]);

    const insertId = Array.isArray(result) ? (result[0]?.insertId || result.insertId) : result.insertId;
    return res.status(201).json({ success: true, id: insertId, message: 'Asset created successfully' });
  } catch (error) {
    console.error('Error creating asset:', error && (error.sqlMessage || error.message) || error);
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Asset code already exists' });
    }
    return res.status(500).json({ error: 'Failed to create asset', details: error.message });
  }
});

// PUT /api/assets-equipment/:id - update (merge missing values with existing)
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const existingRows = await db.execute('SELECT * FROM assets_equipment WHERE id = ? LIMIT 1', [id]);
    const existing = asArray(existingRows)[0];
    if (!existing) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const body = req.body || {};

    const updated = {
      asset_code: body.asset_code ?? existing.asset_code,
      asset_name: body.asset_name ?? existing.asset_name,
      category: body.category ?? existing.category,
      asset_type: body.asset_type ?? existing.asset_type,
      serial_number: body.serial_number ?? existing.serial_number,
      purchase_date: body.purchase_date ?? existing.purchase_date,
      purchase_cost: body.purchase_cost ?? existing.purchase_cost,
      current_value: body.current_value ?? existing.current_value,
      depreciation_method: body.depreciation_method ?? existing.depreciation_method,
      useful_life_years: body.useful_life_years ?? existing.useful_life_years,
      condition: body.condition ?? existing.condition,
      location: body.location ?? existing.location,
      department: body.department ?? existing.department,
      status: body.status ?? existing.status,
      assigned_to: body.assigned_to ?? existing.assigned_to,
      assigned_date: body.assigned_date ?? existing.assigned_date,
      expected_return_date: body.expected_return_date ?? existing.expected_return_date,
      actual_return_date: body.actual_return_date ?? existing.actual_return_date,
      supplier: body.supplier ?? existing.supplier,
      warranty_expiry: body.warranty_expiry ?? existing.warranty_expiry,
      maintenance_schedule: body.maintenance_schedule ? JSON.stringify(body.maintenance_schedule) : existing.maintenance_schedule,
      notes: body.notes ?? existing.notes
    };

    await db.execute(`
      UPDATE assets_equipment SET
        asset_code = ?, asset_name = ?, category = ?, asset_type = ?, serial_number = ?,
        purchase_date = ?, purchase_cost = ?, current_value = ?, depreciation_method = ?, useful_life_years = ?,
        ` + '`condition`' + ` = ?, location = ?, department = ?, status = ?,
        assigned_to = ?, assigned_date = ?, expected_return_date = ?, actual_return_date = ?,
        supplier = ?, warranty_expiry = ?, maintenance_schedule = ?, notes = ?
      WHERE id = ?
    `, [
      updated.asset_code, updated.asset_name, updated.category, updated.asset_type, updated.serial_number,
      updated.purchase_date, updated.purchase_cost, updated.current_value, updated.depreciation_method, updated.useful_life_years,
      updated.condition, updated.location, updated.department, updated.status,
      updated.assigned_to, updated.assigned_date, updated.expected_return_date, updated.actual_return_date,
      updated.supplier, updated.warranty_expiry, updated.maintenance_schedule, updated.notes,
      id
    ]);

    return res.json({ success: true, message: 'Asset updated successfully' });
  } catch (error) {
    console.error('Error updating asset:', error);
    return res.status(500).json({ error: 'Failed to update asset', details: error.message });
  }
});

// PUT /api/assets-equipment/:id/assign
router.put('/:id/assign', async (req, res) => {
  try {
    const { assigned_to, assigned_date, expected_return_date, notes } = req.body || {};
    if (!assigned_to) {
      return res.status(400).json({ error: 'assigned_to is required' });
    }
    const assignDate = assigned_date || new Date().toISOString().split('T')[0];
    await db.execute(`
      UPDATE assets_equipment SET
        status = 'In Use',
        assigned_to = ?,
        assigned_date = ?,
        expected_return_date = ?,
        notes = ?
      WHERE id = ?
    `, [assigned_to, assignDate, expected_return_date || null, notes || null, req.params.id]);

    return res.json({ success: true, message: 'Asset assigned successfully' });
  } catch (error) {
    console.error('Error assigning asset:', error);
    return res.status(500).json({ error: 'Failed to assign asset', details: error.message });
  }
});

// PUT /api/assets-equipment/:id/return
router.put('/:id/return', async (req, res) => {
  try {
    const { return_condition, notes } = req.body || {};
    const actual_return_date = new Date().toISOString().split('T')[0];

    await db.execute(`
      UPDATE assets_equipment SET
        status = 'Available',
        assigned_to = NULL,
        actual_return_date = ?,
        ` + 'return_condition' + ` = ?,
        notes = ?
      WHERE id = ?
    `, [actual_return_date, return_condition || null, notes || null, req.params.id]);

    return res.json({ success: true, message: 'Asset returned successfully' });
  } catch (error) {
    console.error('Error returning asset:', error);
    return res.status(500).json({ error: 'Failed to return asset', details: error.message });
  }
});

// PUT /api/assets-equipment/:id/maintenance
router.put('/:id/maintenance', async (req, res) => {
  try {
    const { maintenance_notes, notes } = req.body || {};
    await db.execute(`
      UPDATE assets_equipment SET
        status = 'Maintenance',
        maintenance_notes = ?,
        notes = ?
      WHERE id = ?
    `, [maintenance_notes || null, notes || null, req.params.id]);

    return res.json({ success: true, message: 'Asset sent for maintenance successfully' });
  } catch (error) {
    console.error('Error updating maintenance:', error);
    return res.status(500).json({ error: 'Failed to update maintenance', details: error.message });
  }
});

// PUT /api/assets-equipment/:id/complete-maintenance
router.put('/:id/complete-maintenance', async (req, res) => {
  try {
    const { condition, notes } = req.body || {};
    await db.execute(`
      UPDATE assets_equipment SET
        status = 'Available',
        ` + '`condition`' + ` = ?,
        maintenance_notes = NULL,
        notes = ?
      WHERE id = ?
    `, [condition || 'Good', notes || null, req.params.id]);

    return res.json({ success: true, message: 'Maintenance completed successfully' });
  } catch (error) {
    console.error('Error completing maintenance:', error);
    return res.status(500).json({ error: 'Failed to complete maintenance', details: error.message });
  }
});

module.exports = router;
