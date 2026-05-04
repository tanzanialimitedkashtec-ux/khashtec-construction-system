const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

console.log('📊 Workforce reports routes loaded with database connection');

// Test GET route
router.get('/test', (req, res) => {
    console.log('📊 GET /api/workforce-reports/test accessed');
    res.json({ 
        message: 'Workforce reports API test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// Get comprehensive workforce summary
router.get('/summary', async (req, res) => {
    console.log('📊 GET /api/workforce-reports/summary accessed');
    try {
        // Get employee statistics
        const totalEmployeesQuery = await db.execute('SELECT COUNT(*) as total FROM employees WHERE status != "terminated"');
        const activeEmployeesQuery = await db.execute('SELECT COUNT(*) as active FROM employees WHERE status = "active"');
        const newHiresQuery = await db.execute('SELECT COUNT(*) as new_hires FROM employees WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)');
        
        // Get department distribution
        const departmentQuery = await db.execute(`
            SELECT department, COUNT(*) as count 
            FROM employees 
            WHERE status = 'active' AND department IS NOT NULL
            GROUP BY department
        `);
        
        // Get salary information
        const salaryQuery = await db.execute(`
            SELECT SUM(salary) as total_payroll, AVG(salary) as avg_salary
            FROM employees 
            WHERE status = 'active' AND salary > 0
        `);
        
        // Get attendance statistics (last 30 days)
        const attendanceQuery = await db.execute(`
            SELECT 
                COUNT(CASE WHEN attendance_status = 'present' THEN 1 END) as present_days,
                COUNT(CASE WHEN attendance_status = 'absent' THEN 1 END) as absent_days,
                COUNT(CASE WHEN attendance_status = 'late' THEN 1 END) as late_days,
                COUNT(*) as total_days
            FROM attendance 
            WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `);
        
        // Get HSE incidents (last 30 days)
        const incidentsQuery = await db.execute(`
            SELECT COUNT(*) as incidents_count
            FROM hse_incidents 
            WHERE incident_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);
        
        // Calculate metrics
        const totalEmployees = totalEmployeesQuery[0]?.total || 0;
        const activeEmployees = activeEmployeesQuery[0]?.active || 0;
        const newHires = newHiresQuery[0]?.new_hires || 0;
        const totalPayroll = salaryQuery[0]?.total_payroll || 0;
        const avgSalary = salaryQuery[0]?.avg_salary || 0;
        const presentDays = attendanceQuery[0]?.present_days || 0;
        const totalAttendanceDays = attendanceQuery[0]?.total_days || 0;
        const incidentsCount = incidentsQuery[0]?.incidents_count || 0;
        
        // Calculate percentages
        const attendanceRate = totalAttendanceDays > 0 ? ((presentDays / totalAttendanceDays) * 100).toFixed(1) : 0;
        const turnoverRate = totalEmployees > 0 ? ((newHires / totalEmployees) * 100).toFixed(1) : 0;
        
        // Format department distribution
        const departmentDistribution = departmentQuery.map(dept => ({
            department: dept.department,
            count: dept.count,
            percentage: totalEmployees > 0 ? ((dept.count / totalEmployees) * 100).toFixed(1) : 0
        }));
        
        // YTD comparison (mock data for now)
        const ytdGrowth = 6.7; // Mock YTD growth percentage
        
        const summary = {
            headcount: {
                current: totalEmployees,
                active: activeEmployees,
                new_hires_q1: newHires,
                ytd_growth: ytdGrowth
            },
            departments: departmentDistribution,
            recruitment: {
                new_hires_q1: newHires,
                growth_vs_last_year: 33 // Mock comparison
            },
            costs: {
                annual_workforce_cost: totalPayroll * 12, // Annualize monthly payroll
                average_salary: avgSalary,
                budget_status: 'On Budget'
            },
            performance: {
                attendance_rate: parseFloat(attendanceRate),
                productivity_index: 87.3, // Mock data
                training_completion: 76.8 // Mock data
            },
            safety: {
                incidents_last_30_days: incidentsCount,
                compliance_rate: 95.0 // Mock data
            },
            turnover: {
                annual_rate: 12.5, // Mock data
                voluntary: 8.3, // Mock data
                involuntary: 4.2 // Mock data
            }
        };
        
        console.log('📊 Workforce summary generated successfully');
        res.json(summary);
        
    } catch (error) {
        console.error('Error generating workforce summary:', error);
        res.status(500).json({ error: 'Failed to generate workforce summary' });
    }
});

// Get detailed employee table data
router.get('/employees', async (req, res) => {
    console.log('📊 GET /api/workforce-reports/employees accessed');
    try {
        const employees = await db.execute(`
            SELECT 
                e.id,
                e.employee_id,
                ed.full_name,
                ed.gmail as email,
                ed.phone,
                e.position,
                e.department,
                e.salary,
                e.hire_date,
                e.status,
                ed.contract_type,
                ed.nida
            FROM employees e
            LEFT JOIN employee_details ed ON e.id = ed.employee_id
            ORDER BY e.hire_date DESC
        `);
        
        console.log(`📊 Retrieved ${employees.length} employee records`);
        res.json(employees);
        
    } catch (error) {
        console.error('Error fetching employee data:', error);
        res.status(500).json({ error: 'Failed to fetch employee data' });
    }
});

// Get turnover analysis data
router.get('/turnover', async (req, res) => {
    console.log('📊 GET /api/workforce-reports/turnover accessed');
    try {
        // Get terminated employees in last 12 months
        const terminatedEmployees = await db.execute(`
            SELECT 
                ed.full_name,
                e.department,
                e.position,
                e.status,
                e.hire_date,
                ed.contract_type
            FROM employees e
            LEFT JOIN employee_details ed ON e.id = ed.employee_id
            WHERE e.status = 'terminated' 
            AND e.hire_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            ORDER BY e.hire_date DESC
        `);
        
        // Calculate turnover metrics
        const totalEmployeesQuery = await db.execute('SELECT COUNT(*) as total FROM employees WHERE status != "terminated"');
        const totalEmployees = totalEmployeesQuery[0]?.total || 0;
        
        const turnoverData = {
            annual_turnover_rate: 12.5, // Mock calculation
            voluntary_turnover: 8.3, // Mock data
            involuntary_turnover: 4.2, // Mock data
            terminated_employees: terminatedEmployees,
            total_active_employees: totalEmployees
        };
        
        console.log('📊 Turnover analysis generated successfully');
        res.json(turnoverData);
        
    } catch (error) {
        console.error('Error generating turnover analysis:', error);
        res.status(500).json({ error: 'Failed to generate turnover analysis' });
    }
});

// Get performance metrics
router.get('/performance', async (req, res) => {
    console.log('📊 GET /api/workforce-reports/performance accessed');
    try {
        // Get attendance data for last 90 days
        const attendanceData = await db.execute(`
            SELECT 
                employee_name,
                COUNT(CASE WHEN attendance_status = 'present' THEN 1 END) as present_days,
                COUNT(CASE WHEN attendance_status = 'absent' THEN 1 END) as absent_days,
                COUNT(CASE WHEN attendance_status = 'late' THEN 1 END) as late_days,
                COUNT(*) as total_days,
                ROUND((COUNT(CASE WHEN attendance_status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_rate
            FROM attendance 
            WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
            GROUP BY employee_name
            HAVING total_days >= 10  -- Only include employees with 10+ days of data
            ORDER BY attendance_rate DESC
        `);
        
        // Mock training completion data
        const trainingData = [
            { employee_name: 'John Smith', courses_completed: 8, total_courses: 10, completion_rate: 80.0 },
            { employee_name: 'Jane Doe', courses_completed: 9, total_courses: 10, completion_rate: 90.0 },
            { employee_name: 'Mike Johnson', courses_completed: 7, total_courses: 10, completion_rate: 70.0 }
        ];
        
        const performanceData = {
            productivity_index: 87.3, // Mock data
            attendance_data: attendanceData,
            training_data: trainingData,
            overall_attendance_rate: 94.2, // Mock data
            overall_training_completion: 76.8 // Mock data
        };
        
        console.log('📊 Performance metrics generated successfully');
        res.json(performanceData);
        
    } catch (error) {
        console.error('Error generating performance metrics:', error);
        res.status(500).json({ error: 'Failed to generate performance metrics' });
    }
});

// Get compliance report
router.get('/compliance', async (req, res) => {
    console.log('📊 GET /api/workforce-reports/compliance accessed');
    try {
        // Get HSE compliance data
        const hseIncidents = await db.execute(`
            SELECT 
                type,
                severity,
                COUNT(*) as count
            FROM hse_incidents 
            WHERE incident_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)
            GROUP BY type, severity
            ORDER BY count DESC
        `);
        
        // Get PPE issuance compliance
        const ppeCompliance = await db.execute(`
            SELECT 
                ppe_type,
                COUNT(CASE WHEN status = 'issued' THEN 1 END) as issued,
                COUNT(*) as total
            FROM ppe_issuance 
            WHERE issue_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
            GROUP BY ppe_type
        `);
        
        const complianceData = {
            labor_law_compliance: 'Compliant',
            safety_regulations: 'Compliant',
            contract_compliance: '95% Compliant',
            hse_incidents: hseIncidents,
            ppe_compliance: ppeCompliance,
            overall_compliance_rate: 95.0
        };
        
        console.log('📊 Compliance report generated successfully');
        res.json(complianceData);
        
    } catch (error) {
        console.error('Error generating compliance report:', error);
        res.status(500).json({ error: 'Failed to generate compliance report' });
    }
});

module.exports = router;
