const notify = require('../utils/notify');
const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// GET all financial strategies
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM financial_strategies ORDER BY created_at DESC';
        const records = await db.query(query);
        res.json({ success: true, data: records });
    } catch (error) {
        console.error('Error fetching financial strategies:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch financial strategies' });
    }
});

// POST new financial strategy
router.post('/', async (req, res) => {
    try {
        const body = req.body;
        console.log('📥 Financial strategy POST body:', JSON.stringify(body));

        const project_id = body.project_id || null;
        const project_name = body.project_name || '';
        const land_acquisition_cost = parseFloat(body.land_acquisition_cost) || 0;
        const estimated_construction_cost = parseFloat(body.estimated_construction_cost) || 0;
        const permits_fees = parseFloat(body.permits_fees) || 0;
        const contingency_reserve_percent = parseFloat(body.contingency_reserve_percent) || 0;
        const developer_equity = parseFloat(body.developer_equity) || 0;
        const bank_loan_amount = parseFloat(body.bank_loan_amount) || 0;
        const annual_interest_rate = parseFloat(body.annual_interest_rate) || 0;
        const loan_repayment_period_years = parseInt(body.loan_repayment_period_years) || 0;
        const grace_period_months = parseInt(body.grace_period_months) || 0;
        const revenue_strategy = body.revenue_strategy || 'build_to_sell';
        const target_selling_price_per_unit = parseFloat(body.target_selling_price_per_unit) || 0;
        const expected_monthly_rent_per_unit = parseFloat(body.expected_monthly_rent_per_unit) || 0;
        const target_occupancy_percent = parseFloat(body.target_occupancy_percent) || 0;
        const target_roi_percent = parseFloat(body.target_roi_percent) || 0;
        const target_irr_percent = parseFloat(body.target_irr_percent) || 0;
        const minimum_dscr = parseFloat(body.minimum_dscr) || 0;

        const query = `
            INSERT INTO financial_strategies (
                project_id, project_name, land_acquisition_cost, estimated_construction_cost, permits_fees,
                contingency_reserve_percent, developer_equity, bank_loan_amount, annual_interest_rate,
                loan_repayment_period_years, grace_period_months, revenue_strategy, target_selling_price_per_unit,
                expected_monthly_rent_per_unit, target_occupancy_percent, target_roi_percent, target_irr_percent, minimum_dscr
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            project_id,
            project_name,
            land_acquisition_cost,
            estimated_construction_cost,
            permits_fees,
            contingency_reserve_percent,
            developer_equity,
            bank_loan_amount,
            annual_interest_rate,
            loan_repayment_period_years,
            grace_period_months,
            revenue_strategy,
            target_selling_price_per_unit,
            expected_monthly_rent_per_unit,
            target_occupancy_percent,
            target_roi_percent,
            target_irr_percent,
            minimum_dscr
        ];

        console.log('📤 Financial strategy params:', params);

        const result = await db.query(query, params);
        console.log('✅ Financial strategy insert result:', result);
        res.status(201).json({ success: true, notify('Financial Strategy', 'New financial strategy: ' + (req.body.title || req.body.name || 'Strategy') + ' - ' + (req.body.description || '').substring(0, 80), 'info', 'MD', 'Director of Administration');
        message: 'Financial strategy created successfully', id: result.insertId });
    } catch (error) {
        console.error('❌ Error creating financial strategy:', error.message);
        console.error('❌ Full error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to create financial strategy' });
    }
});

module.exports = router;
