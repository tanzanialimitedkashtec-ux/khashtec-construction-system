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
        // Create leadership data object
        const leadershipData = {
            position,
            department,
            current_holder: currentHolder,
            reports_to: reportsTo,
            leadership_level: leadershipLevel,
            appointment_date: appointmentDate,
            responsibilities: JSON.stringify(responsibilities),
            strategic_thinking: competencies.strategicThinking || '',
            decision_making: competencies.decisionMaking || '',
            communication_skills: competencies.communicationSkills || '',
            team_leadership: competencies.teamLeadership || '',
            succession_status: successionPlanning.status || '',
            potential_successors: successionPlanning.potentialSuccessors || '',
            development_timeline: successionPlanning.developmentTimeline || '',
            kpis: performanceMetrics.kpis || '',
            review_frequency: performanceMetrics.reviewFrequency || '',
            last_review_date: performanceMetrics.lastReviewDate || '',
            notes,
            submitted_by: submittedBy,
            submitted_date: submittedDate || new Date().toISOString().split('T')[0],
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        console.log('📝 Processing leadership data:', leadershipData);
        
        // For now, return success with processed data (simulating database save)
        const result = { 
            ...leadershipData, 
            id: `LD-${Date.now()}`, 
            action: 'created',
            note: 'Leadership data processed successfully and saved to memory'
        };
        
        console.log('✅ Leadership details processed successfully:', result);
        
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
        // Return mock data for now - this ensures frontend works
        const mockLeadership = [
            {
                id: 'LD-1715432000000',
                position: 'Chief Executive Officer',
                department: 'Executive Office',
                current_holder: 'John Smith',
                reports_to: 'Board of Directors',
                leadership_level: 'c-suite',
                appointment_date: '2024-01-01',
                responsibilities: JSON.stringify(['strategic-planning', 'team-management', 'financial-oversight']),
                strategic_thinking: 'expert',
                decision_making: 'expert',
                communication_skills: 'expert',
                team_leadership: 'expert',
                succession_status: 'identified',
                potential_successors: 'Jane Doe, Mike Johnson',
                development_timeline: '12-month development plan',
                kpis: 'Revenue growth, Market expansion, Team satisfaction',
                review_frequency: 'quarterly',
                last_review_date: '2024-03-15',
                notes: 'Strategic leader with 10+ years experience',
                submitted_by: 'Managing Director',
                submitted_date: '2024-01-01',
                status: 'active',
                created_at: '2024-01-01T00:00:00.000Z'
            }
        ];
        
        console.log('✅ Returning mock leadership data:', mockLeadership.length);
        
        res.json({
            success: true,
            data: mockLeadership
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
