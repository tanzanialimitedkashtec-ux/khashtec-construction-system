const notify = require('../utils/notify');
const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all talent acquisition requisitions
router.get('/', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT ta.*, 
                   requester.name as requester_name,
                   approver.name as approver_name,
                   hiring_mgr.name as hiring_manager_name
            FROM talent_acquisition ta 
            LEFT JOIN users requester ON ta.requested_by = requester.id
            LEFT JOIN users approver ON ta.approved_by = approver.id
            LEFT JOIN users hiring_mgr ON ta.hiring_manager = hiring_mgr.id
            ORDER BY ta.request_date DESC
        `);
        res.json(Array.isArray(result) ? result : []);
    } catch (error) {
        console.error('Error fetching talent acquisition requisitions:', error);
        res.status(500).json({ error: 'Failed to fetch talent acquisition requisitions' });
    }
});

// Get single talent acquisition requisition by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT ta.*, 
                   requester.name as requester_name,
                   approver.name as approver_name,
                   hiring_mgr.name as hiring_manager_name
            FROM talent_acquisition ta 
            LEFT JOIN users requester ON ta.requested_by = requester.id
            LEFT JOIN users approver ON ta.approved_by = approver.id
            LEFT JOIN users hiring_mgr ON ta.hiring_manager = hiring_mgr.id
            WHERE ta.id = ?
        `, [req.params.id]);
        const rows = Array.isArray(result) ? result : [];
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Talent acquisition requisition not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching talent acquisition requisition:', error);
        res.status(500).json({ error: 'Failed to fetch talent acquisition requisition' });
    }
});

// Create new talent acquisition requisition
router.post('/', async (req, res) => {
    try {
        const {
            position_title,
            department,
            position_type,
            experience_level,
            number_of_positions,
            job_description,
            requirements,
            salary_range_min,
            salary_range_max,
            requested_by,
            request_date,
            priority,
            budget_code,
            expected_start_date,
            hiring_manager,
            notes
        } = req.body;

        // Generate requisition number
        const requisition_number = `TA-${Date.now().toString().slice(-6)}`;

        const result = await db.execute(`
            INSERT INTO talent_acquisition (
                requisition_number, position_title, department, position_type,
                experience_level, number_of_positions, job_description, requirements,
                salary_range_min, salary_range_max, requested_by, request_date,
                priority, budget_code, expected_start_date, hiring_manager, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            requisition_number,
            position_title,
            department,
            position_type,
            experience_level,
            number_of_positions || 1,
            job_description || null,
            requirements || null,
            salary_range_min || null,
            salary_range_max || null,
            requested_by,
            request_date,
            priority || 'Medium',
            budget_code || null,
            expected_start_date || null,
            hiring_manager || null,
            notes || null
        ]);

        const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;
        notify('Talent Acquisition', 'New recruitment posting: ' + (req.body.position || req.body.title || 'New position') + ' in ' + (req.body.department || 'unspecified') + ' department', 'info', 'MD', 'HR Department');
        res.status(201).json({ id: insertId, requisition_number, message: 'Talent acquisition requisition created successfully' });
    } catch (error) {
        console.error('Error creating talent acquisition requisition:', error);
        res.status(500).json({ error: 'Failed to create talent acquisition requisition' });
    }
});

// Update talent acquisition requisition
router.put('/:id', async (req, res) => {
    try {
        const {
            position_title,
            department,
            position_type,
            experience_level,
            number_of_positions,
            job_description,
            requirements,
            salary_range_min,
            salary_range_max,
            approved_by,
            approval_date,
            status,
            priority,
            budget_code,
            expected_start_date,
            hiring_manager,
            notes
        } = req.body;

        await db.execute(`
            UPDATE talent_acquisition SET
                position_title = ?, department = ?, position_type = ?,
                experience_level = ?, number_of_positions = ?, job_description = ?,
                requirements = ?, salary_range_min = ?, salary_range_max = ?,
                approved_by = ?, approval_date = ?, status = ?, priority = ?,
                budget_code = ?, expected_start_date = ?, hiring_manager = ?, notes = ?
            WHERE id = ?
        `, [
            position_title ?? null,
            department ?? null,
            position_type ?? null,
            experience_level ?? null,
            number_of_positions ?? 1,
            job_description ?? null,
            requirements ?? null,
            salary_range_min ?? null,
            salary_range_max ?? null,
            approved_by ?? null,
            approval_date ?? null,
            status ?? null,
            priority ?? null,
            budget_code ?? null,
            expected_start_date ?? null,
            hiring_manager ?? null,
            notes ?? null,
            req.params.id
        ]);

        res.json({ message: 'Talent acquisition requisition updated successfully' });
    } catch (error) {
        console.error('Error updating talent acquisition requisition:', error);
        res.status(500).json({ error: 'Failed to update talent acquisition requisition' });
    }
});

// Delete talent acquisition requisition
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM talent_acquisition WHERE id = ?', [req.params.id]);
        res.json({ message: 'Talent acquisition requisition deleted successfully' });
    } catch (error) {
        console.error('Error deleting talent acquisition requisition:', error);
        res.status(500).json({ error: 'Failed to delete talent acquisition requisition' });
    }
});

// Approve requisition
router.put('/:id/approve', async (req, res) => {
    try {
        const { approved_by, notes } = req.body;
        const approval_date = new Date().toISOString().split('T')[0];

        await db.execute(`
            UPDATE talent_acquisition SET
                status = 'Approved',
                approved_by = ?,
                approval_date = ?,
                notes = ?
            WHERE id = ?
        `, [approved_by, approval_date, notes || null, req.params.id]);

        res.json({ message: 'Requisition approved successfully' });
    } catch (error) {
        console.error('Error approving requisition:', error);
        res.status(500).json({ error: 'Failed to approve requisition' });
    }
});

// Reject requisition
router.put('/:id/reject', async (req, res) => {
    try {
        const { approved_by, notes } = req.body;
        const approval_date = new Date().toISOString().split('T')[0];

        await db.execute(`
            UPDATE talent_acquisition SET
                status = 'Rejected',
                approved_by = ?,
                approval_date = ?,
                notes = ?
            WHERE id = ?
        `, [approved_by, approval_date, notes || null, req.params.id]);

        res.json({ message: 'Requisition rejected successfully' });
    } catch (error) {
        console.error('Error rejecting requisition:', error);
        res.status(500).json({ error: 'Failed to reject requisition' });
    }
});

// Start recruitment process
router.put('/:id/start', async (req, res) => {
    try {
        await db.execute(`
            UPDATE talent_acquisition SET status = 'In Progress' WHERE id = ?
        `, [req.params.id]);

        res.json({ message: 'Recruitment process started successfully' });
    } catch (error) {
        console.error('Error starting recruitment process:', error);
        res.status(500).json({ error: 'Failed to start recruitment process' });
    }
});

// Mark as filled
router.put('/:id/filled', async (req, res) => {
    try {
        await db.execute(`
            UPDATE talent_acquisition SET status = 'Filled' WHERE id = ?
        `, [req.params.id]);

        res.json({ message: 'Position marked as filled successfully' });
    } catch (error) {
        console.error('Error marking position as filled:', error);
        res.status(500).json({ error: 'Failed to mark position as filled' });
    }
});

// Put on hold
router.put('/:id/hold', async (req, res) => {
    try {
        const { notes } = req.body;

        await db.execute(`
            UPDATE talent_acquisition SET status = 'On Hold', notes = ? WHERE id = ?
        `, [notes || null, req.params.id]);

        res.json({ message: 'Requisition put on hold successfully' });
    } catch (error) {
        console.error('Error putting requisition on hold:', error);
        res.status(500).json({ error: 'Failed to put requisition on hold' });
    }
});

module.exports = router;