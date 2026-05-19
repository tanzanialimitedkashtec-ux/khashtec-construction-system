const express = require('express');
const router = express.Router();

let db;
try {
    db = require('../../database/config/database');
    console.log('✅ Departments database connection loaded successfully');
} catch (error) {
    console.error('❌ Departments database connection failed:', error);
}

// Health/test endpoint
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Departments API is working', timestamp: new Date().toISOString() });
});

// Utility: check if a table exists in current database
async function tableExists(tableName){
    try{
        if(!db) return false;
        const q = `SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1`;
        const rows = await db.execute(q, [tableName]);
        const r = Array.isArray(rows) ? rows[0] : rows;
        return Array.isArray(r) ? r.length > 0 : !!r;
    }catch(e){
        return false;
    }
}

// Get all departments (prefer departments table, fallback to office_portal)
router.get(['/','/all'], async (req, res) => {
    try {
        if (!db) {
            // Fallback mock when DB not available
            return res.json([
                {
                    id: 1,
                    name: 'Human Resources',
                    code: 'HR',
                    manager_email: 'hr@manager0501',
                    description: 'HR Department manages employee relations, recruitment, training, and compliance',
                    status: 'Active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    mock: true
                }
            ]);
        }
        let useDepartments = await tableExists('departments');
        let result;
        if(useDepartments){
            const q = `
                SELECT id, name, code, manager_email, description, status, created_at, updated_at
                FROM departments
                ORDER BY created_at DESC
            `;
            result = await db.execute(q);
        } else {
            const q = `
                SELECT 
                    id,
                    department_name AS name,
                    department_code AS code,
                    manager_email,
                    description,
                    status,
                    created_at,
                    updated_at
                FROM office_portal
                ORDER BY created_at DESC
            `;
            result = await db.execute(q);
        }
        const rows = Array.isArray(result) ? result[0] : result;
        return res.json(rows);
    } catch (error) {
        console.error('❌ Error fetching departments:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch departments', details: error.message });
    }
});

// Create a new department
router.post('/', async (req, res) => {
    try {
        const { name, code, managerEmail, description, status } = req.body || {};

        if (!name || !code) {
            return res.status(400).json({ success: false, error: 'Missing required fields', details: 'name and code are required' });
        }

        const statusMap = {
            active: 'Active',
            inactive: 'Inactive',
            maintenance: 'Maintenance'
        };
        const mappedStatus = status ? (statusMap[String(status).toLowerCase()] || 'Active') : 'Active';

        if (!db) {
            // Fallback mock create
            return res.status(201).json({
                success: true,
                message: 'Department created (mock) successfully',
                id: `DEPT${Date.now().toString().slice(-6)}`,
                data: { name, code, manager_email: managerEmail || null, description: description || null, status: mappedStatus, mock: true }
            });
        }

        try {
            // Ensure departments table exists (idempotent)
            await db.execute(`
                CREATE TABLE IF NOT EXISTS departments (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  name VARCHAR(255) NOT NULL,
                  code VARCHAR(50) UNIQUE NOT NULL,
                  manager_email VARCHAR(255),
                  description TEXT,
                  status ENUM('Active','Inactive','Maintenance') DEFAULT 'Active',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_code (code),
                  INDEX idx_status (status)
                )
            `);

            // Insert into departments
            const insert = `
                INSERT INTO departments (name, code, manager_email, description, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            `;
            const values = [name, code, managerEmail || null, description || null, mappedStatus];
            const result = await db.execute(insert, values);
            const rows = Array.isArray(result) ? result[0] : result;

            return res.status(201).json({
                success: true,
                message: 'Department created successfully',
                id: rows.insertId,
                data: { id: rows.insertId, name, code, manager_email: managerEmail || null, description: description || null, status: mappedStatus }
            });
        } catch (primaryError) {
            console.warn('⚠️ Falling back to office_portal for department insert:', primaryError.message);
            // Ensure office_portal exists and insert there as fallback
            await db.execute(`
                CREATE TABLE IF NOT EXISTS office_portal (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  department_name VARCHAR(255) NOT NULL,
                  department_code VARCHAR(50) UNIQUE NOT NULL,
                  manager_email VARCHAR(255),
                  description TEXT,
                  settings JSON,
                  status ENUM('Active', 'Inactive', 'Maintenance') DEFAULT 'Active',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_department_code (department_code),
                  INDEX idx_status (status)
                )
            `);

            const insert2 = `
                INSERT INTO office_portal (department_name, department_code, manager_email, description, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            `;
            const values2 = [name, code, managerEmail || null, description || null, mappedStatus];
            const result2 = await db.execute(insert2, values2);
            const rows2 = Array.isArray(result2) ? result2[0] : result2;

            return res.status(201).json({
                success: true,
                message: 'Department created successfully',
                id: rows2.insertId,
                data: { id: rows2.insertId, name, code, manager_email: managerEmail || null, description: description || null, status: mappedStatus }
            });
        }
    } catch (error) {
        if (error && (error.code === 'ER_DUP_ENTRY' || String(error.message).includes('Duplicate'))) {
            return res.status(409).json({ success: false, error: 'Department code already exists' });
        }
        console.error('❌ Error creating department:', error);
        return res.status(500).json({ success: false, error: 'Failed to create department', details: error.message });
    }
});

module.exports = router;
