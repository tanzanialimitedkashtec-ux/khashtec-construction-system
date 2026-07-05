import sys
import re

filename = r"c:\Users\USER\Downloads\consultion system\backend\routes\auth.js"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

new_routes = """
// ==========================================
// ACCESS MANAGEMENT (Users Table) ENDPOINTS
// ==========================================

// Get all users
router.get('/users', async (req, res) => {
    try {
        const db = require('../../database/config/database');
        const users = await db.execute(
            'SELECT id, email, role, department_name, manager_name, status, last_login, created_at FROM authentication ORDER BY id DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

// Create new user
router.post('/users', async (req, res) => {
    try {
        const { email, password, role, department_name, manager_name, status } = req.body;
        
        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role are required' });
        }

        const db = require('../../database/config/database');
        
        // Check if email already exists
        const existing = await db.execute('SELECT id FROM authentication WHERE email = ?', [email]);
        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'A user with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        const result = await db.execute(
            `INSERT INTO authentication (email, password_hash, role, department_name, manager_name, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [email, hashedPassword, role, department_name || null, manager_name || null, status || 'Active']
        );
        
        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
});

// Update user
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, password, role, department_name, manager_name, status } = req.body;
        
        if (!email || !role) {
            return res.status(400).json({ error: 'Email and role are required' });
        }

        const db = require('../../database/config/database');
        
        // Check if email belongs to another user
        const existing = await db.execute('SELECT id FROM authentication WHERE email = ? AND id != ?', [email, id]);
        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'This email is already in use by another account' });
        }

        let query = `UPDATE authentication SET email = ?, role = ?, department_name = ?, manager_name = ?, status = ?`;
        let params = [email, role, department_name || null, manager_name || null, status || 'Active'];

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 12);
            query += `, password_hash = ?`;
            params.push(hashedPassword);
        }

        query += ` WHERE id = ?`;
        params.push(id);

        await db.execute(query, params);
        
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
});

// Delete user (we will just mark as Inactive for safety)
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = require('../../database/config/database');
        
        await db.execute('UPDATE authentication SET status = ? WHERE id = ?', ['Inactive', id]);
        
        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Error deactivating user:', error);
        res.status(500).json({ error: 'Failed to deactivate user', details: error.message });
    }
});

module.exports = router;
"""

content = content.replace("module.exports = router;", new_routes)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("Backend routes updated.")
