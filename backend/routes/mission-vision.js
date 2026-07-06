const notify = require('../utils/notify');
const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// ===== MISSION & VISION MANAGEMENT =====

// POST - Create/update mission & vision details
router.post('/mission-vision', async (req, res) => {
    console.log('📝 POST /api/mission-vision accessed');
    console.log('📊 Request body:', req.body);
    
    const {
        missionStatement,
        missionCategory,
        missionLastReviewed,
        visionStatement,
        visionTimeframe,
        visionLastReviewed,
        coreValues = [],
        additionalValues = '',
        strategicObjectives = {},
        stakeholderFocus = [],
        implementation = {},
        successMetrics = '',
        notes = '',
        submittedBy = 'Managing Director',
        submittedDate
    } = req.body;
    
    // Validate required fields
    if (!missionStatement || !visionStatement) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['missionStatement', 'visionStatement']
        });
    }
    
    try {
        // Check if mission & vision already exists (we'll use the first record as the main one)
        const existingMissionVision = await db.execute(
            'SELECT id FROM mission_vision WHERE status = ? LIMIT 1',
            ['active']
        );
        
        let result;
        if (existingMissionVision.length > 0) {
            // Update existing mission & vision
            await db.execute(`
                UPDATE mission_vision SET 
                    mission_statement = ?, mission_category = ?, mission_last_reviewed = ?,
                    vision_statement = ?, vision_timeframe = ?, vision_last_reviewed = ?,
                    core_values = ?, additional_values = ?, short_term_objectives = ?,
                    long_term_objectives = ?, stakeholder_focus = ?, communication_strategy = ?,
                    integration_strategy = ?, review_frequency = ?, next_review_date = ?,
                    success_metrics = ?, notes = ?, submitted_by = ?, submitted_date = ?,
                    status = 'active', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                missionStatement, missionCategory || null, missionLastReviewed || null,
                visionStatement, visionTimeframe || null, visionLastReviewed || null,
                JSON.stringify(coreValues), additionalValues, strategicObjectives.shortTerm || '',
                strategicObjectives.longTerm || '', JSON.stringify(stakeholderFocus),
                implementation.communicationStrategy || '', implementation.integrationStrategy || '',
                implementation.reviewFrequency || null, implementation.nextReviewDate || null,
                successMetrics, notes, submittedBy,
                submittedDate || new Date().toISOString().split('T')[0], existingMissionVision[0].id
            ]);
            
            result = { 
                action: 'updated',
                id: existingMissionVision[0].id,
                note: 'Mission & Vision details updated successfully'
            };
        } else {
            // Insert new mission & vision
            const insertResult = await db.execute(`
                INSERT INTO mission_vision (
                    mission_statement, mission_category, mission_last_reviewed,
                    vision_statement, vision_timeframe, vision_last_reviewed,
                    core_values, additional_values, short_term_objectives,
                    long_term_objectives, stakeholder_focus, communication_strategy,
                    integration_strategy, review_frequency, next_review_date,
                    success_metrics, notes, submitted_by, submitted_date, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                missionStatement, missionCategory || '', missionLastReviewed || '',
                visionStatement, visionTimeframe || '', visionLastReviewed || '',
                JSON.stringify(coreValues), additionalValues, strategicObjectives.shortTerm || '',
                strategicObjectives.longTerm || '', JSON.stringify(stakeholderFocus), 
                implementation.communicationStrategy || '', implementation.integrationStrategy || '',
                implementation.reviewFrequency || '', implementation.nextReviewDate || '',
                successMetrics, notes, submittedBy, submittedDate || new Date().toISOString().split('T')[0],
                'active'
            ]);
            
            result = { 
                action: 'created',
                id: insertResult.insertId,
                note: 'Mission & Vision details created successfully'
            };
        }
        
        console.log('✅ Mission & Vision details saved successfully:', result);
        
        res.json({
            success: true,
            message: `Mission & Vision details ${result.action} successfully`,
            data: result
        });
        
    } catch (error) {
        console.error('❌ Error saving mission & vision details:', error);
        res.status(500).json({
            error: 'Failed to save mission & vision details',
            details: error.message
        });
    }
});

// GET - Retrieve mission & vision details
router.get('/mission-vision', async (req, res) => {
    console.log('📝 GET /api/mission-vision accessed');
    
    try {
        // Retrieve mission & vision data from database
        const missionVision = await db.execute(`
            SELECT id, mission_statement, mission_category, mission_last_reviewed,
                   vision_statement, vision_timeframe, vision_last_reviewed,
                   core_values, additional_values, short_term_objectives,
                   long_term_objectives, stakeholder_focus, communication_strategy,
                   integration_strategy, review_frequency, next_review_date,
                   success_metrics, notes, submitted_by, submitted_date, status,
                   created_at, updated_at
            FROM mission_vision 
            ORDER BY created_at DESC
        `);
        
        console.log('✅ Retrieved mission & vision data:', missionVision.length);
        
        res.json({
            success: true,
            data: missionVision
        });
        
    } catch (error) {
        console.error('❌ Error retrieving mission & vision details:', error);
        res.status(500).json({
            error: 'Failed to retrieve mission & vision details',
            details: error.message
        });
    }
});

module.exports = router;
