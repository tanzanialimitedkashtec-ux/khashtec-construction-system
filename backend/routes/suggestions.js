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

// Get suggestions by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;

        const [suggestions] = await db.execute(`
            SELECT s.*, u.full_name as submitted_by_name
            FROM suggestions s
            LEFT JOIN users u ON s.submitted_by = u.id
            WHERE s.category = ?
            ORDER BY s.submitted_date DESC
        `, [category]);

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error('Error fetching suggestions by category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch suggestions by category'
        });
    }
});

// Get suggestions by priority
router.get('/priority/:priority', async (req, res) => {
    try {
        const { priority } = req.params;

        const [suggestions] = await db.execute(`
            SELECT s.*, u.full_name as submitted_by_name
            FROM suggestions s
            LEFT JOIN users u ON s.submitted_by = u.id
            WHERE s.priority = ?
            ORDER BY s.submitted_date DESC
        `, [priority]);

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error('Error fetching suggestions by priority:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch suggestions by priority'
        });
    }
});

// Get suggestions by status
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;

        const [suggestions] = await db.execute(`
            SELECT s.*, u.full_name as submitted_by_name, r.full_name as reviewed_by_name
            FROM suggestions s
            LEFT JOIN users u ON s.submitted_by = u.id
            LEFT JOIN users r ON s.reviewed_by = r.id
            WHERE s.status = ?
            ORDER BY s.submitted_date DESC
        `, [status]);

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error('Error fetching suggestions by status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch suggestions by status'
        });
    }
});

// Get suggestions summary
router.get('/summary', async (req, res) => {
    try {
        const [summary] = await db.execute(`
            SELECT 
                COUNT(*) as total_suggestions,
                COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'Reviewed' THEN 1 END) as reviewed_count,
                COUNT(CASE WHEN status = 'Implemented' THEN 1 END) as implemented_count,
                COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_count,
                COUNT(CASE WHEN priority = 'High' THEN 1 END) as high_priority_count,
                COUNT(CASE WHEN priority = 'Medium' THEN 1 END) as medium_priority_count,
                COUNT(CASE WHEN priority = 'Low' THEN 1 END) as low_priority_count,
                COUNT(DISTINCT category) as unique_categories,
                COUNT(DISTINCT submitted_by) as unique_contributors
            FROM suggestions
        `);

        res.json({
            success: true,
            data: summary[0]
        });
    } catch (error) {
        console.error('Error fetching suggestions summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch suggestions summary'
        });
    }
});

// Add comment to suggestion
router.post('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, commentedBy, commentedByRole } = req.body;

        if (!comment || !commentedBy || !commentedByRole) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: comment, commentedBy, commentedByRole'
            });
        }

        // Get user ID from role name
        const [userRows] = await db.execute(
            'SELECT id FROM users WHERE role = ? LIMIT 1',
            [commentedByRole]
        );

        if (userRows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user role'
            });
        }

        const userId = userRows[0].id;

        // Add comment to suggestion comments table
        const [result] = await db.execute(`
            INSERT INTO suggestion_comments (suggestion_id, comment, commented_by, commented_by_role, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `, [id, comment, userId, commentedByRole]);

        // Get the created comment
        const [newComment] = await db.execute(`
            SELECT sc.*, u.full_name as commented_by_name
            FROM suggestion_comments sc
            LEFT JOIN users u ON sc.commented_by = u.id
            WHERE sc.id = ?
        `, [result.insertId]);

        // Create notification for suggestion submitter
        const [suggestion] = await db.execute('SELECT submitted_by FROM suggestions WHERE id = ?', [id]);
        if (suggestion.length > 0) {
            await db.execute(`
                INSERT INTO notifications (title, message, type, priority, recipient_id, created_at)
                VALUES (?, ?, 'info', 'Medium', ?, NOW())
            `, [
                'New Comment on Your Suggestion',
                `A new comment was added to your suggestion`,
                suggestion[0].submitted_by
            ]);
        }

        res.json({
            success: true,
            data: newComment[0]
        });
    } catch (error) {
        console.error('Error adding comment to suggestion:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add comment to suggestion'
        });
    }
});

// Get suggestion comments
router.get('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;

        const [comments] = await db.execute(`
            SELECT sc.*, u.full_name as commented_by_name
            FROM suggestion_comments sc
            LEFT JOIN users u ON sc.commented_by = u.id
            WHERE sc.suggestion_id = ?
            ORDER BY sc.created_at ASC
        `, [id]);

        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('Error fetching suggestion comments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch suggestion comments'
        });
    }
});

// Vote on suggestion
router.post('/:id/vote', async (req, res) => {
    try {
        const { id } = req.params;
        const { voteType, votedBy, votedByRole } = req.body;

        if (!['up', 'down'].includes(voteType) || !votedBy || !votedByRole) {
            return res.status(400).json({
                success: false,
                error: 'Invalid vote type or missing required fields'
            });
        }

        // Get user ID from role name
        const [userRows] = await db.execute(
            'SELECT id FROM users WHERE role = ? LIMIT 1',
            [votedByRole]
        );

        if (userRows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user role'
            });
        }

        const userId = userRows[0].id;

        // Check if user already voted
        const [existingVote] = await db.execute(
            'SELECT id FROM suggestion_votes WHERE suggestion_id = ? AND voted_by = ?',
            [id, userId]
        );

        if (existingVote.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'You have already voted on this suggestion'
            });
        }

        // Add vote
        const [result] = await db.execute(`
            INSERT INTO suggestion_votes (suggestion_id, vote_type, voted_by, voted_by_role, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `, [id, voteType, userId, votedByRole]);

        // Update suggestion vote counts
        if (voteType === 'up') {
            await db.execute('UPDATE suggestions SET up_votes = up_votes + 1 WHERE id = ?', [id]);
        } else {
            await db.execute('UPDATE suggestions SET down_votes = down_votes + 1 WHERE id = ?', [id]);
        }

        res.json({
            success: true,
            message: 'Vote recorded successfully'
        });
    } catch (error) {
        console.error('Error voting on suggestion:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to vote on suggestion'
        });
    }
});

// Get suggestion votes
router.get('/:id/votes', async (req, res) => {
    try {
        const { id } = req.params;

        const [votes] = await db.execute(`
            SELECT sv.*, u.full_name as voted_by_name
            FROM suggestion_votes sv
            LEFT JOIN users u ON sv.voted_by = u.id
            WHERE sv.suggestion_id = ?
            ORDER BY sv.created_at DESC
        `, [id]);

        res.json({
            success: true,
            data: votes
        });
    } catch (error) {
        console.error('Error fetching suggestion votes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch suggestion votes'
        });
    }
});

module.exports = router;
