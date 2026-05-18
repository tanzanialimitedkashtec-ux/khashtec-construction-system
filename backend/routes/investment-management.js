const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// ===== INVESTMENT MANAGEMENT =====

// POST - Create new investment record
router.post('/investment-management', async (req, res) => {
    console.log('📝 POST /api/investment-management accessed');
    console.log('📊 Request body:', req.body);

    const {
        investmentTitle,
        investmentType,
        assetClass = '',
        amount,
        currency = 'TZS',
        investmentDate,
        expectedReturn,
        riskLevel,
        status,
        maturityDate,
        allocationPercentage,
        counterparty = '',
        investmentObjective,
        notes = '',
        submittedBy = 'Finance Manager',
        submittedDate
    } = req.body;

    if (!investmentTitle || !investmentType || !amount || !currency || !investmentDate || !riskLevel || !status || !investmentObjective) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['investmentTitle', 'investmentType', 'amount', 'currency', 'investmentDate', 'riskLevel', 'status', 'investmentObjective']
        });
    }

    try {
        const result = await db.execute(`
            INSERT INTO investment_management (
                investment_title,
                investment_type,
                asset_class,
                investment_amount,
                currency,
                investment_date,
                expected_return,
                risk_level,
                status,
                maturity_date,
                allocation_percentage,
                counterparty,
                investment_objective,
                notes,
                submitted_by,
                submitted_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            investmentTitle,
            investmentType,
            assetClass || null,
            amount,
            currency,
            investmentDate,
            expectedReturn || null,
            riskLevel,
            status,
            maturityDate || null,
            allocationPercentage || null,
            counterparty || null,
            investmentObjective,
            notes,
            submittedBy,
            submittedDate || new Date().toISOString().split('T')[0]
        ]);

        console.log('✅ Investment record saved successfully:', result);

        res.json({
            success: true,
            message: 'Investment record saved successfully',
            data: {
                id: result.insertId,
                investment_title: investmentTitle,
                investment_type: investmentType,
                status: status
            }
        });
    } catch (error) {
        console.error('❌ Error saving investment record:', error);
        res.status(500).json({
            error: 'Failed to save investment record',
            details: error.message
        });
    }
});

// GET - Retrieve investment records
router.get('/investment-management', async (req, res) => {
    console.log('📝 GET /api/investment-management accessed');

    try {
        const investments = await db.execute(`
            SELECT id,
                   investment_title,
                   investment_type,
                   asset_class,
                   investment_amount,
                   currency,
                   investment_date,
                   expected_return,
                   risk_level,
                   status,
                   maturity_date,
                   allocation_percentage,
                   counterparty,
                   investment_objective,
                   notes,
                   submitted_by,
                   submitted_date,
                   created_at,
                   updated_at
            FROM investment_management
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: investments
        });
    } catch (error) {
        console.error('❌ Error retrieving investment records:', error);
        res.status(500).json({
            error: 'Failed to retrieve investment records',
            details: error.message
        });
    }
});

module.exports = router;
