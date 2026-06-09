const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

console.log('🚀 Financial Strategies routes loaded');

async function ensureFinancialStrategiesTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS financial_strategies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT NULL,
                units INT DEFAULT 0,
                revenue_strategy VARCHAR(50) NULL,
                target_selling_price_per_unit DECIMAL(15,2) NULL,
                expected_monthly_rent_per_unit DECIMAL(15,2) NULL,
                target_occupancy_percent DECIMAL(5,2) NULL,
                land_acquisition_cost DECIMAL(15,2) DEFAULT 0,
                estimated_construction_cost DECIMAL(15,2) DEFAULT 0,
                permits_fees DECIMAL(15,2) DEFAULT 0,
                legal_fees DECIMAL(15,2) DEFAULT 0,
                architecture_fees DECIMAL(15,2) DEFAULT 0,
                contingency_reserve_percent DECIMAL(5,2) DEFAULT 0,
                developer_equity DECIMAL(15,2) DEFAULT 0,
                bank_loan_amount DECIMAL(15,2) DEFAULT 0,
                annual_interest_rate DECIMAL(5,2) DEFAULT 0,
                loan_repayment_period_years INT DEFAULT 0,
                grace_period_months INT DEFAULT 0,
                operating_expenses_percent DECIMAL(5,2) DEFAULT 30,
                target_roi_percent DECIMAL(5,2) DEFAULT 0,
                target_irr_percent DECIMAL(5,2) DEFAULT 0,
                min_dscr DECIMAL(5,2) DEFAULT 0,
                created_by VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_project_id (project_id)
            )
        `);
    } catch (e) {
        console.warn('Could not ensure financial_strategies table:', e && e.message);
    }
}

// Test route
router.get('/test', async (req, res) => {
    await ensureFinancialStrategiesTable();
    res.json({ success: true, message: 'Financial strategies route OK' });
});

// List all financial strategies
router.get('/', async (req, res) => {
    try {
        await ensureFinancialStrategiesTable();
        const rows = await db.execute(`
            SELECT fs.*, p.name as project_name
            FROM financial_strategies fs
            LEFT JOIN projects p ON p.id = fs.project_id
            ORDER BY fs.created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (e) {
        console.error('Error listing financial strategies:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// Get strategies by project
router.get('/project/:projectId', async (req, res) => {
    try {
        await ensureFinancialStrategiesTable();
        const rows = await db.execute('SELECT * FROM financial_strategies WHERE project_id = ? ORDER BY created_at DESC', [req.params.projectId]);
        res.json({ success: true, data: rows });
    } catch (e) {
        console.error('Error fetching strategies for project:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// Get single strategy
router.get('/:id', async (req, res) => {
    try {
        await ensureFinancialStrategiesTable();
        const rows = await db.execute('SELECT * FROM financial_strategies WHERE id = ?', [req.params.id]);
        if (!rows || rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
        res.json({ success: true, data: rows[0] });
    } catch (e) {
        console.error('Error fetching financial strategy:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// Create strategy
router.post('/', async (req, res) => {
    try {
        await ensureFinancialStrategiesTable();
        const p = req.body || {};
        console.log('📥 Received financial strategy create request:', JSON.stringify(p).substring(0, 1000));
        const result = await db.execute(`
            INSERT INTO financial_strategies
            (project_id, units, revenue_strategy, target_selling_price_per_unit, expected_monthly_rent_per_unit,
             target_occupancy_percent, land_acquisition_cost, estimated_construction_cost, permits_fees, legal_fees,
             architecture_fees, contingency_reserve_percent, developer_equity, bank_loan_amount, annual_interest_rate,
             loan_repayment_period_years, grace_period_months, operating_expenses_percent, target_roi_percent,
             target_irr_percent, min_dscr, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            p.project_id || null,
            p.units || 0,
            p.revenue_strategy || null,
            p.target_selling_price_per_unit || 0,
            p.expected_monthly_rent_per_unit || 0,
            p.target_occupancy_percent || 0,
            p.land_acquisition_cost || 0,
            p.estimated_construction_cost || 0,
            p.permits_fees || 0,
            p.legal_fees || 0,
            p.architecture_fees || 0,
            p.contingency_reserve_percent || 0,
            p.developer_equity || 0,
            p.bank_loan_amount || 0,
            p.annual_interest_rate || 0,
            p.loan_repayment_period_years || 0,
            p.grace_period_months || 0,
            p.operating_expenses_percent || 30,
            p.target_roi_percent || 0,
            p.target_irr_percent || 0,
            p.min_dscr || 0,
            p.created_by || null
        ]);
        console.log('✅ Financial strategy created with id:', result.insertId);
        res.status(201).json({ success: true, id: result.insertId });
    } catch (e) {
        console.error('Error creating financial strategy:', e && (e.stack || e.message || e));
        res.status(500).json({ success: false, error: e.message });
    }
});

// Update strategy
router.put('/:id', async (req, res) => {
    try {
        await ensureFinancialStrategiesTable();
        const id = req.params.id;
        const updates = req.body || {};
        const fields = [];
        const values = [];
        for (const k of Object.keys(updates)) {
            fields.push(`${k} = ?`);
            values.push(updates[k]);
        }
        if (fields.length === 0) return res.status(400).json({ success: false, error: 'No updates provided' });
        values.push(id);
        const sql = `UPDATE financial_strategies SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await db.execute(sql, values);
        res.json({ success: true, id });
    } catch (e) {
        console.error('Error updating financial strategy:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
