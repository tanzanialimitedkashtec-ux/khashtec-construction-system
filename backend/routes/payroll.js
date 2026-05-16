const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Ensure payroll_records table exists
async function ensurePayrollTables() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS payroll_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                payroll_month VARCHAR(20) NOT NULL,
                payment_date DATE NOT NULL,
                payroll_type ENUM('regular', 'overtime', 'bonus', 'termination') DEFAULT 'regular',
                total_employees INT NOT NULL DEFAULT 0,
                total_gross DECIMAL(15,2) NOT NULL DEFAULT 0,
                total_deductions DECIMAL(15,2) NOT NULL DEFAULT 0,
                net_payment DECIMAL(15,2) NOT NULL DEFAULT 0,
                processed_by VARCHAR(255),
                status ENUM('draft', 'processed', 'approved', 'paid') DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_payroll_month (payroll_month),
                INDEX idx_status (status)
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS salary_structures (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id VARCHAR(50) NOT NULL,
                basic_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
                housing_allowance DECIMAL(15,2) DEFAULT 0,
                transport_allowance DECIMAL(15,2) DEFAULT 0,
                medical_allowance DECIMAL(15,2) DEFAULT 0,
                other_allowances DECIMAL(15,2) DEFAULT 0,
                gross_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
                approved_by VARCHAR(255),
                approved_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_employee_salary (employee_id),
                INDEX idx_employee_id (employee_id)
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS payslip_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id VARCHAR(50) NOT NULL,
                employee_name VARCHAR(255),
                payroll_month VARCHAR(20) NOT NULL,
                basic_salary DECIMAL(15,2) DEFAULT 0,
                allowances DECIMAL(15,2) DEFAULT 0,
                gross_salary DECIMAL(15,2) DEFAULT 0,
                nssf_deduction DECIMAL(15,2) DEFAULT 0,
                paye_tax DECIMAL(15,2) DEFAULT 0,
                other_deductions DECIMAL(15,2) DEFAULT 0,
                net_salary DECIMAL(15,2) DEFAULT 0,
                generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                emailed BOOLEAN DEFAULT FALSE,
                INDEX idx_employee_month (employee_id, payroll_month),
                INDEX idx_payroll_month (payroll_month)
            )
        `);
    } catch (error) {
        console.error('❌ Error ensuring payroll tables:', error.message);
    }
}

ensurePayrollTables();

// GET /api/payroll/overview - Get payroll overview stats
router.get('/overview', async (req, res) => {
    try {
        console.log('📊 GET /api/payroll/overview called');

        const [employees] = await db.execute(`
            SELECT id, employee_id, full_name, position, department, salary, status, hire_date
            FROM employees
            WHERE status = 'active'
        `);

        const totalEmployees = employees ? employees.length : 0;
        const totalMonthlyPayroll = employees && employees.length > 0
            ? employees.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0)
            : 0;
        const avgSalary = totalEmployees > 0 ? totalMonthlyPayroll / totalEmployees : 0;

        // Get last processed payroll
        const [lastPayroll] = await db.execute(`
            SELECT payroll_month, payment_date, status
            FROM payroll_records
            ORDER BY created_at DESC
            LIMIT 1
        `);

        // Get salary structures count
        const [salaryStructures] = await db.execute(`
            SELECT COUNT(*) as count FROM salary_structures
        `);

        res.json({
            success: true,
            data: {
                totalEmployees,
                totalMonthlyPayroll,
                avgSalary,
                salaryStructuresCount: salaryStructures && salaryStructures[0] ? salaryStructures[0].count : 0,
                lastPayroll: lastPayroll && lastPayroll[0] ? lastPayroll[0] : null,
                employees: employees || []
            }
        });
    } catch (error) {
        console.error('❌ Error fetching payroll overview:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch payroll overview', details: error.message });
    }
});

// GET /api/payroll/employees - Get employees for dropdowns
router.get('/employees', async (req, res) => {
    try {
        console.log('👥 GET /api/payroll/employees called');

        const [employees] = await db.execute(`
            SELECT id, employee_id, full_name, position, department, salary
            FROM employees
            WHERE status = 'active'
            ORDER BY full_name ASC
        `);

        res.json({
            success: true,
            data: employees || []
        });
    } catch (error) {
        console.error('❌ Error fetching payroll employees:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch employees', details: error.message });
    }
});

// POST /api/payroll/salary-structure - Save salary structure
router.post('/salary-structure', async (req, res) => {
    try {
        console.log('💰 POST /api/payroll/salary-structure called');
        console.log('📝 Request body:', req.body);

        const { employeeId, basicSalary, housingAllowance, transportAllowance, medicalAllowance, otherAllowances, grossSalary } = req.body;

        if (!employeeId || !basicSalary) {
            return res.status(400).json({ success: false, error: 'Employee ID and basic salary are required' });
        }

        const gross = parseFloat(grossSalary) || (
            parseFloat(basicSalary) +
            parseFloat(housingAllowance || 0) +
            parseFloat(transportAllowance || 0) +
            parseFloat(medicalAllowance || 0) +
            parseFloat(otherAllowances || 0)
        );

        await db.execute(`
            INSERT INTO salary_structures 
            (employee_id, basic_salary, housing_allowance, transport_allowance, medical_allowance, other_allowances, gross_salary, approved_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            basic_salary = VALUES(basic_salary),
            housing_allowance = VALUES(housing_allowance),
            transport_allowance = VALUES(transport_allowance),
            medical_allowance = VALUES(medical_allowance),
            other_allowances = VALUES(other_allowances),
            gross_salary = VALUES(gross_salary),
            approved_by = VALUES(approved_by),
            approved_date = CURRENT_TIMESTAMP
        `, [
            employeeId,
            parseFloat(basicSalary) || 0,
            parseFloat(housingAllowance) || 0,
            parseFloat(transportAllowance) || 0,
            parseFloat(medicalAllowance) || 0,
            parseFloat(otherAllowances) || 0,
            gross,
            req.body.approvedBy || 'Finance Manager'
        ]);

        // Also update the employees table salary field
        await db.execute(`
            UPDATE employees SET salary = ? WHERE employee_id = ? OR id = ?
        `, [gross, employeeId, employeeId]);

        res.json({ success: true, message: 'Salary structure saved successfully', grossSalary: gross });
    } catch (error) {
        console.error('❌ Error saving salary structure:', error.message);
        res.status(500).json({ success: false, error: 'Failed to save salary structure', details: error.message });
    }
});

// GET /api/payroll/salary-structures - Get all salary structures
router.get('/salary-structures', async (req, res) => {
    try {
        const [structures] = await db.execute(`
            SELECT s.*, e.full_name, e.department, e.position
            FROM salary_structures s
            LEFT JOIN employees e ON s.employee_id = e.employee_id OR s.employee_id = e.id
            ORDER BY s.created_at DESC
        `);

        res.json({ success: true, data: structures || [] });
    } catch (error) {
        console.error('❌ Error fetching salary structures:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch salary structures', details: error.message });
    }
});

// POST /api/payroll/process - Process monthly payroll
router.post('/process', async (req, res) => {
    try {
        console.log('🔄 POST /api/payroll/process called');
        console.log('📝 Request body:', req.body);

        const { payrollMonth, paymentDate, payrollType } = req.body;

        if (!payrollMonth || !paymentDate) {
            return res.status(400).json({ success: false, error: 'Payroll month and payment date are required' });
        }

        // Get all active employees with salary structures
        const [employees] = await db.execute(`
            SELECT e.id, e.employee_id, e.full_name, e.department, e.position,
                   COALESCE(s.gross_salary, e.salary, 0) as gross_salary,
                   COALESCE(s.basic_salary, e.salary, 0) as basic_salary,
                   COALESCE(s.housing_allowance, 0) as housing_allowance,
                   COALESCE(s.transport_allowance, 0) as transport_allowance,
                   COALESCE(s.medical_allowance, 0) as medical_allowance,
                   COALESCE(s.other_allowances, 0) as other_allowances
            FROM employees e
            LEFT JOIN salary_structures s ON e.employee_id = s.employee_id OR e.id = s.employee_id
            WHERE e.status = 'active'
        `);

        if (!employees || employees.length === 0) {
            return res.status(404).json({ success: false, error: 'No active employees found for payroll processing' });
        }

        const totalEmployees = employees.length;
        let totalGross = 0;
        let totalDeductions = 0;

        const employeePayrolls = employees.map(emp => {
            const gross = parseFloat(emp.gross_salary) || 0;
            const basic = parseFloat(emp.basic_salary) || gross;
            
            // Tanzania tax calculations
            const nssf = basic * 0.10; // Employee NSSF contribution (10%)
            const paye = calculatePAYE(gross);
            const otherDeductions = 0;
            const totalDeduction = nssf + paye + otherDeductions;
            const netSalary = gross - totalDeduction;

            totalGross += gross;
            totalDeductions += totalDeduction;

            return {
                employeeId: emp.employee_id || emp.id,
                employeeName: emp.full_name || `Employee ${emp.id}`,
                department: emp.department,
                position: emp.position,
                basicSalary: basic,
                allowances: gross - basic,
                grossSalary: gross,
                nssfDeduction: nssf,
                payeTax: paye,
                otherDeductions: otherDeductions,
                netSalary: netSalary
            };
        });

        const netPayment = totalGross - totalDeductions;

        // Insert payroll record
        const [result] = await db.execute(`
            INSERT INTO payroll_records 
            (payroll_month, payment_date, payroll_type, total_employees, total_gross, total_deductions, net_payment, processed_by, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'processed')
        `, [payrollMonth, paymentDate, payrollType || 'regular', totalEmployees, totalGross, totalDeductions, netPayment, req.body.processedBy || 'Finance Manager']);

        // Generate payslip records for each employee
        for (const emp of employeePayrolls) {
            await db.execute(`
                INSERT INTO payslip_records 
                (employee_id, employee_name, payroll_month, basic_salary, allowances, gross_salary, nssf_deduction, paye_tax, other_deductions, net_salary)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                basic_salary = VALUES(basic_salary),
                allowances = VALUES(allowances),
                gross_salary = VALUES(gross_salary),
                nssf_deduction = VALUES(nssf_deduction),
                paye_tax = VALUES(paye_tax),
                other_deductions = VALUES(other_deductions),
                net_salary = VALUES(net_salary),
                generated_at = CURRENT_TIMESTAMP
            `, [
                emp.employeeId,
                emp.employeeName,
                payrollMonth,
                emp.basicSalary,
                emp.allowances,
                emp.grossSalary,
                emp.nssfDeduction,
                emp.payeTax,
                emp.otherDeductions,
                emp.netSalary
            ]);
        }

        res.json({
            success: true,
            message: 'Payroll processed successfully',
            data: {
                payrollId: result ? result.insertId : null,
                payrollMonth,
                paymentDate,
                totalEmployees,
                totalGross,
                totalDeductions,
                netPayment,
                employeePayrolls
            }
        });
    } catch (error) {
        console.error('❌ Error processing payroll:', error.message);
        res.status(500).json({ success: false, error: 'Failed to process payroll', details: error.message });
    }
});

// GET /api/payroll/history - Get payroll processing history
router.get('/history', async (req, res) => {
    try {
        const [records] = await db.execute(`
            SELECT * FROM payroll_records ORDER BY created_at DESC LIMIT 20
        `);

        res.json({ success: true, data: records || [] });
    } catch (error) {
        console.error('❌ Error fetching payroll history:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch payroll history', details: error.message });
    }
});

// GET /api/payroll/payslips/:month - Get payslips for a specific month
router.get('/payslips/:month', async (req, res) => {
    try {
        const { month } = req.params;
        console.log('📄 GET /api/payroll/payslips/' + month);

        const [payslips] = await db.execute(`
            SELECT * FROM payslip_records WHERE payroll_month = ? ORDER BY employee_name ASC
        `, [month]);

        res.json({ success: true, data: payslips || [] });
    } catch (error) {
        console.error('❌ Error fetching payslips:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch payslips', details: error.message });
    }
});

// GET /api/payroll/payslips/employee/:employeeId/:month - Get specific employee payslip
router.get('/payslips/employee/:employeeId/:month', async (req, res) => {
    try {
        const { employeeId, month } = req.params;
        console.log('📄 GET /api/payroll/payslips/employee/' + employeeId + '/' + month);

        const [payslips] = await db.execute(`
            SELECT * FROM payslip_records 
            WHERE employee_id = ? AND payroll_month = ?
            LIMIT 1
        `, [employeeId, month]);

        res.json({ success: true, data: payslips && payslips[0] ? payslips[0] : null });
    } catch (error) {
        console.error('❌ Error fetching employee payslip:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch payslip', details: error.message });
    }
});

// POST /api/payroll/payslips/email - Email payslips
router.post('/payslips/email', async (req, res) => {
    try {
        const { month, employeeId } = req.body;
        console.log('📧 POST /api/payroll/payslips/email', { month, employeeId });

        let query = `UPDATE payslip_records SET emailed = TRUE WHERE payroll_month = ?`;
        let params = [month];

        if (employeeId && employeeId !== 'all') {
            query += ` AND employee_id = ?`;
            params.push(employeeId);
        }

        const [result] = await db.execute(query, params);

        res.json({ success: true, message: 'Payslips marked as emailed', updated: result ? result.affectedRows : 0 });
    } catch (error) {
        console.error('❌ Error emailing payslips:', error.message);
        res.status(500).json({ success: false, error: 'Failed to email payslips', details: error.message });
    }
});

// Tanzania PAYE calculation helper
function calculatePAYE(grossSalary) {
    // Simplified Tanzania PAYE brackets (monthly)
    // 0 - 270,000: 0%
    // 270,001 - 520,000: 8% of amount above 270,000
    // 520,001 - 760,000: 20,000 + 20% of amount above 520,000
    // 760,001 - 1,000,000: 68,000 + 25% of amount above 760,000
    // Above 1,000,000: 128,000 + 30% of amount above 1,000,000

    if (grossSalary <= 270000) return 0;
    if (grossSalary <= 520000) return (grossSalary - 270000) * 0.08;
    if (grossSalary <= 760000) return 20000 + (grossSalary - 520000) * 0.20;
    if (grossSalary <= 1000000) return 68000 + (grossSalary - 760000) * 0.25;
    return 128000 + (grossSalary - 1000000) * 0.30;
}

module.exports = router;
