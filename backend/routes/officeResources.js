const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all office resources
router.get('/', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT or.*, e.employee_id, ed.full_name 
            FROM office_resources or 
            LEFT JOIN employees e ON or.assigned_to = e.id 
            LEFT JOIN employee_details ed ON e.id = ed.employee_id 
            ORDER BY or.created_at DESC
        `);
        const resources = Array.isArray(result) ? result[0] : result;
        res.json(resources);
    } catch (error) {
        console.error('Error fetching office resources:', error);
        res.status(500).json({ error: 'Failed to fetch office resources' });
    }
});

// Get single office resource by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT or.*, e.employee_id, ed.full_name 
            FROM office_resources or 
            LEFT JOIN employees e ON or.assigned_to = e.id 
            LEFT JOIN employee_details ed ON e.id = ed.employee_id 
            WHERE or.id = ?
        `, [req.params.id]);
        const resource = Array.isArray(result) ? result[0] : result;
        if (resource.length === 0) {
            return res.status(404).json({ error: 'Office resource not found' });
        }
        res.json(resource[0]);
    } catch (error) {
        console.error('Error fetching office resource:', error);
        res.status(500).json({ error: 'Failed to fetch office resource' });
    }
});

// Create new office resource
router.post('/', async (req, res) => {
    try {
        const {
            resource_code,
            resource_name,
            resource_type,
            description,
            serial_number,
            purchase_date,
            purchase_cost,
            current_value,
            condition,
            location,
            department,
            created_by
        } = req.body;

        const result = await db.execute(`
            INSERT INTO office_resources (
                resource_code, resource_name, resource_type, description,
                serial_number, purchase_date, purchase_cost, current_value,
                condition, location, department, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            resource_code,
            resource_name,
            resource_type,
            description || null,
            serial_number || null,
            purchase_date || null,
            purchase_cost || null,
            current_value || null,
            condition || 'Good',
            location || null,
            department || null,
            created_by || null
        ]);

        const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;
        res.status(201).json({ id: insertId, message: 'Office resource created successfully' });
    } catch (error) {
        console.error('Error creating office resource:', error);
        res.status(500).json({ error: 'Failed to create office resource' });
    }
});

// Update office resource
router.put('/:id', async (req, res) => {
    try {
        const {
            resource_code,
            resource_name,
            resource_type,
            description,
            serial_number,
            purchase_date,
            purchase_cost,
            current_value,
            condition,
            location,
            department,
            status,
            assigned_to,
            assigned_date,
            expected_return_date,
            actual_return_date,
            return_condition,
            maintenance_notes,
            notes
        } = req.body;

        await db.execute(`
            UPDATE office_resources SET
                resource_code = ?, resource_name = ?, resource_type = ?,
                description = ?, serial_number = ?, purchase_date = ?,
                purchase_cost = ?, current_value = ?, condition = ?,
                location = ?, department = ?, status = ?,
                assigned_to = ?, assigned_date = ?, expected_return_date = ?,
                actual_return_date = ?, return_condition = ?,
                maintenance_notes = ?, notes = ?
            WHERE id = ?
        `, [
            resource_code,
            resource_name,
            resource_type,
            description || null,
            serial_number || null,
            purchase_date || null,
            purchase_cost || null,
            current_value || null,
            condition,
            location || null,
            department || null,
            status,
            assigned_to || null,
            assigned_date || null,
            expected_return_date || null,
            actual_return_date || null,
            return_condition || null,
            maintenance_notes || null,
            notes || null,
            req.params.id
        ]);

        res.json({ message: 'Office resource updated successfully' });
    } catch (error) {
        console.error('Error updating office resource:', error);
        res.status(500).json({ error: 'Failed to update office resource' });
    }
});

// Delete office resource
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM office_resources WHERE id = ?', [req.params.id]);
        res.json({ message: 'Office resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting office resource:', error);
        res.status(500).json({ error: 'Failed to delete office resource' });
    }
});

// Assign resource to employee
router.put('/:id/assign', async (req, res) => {
    try {
        const { assigned_to, assigned_date, expected_return_date, notes } = req.body;
        const assignDate = assigned_date || new Date().toISOString().split('T')[0];

        await db.execute(`
            UPDATE office_resources SET
                status = 'Assigned',
                assigned_to = ?,
                assigned_date = ?,
                expected_return_date = ?,
                notes = ?
            WHERE id = ?
        `, [assigned_to, assignDate, expected_return_date || null, notes || null, req.params.id]);

        res.json({ message: 'Resource assigned successfully' });
    } catch (error) {
        console.error('Error assigning resource:', error);
        res.status(500).json({ error: 'Failed to assign resource' });
    }
});

// Return resource
router.put('/:id/return', async (req, res) => {
    try {
        const { return_condition, notes } = req.body;
        const actual_return_date = new Date().toISOString().split('T')[0];

        await db.execute(`
            UPDATE office_resources SET
                status = 'Available',
                assigned_to = NULL,
                actual_return_date = ?,
                return_condition = ?,
                notes = ?
            WHERE id = ?
        `, [actual_return_date, return_condition, notes || null, req.params.id]);

        res.json({ message: 'Resource returned successfully' });
    } catch (error) {
        console.error('Error returning resource:', error);
        res.status(500).json({ error: 'Failed to return resource' });
    }
});

// Send resource for maintenance
router.put('/:id/maintenance', async (req, res) => {
    try {
        const { maintenance_notes, notes } = req.body;

        await db.execute(`
            UPDATE office_resources SET
                status = 'In Maintenance',
                maintenance_notes = ?,
                notes = ?
            WHERE id = ?
        `, [maintenance_notes, notes || null, req.params.id]);

        res.json({ message: 'Resource sent for maintenance successfully' });
    } catch (error) {
        console.error('Error sending resource for maintenance:', error);
        res.status(500).json({ error: 'Failed to send resource for maintenance' });
    }
});

// Complete maintenance
router.put('/:id/complete-maintenance', async (req, res) => {
    try {
        const { condition, notes } = req.body;

        await db.execute(`
            UPDATE office_resources SET
                status = 'Available',
                condition = ?,
                maintenance_notes = NULL,
                notes = ?
            WHERE id = ?
        `, [condition, notes || null, req.params.id]);

        res.json({ message: 'Maintenance completed successfully' });
    } catch (error) {
        console.error('Error completing maintenance:', error);
        res.status(500).json({ error: 'Failed to complete maintenance' });
    }
});

module.exports = router;