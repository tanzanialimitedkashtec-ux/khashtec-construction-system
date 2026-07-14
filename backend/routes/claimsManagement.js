const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all claims
router.get('/', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT cm.*, e.employee_id, ed.full_name 
            FROM claims_management cm 
            LEFT JOIN employees e ON cm.employee_id = e.id 
            LEFT JOIN employee_details ed ON e.id = ed.employee_id 
            ORDER BY cm.claim_date DESC
        `);
        res.json(Array.isArray(result) ? result : []);
    } catch (error) {
        console.error('Error fetching claims:', error);
        res.status(500).json({ error: 'Failed to fetch claims' });
    }
});

// Get single claim by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT cm.*, e.employee_id, ed.full_name 
            FROM claims_management cm 
            LEFT JOIN employees e ON cm.employee_id = e.id 
            LEFT JOIN employee_details ed ON e.id = ed.employee_id 
            WHERE cm.id = ?
        `, [req.params.id]);
        const rows = Array.isArray(result) ? result : [];
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Claim not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching claim:', error);
        res.status(500).json({ error: 'Failed to fetch claim' });
    }
});

// Create new claim
router.post('/', async (req, res) => {
    try {
        const {
            employee_id,
            claim_type,
            title,
            description,
            claim_date,
            incident_date,
            incident_location,
            amount_claimed,
            priority,
            supporting_documents,
            witness_names,
            created_by
        } = req.body;

        // Generate claim number
        const claim_number = `CLM-${Date.now().toString().slice(-6)}`;

        const result = await db.execute(`
            INSERT INTO claims_management (
                claim_number, employee_id, claim_type, title, description, 
                claim_date, incident_date, incident_location, amount_claimed, 
                priority, supporting_documents, witness_names, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            claim_number,
            employee_id || null,
            claim_type,
            title,
            description,
            claim_date,
            incident_date || null,
            incident_location || null,
            amount_claimed || null,
            priority || 'Medium',
            supporting_documents || null,
            witness_names || null,
            created_by || null
        ]);

        const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;
        res.status(201).json({ id: insertId, claim_number, message: 'Claim created successfully' });
    } catch (error) {
        console.error('Error creating claim:', error);
        res.status(500).json({ error: 'Failed to create claim' });
    }
});

// Update claim
router.put('/:id', async (req, res) => {
    try {
        const {
            employee_id,
            claim_type,
            title,
            description,
            claim_date,
            incident_date,
            incident_location,
            amount_claimed,
            amount_approved,
            status,
            priority,
            supporting_documents,
            witness_names,
            approved_by,
            approved_date,
            payment_date,
            notes
        } = req.body;

        await db.execute(`
            UPDATE claims_management SET
                employee_id = ?, claim_type = ?, title = ?, description = ?,
                claim_date = ?, incident_date = ?, incident_location = ?,
                amount_claimed = ?, amount_approved = ?, status = ?, priority = ?,
                supporting_documents = ?, witness_names = ?, approved_by = ?,
                approved_date = ?, payment_date = ?, notes = ?
            WHERE id = ?
        `, [
            employee_id ?? null,
            claim_type ?? null,
            title ?? null,
            description ?? null,
            claim_date ?? null,
            incident_date ?? null,
            incident_location ?? null,
            amount_claimed ?? null,
            amount_approved ?? null,
            status ?? null,
            priority ?? null,
            supporting_documents ?? null,
            witness_names ?? null,
            approved_by ?? null,
            approved_date ?? null,
            payment_date ?? null,
            notes ?? null,
            req.params.id
        ]);

        res.json({ message: 'Claim updated successfully' });
    } catch (error) {
        console.error('Error updating claim:', error);
        res.status(500).json({ error: 'Failed to update claim' });
    }
});

// Delete claim
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM claims_management WHERE id = ?', [req.params.id]);
        res.json({ message: 'Claim deleted successfully' });
    } catch (error) {
        console.error('Error deleting claim:', error);
        res.status(500).json({ error: 'Failed to delete claim' });
    }
});

// Approve claim
router.put('/:id/approve', async (req, res) => {
    try {
        const { amount_approved, approved_by, notes } = req.body;
        const approved_date = new Date().toISOString().split('T')[0];

        await db.execute(`
            UPDATE claims_management SET
                status = 'Approved',
                amount_approved = ?,
                approved_by = ?,
                approved_date = ?,
                notes = ?
            WHERE id = ?
        `, [amount_approved, approved_by, approved_date, notes, req.params.id]);

        res.json({ message: 'Claim approved successfully' });
    } catch (error) {
        console.error('Error approving claim:', error);
        res.status(500).json({ error: 'Failed to approve claim' });
    }
});

// Reject claim
router.put('/:id/reject', async (req, res) => {
    try {
        const { approved_by, notes } = req.body;
        const approved_date = new Date().toISOString().split('T')[0];

        await db.execute(`
            UPDATE claims_management SET
                status = 'Rejected',
                approved_by = ?,
                approved_date = ?,
                notes = ?
            WHERE id = ?
        `, [approved_by, approved_date, notes, req.params.id]);

        res.json({ message: 'Claim rejected successfully' });
    } catch (error) {
        console.error('Error rejecting claim:', error);
        res.status(500).json({ error: 'Failed to reject claim' });
    }
});

module.exports = router;