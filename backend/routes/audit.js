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
            const employeeCount = await db.execute(`
                SELECT COUNT(*) as count FROM employees WHERE status = 'Active'
            `);
            
            const projectCount = await db.execute(`
                SELECT COUNT(*) as count FROM projects WHERE status != 'Completed'
            `);
            
            const departmentCount = await db.execute(`
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
            const projectStatus = await db.execute(`
                SELECT status, COUNT(*) as count 
                FROM projects 
                GROUP BY status
            `);
            
            // Projects by status with overdue count
            const projectsByDept = await db.execute(`
                SELECT status as department, COUNT(*) as count,
                       SUM(CASE WHEN end_date < CURDATE() AND status != 'Completed' THEN 1 ELSE 0 END) as overdue
                FROM projects 
                GROUP BY status
            `);
            
            // Recent project activity
            const recentProjects = await db.execute(`
                SELECT id, name as project_name, status, status as department, start_date, end_date as due_date,
                       DATEDIFF(end_date, CURDATE()) as days_remaining
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
            const employeeStatus = await db.execute(`
                SELECT department, status, COUNT(*) as count
                FROM employees 
                GROUP BY department, status
                ORDER BY department, status
            `);
            
            // Attendance trends (last 7 days)
            const attendanceTrends = await db.execute(`
                SELECT DATE(check_in) as date, 
                       COUNT(DISTINCT employee_id) as present,
                       COUNT(*) as total_checkins
                FROM attendance 
                WHERE check_in >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(check_in)
                ORDER BY date DESC
            `);
            
            // Leave requests status
            const leaveStatus = await db.execute(`
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
            const safetyIncidents = await db.execute(`
                SELECT work_type, COUNT(*) as count,
                       SUM(CASE WHEN work_type LIKE '%Violation%' THEN 1 ELSE 0 END) as violations
                FROM hse_work 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY work_type
            `);
            
            // Recent safety issues
            const recentSafety = await db.execute(`
                SELECT id, work_title, work_type, department_code, created_at
                FROM hse_work 
                WHERE work_type LIKE '%Violation%' OR work_type LIKE '%Incident%'
                ORDER BY created_at DESC 
                LIMIT 5
            `);
            
            // Inspection reports
            const inspections = await db.execute(`
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
            const financialSummary = await db.execute(`
                SELECT type, COUNT(*) as count, SUM(amount) as total
                FROM financial_transactions 
                WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY type
            `);
            
            // Budget status
            const budgetStatus = await db.execute(`
                SELECT department, SUM(total_proposed) as proposed,
                       SUM(CASE WHEN status = 'Approved' THEN total_proposed ELSE 0 END) as approved
                FROM budgets 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
                GROUP BY department
            `);
            
            // Recent transactions
            const recentTransactions = await db.execute(`
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
            // Policy compliance by status
            const policyCompliance = await db.execute(`
                SELECT status as department, COUNT(*) as policies,
                       SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as active
                FROM policies 
                GROUP BY status
            `);
            
            // Training completion (use leave_requests as proxy if training_records doesn't exist)
            let trainingStatus = [];
            try {
                const ts = await db.execute(`
                    SELECT status, COUNT(*) as count
                    FROM training_records 
                    WHERE completion_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
                    GROUP BY status
                `);
                trainingStatus = ts;
            } catch (e) {
                console.log('training_records table not found, skipping');
            }
            
            // Document compliance by category
            const documentStatus = await db.execute(`
                SELECT category as document_type, status, COUNT(*) as count
                FROM documents 
                GROUP BY category, status
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
            const systemActivity = await db.execute(`
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

        console.log('📊 Audit dashboard data compiled:', JSON.stringify({
            overview: auditData.overview,
            projectCount: auditData.projects?.statusBreakdown?.length || 0,
            employeeGroups: auditData.employees?.statusByDepartment?.length || 0,
            safetyScore: auditData.safety?.safetyScore || 'N/A',
            financialTxCount: auditData.financial?.transactionSummary?.length || 0,
            complianceRate: auditData.compliance?.overallCompliance || 'N/A'
        }));

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
                const projects = await db.execute(`
                    SELECT p.*,
                           DATEDIFF(p.end_date, CURDATE()) as days_remaining
                    FROM projects p
                    ORDER BY p.created_at DESC
                `);
                data = { projects };
                break;
                
            case 'employees':
                const employees = await db.execute(`
                    SELECT e.*, d.name as department_name,
                           (SELECT COUNT(*) FROM attendance a WHERE a.employee_id = e.id 
                            AND a.check_in >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as attendance_days
                    FROM employees e
                    LEFT JOIN departments d ON e.department = d.code
                    ORDER BY e.full_name
                `);
                data = { employees };
                break;
                
            case 'safety':
                const safety = await db.execute(`
                    SELECT *, DATE(created_at) as incident_date
                    FROM hse_work 
                    WHERE work_type LIKE '%Violation%' OR work_type LIKE '%Incident%'
                    ORDER BY created_at DESC
                    LIMIT 50
                `);
                data = { incidents: safety };
                break;
                
            case 'financial':
                const transactions = await db.execute(`
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

// ===== SYSTEM CHANGE TRACKING =====

// Ensure audit_logs table exists
async function ensureAuditLogsTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(50) NOT NULL,
                entity_id VARCHAR(100) NULL,
                entity_name VARCHAR(255) NULL,
                description TEXT NULL,
                performed_by VARCHAR(100) NULL,
                ip_address VARCHAR(45) NULL,
                metadata JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_action (action),
                INDEX idx_entity_type (entity_type),
                INDEX idx_created_at (created_at)
            )
        `);
    } catch (err) {
        // Table may already exist with different schema
        console.log('audit_logs table check:', err.message);
    }
}

// Get system change notifications (new workers, employees, drivers, policies)
router.get('/system-changes', async (req, res) => {
    try {
        console.log('🔔 Fetching system change notifications...');
        await ensureAuditLogsTable();

        const { days = 30, type } = req.query;
        const safeDaysVal = Math.max(1, Math.min(365, parseInt(days) || 30));
        console.log(`  → Period: Last ${safeDaysVal} days, Filter: ${type || 'All'}`);
        const changes = [];

        // Track recently added employees
        try {
            const newEmployees = await db.execute(`
                SELECT id, full_name, department, position, status, created_at
                FROM employees
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            newEmployees.forEach(emp => {
                changes.push({
                    type: 'employee_added',
                    icon: '👤',
                    title: 'New Employee Registered',
                    description: `${emp.full_name} added to ${emp.department || 'Unknown'} department as ${emp.position || 'N/A'}`,
                    entity_id: emp.id,
                    entity_name: emp.full_name,
                    status: emp.status,
                    timestamp: emp.created_at
                });
            });
        } catch (e) { console.log('Employee tracking:', e.message); }

        // Track recently added worker accounts
        try {
            const newWorkers = await db.execute(`
                SELECT id, full_name, account_type, department, status, created_at
                FROM worker_accounts
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            newWorkers.forEach(w => {
                changes.push({
                    type: 'worker_added',
                    icon: '🔧',
                    title: 'New Worker Account Created',
                    description: `${w.full_name} (${w.account_type || 'Worker'}) added to ${w.department || 'General'}`,
                    entity_id: w.id,
                    entity_name: w.full_name,
                    status: w.status,
                    timestamp: w.created_at
                });
            });
        } catch (e) { console.log('Worker tracking:', e.message); }

        // Track recently added drivers
        try {
            const newDrivers = await db.execute(`
                SELECT id, full_name, license_number, status, created_at
                FROM drivers
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            newDrivers.forEach(d => {
                changes.push({
                    type: 'driver_added',
                    icon: '🚗',
                    title: 'New Driver Registered',
                    description: `${d.full_name} registered with license ${d.license_number || 'N/A'}`,
                    entity_id: d.id,
                    entity_name: d.full_name,
                    status: d.status,
                    timestamp: d.created_at
                });
            });
        } catch (e) { console.log('Driver tracking:', e.message); }

        // Track recently added policies
        try {
            const newPolicies = await db.execute(`
                SELECT id, title, submitted_by, status, created_at
                FROM policies
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            newPolicies.forEach(p => {
                changes.push({
                    type: 'policy_added',
                    icon: '📋',
                    title: 'New Policy Added',
                    description: `"${p.title}" policy submitted by ${p.submitted_by || 'Unknown'}`,
                    entity_id: p.id,
                    entity_name: p.title,
                    status: p.status,
                    timestamp: p.created_at
                });
            });
        } catch (e) { console.log('Policy tracking:', e.message); }

        // Track recently added projects
        try {
            const newProjects = await db.execute(`
                SELECT id, name, status, start_date, created_at
                FROM projects
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            newProjects.forEach(p => {
                changes.push({
                    type: 'project_added',
                    icon: '🚀',
                    title: 'New Project Created',
                    description: `"${p.name}" created`,
                    entity_id: p.id,
                    entity_name: p.name,
                    status: p.status,
                    timestamp: p.created_at
                });
            });
        } catch (e) { console.log('Project tracking:', e.message); }

        // Track recently added company cars
        try {
            const newCars = await db.execute(`
                SELECT id, plate_number, car_name, brand_name, vehicle_status as status, created_at
                FROM vehicles
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            newCars.forEach(c => {
                changes.push({
                    type: 'car_added',
                    icon: '🚛',
                    title: 'New Company Car Registered',
                    description: `${c.car_name || ''} ${c.brand_name || ''} (${c.plate_number}) added to fleet`,
                    entity_id: c.id,
                    entity_name: c.plate_number,
                    status: c.status,
                    timestamp: c.created_at
                });
            });
        } catch (e) { console.log('Car tracking:', e.message); }

        // Track recent financial transactions / payment incidents
        try {
            const newPayments = await db.execute(`
                SELECT id, type, category, description, amount, status, created_at
                FROM financial_transactions
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            newPayments.forEach(p => {
                changes.push({
                    type: 'payment_recorded',
                    icon: '💰',
                    title: `Financial Transaction: ${p.type || 'Payment'}`,
                    description: `${p.description || p.category || 'Transaction'} - Amount: ${Number(p.amount || 0).toLocaleString()} (${p.status || 'N/A'})`,
                    entity_id: p.id,
                    entity_name: p.category || p.type,
                    status: p.status,
                    timestamp: p.created_at
                });
            });
        } catch (e) { console.log('Payment tracking:', e.message); }

        // Track recent tax payments
        try {
            const newTax = await db.execute(`
                SELECT id, tax_type, tax_period, amount, payment_status, payment_date, created_at
                FROM tax_payments
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            newTax.forEach(t => {
                changes.push({
                    type: 'tax_payment',
                    icon: '🏛️',
                    title: `Tax Payment: ${t.tax_type || 'Tax'}`,
                    description: `${t.tax_type} for ${t.tax_period} - Amount: ${Number(t.amount || 0).toLocaleString()} (${t.payment_status})`,
                    entity_id: t.id,
                    entity_name: t.tax_type,
                    status: t.payment_status,
                    timestamp: t.created_at
                });
            });
        } catch (e) { console.log('Tax tracking:', e.message); }

        // Track payroll records
        try {
            const newPayroll = await db.execute(`
                SELECT id, payroll_month, payroll_type, total_employees, net_payment, status, created_at
                FROM payroll_records
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            newPayroll.forEach(pr => {
                changes.push({
                    type: 'payroll_processed',
                    icon: '📊',
                    title: `Payroll: ${pr.payroll_month || 'Record'}`,
                    description: `${pr.payroll_type || 'Regular'} payroll for ${pr.total_employees || 0} employees - Net: ${Number(pr.net_payment || 0).toLocaleString()} (${pr.status})`,
                    entity_id: pr.id,
                    entity_name: pr.payroll_month,
                    status: pr.status,
                    timestamp: pr.created_at
                });
            });
        } catch (e) { console.log('Payroll tracking:', e.message); }

        // Track safety incidents
        try {
            const incidents = await db.execute(`
                SELECT id, work_title, work_type, department_code, created_at
                FROM hse_work
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                  AND (work_type LIKE '%Violation%' OR work_type LIKE '%Incident%')
                ORDER BY created_at DESC
                LIMIT 50
            `);
            incidents.forEach(inc => {
                changes.push({
                    type: 'safety_incident',
                    icon: '⚠️',
                    title: `Safety: ${inc.work_type || 'Incident'}`,
                    description: `${inc.work_title || 'Incident'} in ${inc.department_code || 'Unknown'} department`,
                    entity_id: inc.id,
                    entity_name: inc.work_title,
                    status: inc.work_type,
                    timestamp: inc.created_at
                });
            });
        } catch (e) { console.log('Safety incident tracking:', e.message); }

        // Track HSE safety expenses / incidents
        try {
            const safetyWork = await db.execute(`
                SELECT id, work_title, work_type, severity, status, department_code, created_at
                FROM hse_work
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            safetyWork.forEach(s => {
                changes.push({
                    type: 'safety_expense',
                    icon: '🛡️',
                    title: `Safety: ${s.work_type || 'HSE Work'}`,
                    description: `${s.work_title} - Severity: ${s.severity || 'N/A'} (${s.department_code || 'HSE'})`,
                    entity_id: s.id, entity_name: s.work_title, status: s.status, timestamp: s.created_at
                });
            });
        } catch (e) { console.log('Safety expense tracking:', e.message); }

        // Track procurement & sales
        try {
            const sales = await db.execute(`
                SELECT id, request_title, procurement_type, total_budget, status, department, created_at
                FROM procurement_sales
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            sales.forEach(s => {
                changes.push({
                    type: 'sale_procurement',
                    icon: '🛒',
                    title: `${s.procurement_type || 'Procurement'}: ${s.request_title}`,
                    description: `${s.request_title} - Budget: ${Number(s.total_budget || 0).toLocaleString()} (${s.department || 'N/A'})`,
                    entity_id: s.id, entity_name: s.request_title, status: s.status, timestamp: s.created_at
                });
            });
        } catch (e) { console.log('Sales tracking:', e.message); }

        // Track properties
        try {
            const props = await db.execute(`
                SELECT id, title, type, price, status, location, created_at
                FROM properties
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            props.forEach(p => {
                changes.push({
                    type: 'property_added',
                    icon: '🏠',
                    title: `Property: ${p.title}`,
                    description: `${p.type || 'Property'} at ${p.location || 'N/A'} - Price: ${Number(p.price || 0).toLocaleString()} (${p.status})`,
                    entity_id: p.id, entity_name: p.title, status: p.status, timestamp: p.created_at
                });
            });
        } catch (e) { console.log('Property tracking:', e.message); }

        // Track claims
        try {
            const claims = await db.execute(`
                SELECT id, claim_number, claim_type, title, amount_claimed, status, created_at
                FROM claims_management
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            claims.forEach(c => {
                changes.push({
                    type: 'claim_filed',
                    icon: '📄',
                    title: `Claim: ${c.claim_type || 'Claim'}`,
                    description: `${c.title} (#${c.claim_number}) - Amount: ${Number(c.amount_claimed || 0).toLocaleString()} (${c.status})`,
                    entity_id: c.id, entity_name: c.title, status: c.status, timestamp: c.created_at
                });
            });
        } catch (e) { console.log('Claims tracking:', e.message); }

        // Track risk management
        try {
            const risks = await db.execute(`
                SELECT id, risk_number, risk_title, risk_category, probability, impact, status, created_at
                FROM risk_management
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            risks.forEach(r => {
                changes.push({
                    type: 'risk_identified',
                    icon: '⚠️',
                    title: `Risk: ${r.risk_category || 'Risk'}`,
                    description: `${r.risk_title} (#${r.risk_number}) - Probability: ${r.probability}, Impact: ${r.impact}`,
                    entity_id: r.id, entity_name: r.risk_title, status: r.status, timestamp: r.created_at
                });
            });
        } catch (e) { console.log('Risk tracking:', e.message); }

        // Track talent acquisition
        try {
            const talent = await db.execute(`
                SELECT id, requisition_number, position_title, department, position_type, status, created_at
                FROM talent_acquisition
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            talent.forEach(t => {
                changes.push({
                    type: 'talent_requisition',
                    icon: '👥',
                    title: `Talent: ${t.position_title}`,
                    description: `${t.position_type || 'Position'} in ${t.department || 'N/A'} (#${t.requisition_number})`,
                    entity_id: t.id, entity_name: t.position_title, status: t.status, timestamp: t.created_at
                });
            });
        } catch (e) { console.log('Talent tracking:', e.message); }

        // Track office resources
        try {
            const resources = await db.execute(`
                SELECT id, resource_code, resource_name, resource_type, status, department, created_at
                FROM office_resources
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            resources.forEach(r => {
                changes.push({
                    type: 'office_resource',
                    icon: '🖥️',
                    title: `Resource: ${r.resource_name}`,
                    description: `${r.resource_type || 'Resource'} (${r.resource_code}) - ${r.department || 'N/A'}`,
                    entity_id: r.id, entity_name: r.resource_name, status: r.status, timestamp: r.created_at
                });
            });
        } catch (e) { console.log('Office resource tracking:', e.message); }

        // Track discipline monitoring
        try {
            const discipline = await db.execute(`
                SELECT id, case_number, incident_type, severity, status, disciplinary_action, created_at
                FROM discipline_monitoring
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            discipline.forEach(d => {
                changes.push({
                    type: 'discipline_case',
                    icon: '⚖️',
                    title: `Discipline: ${d.incident_type || 'Case'}`,
                    description: `Case #${d.case_number} - Severity: ${d.severity}, Action: ${d.disciplinary_action || 'Pending'}`,
                    entity_id: d.id, entity_name: d.case_number, status: d.status, timestamp: d.created_at
                });
            });
        } catch (e) { console.log('Discipline tracking:', e.message); }

        // Track department changes
        try {
            const depts = await db.execute(`
                SELECT id, name, code, status, created_at
                FROM departments
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            depts.forEach(d => {
                changes.push({
                    type: 'department_added',
                    icon: '🏢',
                    title: `Department: ${d.name}`,
                    description: `Department "${d.name}" (${d.code}) - Status: ${d.status || 'Active'}`,
                    entity_id: d.id, entity_name: d.name, status: d.status, timestamp: d.created_at
                });
            });
        } catch (e) { console.log('Department tracking:', e.message); }

        // Track luggage campaigns
        try {
            const campaigns = await db.execute(`
                SELECT id, campaign_name, luggage_name, total_units_available, units_sold, campaign_status, created_at
                FROM luggage_campaigns
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            campaigns.forEach(c => {
                changes.push({
                    type: 'luggage_campaign',
                    icon: '🧳',
                    title: `Campaign: ${c.campaign_name}`,
                    description: `${c.luggage_name} - ${c.units_sold || 0}/${c.total_units_available || 0} units sold`,
                    entity_id: c.id, entity_name: c.campaign_name, status: c.campaign_status, timestamp: c.created_at
                });
            });
        } catch (e) { console.log('Luggage campaign tracking:', e.message); }

        // Track luggage purchases
        try {
            const purchases = await db.execute(`
                SELECT id, buyer_name, units_purchased, total_amount, purchase_status, payment_method, created_at
                FROM luggage_purchases
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            purchases.forEach(p => {
                changes.push({
                    type: 'luggage_purchase',
                    icon: '💼',
                    title: `Purchase: ${p.buyer_name}`,
                    description: `${p.units_purchased} units - Total: ${Number(p.total_amount || 0).toLocaleString()} via ${p.payment_method || 'N/A'}`,
                    entity_id: p.id, entity_name: p.buyer_name, status: p.purchase_status, timestamp: p.created_at
                });
            });
        } catch (e) { console.log('Luggage purchase tracking:', e.message); }

        // Track materials (inventory + in + out)
        try {
            const materialsIn = await db.execute(`
                SELECT id, track_number, supplier_name, quantity_received, total_cost, invoice_number, created_at
                FROM materials_in
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            materialsIn.forEach(m => {
                changes.push({
                    type: 'material_received',
                    icon: '📦',
                    title: `Material In: ${m.track_number}`,
                    description: `From ${m.supplier_name} - Qty: ${m.quantity_received}, Cost: ${Number(m.total_cost || 0).toLocaleString()}${m.invoice_number ? ' (Inv: ' + m.invoice_number + ')' : ''}`,
                    entity_id: m.id, entity_name: m.track_number, status: 'Received', timestamp: m.created_at
                });
            });
        } catch (e) { console.log('Materials in tracking:', e.message); }

        try {
            const materialsOut = await db.execute(`
                SELECT id, track_number, issued_to, quantity_out, total_value, issue_type, created_at
                FROM materials_out
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            materialsOut.forEach(m => {
                changes.push({
                    type: 'material_issued',
                    icon: '📤',
                    title: `Material Out: ${m.track_number}`,
                    description: `To ${m.issued_to} - Qty: ${m.quantity_out}, Value: ${Number(m.total_value || 0).toLocaleString()} (${m.issue_type || 'Use'})`,
                    entity_id: m.id, entity_name: m.track_number, status: m.issue_type, timestamp: m.created_at
                });
            });
        } catch (e) { console.log('Materials out tracking:', e.message); }

        // Track transport costs
        try {
            const transport = await db.execute(`
                SELECT id, cost_type, category, description, amount, payment_status, invoice_number, created_at
                FROM transport_costs
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC
                LIMIT 50
            `);
            transport.forEach(t => {
                changes.push({
                    type: 'transport_cost',
                    icon: '🚚',
                    title: `Transport: ${t.category || t.cost_type}`,
                    description: `${t.description || t.category} - Amount: ${Number(t.amount || 0).toLocaleString()}${t.invoice_number ? ' (Inv: ' + t.invoice_number + ')' : ''}`,
                    entity_id: t.id, entity_name: t.category, status: t.payment_status, timestamp: t.created_at
                });
            });
        } catch (e) { console.log('Transport cost tracking:', e.message); }

        // Track leadership management changes
        try {
            const leadership = await db.execute(`
                SELECT id, position, department, current_holder, leadership_level, status, created_at
                FROM leadership_management
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC LIMIT 50
            `);
            leadership.forEach(r => {
                changes.push({ type: 'leadership_change', icon: '👔', title: 'Leadership: ' + (r.position || 'Update'),
                    description: `${r.current_holder || 'N/A'} - ${r.department || 'N/A'} (${r.leadership_level || 'N/A'})`,
                    entity_id: r.id, entity_name: r.position, status: r.status, timestamp: r.created_at });
            });
        } catch (e) { console.log('Leadership tracking:', e.message); }

        // Track accountant changes
        try {
            const accountants = await db.execute(`
                SELECT id, name, email, department, employment_type, status, created_at
                FROM accountants
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC LIMIT 50
            `);
            accountants.forEach(r => {
                changes.push({ type: 'accountant_change', icon: '📊', title: 'Accountant: ' + (r.name || 'Update'),
                    description: `${r.name || 'N/A'} - ${r.department || 'N/A'} (${r.employment_type || 'N/A'})`,
                    entity_id: r.id, entity_name: r.name, status: r.status, timestamp: r.created_at });
            });
        } catch (e) { console.log('Accountant tracking:', e.message); }

        // Track mission & vision changes
        try {
            const mv = await db.execute(`
                SELECT id, mission_statement, mission_category, vision_statement, status, created_at
                FROM mission_vision
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC LIMIT 50
            `);
            mv.forEach(r => {
                changes.push({ type: 'mission_vision_change', icon: '🎯', title: 'Mission/Vision: ' + (r.mission_category || 'Update'),
                    description: `${(r.mission_statement || '').substring(0, 80)} (${r.mission_category || 'General'})`,
                    entity_id: r.id, entity_name: r.mission_category, status: r.status, timestamp: r.created_at });
            });
        } catch (e) { console.log('Mission/Vision tracking:', e.message); }

        // Track long-term growth changes
        try {
            const ltg = await db.execute(`
                SELECT id, growth_title, growth_category, timeframe, status, created_at
                FROM long_term_growth
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC LIMIT 50
            `);
            ltg.forEach(r => {
                changes.push({ type: 'long_term_change', icon: '📈', title: 'Long-Term Growth: ' + (r.growth_title || 'Update'),
                    description: `${r.growth_category || 'Strategy'} - Timeframe: ${r.timeframe || 'N/A'}`,
                    entity_id: r.id, entity_name: r.growth_title, status: r.status, timestamp: r.created_at });
            });
        } catch (e) { console.log('Long-term growth tracking:', e.message); }

        // Track senior hiring changes
        try {
            const sh = await db.execute(`
                SELECT id, candidate_name, department, position_level, proposed_salary, requested_by, status, created_at
                FROM senior_hiring_requests
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC LIMIT 50
            `);
            sh.forEach(r => {
                changes.push({ type: 'senior_hiring_change', icon: '👥', title: 'Senior Hiring: ' + (r.candidate_name || 'Request'),
                    description: `${r.candidate_name || 'Candidate'} - ${r.position_level || 'N/A'} in ${r.department || 'N/A'}`,
                    entity_id: r.id, entity_name: r.candidate_name, status: r.status, timestamp: r.created_at });
            });
        } catch (e) { console.log('Senior hiring tracking:', e.message); }

        // Track workforce budget changes
        try {
            const wb = await db.execute(`
                SELECT id, budget_period, total_proposed, submitted_by, status, created_at
                FROM workforce_budgets
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC LIMIT 50
            `);
            wb.forEach(r => {
                changes.push({ type: 'workforce_budget_change', icon: '💰', title: 'Workforce Budget: ' + (r.budget_period || 'Request'),
                    description: `Period: ${r.budget_period || 'N/A'} - Total: ${Number(r.total_proposed || 0).toLocaleString()}`,
                    entity_id: r.id, entity_name: r.budget_period, status: r.status, timestamp: r.created_at });
            });
        } catch (e) { console.log('Workforce budget tracking:', e.message); }

        // Track NHIF contribution changes
        try {
            const nhif = await db.execute(`
                SELECT id, employee_id, contribution_month, total_contribution, payment_status, created_at
                FROM nhif_contributions
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC LIMIT 50
            `);
            nhif.forEach(r => {
                changes.push({ type: 'nhif_contribution', icon: '🏥', title: 'NHIF: Employee #' + (r.employee_id || 'N/A'),
                    description: `Employee #${r.employee_id || 'N/A'} - Total: ${r.total_contribution || 'N/A'} (${r.contribution_month || 'N/A'})`,
                    entity_id: r.id, entity_name: 'Employee #' + r.employee_id, status: r.payment_status, timestamp: r.created_at });
            });
        } catch (e) { console.log('NHIF tracking:', e.message); }

        // Track team changes
        try {
            const teams = await db.execute(`
                SELECT id, name, department, description, status, created_at
                FROM teams
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDaysVal} DAY)
                ORDER BY created_at DESC LIMIT 50
            `);
            teams.forEach(r => {
                changes.push({ type: 'team_change', icon: '👨‍👩‍👧‍👦', title: 'Team: ' + (r.name || 'Update'),
                    description: `Team "${r.name}" in ${r.department || 'N/A'}`,
                    entity_id: r.id, entity_name: r.name, status: r.status, timestamp: r.created_at });
            });
        } catch (e) { console.log('Team tracking:', e.message); }

        // Filter by type if specified
        let filtered = changes;
        if (type) {
            filtered = changes.filter(c => c.type === type);
        }

        // Sort all changes by timestamp descending
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Summary counts
        const summary = {
            total: filtered.length,
            employees: changes.filter(c => c.type === 'employee_added').length,
            workers: changes.filter(c => c.type === 'worker_added').length,
            drivers: changes.filter(c => c.type === 'driver_added').length,
            policies: changes.filter(c => c.type === 'policy_added').length,
            projects: changes.filter(c => c.type === 'project_added').length,
            cars: changes.filter(c => c.type === 'car_added').length,
            payments: changes.filter(c => c.type === 'payment_recorded').length,
            tax: changes.filter(c => c.type === 'tax_payment').length,
            payroll: changes.filter(c => c.type === 'payroll_processed').length,
            incidents: changes.filter(c => c.type === 'safety_incident').length,
            safety: changes.filter(c => c.type === 'safety_expense').length,
            sales: changes.filter(c => c.type === 'sale_procurement').length,
            properties: changes.filter(c => c.type === 'property_added').length,
            claims: changes.filter(c => c.type === 'claim_filed').length,
            risks: changes.filter(c => c.type === 'risk_identified').length,
            talent: changes.filter(c => c.type === 'talent_requisition').length,
            resources: changes.filter(c => c.type === 'office_resource').length,
            discipline: changes.filter(c => c.type === 'discipline_case').length,
            departments: changes.filter(c => c.type === 'department_added').length,
            campaigns: changes.filter(c => c.type === 'luggage_campaign').length,
            luggagePurchases: changes.filter(c => c.type === 'luggage_purchase').length,
            materialsIn: changes.filter(c => c.type === 'material_received').length,
            materialsOut: changes.filter(c => c.type === 'material_issued').length,
            transport: changes.filter(c => c.type === 'transport_cost').length,
            leadership: changes.filter(c => c.type === 'leadership_change').length,
            accountant: changes.filter(c => c.type === 'accountant_change').length,
            missionVision: changes.filter(c => c.type === 'mission_vision_change').length,
            longTerm: changes.filter(c => c.type === 'long_term_change').length,
            seniorHiring: changes.filter(c => c.type === 'senior_hiring_change').length,
            workforceBudget: changes.filter(c => c.type === 'workforce_budget_change').length,
            nhif: changes.filter(c => c.type === 'nhif_contribution').length,
            teams: changes.filter(c => c.type === 'team_change').length
        };

        console.log(`🔔 System changes loaded: ${filtered.length} changes (${changes.length} total before filter)`);
        console.log('  Summary:', JSON.stringify(summary));

        res.json({
            success: true,
            changes: filtered,
            summary,
            period: `Last ${days} days`
        });

    } catch (error) {
        console.error('❌ Error fetching system changes:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get system status overview
router.get('/system-status', async (req, res) => {
    try {
        console.log('📊 Fetching system status overview...');
        const status = {
            timestamp: new Date().toISOString(),
            system: 'Operational',
            components: {}
        };

        // Database connectivity
        try {
            const dbCheck = await db.execute('SELECT 1 as ok');
            status.components.database = { status: 'Connected', healthy: true };
        } catch (e) {
            status.components.database = { status: 'Error', healthy: false, error: e.message };
            status.system = 'Degraded';
        }

        // Table counts for system overview
        const tables = [
            { name: 'employees', label: 'Employees' },
            { name: 'worker_accounts', label: 'Worker Accounts' },
            { name: 'drivers', label: 'Drivers' },
            { name: 'projects', label: 'Projects' },
            { name: 'policies', label: 'Policies' },
            { name: 'vehicles', label: 'Company Cars' },
            { name: 'departments', label: 'Departments' },
            { name: 'documents', label: 'Documents' },
            { name: 'financial_transactions', label: 'Financial Transactions' },
            { name: 'attendance', label: 'Attendance Records' }
        ];

        status.counts = {};
        for (const table of tables) {
            try {
                const rows = await db.execute(`SELECT COUNT(*) as count FROM ${table.name}`);
                const count = rows[0]?.count || 0;
                status.counts[table.name] = { label: table.label, count };
                console.log(`  ✅ ${table.label} (${table.name}): ${count} records`);
            } catch (e) {
                status.counts[table.name] = { label: table.label, count: 0, error: 'Table not found' };
                console.log(`  ❌ ${table.label} (${table.name}): Table not found - ${e.message}`);
            }
        }
        console.log('📊 System counts loaded:', JSON.stringify(Object.entries(status.counts).map(([k, v]) => `${v.label}: ${v.count}`)));

        // Active vs Inactive counts for key entities
        try {
            const activeEmployeesRows = await db.execute(
                "SELECT COUNT(*) as count FROM employees WHERE status = 'Active'"
            );
            const totalEmployeesRows = await db.execute('SELECT COUNT(*) as count FROM employees');
            status.employeeStatus = {
                active: activeEmployeesRows[0]?.count || 0,
                total: totalEmployeesRows[0]?.count || 0
            };
        } catch (e) {
            status.employeeStatus = { active: 0, total: 0 };
        }

        // Recent activity (last 24 hours)
        try {
            const recentEmployeesRows = await db.execute(
                'SELECT COUNT(*) as count FROM employees WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'
            );
            const recentWorkersRows = await db.execute(
                'SELECT COUNT(*) as count FROM worker_accounts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'
            );
            status.recentActivity = {
                newEmployees24h: recentEmployeesRows[0]?.count || 0,
                newWorkers24h: recentWorkersRows[0]?.count || 0
            };
        } catch (e) {
            status.recentActivity = { newEmployees24h: 0, newWorkers24h: 0 };
        }

        // API status
        status.components.api = { status: 'Operational', healthy: true };
        status.components.authentication = { status: 'Active', healthy: true };
        status.components.fileStorage = { status: 'Available', healthy: true };

        res.json({ success: true, data: status });

    } catch (error) {
        console.error('❌ Error fetching system status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== INTERNAL AUDITS (real DB data) =====
router.get('/internal-audits', async (req, res) => {
    try {
        console.log('📋 Fetching internal audit data from database...');
        console.log('  → Querying: financial_transactions, payroll_records, payment_tracking, workforce_budgets, procurement_sales, claims_management, materials_in, materials_out, transport_costs, luggage_campaigns, luggage_purchases');
        const audits = [];

        // Financial transactions audit
        try {
            const txSummary = await db.execute(`
                SELECT type, status, COUNT(*) as count, SUM(amount) as total_amount
                FROM financial_transactions
                GROUP BY type, status
                ORDER BY type, status
            `);
            const txRecent = await db.execute(`
                SELECT id, type, category, description, amount, status, created_at
                FROM financial_transactions
                ORDER BY created_at DESC LIMIT 20
            `);
            audits.push({
                id: 'internal_financial',
                name: 'Financial Records Audit',
                scope: 'All financial transactions',
                summary: txSummary,
                recentRecords: txRecent,
                totalRecords: txSummary.reduce((s, r) => s + r.count, 0),
                totalAmount: txSummary.reduce((s, r) => s + Number(r.total_amount || 0), 0)
            });
            console.log('  ✅ Financial audit:', txSummary.length, 'groups,', txRecent.length, 'recent');
        } catch (e) {
            console.log('  ❌ Financial audit:', e.message);
            audits.push({ id: 'internal_financial', name: 'Financial Records Audit', scope: 'All financial transactions', summary: [], recentRecords: [], totalRecords: 0, totalAmount: 0, error: e.message });
        }

        // Payroll audit
        try {
            const payrollSummary = await db.execute(`
                SELECT status, COUNT(*) as count, SUM(net_payment) as total_net,
                       SUM(total_gross) as total_gross, SUM(total_deductions) as total_deductions
                FROM payroll_records
                GROUP BY status
            `);
            const payrollRecent = await db.execute(`
                SELECT id, payroll_month, payroll_type, total_employees, total_gross,
                       total_deductions, net_payment, status, created_at
                FROM payroll_records
                ORDER BY created_at DESC LIMIT 20
            `);
            audits.push({
                id: 'internal_payroll',
                name: 'Payroll Compliance Audit',
                scope: 'Salary payments & deductions',
                summary: payrollSummary,
                recentRecords: payrollRecent,
                totalRecords: payrollSummary.reduce((s, r) => s + r.count, 0),
                totalNet: payrollSummary.reduce((s, r) => s + Number(r.total_net || 0), 0)
            });
            console.log('  ✅ Payroll audit:', payrollSummary.length, 'groups,', payrollRecent.length, 'recent');
        } catch (e) {
            console.log('  ❌ Payroll audit:', e.message);
            audits.push({ id: 'internal_payroll', name: 'Payroll Compliance Audit', scope: 'Salary payments & deductions', summary: [], recentRecords: [], totalRecords: 0, totalNet: 0, error: e.message });
        }

        // Payment tracking audit
        try {
            const ptSummary = await db.execute(`
                SELECT payment_stage, COUNT(*) as count, SUM(amount) as total
                FROM payment_tracking
                GROUP BY payment_stage
                ORDER BY payment_stage
            `);
            const ptRecent = await db.execute(`
                SELECT id, tracking_number, amount, payment_stage,
                       payment_reference, payment_date, tracking_notes, created_at
                FROM payment_tracking
                ORDER BY created_at DESC LIMIT 20
            `);
            const overdue = ptRecent.filter(p => p.payment_stage === 'Failed');
            audits.push({
                id: 'internal_payments',
                name: 'Payment Tracking Audit',
                scope: 'All payment records & tracking',
                summary: ptSummary,
                recentRecords: ptRecent,
                totalRecords: ptSummary.reduce((s, r) => s + r.count, 0),
                overdueCount: overdue.length
            });
            console.log('  ✅ Payment tracking audit:', ptSummary.length, 'groups,', ptRecent.length, 'recent');
        } catch (e) {
            console.log('  ❌ Payment tracking audit:', e.message);
            audits.push({ id: 'internal_payments', name: 'Payment Tracking Audit', scope: 'All payment records & tracking', summary: [], recentRecords: [], totalRecords: 0, overdueCount: 0, error: e.message });
        }

        // Budget audit
        try {
            const budgetSummary = await db.execute(`
                SELECT status, COUNT(*) as count, SUM(total_proposed) as total_proposed
                FROM workforce_budgets
                GROUP BY status
            `);
            audits.push({
                id: 'internal_budget',
                name: 'Budget Allocation Audit',
                scope: 'Workforce & department budgets',
                summary: budgetSummary,
                totalRecords: budgetSummary.reduce((s, r) => s + r.count, 0),
                totalProposed: budgetSummary.reduce((s, r) => s + Number(r.total_proposed || 0), 0)
            });
            console.log('  ✅ Budget audit:', budgetSummary.length, 'groups');
        } catch (e) {
            console.log('  ❌ Budget audit:', e.message);
            audits.push({ id: 'internal_budget', name: 'Budget Allocation Audit', scope: 'Workforce & department budgets', summary: [], totalRecords: 0, totalProposed: 0, error: e.message });
        }

        // Procurement & Sales audit
        try {
            const procSummary = await db.execute(`
                SELECT procurement_type, status, COUNT(*) as count, SUM(total_budget) as total_budget
                FROM procurement_sales GROUP BY procurement_type, status ORDER BY procurement_type
            `);
            const procRecent = await db.execute(`
                SELECT id, request_title, procurement_type, total_budget, status, department, created_at
                FROM procurement_sales ORDER BY created_at DESC LIMIT 20
            `);
            audits.push({
                id: 'internal_procurement', name: 'Procurement & Sales Audit',
                scope: 'All procurement requests and sales',
                summary: procSummary, recentRecords: procRecent,
                totalRecords: procSummary.reduce((s, r) => s + r.count, 0),
                totalBudget: procSummary.reduce((s, r) => s + Number(r.total_budget || 0), 0)
            });
            console.log('  ✅ Procurement audit:', procSummary.length, 'groups,', procRecent.length, 'recent');
        } catch (e) {
            console.log('  ❌ Procurement audit:', e.message);
            audits.push({ id: 'internal_procurement', name: 'Procurement & Sales Audit', scope: 'All procurement requests and sales', summary: [], recentRecords: [], totalRecords: 0, totalBudget: 0, error: e.message });
        }

        // Claims audit
        try {
            const claimsSummary = await db.execute(`
                SELECT claim_type, status, COUNT(*) as count, SUM(amount_claimed) as total_claimed, SUM(amount_approved) as total_approved
                FROM claims_management GROUP BY claim_type, status ORDER BY claim_type
            `);
            const claimsRecent = await db.execute(`
                SELECT id, claim_number, claim_type, title, amount_claimed, amount_approved, status, created_at
                FROM claims_management ORDER BY created_at DESC LIMIT 20
            `);
            audits.push({
                id: 'internal_claims', name: 'Claims Management Audit',
                scope: 'Medical, accident, insurance claims',
                summary: claimsSummary, recentRecords: claimsRecent,
                totalRecords: claimsSummary.reduce((s, r) => s + r.count, 0),
                totalClaimed: claimsSummary.reduce((s, r) => s + Number(r.total_claimed || 0), 0)
            });
            console.log('  ✅ Claims audit:', claimsSummary.length, 'groups,', claimsRecent.length, 'recent');
        } catch (e) {
            console.log('  ❌ Claims audit:', e.message);
            audits.push({ id: 'internal_claims', name: 'Claims Management Audit', scope: 'Medical, accident, insurance claims', summary: [], recentRecords: [], totalRecords: 0, totalClaimed: 0, error: e.message });
        }

        // Materials audit
        try {
            const matInRows = await db.execute(`
                SELECT COUNT(*) as count, SUM(total_cost) as total_cost FROM materials_in
            `);
            const matOutRows = await db.execute(`
                SELECT COUNT(*) as count, SUM(total_value) as total_value FROM materials_out
            `);
            const matRecent = await db.execute(`
                SELECT id, track_number, supplier_name, quantity_received, total_cost, invoice_number, created_at
                FROM materials_in ORDER BY created_at DESC LIMIT 15
            `);
            const matIn = matInRows[0] || { count: 0, total_cost: 0 };
            const matOut = matOutRows[0] || { count: 0, total_value: 0 };
            audits.push({
                id: 'internal_materials', name: 'Materials Audit',
                scope: 'Material receipts, issues, and inventory',
                summary: [
                    { category: 'Materials Received', count: matIn.count || 0, total: matIn.total_cost || 0 },
                    { category: 'Materials Issued', count: matOut.count || 0, total: matOut.total_value || 0 }
                ],
                recentRecords: matRecent,
                totalRecords: (matIn.count || 0) + (matOut.count || 0)
            });
            console.log('  ✅ Materials audit: In=' + (matIn.count || 0) + ', Out=' + (matOut.count || 0));
        } catch (e) {
            console.log('  ❌ Materials audit:', e.message);
            audits.push({ id: 'internal_materials', name: 'Materials Audit', scope: 'Material receipts, issues, and inventory', summary: [{ category: 'Materials Received', count: 0, total: 0 }, { category: 'Materials Issued', count: 0, total: 0 }], recentRecords: [], totalRecords: 0, error: e.message });
        }

        // Transport costs audit
        try {
            const transportSummary = await db.execute(`
                SELECT category, payment_status, COUNT(*) as count, SUM(amount) as total_amount
                FROM transport_costs GROUP BY category, payment_status ORDER BY category
            `);
            const transportRecent = await db.execute(`
                SELECT id, cost_type, category, description, amount, payment_status, invoice_number, created_at
                FROM transport_costs ORDER BY created_at DESC LIMIT 20
            `);
            audits.push({
                id: 'internal_transport', name: 'Transport Costs Audit',
                scope: 'Vehicle maintenance, fuel, repairs, tolls',
                summary: transportSummary, recentRecords: transportRecent,
                totalRecords: transportSummary.reduce((s, r) => s + r.count, 0),
                totalCost: transportSummary.reduce((s, r) => s + Number(r.total_amount || 0), 0)
            });
            console.log('  ✅ Transport audit:', transportSummary.length, 'groups,', transportRecent.length, 'recent');
        } catch (e) {
            console.log('  ❌ Transport audit:', e.message);
            audits.push({ id: 'internal_transport', name: 'Transport Costs Audit', scope: 'Vehicle maintenance, fuel, repairs, tolls', summary: [], recentRecords: [], totalRecords: 0, totalCost: 0, error: e.message });
        }

        // Luggage campaigns & purchases audit
        try {
            const campSummary = await db.execute(`
                SELECT campaign_status, COUNT(*) as count, SUM(total_units_available) as total_units, SUM(units_sold) as total_sold
                FROM luggage_campaigns GROUP BY campaign_status
            `);
            const purchSummary = await db.execute(`
                SELECT purchase_status, COUNT(*) as count, SUM(total_amount) as total_amount
                FROM luggage_purchases GROUP BY purchase_status
            `);
            audits.push({
                id: 'internal_luggage', name: 'Luggage Campaign & Purchase Audit',
                scope: 'Campaigns, purchases, and revenue',
                summary: [...(campSummary || []).map(r => ({ ...r, category: 'Campaign' })), ...(purchSummary || []).map(r => ({ ...r, category: 'Purchase' }))],
                totalRecords: (campSummary.reduce((s, r) => s + r.count, 0)) + (purchSummary.reduce((s, r) => s + r.count, 0)),
                totalRevenue: purchSummary.reduce((s, r) => s + Number(r.total_amount || 0), 0)
            });
            console.log('  ✅ Luggage audit: campaigns=' + campSummary.length + ', purchases=' + purchSummary.length);
        } catch (e) {
            console.log('  ❌ Luggage audit:', e.message);
            audits.push({ id: 'internal_luggage', name: 'Luggage Campaign & Purchase Audit', scope: 'Campaigns, purchases, and revenue', summary: [], totalRecords: 0, totalRevenue: 0, error: e.message });
        }

        console.log('📋 Internal audits loaded:', audits.length, 'audit sections with data:', audits.map(a => a.name + ' (' + a.totalRecords + ' records)').join(', '));
        res.json({ success: true, audits });
    } catch (error) {
        console.error('❌ Error fetching internal audits:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== EXTERNAL AUDITS (real DB data) =====
router.get('/external-audits', async (req, res) => {
    try {
        console.log('📋 Fetching external audit data from database...');
        console.log('  → Querying: tax_payments, nssf_registration, documents, risk_management, talent_acquisition, properties');
        const audits = [];

        // Tax payments audit
        try {
            const taxSummary = await db.execute(`
                SELECT tax_type, payment_status, COUNT(*) as count,
                       SUM(total_amount) as total_paid,
                       SUM(penalties) as total_penalties
                FROM tax_payments
                GROUP BY tax_type, payment_status
                ORDER BY tax_type
            `);
            const taxRecent = await db.execute(`
                SELECT id, tax_type, tax_period, amount, penalties, interest,
                       total_amount, payment_status, payment_date, due_date, created_at
                FROM tax_payments
                ORDER BY created_at DESC LIMIT 20
            `);
            const overdueTax = taxRecent.filter(t => t.payment_status === 'Overdue' || (t.payment_status === 'Pending' && t.due_date && new Date(t.due_date) < new Date()));
            audits.push({
                id: 'external_tax',
                name: 'Tax Compliance Audit',
                auditor: 'Tanzania Revenue Authority (TRA)',
                scope: 'PAYE, VAT, Corporate Tax, SDL',
                summary: taxSummary,
                recentRecords: taxRecent,
                totalRecords: taxSummary.reduce((s, r) => s + r.count, 0),
                totalPaid: taxSummary.reduce((s, r) => s + Number(r.total_paid || 0), 0),
                overdueCount: overdueTax.length,
                totalPenalties: taxSummary.reduce((s, r) => s + Number(r.total_penalties || 0), 0)
            });
            console.log('  ✅ Tax audit:', taxSummary.length, 'groups,', taxRecent.length, 'recent');
        } catch (e) {
            console.log('  ❌ Tax audit:', e.message);
            audits.push({ id: 'external_tax', name: 'Tax Compliance Audit', auditor: 'Tanzania Revenue Authority (TRA)', scope: 'PAYE, VAT, Corporate Tax, SDL', summary: [], recentRecords: [], totalRecords: 0, totalPaid: 0, overdueCount: 0, totalPenalties: 0, error: e.message });
        }

        // NSSF compliance audit
        try {
            const nssfSummary = await db.execute(`
                SELECT status, COUNT(*) as count,
                       SUM(total_contributions) as total_contributions,
                       SUM(monthly_contribution) as monthly_total
                FROM nssf_registration
                GROUP BY status
            `);
            const nssfRecent = await db.execute(`
                SELECT id, registration_number, nssf_number, employee_id, status,
                       monthly_salary, monthly_contribution, total_contributions,
                       last_contribution_date, created_at
                FROM nssf_registration
                ORDER BY created_at DESC LIMIT 20
            `);
            audits.push({
                id: 'external_nssf',
                name: 'NSSF Compliance Audit',
                auditor: 'National Social Security Fund (NSSF)',
                scope: 'Employee NSSF registrations & contributions',
                summary: nssfSummary,
                recentRecords: nssfRecent,
                totalRecords: nssfSummary.reduce((s, r) => s + r.count, 0),
                totalContributions: nssfSummary.reduce((s, r) => s + Number(r.total_contributions || 0), 0)
            });
            console.log('  ✅ NSSF audit:', nssfSummary.length, 'groups,', nssfRecent.length, 'recent');
        } catch (e) {
            console.log('  ❌ NSSF audit:', e.message);
            audits.push({ id: 'external_nssf', name: 'NSSF Compliance Audit', auditor: 'National Social Security Fund (NSSF)', scope: 'Employee NSSF registrations & contributions', summary: [], recentRecords: [], totalRecords: 0, totalContributions: 0, error: e.message });
        }

        // Document compliance audit
        try {
            const docSummary = await db.execute(`
                SELECT category, status, COUNT(*) as count
                FROM documents
                GROUP BY category, status
                ORDER BY category
            `);
            audits.push({
                id: 'external_documents',
                name: 'Document & Certificate Audit',
                auditor: 'Regulatory Bodies',
                scope: 'Contracts, Permits, Certificates, Reports',
                summary: docSummary,
                totalRecords: docSummary.reduce((s, r) => s + r.count, 0)
            });
            console.log('  ✅ Document audit:', docSummary.length, 'groups');
        } catch (e) {
            console.log('  ❌ Document audit:', e.message);
            audits.push({ id: 'external_documents', name: 'Document & Certificate Audit', auditor: 'Regulatory Bodies', scope: 'Contracts, Permits, Certificates, Reports', summary: [], totalRecords: 0, error: e.message });
        }

        // Risk management audit
        try {
            const riskSummary = await db.execute(`
                SELECT risk_category, status, COUNT(*) as count, SUM(potential_loss) as total_potential_loss
                FROM risk_management GROUP BY risk_category, status ORDER BY risk_category
            `);
            const riskRecent = await db.execute(`
                SELECT id, risk_number, risk_title, risk_category, probability, impact, status, potential_loss, created_at
                FROM risk_management ORDER BY created_at DESC LIMIT 20
            `);
            audits.push({
                id: 'external_risk', name: 'Risk Management Audit',
                auditor: 'Risk Assessment Team',
                scope: 'Financial, operational, safety, legal risks',
                summary: riskSummary, recentRecords: riskRecent,
                totalRecords: riskSummary.reduce((s, r) => s + r.count, 0),
                totalPotentialLoss: riskSummary.reduce((s, r) => s + Number(r.total_potential_loss || 0), 0)
            });
            console.log('  ✅ Risk audit:', riskSummary.length, 'groups,', riskRecent.length, 'recent');
        } catch (e) {
            console.log('  ❌ Risk audit:', e.message);
            audits.push({ id: 'external_risk', name: 'Risk Management Audit', auditor: 'Risk Assessment Team', scope: 'Financial, operational, safety, legal risks', summary: [], recentRecords: [], totalRecords: 0, totalPotentialLoss: 0, error: e.message });
        }

        // Talent acquisition audit
        try {
            const talentSummary = await db.execute(`
                SELECT status, position_type, COUNT(*) as count, SUM(number_of_positions) as total_positions
                FROM talent_acquisition GROUP BY status, position_type ORDER BY status
            `);
            const talentRecent = await db.execute(`
                SELECT id, requisition_number, position_title, department, position_type, status, number_of_positions, created_at
                FROM talent_acquisition ORDER BY created_at DESC LIMIT 20
            `);
            audits.push({
                id: 'external_talent', name: 'Talent Acquisition Audit',
                auditor: 'HR Department',
                scope: 'Hiring requisitions, positions, recruitment',
                summary: talentSummary, recentRecords: talentRecent,
                totalRecords: talentSummary.reduce((s, r) => s + r.count, 0),
                totalPositions: talentSummary.reduce((s, r) => s + Number(r.total_positions || 0), 0)
            });
            console.log('  ✅ Talent audit:', talentSummary.length, 'groups,', talentRecent.length, 'recent');
        } catch (e) {
            console.log('  ❌ Talent audit:', e.message);
            audits.push({ id: 'external_talent', name: 'Talent Acquisition Audit', auditor: 'HR Department', scope: 'Hiring requisitions, positions, recruitment', summary: [], recentRecords: [], totalRecords: 0, totalPositions: 0, error: e.message });
        }

        // Properties audit
        try {
            const propSummary = await db.execute(`
                SELECT type, status, COUNT(*) as count, SUM(price) as total_value
                FROM properties GROUP BY type, status ORDER BY type
            `);
            const propRecent = await db.execute(`
                SELECT id, title, type, price, status, location, created_at
                FROM properties ORDER BY created_at DESC LIMIT 20
            `);
            audits.push({
                id: 'external_properties', name: 'Property Portfolio Audit',
                auditor: 'Real Estate Management',
                scope: 'Properties - residential, commercial, land',
                summary: propSummary, recentRecords: propRecent,
                totalRecords: propSummary.reduce((s, r) => s + r.count, 0),
                totalValue: propSummary.reduce((s, r) => s + Number(r.total_value || 0), 0)
            });
            console.log('  ✅ Property audit:', propSummary.length, 'groups,', propRecent.length, 'recent');
        } catch (e) {
            console.log('  ❌ Property audit:', e.message);
            audits.push({ id: 'external_properties', name: 'Property Portfolio Audit', auditor: 'Real Estate Management', scope: 'Properties - residential, commercial, land', summary: [], recentRecords: [], totalRecords: 0, totalValue: 0, error: e.message });
        }

        console.log('📋 External audits loaded:', audits.length, 'audit sections with data:', audits.map(a => a.name + ' (' + a.totalRecords + ' records)').join(', '));
        res.json({ success: true, audits });
    } catch (error) {
        console.error('❌ Error fetching external audits:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== COMPLIANCE CHECKS (real DB data) =====
router.get('/compliance-checks', async (req, res) => {
    try {
        console.log('📋 Fetching compliance check data from database...');
        console.log('  → Querying: tax_payments, nssf_registration, financial_transactions, payroll_records, policies, payment_tracking, claims_management, risk_management, discipline_monitoring, office_resources, transport_costs, hse_work, departments');
        const checks = {};

        // Tax compliance
        try {
            const taxOverdueRows = await db.execute(`
                SELECT COUNT(*) as count FROM tax_payments
                WHERE payment_status IN ('Overdue', 'Pending')
                  AND due_date < CURDATE()
            `);
            const taxTotalRows = await db.execute(`SELECT COUNT(*) as count FROM tax_payments`);
            const taxPaidRows = await db.execute(`
                SELECT COUNT(*) as count FROM tax_payments WHERE payment_status = 'Paid'
            `);
            const total = taxTotalRows[0]?.count || 0;
            const paid = taxPaidRows[0]?.count || 0;
            const overdueCount = taxOverdueRows[0]?.count || 0;
            checks.tax = {
                label: 'Tax Compliance',
                status: overdueCount > 0 ? 'Issues Found' : (total > 0 ? 'Compliant' : 'Empty - 0 Records'),
                healthy: overdueCount === 0,
                overdue: overdueCount,
                total,
                paid,
                rate: total > 0 ? Math.round((paid / total) * 100) : 0
            };
            console.log('  ✅ Tax compliance: total=' + total + ', paid=' + paid + ', overdue=' + overdueCount);
        } catch (e) {
            console.log('  ❌ Tax compliance:', e.message);
            checks.tax = { label: 'Tax Compliance', status: 'Table Error', healthy: true, overdue: 0, total: 0, paid: 0, rate: 0, error: e.message };
        }

        // NSSF compliance
        try {
            const nssfActiveRows = await db.execute(`
                SELECT COUNT(*) as count FROM nssf_registration WHERE status = 'Active'
            `);
            const nssfTotalRows = await db.execute(`SELECT COUNT(*) as count FROM nssf_registration`);
            const nssfInactiveRows = await db.execute(`
                SELECT COUNT(*) as count FROM nssf_registration WHERE status != 'Active'
            `);
            const total = nssfTotalRows[0]?.count || 0;
            const active = nssfActiveRows[0]?.count || 0;
            const inactiveCount = nssfInactiveRows[0]?.count || 0;
            checks.nssf = {
                label: 'NSSF Compliance',
                status: inactiveCount > 0 ? 'Issues Found' : (total > 0 ? 'Compliant' : 'Empty - 0 Records'),
                healthy: inactiveCount === 0,
                active,
                inactive: inactiveCount,
                total,
                rate: total > 0 ? Math.round((active / total) * 100) : 0
            };
            console.log('  ✅ NSSF compliance: total=' + total + ', active=' + active);
        } catch (e) {
            console.log('  ❌ NSSF compliance:', e.message);
            checks.nssf = { label: 'NSSF Compliance', status: 'Table Error', healthy: true, active: 0, inactive: 0, total: 0, rate: 0, error: e.message };
        }

        // Financial reporting compliance
        try {
            const pendingTxRows = await db.execute(`
                SELECT COUNT(*) as count FROM financial_transactions WHERE status = 'Pending'
            `);
            const totalTxRows = await db.execute(`SELECT COUNT(*) as count FROM financial_transactions`);
            const approvedTxRows = await db.execute(`
                SELECT COUNT(*) as count FROM financial_transactions WHERE status IN ('Approved', 'Processed')
            `);
            const total = totalTxRows[0]?.count || 0;
            const approved = approvedTxRows[0]?.count || 0;
            const pending = pendingTxRows[0]?.count || 0;
            checks.financial = {
                label: 'Financial Reporting',
                status: pending > 5 ? 'Action Required' : (total > 0 ? 'Up to Date' : 'Empty - 0 Records'),
                healthy: pending <= 5,
                pending,
                approved,
                total,
                rate: total > 0 ? Math.round((approved / total) * 100) : 0
            };
            console.log('  ✅ Financial reporting: total=' + total + ', approved=' + approved + ', pending=' + pending);
        } catch (e) {
            console.log('  ❌ Financial reporting:', e.message);
            checks.financial = { label: 'Financial Reporting', status: 'Table Error', healthy: true, pending: 0, approved: 0, total: 0, rate: 0, error: e.message };
        }

        // Payroll compliance
        try {
            const payrollDraftRows = await db.execute(`
                SELECT COUNT(*) as count FROM payroll_records WHERE status = 'draft'
            `);
            const payrollTotalRows = await db.execute(`SELECT COUNT(*) as count FROM payroll_records`);
            const payrollPaidRows = await db.execute(`
                SELECT COUNT(*) as count FROM payroll_records WHERE status IN ('paid', 'approved')
            `);
            const total = payrollTotalRows[0]?.count || 0;
            const paid = payrollPaidRows[0]?.count || 0;
            const draftCount = payrollDraftRows[0]?.count || 0;
            checks.payroll = {
                label: 'Payroll Compliance',
                status: draftCount > 0 ? 'Drafts Pending' : (total > 0 ? 'Compliant' : 'Empty - 0 Records'),
                healthy: draftCount === 0,
                drafts: draftCount,
                paid,
                total,
                rate: total > 0 ? Math.round((paid / total) * 100) : 0
            };
            console.log('  ✅ Payroll compliance: total=' + total + ', paid=' + paid);
        } catch (e) {
            console.log('  ❌ Payroll compliance:', e.message);
            checks.payroll = { label: 'Payroll Compliance', status: 'Table Error', healthy: true, drafts: 0, paid: 0, total: 0, rate: 0, error: e.message };
        }

        // Policy compliance
        try {
            const policyActiveRows = await db.execute(`
                SELECT COUNT(*) as count FROM policies WHERE status = 'Approved'
            `);
            const policyTotalRows = await db.execute(`SELECT COUNT(*) as count FROM policies`);
            const policyPendingRows = await db.execute(`
                SELECT COUNT(*) as count FROM policies WHERE status = 'Pending'
            `);
            const total = policyTotalRows[0]?.count || 0;
            const approved = policyActiveRows[0]?.count || 0;
            const pendingCount = policyPendingRows[0]?.count || 0;
            checks.policies = {
                label: 'Policy Compliance',
                status: pendingCount > 0 ? 'Pending Review' : (total > 0 ? 'Compliant' : 'Empty - 0 Records'),
                healthy: pendingCount === 0,
                approved,
                pending: pendingCount,
                total,
                rate: total > 0 ? Math.round((approved / total) * 100) : 0
            };
            console.log('  ✅ Policy compliance: total=' + total + ', approved=' + approved);
        } catch (e) {
            console.log('  ❌ Policy compliance:', e.message);
            checks.policies = { label: 'Policy Compliance', status: 'Table Error', healthy: true, approved: 0, pending: 0, total: 0, rate: 0, error: e.message };
        }

        // Payment tracking compliance
        try {
            const ptFailedRows = await db.execute(`
                SELECT COUNT(*) as count FROM payment_tracking
                WHERE payment_stage IN ('Failed')
            `);
            const ptTotalRows = await db.execute(`SELECT COUNT(*) as count FROM payment_tracking`);
            const ptCompletedRows = await db.execute(`
                SELECT COUNT(*) as count FROM payment_tracking WHERE payment_stage = 'Completed'
            `);
            const total = ptTotalRows[0]?.count || 0;
            const completed = ptCompletedRows[0]?.count || 0;
            const failedCount = ptFailedRows[0]?.count || 0;
            checks.payments = {
                label: 'Payment Tracking',
                status: failedCount > 0 ? 'Failed Payments' : (total > 0 ? 'On Track' : 'Empty - 0 Records'),
                healthy: failedCount === 0,
                overdue: failedCount,
                completed,
                total,
                rate: total > 0 ? Math.round((completed / total) * 100) : 0
            };
            console.log('  ✅ Payment tracking: total=' + total + ', completed=' + completed);
        } catch (e) {
            console.log('  ❌ Payment tracking:', e.message);
            checks.payments = { label: 'Payment Tracking', status: 'Table Error', healthy: true, overdue: 0, completed: 0, total: 0, rate: 0, error: e.message };
        }

        // Claims compliance
        try {
            const claimsPendingRows = await db.execute(`SELECT COUNT(*) as count FROM claims_management WHERE status IN ('Pending', 'Under Review')`);
            const claimsTotalRows = await db.execute(`SELECT COUNT(*) as count FROM claims_management`);
            const claimsResolvedRows = await db.execute(`SELECT COUNT(*) as count FROM claims_management WHERE status IN ('Approved', 'Paid')`);
            const total = claimsTotalRows[0]?.count || 0;
            const resolved = claimsResolvedRows[0]?.count || 0;
            const pendingCount = claimsPendingRows[0]?.count || 0;
            checks.claims = {
                label: 'Claims Management',
                status: pendingCount > 3 ? 'Pending Claims' : (total > 0 ? 'On Track' : 'Empty - 0 Records'),
                healthy: pendingCount <= 3,
                pending: pendingCount, resolved, total,
                rate: total > 0 ? Math.round((resolved / total) * 100) : 0
            };
            console.log('  ✅ Claims compliance: total=' + total + ', resolved=' + resolved);
        } catch (e) {
            console.log('  ❌ Claims compliance:', e.message);
            checks.claims = { label: 'Claims Management', status: 'Table Error', healthy: true, pending: 0, resolved: 0, total: 0, rate: 0, error: e.message };
        }

        // Risk management compliance
        try {
            const risksOpenRows = await db.execute(`SELECT COUNT(*) as count FROM risk_management WHERE status IN ('Open', 'In Progress')`);
            const risksTotalRows = await db.execute(`SELECT COUNT(*) as count FROM risk_management`);
            const risksMitigatedRows = await db.execute(`SELECT COUNT(*) as count FROM risk_management WHERE status IN ('Mitigated', 'Closed')`);
            const total = risksTotalRows[0]?.count || 0;
            const mitigated = risksMitigatedRows[0]?.count || 0;
            const openCount = risksOpenRows[0]?.count || 0;
            checks.risks = {
                label: 'Risk Management',
                status: openCount > 5 ? 'Open Risks' : (total > 0 ? 'Managed' : 'Empty - 0 Records'),
                healthy: openCount <= 5,
                open: openCount, mitigated, total,
                rate: total > 0 ? Math.round((mitigated / total) * 100) : 0
            };
            console.log('  ✅ Risk compliance: total=' + total + ', mitigated=' + mitigated);
        } catch (e) {
            console.log('  ❌ Risk compliance:', e.message);
            checks.risks = { label: 'Risk Management', status: 'Table Error', healthy: true, open: 0, mitigated: 0, total: 0, rate: 0, error: e.message };
        }

        // Discipline monitoring compliance
        try {
            const discOpenRows = await db.execute(`SELECT COUNT(*) as count FROM discipline_monitoring WHERE status IN ('Open', 'Under Investigation')`);
            const discTotalRows = await db.execute(`SELECT COUNT(*) as count FROM discipline_monitoring`);
            const discClosedRows = await db.execute(`SELECT COUNT(*) as count FROM discipline_monitoring WHERE status = 'Closed'`);
            const total = discTotalRows[0]?.count || 0;
            const closed = discClosedRows[0]?.count || 0;
            const openCount = discOpenRows[0]?.count || 0;
            checks.discipline = {
                label: 'Discipline Monitoring',
                status: openCount > 3 ? 'Open Cases' : (total > 0 ? 'Compliant' : 'Empty - 0 Records'),
                healthy: openCount <= 3,
                open: openCount, closed, total,
                rate: total > 0 ? Math.round((closed / total) * 100) : 0
            };
            console.log('  ✅ Discipline compliance: total=' + total + ', closed=' + closed);
        } catch (e) {
            console.log('  ❌ Discipline compliance:', e.message);
            checks.discipline = { label: 'Discipline Monitoring', status: 'Table Error', healthy: true, open: 0, closed: 0, total: 0, rate: 0, error: e.message };
        }

        // Office resources compliance
        try {
            const resIssuesRows = await db.execute(`SELECT COUNT(*) as count FROM office_resources WHERE status IN ('In Maintenance', 'Lost', 'Retired')`);
            const resTotalRows = await db.execute(`SELECT COUNT(*) as count FROM office_resources`);
            const resAvailableRows = await db.execute(`SELECT COUNT(*) as count FROM office_resources WHERE status IN ('Available', 'Assigned')`);
            const total = resTotalRows[0]?.count || 0;
            const available = resAvailableRows[0]?.count || 0;
            const issuesCount = resIssuesRows[0]?.count || 0;
            checks.officeResources = {
                label: 'Office Resources',
                status: issuesCount > 3 ? 'Maintenance Issues' : (total > 0 ? 'On Track' : 'Empty - 0 Records'),
                healthy: issuesCount <= 3,
                issues: issuesCount, available, total,
                rate: total > 0 ? Math.round((available / total) * 100) : 0
            };
            console.log('  ✅ Office resources: total=' + total + ', available=' + available);
        } catch (e) {
            console.log('  ❌ Office resources:', e.message);
            checks.officeResources = { label: 'Office Resources', status: 'Table Error', healthy: true, issues: 0, available: 0, total: 0, rate: 0, error: e.message };
        }

        // Transport compliance
        try {
            const transPendingRows = await db.execute(`SELECT COUNT(*) as count FROM transport_costs WHERE payment_status IN ('pending', 'rejected')`);
            const transTotalRows = await db.execute(`SELECT COUNT(*) as count FROM transport_costs`);
            const transPaidRows = await db.execute(`SELECT COUNT(*) as count FROM transport_costs WHERE payment_status = 'paid'`);
            const total = transTotalRows[0]?.count || 0;
            const paid = transPaidRows[0]?.count || 0;
            const pendingCount = transPendingRows[0]?.count || 0;
            checks.transport = {
                label: 'Transport Costs',
                status: pendingCount > 3 ? 'Pending Approvals' : (total > 0 ? 'Compliant' : 'Empty - 0 Records'),
                healthy: pendingCount <= 3,
                pending: pendingCount, paid, total,
                rate: total > 0 ? Math.round((paid / total) * 100) : 0
            };
            console.log('  ✅ Transport compliance: total=' + total + ', paid=' + paid);
        } catch (e) {
            console.log('  ❌ Transport compliance:', e.message);
            checks.transport = { label: 'Transport Costs', status: 'Table Error', healthy: true, pending: 0, paid: 0, total: 0, rate: 0, error: e.message };
        }

        // Safety compliance (HSE)
        try {
            const safetyOpenRows = await db.execute(`SELECT COUNT(*) as count FROM hse_work WHERE status IN ('Pending', 'In Progress')`);
            const safetyTotalRows = await db.execute(`SELECT COUNT(*) as count FROM hse_work`);
            const safetyCompletedRows = await db.execute(`SELECT COUNT(*) as count FROM hse_work WHERE status = 'Completed'`);
            const total = safetyTotalRows[0]?.count || 0;
            const completed = safetyCompletedRows[0]?.count || 0;
            const openCount = safetyOpenRows[0]?.count || 0;
            checks.safety = {
                label: 'Safety (HSE)',
                status: openCount > 5 ? 'Open Items' : (total > 0 ? 'Compliant' : 'Empty - 0 Records'),
                healthy: openCount <= 5,
                open: openCount, completed, total,
                rate: total > 0 ? Math.round((completed / total) * 100) : 0
            };
            console.log('  ✅ Safety compliance: total=' + total + ', completed=' + completed);
        } catch (e) {
            console.log('  ❌ Safety compliance:', e.message);
            checks.safety = { label: 'Safety (HSE)', status: 'Table Error', healthy: true, open: 0, completed: 0, total: 0, rate: 0, error: e.message };
        }

        // Department management compliance
        try {
            const deptActiveRows = await db.execute(`SELECT COUNT(*) as count FROM departments WHERE status = 'Active'`);
            const deptTotalRows = await db.execute(`SELECT COUNT(*) as count FROM departments`);
            const total = deptTotalRows[0]?.count || 0;
            const active = deptActiveRows[0]?.count || 0;
            checks.departments = {
                label: 'Department Management',
                status: total > 0 ? 'Active' : 'Empty - 0 Records',
                healthy: true,
                active, total,
                rate: total > 0 ? Math.round((active / total) * 100) : 0
            };
            console.log('  ✅ Department compliance: total=' + total + ', active=' + active);
        } catch (e) {
            console.log('  ❌ Department compliance:', e.message);
            checks.departments = { label: 'Department Management', status: 'Table Error', healthy: true, active: 0, total: 0, rate: 0, error: e.message };
        }

        console.log('📋 Compliance checks loaded:', Object.entries(checks).map(([k, v]) => v.label + ': ' + v.status + ' (' + v.total + ')').join(', '));
        res.json({ success: true, checks });
    } catch (error) {
        console.error('❌ Error fetching compliance checks:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== LOGIN AUDIT LOG =====

// Ensure login_audit_logs table exists
async function ensureLoginAuditLogsTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS login_audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                email VARCHAR(255) NOT NULL,
                user_name VARCHAR(255) NULL,
                role VARCHAR(100) NULL,
                department_name VARCHAR(255) NULL,
                action VARCHAR(50) NOT NULL DEFAULT 'login',
                ip_address VARCHAR(45) NULL,
                user_agent TEXT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'success',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_created_at (created_at),
                INDEX idx_action (action)
            )
        `);
    } catch (err) {
        console.log('login_audit_logs table check:', err.message);
    }
}

// Get login audit logs
router.get('/login-logs', async (req, res) => {
    try {
        console.log('🔍 Fetching login audit logs...');
        await ensureLoginAuditLogsTable();

        const { days = 30, email, role, status, limit: rowLimit = 100 } = req.query;

        const safeDays = Math.max(1, Math.min(365, parseInt(days) || 30));
        const safeLimit = Math.max(1, Math.min(500, parseInt(rowLimit) || 100));

        let query = `
            SELECT id, user_id, email, user_name, role, department_name,
                   action, ip_address, user_agent, status, created_at
            FROM login_audit_logs
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDays} DAY)
        `;
        const params = [];

        if (email) {
            query += ' AND email LIKE ?';
            params.push(`%${email}%`);
        }
        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ` ORDER BY created_at DESC LIMIT ${safeLimit}`;

        const logs = await db.execute(query, params);

        // Get summary stats
        const stats = await db.execute(`
            SELECT
                COUNT(*) as total_events,
                SUM(CASE WHEN action = 'login' AND status = 'success' THEN 1 ELSE 0 END) as successful_logins,
                SUM(CASE WHEN action = 'login' AND status = 'failed' THEN 1 ELSE 0 END) as failed_logins,
                SUM(CASE WHEN action = 'logout' THEN 1 ELSE 0 END) as logouts,
                COUNT(DISTINCT email) as unique_users
            FROM login_audit_logs
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeDays} DAY)
        `);

        res.json({
            success: true,
            data: {
                logs: logs,
                stats: stats[0] || { total_events: 0, successful_logins: 0, failed_logins: 0, logouts: 0, unique_users: 0 },
                period_days: parseInt(days)
            }
        });
    } catch (error) {
        console.error('❌ Error fetching login audit logs:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to load login audit logs'
        });
    }
});

// Get currently active sessions (users who logged in but haven't logged out)
router.get('/active-sessions', async (req, res) => {
    try {
        console.log('🔍 Fetching active sessions...');
        await ensureLoginAuditLogsTable();

        const sessions = await db.execute(`
            SELECT l.email, l.user_name, l.role, l.department_name, l.ip_address,
                   l.created_at as login_time
            FROM login_audit_logs l
            INNER JOIN (
                SELECT email, MAX(created_at) as last_activity
                FROM login_audit_logs
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY email
            ) latest ON l.email = latest.email AND l.created_at = latest.last_activity
            WHERE l.action = 'login' AND l.status = 'success'
            ORDER BY l.created_at DESC
        `);

        res.json({
            success: true,
            data: {
                sessions: sessions,
                active_count: sessions.length
            }
        });
    } catch (error) {
        console.error('❌ Error fetching active sessions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get detailed activity for a specific user
router.get('/user-activity', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email parameter is required' });
        }

        console.log('🔍 Fetching user activity for:', email);
        await ensureLoginAuditLogsTable();

        // Get all login/logout logs for this user
        const logs = await db.execute(`
            SELECT id, user_id, email, user_name, role, department_name,
                   action, ip_address, user_agent, status, created_at
            FROM login_audit_logs
            WHERE email = ?
            ORDER BY created_at DESC
            LIMIT 200
        `, [email]);

        // Get summary stats for this user
        const summaryRows = await db.execute(`
            SELECT
                COUNT(*) as total_logins,
                SUM(CASE WHEN action = 'login' AND status = 'success' THEN 1 ELSE 0 END) as successful_logins,
                SUM(CASE WHEN action = 'login' AND status = 'failed' THEN 1 ELSE 0 END) as failed_logins,
                SUM(CASE WHEN action = 'logout' THEN 1 ELSE 0 END) as logouts,
                MIN(created_at) as first_login,
                MAX(created_at) as last_login,
                COUNT(DISTINCT ip_address) as unique_ips,
                COUNT(DISTINCT DATE(created_at)) as active_days
            FROM login_audit_logs
            WHERE email = ?
        `, [email]);

        const summary = summaryRows[0] || {};

        // Calculate session durations by pairing logins with logouts or next login
        let totalSessionMinutes = 0;
        let sessionCount = 0;
        const logsAsc = [...logs].reverse();
        for (let i = 0; i < logsAsc.length; i++) {
            if (logsAsc[i].action === 'login' && logsAsc[i].status === 'success') {
                let endTime = null;
                for (let j = i + 1; j < logsAsc.length; j++) {
                    if (logsAsc[j].email === logsAsc[i].email &&
                        (logsAsc[j].action === 'logout' || logsAsc[j].action === 'login')) {
                        endTime = new Date(logsAsc[j].created_at);
                        break;
                    }
                }
                if (endTime) {
                    const loginTime = new Date(logsAsc[i].created_at);
                    const durationMinutes = (endTime - loginTime) / 60000;
                    if (durationMinutes > 0 && durationMinutes < 1440) {
                        totalSessionMinutes += durationMinutes;
                        sessionCount++;
                    }
                }
            }
        }

        // Add session duration to each log entry
        const logsWithDuration = logs.map((log, idx) => {
            let sessionDuration = null;
            if (log.action === 'login' && log.status === 'success') {
                for (let j = idx - 1; j >= 0; j--) {
                    if (logs[j].email === log.email &&
                        (logs[j].action === 'logout' || logs[j].action === 'login')) {
                        const loginTime = new Date(log.created_at);
                        const endTime = new Date(logs[j].created_at);
                        const duration = (endTime - loginTime) / 60000;
                        if (duration > 0 && duration < 1440) {
                            sessionDuration = Math.round(duration);
                        }
                        break;
                    }
                }
            }
            return { ...log, session_duration_minutes: sessionDuration };
        });

        summary.total_time_minutes = Math.round(totalSessionMinutes);
        summary.avg_session_minutes = sessionCount > 0 ? Math.round(totalSessionMinutes / sessionCount) : 0;

        res.json({
            success: true,
            data: {
                logs: logsWithDuration,
                summary
            }
        });
    } catch (error) {
        console.error('❌ Error fetching user activity:', error);
        res.status(500).json({ success: false, error: error.message });
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
            'GET /audit/system-changes - System change notifications',
            'GET /audit/system-status - System status overview',
            'GET /audit/internal-audits - Internal audit data from DB',
            'GET /audit/external-audits - External audit data from DB',
            'GET /audit/compliance-checks - Compliance check data from DB',
            'GET /audit/login-logs - Login/logout audit trail',
            'GET /audit/active-sessions - Currently active user sessions',
            'GET /audit/user-activity?email=X - Detailed activity for a specific user',
            'POST /audit/report - Generate audit report',
            'GET /audit/test - Test endpoint'
        ]
    });
});

module.exports = router;
