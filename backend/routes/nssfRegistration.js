const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all NSSF registrations
router.get('/', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT nr.*, e.employee_id, COALESCE(ed.full_name, CONCAT('Employee ', nr.employee_id)) AS full_name 
            FROM nssf_registration nr 
            LEFT JOIN employees e ON nr.employee_id = e.id 
            LEFT JOIN employee_details ed ON e.id = ed.employee_id 
            ORDER BY nr.registration_date DESC
        `);
        const registrations = Array.isArray(result) ? result[0] : result;
        res.json(registrations);
    } catch (error) {
        console.error('Error fetching NSSF registrations:', error);
        res.status(500).json({ error: 'Failed to fetch NSSF registrations' });
    }
});

// Get single NSSF registration by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT nr.*, e.employee_id, COALESCE(ed.full_name, CONCAT('Employee ', nr.employee_id)) AS full_name 
            FROM nssf_registration nr 
            LEFT JOIN employees e ON nr.employee_id = e.id 
            LEFT JOIN employee_details ed ON e.id = ed.employee_id 
            WHERE nr.id = ?
        `, [req.params.id]);
        const registration = Array.isArray(result) ? result[0] : result;
        if (registration.length === 0) {
            return res.status(404).json({ error: 'NSSF registration not found' });
        }
        res.json(registration[0]);
    } catch (error) {
        console.error('Error fetching NSSF registration:', error);
        res.status(500).json({ error: 'Failed to fetch NSSF registration' });
    }
});

// Create new NSSF registration
router.post('/', async (req, res) => {
    try {
        const {
            employee_id,
            nssf_number,
            registration_date,
            employer_contribution_rate,
            employee_contribution_rate,
            monthly_salary,
            monthly_contribution,
            registration_certificate,
            notes,
            created_by
        } = req.body;

        // Generate registration number
        const registration_number = `NSSF-${Date.now().toString().slice(-6)}`;

        const result = await db.execute(`
            INSERT INTO nssf_registration (
                registration_number, employee_id, nssf_number, registration_date,
                employer_contribution_rate, employee_contribution_rate, monthly_salary,
                monthly_contribution, registration_certificate, notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            registration_number,
            employee_id,
            nssf_number,
            registration_date,
            employer_contribution_rate || 10.00,
            employee_contribution_rate || 10.00,
            monthly_salary || null,
            monthly_contribution || null,
            registration_certificate || null,
            notes || null,
            created_by || null
        ]);

        const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;
        res.status(201).json({ id: insertId, registration_number, message: 'NSSF registration created successfully' });
    } catch (error) {
        console.error('Error creating NSSF registration:', error);
        res.status(500).json({ error: 'Failed to create NSSF registration' });
    }
});

// Update NSSF registration
router.put('/:id', async (req, res) => {
    try {
        const {
            employee_id,
            nssf_number,
            registration_date,
            employer_contribution_rate,
            employee_contribution_rate,
            monthly_salary,
            monthly_contribution,
            status,
            registration_certificate,
            last_contribution_date,
            total_contributions,
            notes
        } = req.body;

        await db.execute(`
            UPDATE nssf_registration SET
                employee_id = ?, nssf_number = ?, registration_date = ?,
                employer_contribution_rate = ?, employee_contribution_rate = ?,
                monthly_salary = ?, monthly_contribution = ?, status = ?,
                registration_certificate = ?, last_contribution_date = ?,
                total_contributions = ?, notes = ?
            WHERE id = ?
        `, [
            employee_id,
            nssf_number,
            registration_date,
            employer_contribution_rate || 10.00,
            employee_contribution_rate || 10.00,
            monthly_salary || null,
            monthly_contribution || null,
            status,
            registration_certificate || null,
            last_contribution_date || null,
            total_contributions || 0,
            notes || null,
            req.params.id
        ]);

        res.json({ message: 'NSSF registration updated successfully' });
    } catch (error) {
        console.error('Error updating NSSF registration:', error);
        res.status(500).json({ error: 'Failed to update NSSF registration' });
    }
});

// Delete NSSF registration
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM nssf_registration WHERE id = ?', [req.params.id]);
        res.json({ message: 'NSSF registration deleted successfully' });
    } catch (error) {
        console.error('Error deleting NSSF registration:', error);
        res.status(500).json({ error: 'Failed to delete NSSF registration' });
    }
});

// Update contribution
router.put('/:id/contribution', async (req, res) => {
    try {
        const { monthly_contribution, last_contribution_date, total_contributions } = req.body;

        await db.execute(`
            UPDATE nssf_registration SET
                monthly_contribution = ?,
                last_contribution_date = ?,
                total_contributions = total_contributions + ?
            WHERE id = ?
        `, [monthly_contribution, last_contribution_date, monthly_contribution, req.params.id]);

        res.json({ message: 'Contribution updated successfully' });
    } catch (error) {
        console.error('Error updating contribution:', error);
        res.status(500).json({ error: 'Failed to update contribution' });
    }
});

// Suspend NSSF registration
router.put('/:id/suspend', async (req, res) => {
    try {
        await db.execute(`
            UPDATE nssf_registration SET status = 'Suspended' WHERE id = ?
        `, [req.params.id]);

        res.json({ message: 'NSSF registration suspended successfully' });
    } catch (error) {
        console.error('Error suspending NSSF registration:', error);
        res.status(500).json({ error: 'Failed to suspend NSSF registration' });
    }
});

// Activate NSSF registration
router.put('/:id/activate', async (req, res) => {
    try {
        await db.execute(`
            UPDATE nssf_registration SET status = 'Active' WHERE id = ?
        `, [req.params.id]);

        res.json({ message: 'NSSF registration activated successfully' });
    } catch (error) {
        console.error('Error activating NSSF registration:', error);
        res.status(500).json({ error: 'Failed to activate NSSF registration' });
    }
});

module.exports = router;