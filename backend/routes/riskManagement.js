const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all risks
router.get('/', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT rm.*, 
                   identifier.name as identified_by_name,
                   owner_user.name as owner_name,
                   p.name as project_name
            FROM risk_management rm 
            LEFT JOIN users identifier ON rm.identified_by = identifier.id
            LEFT JOIN users owner_user ON rm.owner = owner_user.id
            LEFT JOIN projects p ON rm.project_id = p.id
            ORDER BY rm.identified_date DESC
        `);
        res.json(Array.isArray(result) ? result : []);
    } catch (error) {
        console.error('Error fetching risks:', error);
        res.status(500).json({ error: 'Failed to fetch risks' });
    }
});

// Get single risk by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT rm.*, 
                   identifier.name as identified_by_name,
                   owner_user.name as owner_name,
                   p.name as project_name
            FROM risk_management rm 
            LEFT JOIN users identifier ON rm.identified_by = identifier.id
            LEFT JOIN users owner_user ON rm.owner = owner_user.id
            LEFT JOIN projects p ON rm.project_id = p.id
            WHERE rm.id = ?
        `, [req.params.id]);
        const rows = Array.isArray(result) ? result : [];
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Risk not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching risk:', error);
        res.status(500).json({ error: 'Failed to fetch risk' });
    }
});

// Create new risk
router.post('/', async (req, res) => {
    try {
        const {
            risk_title,
            risk_category,
            risk_description,
            probability,
            impact,
            project_id,
            department,
            identified_by,
            identified_date,
            mitigation_strategy,
            contingency_plan,
            owner,
            review_date,
            cost_of_mitigation,
            potential_loss,
            notes
        } = req.body;

        // Generate risk number
        const risk_number = `RISK-${Date.now().toString().slice(-6)}`;

        const result = await db.execute(`
            INSERT INTO risk_management (
                risk_number, risk_title, risk_category, risk_description,
                probability, impact, project_id, department, identified_by,
                identified_date, mitigation_strategy, contingency_plan,
                owner, review_date, cost_of_mitigation, potential_loss, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            risk_number,
            risk_title,
            risk_category,
            risk_description,
            probability,
            impact,
            project_id || null,
            department || null,
            identified_by,
            identified_date,
            mitigation_strategy || null,
            contingency_plan || null,
            owner || null,
            review_date || null,
            cost_of_mitigation || null,
            potential_loss || null,
            notes || null
        ]);

        const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;
        res.status(201).json({ id: insertId, risk_number, message: 'Risk created successfully' });
    } catch (error) {
        console.error('Error creating risk:', error);
        res.status(500).json({ error: 'Failed to create risk' });
    }
});

// Update risk
router.put('/:id', async (req, res) => {
    try {
        const {
            risk_title,
            risk_category,
            risk_description,
            probability,
            impact,
            project_id,
            department,
            mitigation_strategy,
            contingency_plan,
            owner,
            review_date,
            status,
            likelihood_after_mitigation,
            impact_after_mitigation,
            cost_of_mitigation,
            potential_loss,
            notes
        } = req.body;

        await db.execute(`
            UPDATE risk_management SET
                risk_title = ?, risk_category = ?, risk_description = ?,
                probability = ?, impact = ?, project_id = ?, department = ?,
                mitigation_strategy = ?, contingency_plan = ?, owner = ?,
                review_date = ?, status = ?, likelihood_after_mitigation = ?,
                impact_after_mitigation = ?, cost_of_mitigation = ?,
                potential_loss = ?, notes = ?
            WHERE id = ?
        `, [
            risk_title,
            risk_category,
            risk_description,
            probability,
            impact,
            project_id || null,
            department || null,
            mitigation_strategy || null,
            contingency_plan || null,
            owner || null,
            review_date || null,
            status,
            likelihood_after_mitigation || null,
            impact_after_mitigation || null,
            cost_of_mitigation || null,
            potential_loss || null,
            notes || null,
            req.params.id
        ]);

        res.json({ message: 'Risk updated successfully' });
    } catch (error) {
        console.error('Error updating risk:', error);
        res.status(500).json({ error: 'Failed to update risk' });
    }
});

// Delete risk
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM risk_management WHERE id = ?', [req.params.id]);
        res.json({ message: 'Risk deleted successfully' });
    } catch (error) {
        console.error('Error deleting risk:', error);
        res.status(500).json({ error: 'Failed to delete risk' });
    }
});

// Start risk mitigation
router.put('/:id/mitigate', async (req, res) => {
    try {
        const { mitigation_strategy, contingency_plan, owner, cost_of_mitigation, notes } = req.body;

        await db.execute(`
            UPDATE risk_management SET
                status = 'In Progress',
                mitigation_strategy = ?,
                contingency_plan = ?,
                owner = ?,
                cost_of_mitigation = ?,
                notes = ?
            WHERE id = ?
        `, [
            mitigation_strategy || null,
            contingency_plan || null,
            owner || null,
            cost_of_mitigation || null,
            notes || null,
            req.params.id
        ]);

        res.json({ message: 'Risk mitigation started successfully' });
    } catch (error) {
        console.error('Error starting risk mitigation:', error);
        res.status(500).json({ error: 'Failed to start risk mitigation' });
    }
});

// Mark risk as mitigated
router.put('/:id/mitigated', async (req, res) => {
    try {
        const { likelihood_after_mitigation, impact_after_mitigation, notes } = req.body;

        await db.execute(`
            UPDATE risk_management SET
                status = 'Mitigated',
                likelihood_after_mitigation = ?,
                impact_after_mitigation = ?,
                notes = ?
            WHERE id = ?
        `, [
            likelihood_after_mitigation || null,
            impact_after_mitigation || null,
            notes || null,
            req.params.id
        ]);

        res.json({ message: 'Risk marked as mitigated successfully' });
    } catch (error) {
        console.error('Error marking risk as mitigated:', error);
        res.status(500).json({ error: 'Failed to mark risk as mitigated' });
    }
});

// Close risk
router.put('/:id/close', async (req, res) => {
    try {
        const { notes } = req.body;

        await db.execute(`
            UPDATE risk_management SET status = 'Closed', notes = ? WHERE id = ?
        `, [notes || null, req.params.id]);

        res.json({ message: 'Risk closed successfully' });
    } catch (error) {
        console.error('Error closing risk:', error);
        res.status(500).json({ error: 'Failed to close risk' });
    }
});

// Accept risk
router.put('/:id/accept', async (req, res) => {
    try {
        const { notes } = req.body;

        await db.execute(`
            UPDATE risk_management SET status = 'Accepted', notes = ? WHERE id = ?
        `, [notes || null, req.params.id]);

        res.json({ message: 'Risk accepted successfully' });
    } catch (error) {
        console.error('Error accepting risk:', error);
        res.status(500).json({ error: 'Failed to accept risk' });
    }
});

// Schedule risk review
router.put('/:id/review', async (req, res) => {
    try {
        const { review_date, notes } = req.body;

        await db.execute(`
            UPDATE risk_management SET review_date = ?, notes = ? WHERE id = ?
        `, [review_date, notes || null, req.params.id]);

        res.json({ message: 'Risk review scheduled successfully' });
    } catch (error) {
        console.error('Error scheduling risk review:', error);
        res.status(500).json({ error: 'Failed to schedule risk review' });
    }
});

module.exports = router;