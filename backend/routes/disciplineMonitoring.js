const notify = require('../utils/notify');
const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all discipline cases
router.get('/', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT dm.*, e.employee_id, ed.full_name,
                   reporter.name as reporter_name,
                   resolver.name as resolver_name
            FROM discipline_monitoring dm 
            LEFT JOIN employees e ON dm.employee_id = e.id 
            LEFT JOIN employee_details ed ON e.id = ed.employee_id 
            LEFT JOIN users reporter ON dm.reported_by = reporter.id
            LEFT JOIN users resolver ON dm.resolved_by = resolver.id
            ORDER BY dm.incident_date DESC
        `);
        res.json(Array.isArray(result) ? result : []);
    } catch (error) {
        console.error('Error fetching discipline cases:', error);
        res.status(500).json({ error: 'Failed to fetch discipline cases' });
    }
});

// Get single discipline case by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT dm.*, e.employee_id, ed.full_name,
                   reporter.name as reporter_name,
                   resolver.name as resolver_name
            FROM discipline_monitoring dm 
            LEFT JOIN employees e ON dm.employee_id = e.id 
            LEFT JOIN employee_details ed ON e.id = ed.employee_id 
            LEFT JOIN users reporter ON dm.reported_by = reporter.id
            LEFT JOIN users resolver ON dm.resolved_by = resolver.id
            WHERE dm.id = ?
        `, [req.params.id]);
        const rows = Array.isArray(result) ? result : [];
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Discipline case not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching discipline case:', error);
        res.status(500).json({ error: 'Failed to fetch discipline case' });
    }
});

// Create new discipline case
router.post('/', async (req, res) => {
    try {
        const {
            employee_id,
            incident_type,
            incident_date,
            incident_location,
            description,
            severity,
            reported_by,
            witnesses,
            evidence_documents,
            notes
        } = req.body;

        // Generate case number
        const case_number = `DISC-${Date.now().toString().slice(-6)}`;

        const result = await db.execute(`
            INSERT INTO discipline_monitoring (
                case_number, employee_id, incident_type, incident_date,
                incident_location, description, severity, reported_by,
                witnesses, evidence_documents, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            case_number,
            employee_id,
            incident_type,
            incident_date,
            incident_location || null,
            description,
            severity,
            reported_by,
            witnesses || null,
            evidence_documents || null,
            notes || null
        ]);

        const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;
        notify('Discipline Update', 'Discipline record created for employee #' + (req.body.employee_id || req.body.employeeId) + ': ' + (req.body.violation_type || req.body.type || 'Disciplinary action'), 'warning', 'MD', 'HR Department');
        res.status(201).json({ id: insertId, case_number, message: 'Discipline case created successfully' });
    } catch (error) {
        console.error('Error creating discipline case:', error);
        res.status(500).json({ error: 'Failed to create discipline case' });
    }
});

// Update discipline case
router.put('/:id', async (req, res) => {
    try {
        const {
            employee_id,
            incident_type,
            incident_date,
            incident_location,
            description,
            severity,
            witnesses,
            evidence_documents,
            status,
            disciplinary_action,
            action_date,
            action_notes,
            appeal_status,
            appeal_date,
            appeal_notes,
            resolved_by,
            resolved_date,
            notes
        } = req.body;

        await db.execute(`
            UPDATE discipline_monitoring SET
                employee_id = ?, incident_type = ?, incident_date = ?,
                incident_location = ?, description = ?, severity = ?,
                witnesses = ?, evidence_documents = ?, status = ?,
                disciplinary_action = ?, action_date = ?, action_notes = ?,
                appeal_status = ?, appeal_date = ?, appeal_notes = ?,
                resolved_by = ?, resolved_date = ?, notes = ?
            WHERE id = ?
        `, [
            employee_id,
            incident_type,
            incident_date,
            incident_location || null,
            description,
            severity,
            witnesses || null,
            evidence_documents || null,
            status,
            disciplinary_action,
            action_date || null,
            action_notes || null,
            appeal_status,
            appeal_date || null,
            appeal_notes || null,
            resolved_by || null,
            resolved_date || null,
            notes || null,
            req.params.id
        ]);

        res.json({ message: 'Discipline case updated successfully' });
    } catch (error) {
        console.error('Error updating discipline case:', error);
        res.status(500).json({ error: 'Failed to update discipline case' });
    }
});

// Delete discipline case
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM discipline_monitoring WHERE id = ?', [req.params.id]);
        res.json({ message: 'Discipline case deleted successfully' });
    } catch (error) {
        console.error('Error deleting discipline case:', error);
        res.status(500).json({ error: 'Failed to delete discipline case' });
    }
});

// Resolve discipline case
router.put('/:id/resolve', async (req, res) => {
    try {
        const { disciplinary_action, action_notes, resolved_by, notes } = req.body;
        const action_date = new Date().toISOString().split('T')[0];
        const resolved_date = new Date().toISOString().split('T')[0];

        await db.execute(`
            UPDATE discipline_monitoring SET
                status = 'Closed',
                disciplinary_action = ?,
                action_date = ?,
                action_notes = ?,
                resolved_by = ?,
                resolved_date = ?,
                notes = ?
            WHERE id = ?
        `, [disciplinary_action, action_date, action_notes, resolved_by, resolved_date, notes, req.params.id]);

        res.json({ message: 'Discipline case resolved successfully' });
    } catch (error) {
        console.error('Error resolving discipline case:', error);
        res.status(500).json({ error: 'Failed to resolve discipline case' });
    }
});

// File appeal
router.put('/:id/appeal', async (req, res) => {
    try {
        const { appeal_notes } = req.body;
        const appeal_date = new Date().toISOString().split('T')[0];

        await db.execute(`
            UPDATE discipline_monitoring SET
                appeal_status = 'Filed',
                appeal_date = ?,
                appeal_notes = ?,
                status = 'Appealed'
            WHERE id = ?
        `, [appeal_date, appeal_notes, req.params.id]);

        res.json({ message: 'Appeal filed successfully' });
    } catch (error) {
        console.error('Error filing appeal:', error);
        res.status(500).json({ error: 'Failed to file appeal' });
    }
});

// Start investigation
router.put('/:id/investigate', async (req, res) => {
    try {
        await db.execute(`
            UPDATE discipline_monitoring SET status = 'Under Investigation' WHERE id = ?
        `, [req.params.id]);

        res.json({ message: 'Investigation started successfully' });
    } catch (error) {
        console.error('Error starting investigation:', error);
        res.status(500).json({ error: 'Failed to start investigation' });
    }
});

module.exports = router;