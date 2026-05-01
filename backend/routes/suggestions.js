const express = require('express');
const router = express.Router();
const db = require('../src/config/database');

// Get all suggestions
router.get('/', async (req, res) => {
    try {
        const [suggestions] = await db.execute(`
            SELECT s.*, u.full_name as submitted_by_name
            FROM suggestions s
            LEFT JOIN users u ON s.submitted_by = u.id
            ORDER BY s.submitted_date DESC
        `);
        
        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch suggestions'
        });
    }
});

// Create new suggestion
router.post('/', async (req, res) => {
    try {
        const {
            title,
            category,
            priority,
            description,
            impact,
            implementation,
            submittedBy,
            submittedByRole
        } = req.body;

        if (!title || !category || !priority || !description) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: title, category, priority, description'
            });
        }

        // Get user ID from role name
        const [userRows] = await db.execute(
            'SELECT id FROM users WHERE role = ? LIMIT 1',
            [submittedByRole]
        );

        if (userRows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user role'
            });
        }

        const userId = userRows[0].id;

        const [result] = await db.execute(`
            INSERT INTO suggestions (
                title, category, priority, description, impact, 
                implementation, submitted_by, submitted_by_role, 
                status, submitted_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
        `, [title, category, priority, description, impact, implementation, userId, submittedByRole]);

        // Get the created suggestion
        const [newSuggestion] = await db.execute(`
            SELECT s.*, u.full_name as submitted_by_name
            FROM suggestions s
            LEFT JOIN users u ON s.submitted_by = u.id
            WHERE s.id = ?
        `, [result.insertId]);

        // Create notification for MD
        await db.execute(`
            INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
            VALUES (?, ?, 'info', 'Medium', NULL, NOW())
        `, [
            'New Suggestion Submitted',
            `${submittedByRole} submitted a new suggestion: ${title}`
        ]);

        res.json({
            success: true,
            data: newSuggestion[0]
        });
    } catch (error) {
        console.error('Error creating suggestion:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create suggestion'
        });
    }
});

// Update suggestion status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reviewedBy, reviewedByRole, rejectionReason } = req.body;

        if (!['Pending', 'Reviewed', 'Implemented', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        // Get reviewer user ID
        const [reviewerRows] = await db.execute(
            'SELECT id FROM users WHERE role = ? LIMIT 1',
            [reviewedByRole]
        );

        if (reviewerRows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid reviewer role'
            });
        }

        const reviewerId = reviewerRows[0].id;

        // Update suggestion
        const [result] = await db.execute(`
            UPDATE suggestions 
            SET status = ?, reviewed_by = ?, reviewed_date = NOW(), rejection_reason = ?
            WHERE id = ?
        `, [status, reviewerId, rejectionReason || null, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Suggestion not found'
            });
        }

        // Get updated suggestion
        const [updatedSuggestion] = await db.execute(`
            SELECT s.*, u.full_name as submitted_by_name
            FROM suggestions s
            LEFT JOIN users u ON s.submitted_by = u.id
            WHERE s.id = ?
        `, [id]);

        // Create notification for the submitter
        const submitterId = updatedSuggestion[0].submitted_by;
        await db.execute(`
            INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
            VALUES (?, ?, 'info', 'Medium', ?, NOW())
        `, [
            `Suggestion ${status}`,
            `Your suggestion "${updatedSuggestion[0].title}" has been ${status.toLowerCase()}`
        ], [submitterId]);

        res.json({
            success: true,
            data: updatedSuggestion[0]
        });
    } catch (error) {
        console.error('Error updating suggestion:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update suggestion'
        });
    }
});

// Get suggestions by submitter
router.get('/my-suggestions/:role', async (req, res) => {
    try {
        const { role } = req.params;

        const [userRows] = await db.execute(
            'SELECT id FROM users WHERE role = ? LIMIT 1',
            [role]
        );

        if (userRows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user role'
            });
        }

        const userId = userRows[0].id;

        const [suggestions] = await db.execute(`
            SELECT * FROM suggestions 
            WHERE submitted_by = ? 
            ORDER BY submitted_date DESC
        `, [userId]);

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error('Error fetching user suggestions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch suggestions'
        });
    }
});

module.exports = router;
