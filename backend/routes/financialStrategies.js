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
        const {
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
        } = req.body;

        const query = `
            INSERT INTO financial_strategies (
                project_id, project_name, land_acquisition_cost, estimated_construction_cost, permits_fees,
                contingency_reserve_percent, developer_equity, bank_loan_amount, annual_interest_rate,
                loan_repayment_period_years, grace_period_months, revenue_strategy, target_selling_price_per_unit,
                expected_monthly_rent_per_unit, target_occupancy_percent, target_roi_percent, target_irr_percent, minimum_dscr
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            project_id || null,
            project_name || '',
            land_acquisition_cost || 0,
            estimated_construction_cost || 0,
            permits_fees || 0,
            contingency_reserve_percent || 0,
            developer_equity || 0,
            bank_loan_amount || 0,
            annual_interest_rate || 0,
            loan_repayment_period_years || 0,
            grace_period_months || 0,
            revenue_strategy || 'build_to_sell',
            target_selling_price_per_unit || 0,
            expected_monthly_rent_per_unit || 0,
            target_occupancy_percent || 0,
            target_roi_percent || 0,
            target_irr_percent || 0,
            minimum_dscr || 0
        ];

        const result = await db.query(query, params);
        res.status(201).json({ success: true, message: 'Financial strategy created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating financial strategy:', error);
        res.status(500).json({ success: false, error: 'Failed to create financial strategy' });
    }
});

module.exports = router;
