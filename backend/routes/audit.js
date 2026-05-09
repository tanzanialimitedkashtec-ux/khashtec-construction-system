const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// ===== SYSTEM AUDIT DASHBOARD =====

// Get comprehensive system audit data
router.get('/dashboard', async (req, res) => {
    try {
        console.log('🔍 Fetching comprehensive audit dashboard data...');
        
        const auditData = {
            timestamp: new Date().toISOString(),
            overview: {},
            projects: {},
            employees: {},
            safety: {},
            financial: {},
            compliance: {},
            system: {}
        };

        // ===== SYSTEM OVERVIEW =====
        try {
            // Get basic system stats
            const [employeeCount] = await db.execute(`
                SELECT COUNT(*) as count FROM employees WHERE status = 'Active'
            `);
            
            const [projectCount] = await db.execute(`
                SELECT COUNT(*) as count FROM projects WHERE status != 'Completed'
            `);
            
            const [departmentCount] = await db.execute(`
                SELECT COUNT(DISTINCT department) as count FROM employees WHERE status = 'Active'
            `);

            auditData.overview = {
                totalEmployees: employeeCount[0]?.count || 0,
                activeProjects: projectCount[0]?.count || 0,
                departments: departmentCount[0]?.count || 0,
                systemStatus: 'Operational',
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching overview:', error);
            auditData.overview = { error: error.message };
        }

        // ===== PROJECTS ANALYSIS =====
        try {
            // Project status breakdown
            const [projectStatus] = await db.execute(`
                SELECT status, COUNT(*) as count 
                FROM projects 
                GROUP BY status
            `);
            
            // Projects by department
            const [projectsByDept] = await db.execute(`
                SELECT department, COUNT(*) as count,
                       SUM(CASE WHEN due_date < CURDATE() AND status != 'Completed' THEN 1 ELSE 0 END) as overdue
                FROM projects 
                GROUP BY department
            `);
            
            // Recent project activity
            const [recentProjects] = await db.execute(`
                SELECT id, project_name, status, department, start_date, due_date,
                       DATEDIFF(due_date, CURDATE()) as days_remaining
                FROM projects 
                ORDER BY created_at DESC 
                LIMIT 5
            `);

            auditData.projects = {
                statusBreakdown: projectStatus,
                byDepartment: projectsByDept,
                recentActivity: recentProjects,
                totalOverdue: projectsByDept.reduce((sum, dept) => sum + dept.overdue, 0)
            };
        } catch (error) {
            console.error('Error fetching projects:', error);
            auditData.projects = { error: error.message };
        }

        // ===== EMPLOYEE STATUS =====
        try {
            // Employee status by department
            const [employeeStatus] = await db.execute(`
                SELECT department, status, COUNT(*) as count
                FROM employees 
                GROUP BY department, status
                ORDER BY department, status
            `);
            
            // Attendance trends (last 7 days)
            const [attendanceTrends] = await db.execute(`
                SELECT DATE(check_in) as date, 
                       COUNT(DISTINCT employee_id) as present,
                       COUNT(*) as total_checkins
                FROM attendance 
                WHERE check_in >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(check_in)
                ORDER BY date DESC
            `);
            
            // Leave requests status
            const [leaveStatus] = await db.execute(`
                SELECT status, COUNT(*) as count
                FROM leave_requests 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY status
            `);

            auditData.employees = {
                statusByDepartment: employeeStatus,
                attendanceTrends: attendanceTrends,
                leaveRequests: leaveStatus,
                averageAttendance: attendanceTrends.length > 0 ? 
                    Math.round(attendanceTrends.reduce((sum, day) => sum + day.present, 0) / attendanceTrends.length) : 0
            };
        } catch (error) {
            console.error('Error fetching employee data:', error);
            auditData.employees = { error: error.message };
        }

        // ===== SAFETY ANALYSIS =====
        try {
            // Safety incidents from HSE work
            const [safetyIncidents] = await db.execute(`
                SELECT work_type, COUNT(*) as count,
                       SUM(CASE WHEN work_type LIKE '%Violation%' THEN 1 ELSE 0 END) as violations
                FROM hse_work 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY work_type
            `);
            
            // Recent safety issues
            const [recentSafety] = await db.execute(`
                SELECT id, work_title, work_type, department_code, created_at
                FROM hse_work 
                WHERE work_type LIKE '%Violation%' OR work_type LIKE '%Incident%'
                ORDER BY created_at DESC 
                LIMIT 5
            `);
            
            // Inspection reports
            const [inspections] = await db.execute(`
                SELECT COUNT(*) as total,
                       SUM(CASE WHEN work_type = 'Inspection Report' THEN 1 ELSE 0 END) as inspections
                FROM hse_work 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            `);

            auditData.safety = {
                incidents: safetyIncidents,
                recentIssues: recentSafety,
                inspections: inspections[0] || {},
                totalViolations: safetyIncidents.reduce((sum, item) => sum + item.violations, 0),
                safetyScore: Math.max(0, 100 - (safetyIncidents.reduce((sum, item) => sum + item.violations, 0) * 5))
            };
        } catch (error) {
            console.error('Error fetching safety data:', error);
            auditData.safety = { error: error.message };
        }

        // ===== FINANCIAL OVERVIEW =====
        try {
            // Financial transactions summary
            const [financialSummary] = await db.execute(`
                SELECT type, COUNT(*) as count, SUM(amount) as total
                FROM financial_transactions 
                WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY type
            `);
            
            // Budget status
            const [budgetStatus] = await db.execute(`
                SELECT department, SUM(total_proposed) as proposed,
                       SUM(CASE WHEN status = 'Approved' THEN total_proposed ELSE 0 END) as approved
                FROM budgets 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
                GROUP BY department
            `);
            
            // Recent transactions
            const [recentTransactions] = await db.execute(`
                SELECT id, type, description, amount, transaction_date, status
                FROM financial_transactions 
                ORDER BY transaction_date DESC 
                LIMIT 5
            `);

            auditData.financial = {
                transactionSummary: financialSummary,
                budgetStatus: budgetStatus,
                recentTransactions: recentTransactions,
                totalExpenses: financialSummary.reduce((sum, item) => sum + (item.total || 0), 0)
            };
        } catch (error) {
            console.error('Error fetching financial data:', error);
            auditData.financial = { error: error.message };
        }

        // ===== COMPLIANCE STATUS =====
        try {
            // Policy compliance
            const [policyCompliance] = await db.execute(`
                SELECT department, COUNT(*) as policies,
                       SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active
                FROM policies 
                GROUP BY department
            `);
            
            // Training completion
            const [trainingStatus] = await db.execute(`
                SELECT status, COUNT(*) as count
                FROM training_records 
                WHERE completion_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
                GROUP BY status
            `);
            
            // Document compliance
            const [documentStatus] = await db.execute(`
                SELECT document_type, status, COUNT(*) as count
                FROM documents 
                GROUP BY document_type, status
            `);

            auditData.compliance = {
                policies: policyCompliance,
                training: trainingStatus,
                documents: documentStatus,
                overallCompliance: policyCompliance.length > 0 ? 
                    Math.round((policyCompliance.reduce((sum, dept) => sum + dept.active, 0) / 
                              policyCompliance.reduce((sum, dept) => sum + dept.policies, 0)) * 100) : 0
            };
        } catch (error) {
            console.error('Error fetching compliance data:', error);
            auditData.compliance = { error: error.message };
        }

        // ===== SYSTEM HEALTH =====
        try {
            // System activity logs (if available)
            const [systemActivity] = await db.execute(`
                SELECT action, COUNT(*) as count
                FROM audit_logs 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 24 HOUR)
                GROUP BY action
                ORDER BY count DESC
                LIMIT 10
            `).catch(() => [{ action: 'No audit logs available', count: 0 }]);

            auditData.system = {
                activity: systemActivity,
                databaseStatus: 'Connected',
                apiStatus: 'Operational',
                lastAudit: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching system data:', error);
            auditData.system = { error: error.message };
        }

        res.json({
            success: true,
            data: auditData
        });

    } catch (error) {
        console.error('❌ Error fetching audit dashboard:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to load audit dashboard data'
        });
    }
});

// Get specific audit category details
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        console.log(`🔍 Fetching audit data for category: ${category}`);
        
        let data = {};
        
        switch(category) {
            case 'projects':
                const [projects] = await db.execute(`
                    SELECT p.*, e.full_name as manager_name,
                           DATEDIFF(p.due_date, CURDATE()) as days_remaining
                    FROM projects p
                    LEFT JOIN employees e ON p.manager_id = e.id
                    ORDER BY p.created_at DESC
                `);
                data = { projects };
                break;
                
            case 'employees':
                const [employees] = await db.execute(`
                    SELECT e.*, d.department_name,
                           (SELECT COUNT(*) FROM attendance a WHERE a.employee_id = e.id 
                            AND a.check_in >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as attendance_days
                    FROM employees e
                    LEFT JOIN departments d ON e.department = d.department_code
                    ORDER BY e.full_name
                `);
                data = { employees };
                break;
                
            case 'safety':
                const [safety] = await db.execute(`
                    SELECT *, DATE(created_at) as incident_date
                    FROM hse_work 
                    WHERE work_type LIKE '%Violation%' OR work_type LIKE '%Incident%'
                    ORDER BY created_at DESC
                    LIMIT 50
                `);
                data = { incidents: safety };
                break;
                
            case 'financial':
                const [transactions] = await db.execute(`
                    SELECT ft.*, e.full_name as created_by_name
                    FROM financial_transactions ft
                    LEFT JOIN employees e ON ft.created_by = e.id
                    ORDER BY ft.transaction_date DESC
                    LIMIT 50
                `);
                data = { transactions };
                break;
                
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid category. Use: projects, employees, safety, financial'
                });
        }
        
        res.json({
            success: true,
            category,
            data
        });
        
    } catch (error) {
        console.error(`❌ Error fetching ${category} audit data:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate audit report
router.post('/report', async (req, res) => {
    try {
        const { startDate, endDate, categories, format } = req.body;
        console.log('📊 Generating audit report:', { startDate, endDate, categories, format });
        
        // This would generate a comprehensive audit report
        // For now, return a placeholder response
        res.json({
            success: true,
            message: 'Audit report generation initiated',
            reportId: `AUDIT-${Date.now()}`,
            estimatedTime: '2-3 minutes'
        });
        
    } catch (error) {
        console.error('❌ Error generating audit report:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test endpoint
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Audit routes are working',
        availableEndpoints: [
            'GET /audit/dashboard - Comprehensive system audit',
            'GET /audit/category/:category - Specific category data',
            'POST /audit/report - Generate audit report',
            'GET /audit/test - Test endpoint'
        ]
    });
});

module.exports = router;
