const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all promotions
router.get('/', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT p.*, e.employee_id, ed.full_name,
                   recommender.name as recommender_name,
                   approver.name as approver_name
            FROM promotions p 
            LEFT JOIN employees e ON p.employee_id = e.id 
            LEFT JOIN employee_details ed ON e.id = ed.employee_id 
            LEFT JOIN users recommender ON p.recommended_by = recommender.id
            LEFT JOIN users approver ON p.approved_by = approver.id
            ORDER BY p.recommendation_date DESC
        `);
        const promotions = Array.isArray(result) ? result[0] : result;
        res.json(promotions);
    } catch (error) {
        console.error('Error fetching promotions:', error);
        res.status(500).json({ error: 'Failed to fetch promotions' });
    }
});

// Get single promotion by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT p.*, e.employee_id, ed.full_name,
                   recommender.name as recommender_name,
                   approver.name as approver_name
            FROM promotions p 
            LEFT JOIN employees e ON p.employee_id = e.id 
            LEFT JOIN employee_details ed ON e.id = ed.employee_id 
            LEFT JOIN users recommender ON p.recommended_by = recommender.id
            LEFT JOIN users approver ON p.approved_by = approver.id
            WHERE p.id = ?
        `, [req.params.id]);
        const promotion = Array.isArray(result) ? result[0] : result;
        if (promotion.length === 0) {
            return res.status(404).json({ error: 'Promotion not found' });
        }
        res.json(promotion[0]);
    } catch (error) {
        console.error('Error fetching promotion:', error);
        res.status(500).json({ error: 'Failed to fetch promotion' });
    }
});

// Create new promotion
router.post('/', async (req, res) => {
    try {
        const {
            employee_id,
            current_position,
            current_department,
            current_salary,
            new_position,
            new_department,
            new_salary,
            promotion_type,
            effective_date,
            reason,
            performance_rating,
            recommended_by,
            recommendation_date,
            benefits_change,
            responsibilities_change,
            notes
        } = req.body;

        // Generate promotion number
        const promotion_number = `PROM-${Date.now().toString().slice(-6)}`;

        const result = await db.execute(`
            INSERT INTO promotions (
                promotion_number, employee_id, current_position, current_department,
                current_salary, new_position, new_department, new_salary,
                promotion_type, effective_date, reason, performance_rating,
                recommended_by, recommendation_date, benefits_change,
                responsibilities_change, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            promotion_number,
            employee_id,
            current_position,
            current_department,
            current_salary || null,
            new_position,
            new_department || null,
            new_salary || null,
            promotion_type,
            effective_date,
            reason,
            performance_rating || null,
            recommended_by,
            recommendation_date,
            benefits_change || null,
            responsibilities_change || null,
            notes || null
        ]);

        const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;
        res.status(201).json({ id: insertId, promotion_number, message: 'Promotion created successfully' });
    } catch (error) {
        console.error('Error creating promotion:', error);
        res.status(500).json({ error: 'Failed to create promotion' });
    }
});

// Update promotion
router.put('/:id', async (req, res) => {
    try {
        const {
            employee_id,
            current_position,
            current_department,
            current_salary,
            new_position,
            new_department,
            new_salary,
            promotion_type,
            effective_date,
            reason,
            performance_rating,
            approved_by,
            approval_date,
            status,
            benefits_change,
            responsibilities_change,
            notes
        } = req.body;

        await db.execute(`
            UPDATE promotions SET
                employee_id = ?, current_position = ?, current_department = ?,
                current_salary = ?, new_position = ?, new_department = ?,
                new_salary = ?, promotion_type = ?, effective_date = ?,
                reason = ?, performance_rating = ?, approved_by = ?,
                approval_date = ?, status = ?, benefits_change = ?,
                responsibilities_change = ?, notes = ?
            WHERE id = ?
        `, [
            employee_id,
            current_position,
            current_department,
            current_salary || null,
            new_position,
            new_department || null,
            new_salary || null,
            promotion_type,
            effective_date,
            reason,
            performance_rating || null,
            approved_by || null,
            approval_date || null,
            status,
            benefits_change || null,
            responsibilities_change || null,
            notes || null,
            req.params.id
        ]);

        res.json({ message: 'Promotion updated successfully' });
    } catch (error) {
        console.error('Error updating promotion:', error);
        res.status(500).json({ error: 'Failed to update promotion' });
    }
});

// Delete promotion
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM promotions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Promotion deleted successfully' });
    } catch (error) {
        console.error('Error deleting promotion:', error);
        res.status(500).json({ error: 'Failed to delete promotion' });
    }
});

// Approve promotion
router.put('/:id/approve', async (req, res) => {
    try {
        const { approved_by, notes } = req.body;
        const approval_date = new Date().toISOString().split('T')[0];

        await db.execute(`
            UPDATE promotions SET
                status = 'Approved',
                approved_by = ?,
                approval_date = ?,
                notes = ?
            WHERE id = ?
        `, [approved_by, approval_date, notes || null, req.params.id]);

        res.json({ message: 'Promotion approved successfully' });
    } catch (error) {
        console.error('Error approving promotion:', error);
        res.status(500).json({ error: 'Failed to approve promotion' });
    }
});

// Reject promotion
router.put('/:id/reject', async (req, res) => {
    try {
        const { approved_by, notes } = req.body;
        const approval_date = new Date().toISOString().split('T')[0];

        await db.execute(`
            UPDATE promotions SET
                status = 'Rejected',
                approved_by = ?,
                approval_date = ?,
                notes = ?
            WHERE id = ?
        `, [approved_by, approval_date, notes || null, req.params.id]);

        res.json({ message: 'Promotion rejected successfully' });
    } catch (error) {
        console.error('Error rejecting promotion:', error);
        res.status(500).json({ error: 'Failed to reject promotion' });
    }
});

// Implement promotion
router.put('/:id/implement', async (req, res) => {
    try {
        const { notes } = req.body;

        // Get promotion details
        const promotionResult = await db.execute('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
        const promotion = Array.isArray(promotionResult) ? promotionResult[0] : promotionResult;
        
        if (promotion.length === 0) {
            return res.status(404).json({ error: 'Promotion not found' });
        }

        const promo = promotion[0];

        // Update employee record
        await db.execute(`
            UPDATE employees SET
                position = ?,
                department = ?,
                salary = ?
            WHERE id = ?
        `, [promo.new_position, promo.new_department || promo.current_department, promo.new_salary, promo.employee_id]);

        // Update promotion status
        await db.execute(`
            UPDATE promotions SET status = 'Implemented', notes = ? WHERE id = ?
        `, [notes || null, req.params.id]);

        res.json({ message: 'Promotion implemented successfully' });
    } catch (error) {
        console.error('Error implementing promotion:', error);
        res.status(500).json({ error: 'Failed to implement promotion' });
    }
});

module.exports = router;