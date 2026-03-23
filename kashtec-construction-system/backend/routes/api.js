const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await db.execute('SELECT id, name, email, role, department, status FROM users');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all projects
router.get('/projects', async (req, res) => {
    try {
        const projects = await db.execute(`
            SELECT p.*, u.name as manager_name 
            FROM projects p 
            LEFT JOIN users u ON p.manager_id = u.id
        `);
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all employees
router.get('/employees', async (req, res) => {
    try {
        const employees = await db.execute(`
            SELECT e.*, u.name, u.email, u.phone 
            FROM employees e 
            LEFT JOIN users u ON e.user_id = u.id
        `);
        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all properties
router.get('/properties', async (req, res) => {
    try {
        const properties = await db.execute(`
            SELECT p.*, u.name as agent_name 
            FROM properties p 
            LEFT JOIN users u ON p.agent_id = u.id
        `);
        res.json({ success: true, data: properties });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get financial transactions
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await db.execute(`
            SELECT ft.*, u1.name as created_by_name, u2.name as approved_by_name 
            FROM financial_transactions ft 
            LEFT JOIN users u1 ON ft.created_by = u1.id 
            LEFT JOIN users u2 ON ft.approved_by = u2.id
            ORDER BY ft.date DESC
        `);
        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get HSE incidents
router.get('/incidents', async (req, res) => {
    try {
        const incidents = await db.execute(`
            SELECT hi.*, u.name as reported_by_name, p.name as project_name 
            FROM hse_incidents hi 
            LEFT JOIN users u ON hi.reported_by = u.id 
            LEFT JOIN projects p ON hi.project_id = p.id
            ORDER BY hi.incident_date DESC
        `);
        res.json({ success: true, data: incidents });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add new user
router.post('/users', async (req, res) => {
    try {
        const { name, email, phone, location, role, department, password } = req.body;
        
        // Check if user exists
        const existing = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }
        
        const result = await db.execute(`
            INSERT INTO users (name, email, phone, location, role, department, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [name, email, phone, location, role, department, password]);
        
        res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add new project
router.post('/projects', async (req, res) => {
    try {
        const { name, description, location, start_date, end_date, budget, manager_id } = req.body;
        
        const result = await db.execute(`
            INSERT INTO projects (name, description, location, start_date, end_date, budget, manager_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [name, description, location, start_date, end_date, budget, manager_id]);
        
        res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update project status
router.put('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, actual_cost } = req.body;
        
        await db.execute(`
            UPDATE projects SET status = ?, actual_cost = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [status, actual_cost, id]);
        
        res.json({ success: true, message: 'Project updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add financial transaction
router.post('/transactions', async (req, res) => {
    try {
        const { type, category, description, amount, date, created_by } = req.body;
        
        const result = await db.execute(`
            INSERT INTO financial_transactions (type, category, description, amount, date, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [type, category, description, amount, date, created_by]);
        
        res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        const [userCount, projectCount, propertyCount, transactionSum] = await Promise.all([
            db.execute('SELECT COUNT(*) as count FROM users'),
            db.execute('SELECT COUNT(*) as count FROM projects'),
            db.execute('SELECT COUNT(*) as count FROM properties'),
            db.execute('SELECT SUM(amount) as total FROM financial_transactions WHERE type = "Income"')
        ]);
        
        res.json({
            success: true,
            data: {
                users: userCount[0].count,
                projects: projectCount[0].count,
                properties: propertyCount[0].count,
                total_income: transactionSum[0].total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
