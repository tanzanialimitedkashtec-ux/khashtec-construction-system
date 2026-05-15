const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// ===== LONG-TERM GROWTH MANAGEMENT =====

// POST - Create/update long-term growth strategy
router.post('/long-term-growth', async (req, res) => {
    console.log('📝 POST /api/long-term-growth accessed');
    console.log('📊 Request body:', req.body);
    
    const {
        growthTitle,
        growthCategory,
        timeframe,
        targetMarkets = [],
        expansionStrategy,
        investmentRequirements,
        riskAssessment,
        milestones = [],
        successMetrics,
        implementationPlan,
        notes = '',
        submittedBy = 'Managing Director',
        submittedDate
    } = req.body;
    
    // Validate required fields
    if (!growthTitle || !growthCategory || !timeframe || !expansionStrategy || !successMetrics) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['growthTitle', 'growthCategory', 'timeframe', 'expansionStrategy', 'successMetrics']
        });
    }
    
    try {
        // Check if long-term growth strategy already exists (we'll use the first record as main one)
        const existingGrowth = await db.execute(
            'SELECT id FROM long_term_growth WHERE status = ? LIMIT 1',
            ['active']
        );
        
        let result;
        if (existingGrowth.length > 0) {
            // Update existing long-term growth
            await db.execute(`
                UPDATE long_term_growth SET 
                    growth_title = ?, growth_category = ?, timeframe = ?,
                    target_markets = ?, expansion_strategy = ?, investment_requirements = ?,
                    risk_assessment = ?, milestones = ?, success_metrics = ?,
                    implementation_plan = ?, notes = ?, submitted_by = ?, 
                    submitted_date = ?, status = 'active', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                growthTitle, growthCategory, timeframe, JSON.stringify(targetMarkets),
                expansionStrategy, investmentRequirements || '', riskAssessment || '',
                JSON.stringify(milestones), successMetrics, implementationPlan || '',
                notes, submittedBy, submittedDate || new Date().toISOString().split('T')[0],
                existingGrowth[0].id
            ]);
            
            result = { 
                action: 'updated',
                id: existingGrowth[0].id,
                growth_title: growthTitle,
                growth_category: growthCategory,
                note: 'Long-term growth details updated successfully'
            };
        } else {
            // Insert new long-term growth
            const insertResult = await db.execute(`
                INSERT INTO long_term_growth (
                    growth_title, growth_category, timeframe, target_markets,
                    expansion_strategy, investment_requirements, risk_assessment,
                    milestones, success_metrics, implementation_plan, notes,
                    submitted_by, submitted_date, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                growthTitle, growthCategory, timeframe, JSON.stringify(targetMarkets),
                expansionStrategy, investmentRequirements || '', riskAssessment || '',
                JSON.stringify(milestones), successMetrics, implementationPlan || '',
                notes, submittedBy, submittedDate || new Date().toISOString().split('T')[0],
                'active'
            ]);
            
            result = { 
                action: 'created',
                id: insertResult.insertId,
                growth_title: growthTitle,
                growth_category: growthCategory,
                note: 'Long-term growth details created successfully'
            };
        }
        
        console.log('✅ Long-term growth details saved successfully:', result);
        
        res.json({
            success: true,
            message: `Long-term growth strategy ${result.action} successfully`,
            data: result
        });
        
    } catch (error) {
        console.error('❌ Error saving long-term growth details:', error);
        res.status(500).json({
            error: 'Failed to save long-term growth details',
            details: error.message
        });
    }
});

// GET - Retrieve long-term growth strategies
router.get('/long-term-growth', async (req, res) => {
    console.log('📝 GET /api/long-term-growth accessed');
    
    try {
        // Retrieve long-term growth data from database
        const growthStrategies = await db.execute(`
            SELECT id, growth_title, growth_category, timeframe, target_markets,
                   expansion_strategy, investment_requirements, risk_assessment,
                   milestones, success_metrics, implementation_plan, notes,
                   submitted_by, submitted_date, status, created_at, updated_at
            FROM long_term_growth 
            ORDER BY created_at DESC
        `);
        
        console.log('✅ Retrieved long-term growth data:', growthStrategies.length);
        
        res.json({
            success: true,
            data: growthStrategies
        });
        
    } catch (error) {
        console.error('❌ Error retrieving long-term growth details:', error);
        res.status(500).json({
            error: 'Failed to retrieve long-term growth details',
            details: error.message
        });
    }
});

module.exports = router;
