const express = require('express');
const router = express.Router();

console.log('🚀 Workforce budget route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Workforce budget test endpoint accessed');
    res.json({ 
        message: 'Workforce budget API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully'
    });
});

// Root endpoint test
router.get('/', (req, res) => {
    console.log('💰 Workforce budget root endpoint accessed');
    res.json({ 
        message: 'Workforce budget API root endpoint',
        available_endpoints: ['GET /test', 'POST /budgets', 'GET /budgets', 'GET /budgets/:id', 'POST /budgets/:id/approve', 'POST /budgets/:id/reject', 'POST /budgets/:id/request-modification']
    });
});

// Create new workforce budget
router.post('/budgets', async (req, res) => {
    try {
        console.log('💰 Workforce budget creation request received');
        console.log('📝 Request body:', req.body);
        
        const {
            id,
            budgetPeriod,
            totalProposed,
            salariesWages,
            trainingDevelopment,
            employeeBenefits,
            recruitmentCosts,
            submittedBy,
            submittedByRole,
            currentHeadcount,
            justification
        } = req.body;
        
        // Validate required fields
        if (!budgetPeriod || !totalProposed || !submittedBy) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'budgetPeriod, totalProposed, and submittedBy are required'
            });
        }
        
        console.log('🔍 About to execute workforce budget insert query...');
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            const budgetId = id || `WFB${Date.now().toString().slice(-6)}`;
            
            const query = `
                INSERT INTO workforce_budgets (
                    id, budget_period, total_proposed, salaries_wages, training_development,
                    employee_benefits, recruitment_costs, submitted_by, submitted_by_role,
                    current_headcount, justification, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
            `;
            
            const values = [
                budgetId,
                budgetPeriod,
                parseFloat(totalProposed),
                parseFloat(salariesWages) || 0,
                parseFloat(trainingDevelopment) || 0,
                parseFloat(employeeBenefits) || 0,
                parseFloat(recruitmentCosts) || 0,
                submittedBy,
                submittedByRole || null,
                parseInt(currentHeadcount) || 0,
                justification || null
            ];
            
            console.log('🔍 Query:', query);
            console.log('📊 Values:', values);
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Workforce budget inserted successfully:', result);
            
            res.status(201).json({
                success: true,
                message: 'Workforce budget created successfully',
                budgetId: budgetId,
                budget: {
                    id: budgetId,
                    budgetPeriod,
                    totalProposed: parseFloat(totalProposed),
                    salariesWages: parseFloat(salariesWages) || 0,
                    trainingDevelopment: parseFloat(trainingDevelopment) || 0,
                    employeeBenefits: parseFloat(employeeBenefits) || 0,
                    recruitmentCosts: parseFloat(recruitmentCosts) || 0,
                    submittedBy,
                    submittedByRole,
                    currentHeadcount: parseInt(currentHeadcount) || 0,
                    justification,
                    status: 'Pending'
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock workforce budget:', dbError);
            
            // Fallback to mock workforce budget creation
            const budgetId = id || `WFB${Date.now().toString().slice(-6)}`;
            
            res.status(201).json({
                success: true,
                message: 'Workforce budget created successfully (mock)',
                budgetId: budgetId,
                budget: {
                    id: budgetId,
                    budgetPeriod,
                    totalProposed: parseFloat(totalProposed),
                    salariesWages: parseFloat(salariesWages) || 0,
                    trainingDevelopment: parseFloat(trainingDevelopment) || 0,
                    employeeBenefits: parseFloat(employeeBenefits) || 0,
                    recruitmentCosts: parseFloat(recruitmentCosts) || 0,
                    submittedBy,
                    submittedByRole,
                    currentHeadcount: parseInt(currentHeadcount) || 0,
                    justification,
                    status: 'Pending',
                    mock: true
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error creating workforce budget:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create workforce budget',
            details: error.message 
        });
    }
});

// Get all workforce budgets
router.get('/budgets', async (req, res) => {
    try {
        console.log('📋 Fetching all workforce budgets...');
        
        let budgets = [];
        
        try {
            const db = require('../../database/config/database');
            const budgetsResult = await db.execute('SELECT * FROM workforce_budgets ORDER BY submission_date DESC');
            budgets = Array.isArray(budgetsResult) ? budgetsResult[0] : budgetsResult;
            console.log('✅ Workforce budgets fetched from database:', budgets.length);
        } catch (dbError) {
            console.error('❌ Database error, using fallback workforce budgets:', dbError);
            
            // Fallback to mock workforce budgets
            budgets = [
                {
                    id: 'WFB001',
                    budget_period: 'Q1 2024',
                    total_proposed: 500000.00,
                    salaries_wages: 350000.00,
                    training_development: 50000.00,
                    employee_benefits: 75000.00,
                    recruitment_costs: 25000.00,
                    submitted_by: 'Finance Manager',
                    submitted_by_role: 'Finance Manager',
                    current_headcount: 45,
                    justification: 'Budget increase due to new project requirements and inflation adjustments',
                    status: 'Pending',
                    submission_date: '2024-01-15T10:30:00Z'
                },
                {
                    id: 'WFB002',
                    budget_period: 'Q4 2023',
                    total_proposed: 450000.00,
                    salaries_wages: 320000.00,
                    training_development: 40000.00,
                    employee_benefits: 70000.00,
                    recruitment_costs: 20000.00,
                    submitted_by: 'Finance Manager',
                    submitted_by_role: 'Finance Manager',
                    current_headcount: 42,
                    justification: 'Standard quarterly budget with minor adjustments',
                    status: 'Approved',
                    submission_date: '2023-10-01T14:20:00Z'
                }
            ];
        }
        
        res.json({
            success: true,
            budgets: budgets,
            total: budgets.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching workforce budgets:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch workforce budgets',
            details: error.message 
        });
    }
});

// Get workforce budget by ID
router.get('/budgets/:id', async (req, res) => {
    try {
        const budgetId = req.params.id;
        console.log('🔍 Fetching workforce budget:', budgetId);
        
        let budget = null;
        
        try {
            const db = require('../../database/config/database');
            const budgetResult = await db.execute('SELECT * FROM workforce_budgets WHERE id = ?', [budgetId]);
            const budgets = Array.isArray(budgetResult) ? budgetResult[0] : budgetResult;
            
            if (budgets.length > 0) {
                budget = budgets[0];
                console.log('✅ Workforce budget found:', budget);
            }
        } catch (dbError) {
            console.error('❌ Database error, using fallback workforce budget:', dbError);
            
            // Fallback to mock workforce budget
            if (budgetId === 'WFB001') {
                budget = {
                    id: 'WFB001',
                    budget_period: 'Q1 2024',
                    total_proposed: 500000.00,
                    salaries_wages: 350000.00,
                    training_development: 50000.00,
                    employee_benefits: 75000.00,
                    recruitment_costs: 25000.00,
                    submitted_by: 'Finance Manager',
                    submitted_by_role: 'Finance Manager',
                    current_headcount: 45,
                    justification: 'Budget increase due to new project requirements and inflation adjustments',
                    status: 'Pending',
                    submission_date: '2024-01-15T10:30:00Z',
                    mock: true
                };
            }
        }
        
        if (!budget) {
            return res.status(404).json({ 
                success: false,
                error: 'Workforce budget not found' 
            });
        }
        
        res.json({
            success: true,
            budget: budget
        });
        
    } catch (error) {
        console.error('❌ Error fetching workforce budget:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch workforce budget',
            details: error.message 
        });
    }
});

// Approve workforce budget
router.post('/budgets/:id/approve', async (req, res) => {
    try {
        const budgetId = req.params.id;
        const { approvedBy, approvedByRole, comments, approvedAmount } = req.body;
        
        console.log('✅ Approving workforce budget:', budgetId);
        console.log('📝 Approval data:', req.body);
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Update main budget status
            await db.execute(
                'UPDATE workforce_budgets SET status = "Approved", approved_by = ?, approved_date = NOW() WHERE id = ?',
                [approvedBy || 'Managing Director', budgetId]
            );
            
            // Insert approval record
            await db.execute(
                'INSERT INTO workforce_budget_approvals (budget_id, approved_by, approved_by_role, approval_date, comments, final_decision, approved_amount) VALUES (?, ?, ?, NOW(), ?, "Approved", ?)',
                [budgetId, approvedBy || 'Managing Director', approvedByRole || 'Managing Director', comments || null, approvedAmount || null]
            );
            
            console.log('✅ Workforce budget approved successfully:', budgetId);
            
            res.json({
                success: true,
                message: 'Workforce budget approved successfully',
                budgetId: budgetId,
                status: 'Approved',
                approvedBy: approvedBy || 'Managing Director',
                approvedAmount: approvedAmount
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock approval:', dbError);
            
            // Fallback to mock approval
            res.json({
                success: true,
                message: 'Workforce budget approved successfully (mock)',
                budgetId: budgetId,
                status: 'Approved',
                approvedBy: approvedBy || 'Managing Director',
                approvedAmount: approvedAmount,
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error approving workforce budget:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to approve workforce budget',
            details: error.message 
        });
    }
});

// Reject workforce budget
router.post('/budgets/:id/reject', async (req, res) => {
    try {
        const budgetId = req.params.id;
        const { rejectedBy, rejectedByRole, rejectionReason } = req.body;
        
        console.log('❌ Rejecting workforce budget:', budgetId);
        console.log('📝 Rejection data:', req.body);
        
        // Validate rejection reason
        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                error: 'Rejection reason is required'
            });
        }
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Update main budget status
            await db.execute(
                'UPDATE workforce_budgets SET status = "Rejected", rejection_reason = ?, approved_date = NOW() WHERE id = ?',
                [rejectionReason, budgetId]
            );
            
            // Insert rejection record
            await db.execute(
                'INSERT INTO workforce_budget_rejections (budget_id, rejection_reason, rejected_by, rejected_by_role, rejection_date) VALUES (?, ?, ?, ?, NOW())',
                [budgetId, rejectionReason, rejectedBy || 'Managing Director', rejectedByRole || 'Managing Director']
            );
            
            console.log('✅ Workforce budget rejected successfully:', budgetId);
            
            res.json({
                success: true,
                message: 'Workforce budget rejected successfully',
                budgetId: budgetId,
                status: 'Rejected',
                rejectionReason: rejectionReason,
                rejectedBy: rejectedBy || 'Managing Director'
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock rejection:', dbError);
            
            // Fallback to mock rejection
            res.json({
                success: true,
                message: 'Workforce budget rejected successfully (mock)',
                budgetId: budgetId,
                status: 'Rejected',
                rejectionReason: rejectionReason,
                rejectedBy: rejectedBy || 'Managing Director',
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error rejecting workforce budget:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to reject workforce budget',
            details: error.message 
        });
    }
});

// Request modification for workforce budget
router.post('/budgets/:id/request-modification', async (req, res) => {
    try {
        const budgetId = req.params.id;
        const { modificationRequest, requestedBy, requestedByRole } = req.body;
        
        console.log('🔄 Requesting modification for workforce budget:', budgetId);
        console.log('📝 Modification request data:', req.body);
        
        // Validate modification request
        if (!modificationRequest) {
            return res.status(400).json({
                success: false,
                error: 'Modification request is required'
            });
        }
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Update main budget status
            await db.execute(
                'UPDATE workforce_budgets SET status = "Modification Requested", modification_request = ? WHERE id = ?',
                [modificationRequest, budgetId]
            );
            
            // Insert modification request record
            await db.execute(
                'INSERT INTO workforce_budget_modifications (budget_id, modification_request, requested_by, requested_by_role, request_date, status) VALUES (?, ?, ?, ?, NOW(), "Pending")',
                [budgetId, modificationRequest, requestedBy || 'Managing Director', requestedByRole || 'Managing Director']
            );
            
            console.log('✅ Modification request created successfully:', budgetId);
            
            res.json({
                success: true,
                message: 'Modification request sent successfully',
                budgetId: budgetId,
                status: 'Modification Requested',
                modificationRequest: modificationRequest,
                requestedBy: requestedBy || 'Managing Director'
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock modification request:', dbError);
            
            // Fallback to mock modification request
            res.json({
                success: true,
                message: 'Modification request sent successfully (mock)',
                budgetId: budgetId,
                status: 'Modification Requested',
                modificationRequest: modificationRequest,
                requestedBy: requestedBy || 'Managing Director',
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error requesting modification for workforce budget:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to request modification',
            details: error.message 
        });
    }
});

module.exports = router;
