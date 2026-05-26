const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

function asArray(rows) {
    if (!rows) return [];
    if (Array.isArray(rows)) return rows;
    return [rows];
}

// Ensure required columns exist (runs once on first request)
let columnsChecked = false;
async function ensureColumns() {
    if (columnsChecked) return;
    try {
        const cols = asArray(await db.execute('DESCRIBE suggestions'));
        const names = cols.map(c => c.Field);

        if (!names.includes('department')) {
            await db.execute("ALTER TABLE suggestions ADD COLUMN department VARCHAR(100) DEFAULT NULL");
        }
        if (!names.includes('submitted_by_name')) {
            await db.execute("ALTER TABLE suggestions ADD COLUMN submitted_by_name VARCHAR(255) DEFAULT NULL");
        }
        if (!names.includes('reviewed_by')) {
            await db.execute("ALTER TABLE suggestions ADD COLUMN reviewed_by INT DEFAULT NULL");
        }
        if (!names.includes('reviewed_date')) {
            await db.execute("ALTER TABLE suggestions ADD COLUMN reviewed_date TIMESTAMP NULL DEFAULT NULL");
        }
        if (!names.includes('rejection_reason')) {
            await db.execute("ALTER TABLE suggestions ADD COLUMN rejection_reason TEXT DEFAULT NULL");
        }
        columnsChecked = true;
    } catch (err) {
        console.warn('suggestionsView: ensureColumns warning:', err.message);
        columnsChecked = true;
    }
}

// GET / — list all suggestions (for view table)
router.get('/', async (req, res) => {
    try {
        await ensureColumns();
        const rows = asArray(await db.execute(`
            SELECT s.*, u.name AS employee_name, r.name AS reviewer_name
            FROM suggestions s
            LEFT JOIN users u ON s.employee_id = u.id
            LEFT JOIN users r ON s.reviewed_by = r.id
            ORDER BY s.created_at DESC
        `));
        res.json(rows);
    } catch (error) {
        console.error('Error fetching suggestions view:', error.message);
        res.status(500).json({ error: 'Failed to fetch suggestions', details: error.message });
    }
});

// POST / — create a new suggestion (from the form)
router.post('/', async (req, res) => {
    try {
        await ensureColumns();
        const {
            title,
            category,
            description,
            submitted_by,
            department,
            priority,
            status
        } = req.body || {};

        if (!title || !description) {
            return res.status(400).json({ error: 'title and description are required' });
        }

        // Map user-friendly values to DB enum values
        const categoryMap = {
            'Process Improvement': 'process',
            'Safety': 'safety',
            'Cost Saving': 'cost-saving',
            'Technology': 'equipment',
            'HR Policy': 'other',
            'Other': 'other'
        };
        const priorityMap = {
            'Low': 'low',
            'Medium': 'medium',
            'High': 'high',
            'Critical': 'urgent'
        };
        const statusMap = {
            'Submitted': 'pending',
            'Under Review': 'under-review',
            'Approved': 'approved',
            'Rejected': 'rejected',
            'Implemented': 'implemented'
        };

        const dbCategory = categoryMap[category] || category || 'other';
        const dbPriority = priorityMap[priority] || priority || 'medium';
        const dbStatus = statusMap[status] || status || 'pending';

        // Try to find user by name
        let employeeId = null;
        if (submitted_by) {
            const users = asArray(await db.execute(
                'SELECT id FROM users WHERE name = ? LIMIT 1',
                [submitted_by]
            ));
            if (users.length > 0) employeeId = users[0].id;
        }
        // Fallback to first user
        if (!employeeId) {
            const fallback = asArray(await db.execute('SELECT id FROM users LIMIT 1'));
            employeeId = fallback.length > 0 ? fallback[0].id : 1;
        }

        const result = await db.execute(`
            INSERT INTO suggestions (
                employee_id, title, category, priority, description,
                status, department, submitted_by_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            employeeId,
            title,
            dbCategory,
            dbPriority,
            description,
            dbStatus,
            department || null,
            submitted_by || null
        ]);

        res.status(201).json({ id: result.insertId, message: 'Suggestion created successfully' });
    } catch (error) {
        console.error('Error creating suggestion:', error.message);
        res.status(500).json({ error: 'Failed to create suggestion', details: error.message });
    }
});

// PUT /:id/approve — MD approves a suggestion
router.put('/:id/approve', async (req, res) => {
    try {
        await ensureColumns();
        const { reviewed_by } = req.body || {};

        let reviewerId = null;
        if (reviewed_by) {
            const users = asArray(await db.execute(
                'SELECT id FROM users WHERE name = ? OR role = ? LIMIT 1',
                [reviewed_by, reviewed_by]
            ));
            if (users.length > 0) reviewerId = users[0].id;
        }

        await db.execute(`
            UPDATE suggestions
            SET status = 'approved', reviewed_by = ?, reviewed_date = NOW()
            WHERE id = ?
        `, [reviewerId, req.params.id]);

        res.json({ message: 'Suggestion approved successfully' });
    } catch (error) {
        console.error('Error approving suggestion:', error.message);
        res.status(500).json({ error: 'Failed to approve suggestion', details: error.message });
    }
});

// PUT /:id/reject — MD rejects a suggestion
router.put('/:id/reject', async (req, res) => {
    try {
        await ensureColumns();
        const { reviewed_by, rejection_reason } = req.body || {};

        let reviewerId = null;
        if (reviewed_by) {
            const users = asArray(await db.execute(
                'SELECT id FROM users WHERE name = ? OR role = ? LIMIT 1',
                [reviewed_by, reviewed_by]
            ));
            if (users.length > 0) reviewerId = users[0].id;
        }

        await db.execute(`
            UPDATE suggestions
            SET status = 'rejected', reviewed_by = ?, reviewed_date = NOW(), rejection_reason = ?
            WHERE id = ?
        `, [reviewerId, rejection_reason || null, req.params.id]);

        res.json({ message: 'Suggestion rejected successfully' });
    } catch (error) {
        console.error('Error rejecting suggestion:', error.message);
        res.status(500).json({ error: 'Failed to reject suggestion', details: error.message });
    }
});

module.exports = router;
