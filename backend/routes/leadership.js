const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// ===== LEADERSHIP MANAGEMENT =====

// POST - Create/update leadership details
router.post('/leadership', async (req, res) => {
    console.log('📝 POST /api/leadership accessed');
    console.log('📊 Request body:', req.body);
    
    const {
        position,
        department,
        currentHolder,
        reportsTo,
        leadershipLevel,
        appointmentDate,
        responsibilities = [],
        competencies = {},
        successionPlanning = {},
        performanceMetrics = {},
        notes = '',
        submittedBy = 'Managing Director',
        submittedDate
    } = req.body;
    
    // Validate required fields
    if (!position || !department || !currentHolder || !reportsTo || !leadershipLevel || !appointmentDate) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['position', 'department', 'currentHolder', 'reportsTo', 'leadershipLevel', 'appointmentDate']
        });
    }
    
    try {
        // Check if leadership position already exists
        const existingLeadership = await db.execute(
            'SELECT id FROM leadership_management WHERE position = ? AND department = ?',
            [position, department]
        );
        
        let result;
        if (existingLeadership.length > 0) {
            // Update existing leadership
            await db.execute(`
                UPDATE leadership_management SET 
                    current_holder = ?, reports_to = ?, leadership_level = ?,
                    appointment_date = ?, responsibilities = ?, strategic_thinking = ?,
                    decision_making = ?, communication_skills = ?, team_leadership = ?,
                    succession_status = ?, potential_successors = ?, development_timeline = ?,
                    kpis = ?, review_frequency = ?, last_review_date = ?,
                    notes = ?, submitted_by = ?, submitted_date = ?,
                    status = 'active', updated_at = CURRENT_TIMESTAMP
                WHERE position = ? AND department = ?
            `, [
                currentHolder, reportsTo, leadershipLevel, appointmentDate,
                JSON.stringify(responsibilities), competencies.strategicThinking || '',
                competencies.decisionMaking || '', competencies.communicationSkills || '',
                competencies.teamLeadership || '', successionPlanning.status || '',
                successionPlanning.potentialSuccessors || '', successionPlanning.developmentTimeline || '',
                performanceMetrics.kpis || '', performanceMetrics.reviewFrequency || '',
                performanceMetrics.lastReviewDate || '', notes, submittedBy,
                submittedDate || new Date().toISOString().split('T')[0], position, department
            ]);
            
            result = { 
                action: 'updated',
                id: existingLeadership[0].id,
                position: position,
                department: department,
                note: 'Leadership details updated successfully'
            };
        } else {
            // Insert new leadership
            const insertResult = await db.execute(`
                INSERT INTO leadership_management (
                    position, department, current_holder, reports_to, leadership_level,
                    appointment_date, responsibilities, strategic_thinking, decision_making,
                    communication_skills, team_leadership, succession_status,
                    potential_successors, development_timeline, kpis, review_frequency,
                    last_review_date, notes, submitted_by, submitted_date, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                position, department, currentHolder, reportsTo, leadershipLevel,
                appointmentDate, JSON.stringify(responsibilities), competencies.strategicThinking || '',
                competencies.decisionMaking || '', competencies.communicationSkills || '',
                competencies.teamLeadership || '', successionPlanning.status || '',
                successionPlanning.potentialSuccessors || '', successionPlanning.developmentTimeline || '',
                performanceMetrics.kpis || '', performanceMetrics.reviewFrequency || '',
                performanceMetrics.lastReviewDate || '', notes, submittedBy,
                submittedDate || new Date().toISOString().split('T')[0], 'active'
            ]);
            
            result = { 
                action: 'created',
                id: insertResult.insertId,
                position: position,
                department: department,
                note: 'Leadership details created successfully'
            };
        }
        
        console.log('✅ Leadership details saved successfully:', result);
        
        res.json({
            success: true,
            message: `Leadership details ${result.action} successfully`,
            data: result
        });
        
    } catch (error) {
        console.error('❌ Error saving leadership details:', error);
        res.status(500).json({
            error: 'Failed to save leadership details',
            details: error.message
        });
    }
});

// GET - Retrieve leadership details
router.get('/leadership', async (req, res) => {
    console.log('📝 GET /api/leadership accessed');
    
    try {
        // Retrieve leadership data from database
        const leadership = await db.execute(`
            SELECT id, position, department, current_holder, reports_to, leadership_level,
                   appointment_date, responsibilities, strategic_thinking, decision_making,
                   communication_skills, team_leadership, succession_status,
                   potential_successors, development_timeline, kpis, review_frequency,
                   last_review_date, notes, submitted_by, submitted_date, status,
                   created_at, updated_at
            FROM leadership_management 
            ORDER BY created_at DESC
        `);
        
        console.log('✅ Retrieved leadership data:', leadership.length);
        
        res.json({
            success: true,
            data: leadership
        });
        
    } catch (error) {
        console.error('❌ Error retrieving leadership details:', error);
        res.status(500).json({
            error: 'Failed to retrieve leadership details',
            details: error.message
        });
    }
});

module.exports = router;
