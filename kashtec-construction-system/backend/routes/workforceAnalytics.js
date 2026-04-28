const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

console.log('📊 Workforce analytics routes loaded with database connection');

// Test GET route
router.get('/test', (req, res) => {
    console.log('🧪 GET /api/workforce-analytics/test accessed');
    res.json({ 
        message: 'Workforce analytics API test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// Get comprehensive workforce analytics
router.get('/', async (req, res) => {
    console.log('📊 GET /api/workforce-analytics accessed');
    try {
        const analytics = {
            summary: await getSummaryAnalytics(),
            turnover: await getTurnoverAnalytics(),
            performance: await getPerformanceAnalytics(),
            compliance: await getComplianceAnalytics()
        };
        
        res.json(analytics);
    } catch (error) {
        console.error('Error fetching workforce analytics:', error);
        res.status(500).json({ error: 'Failed to fetch workforce analytics' });
    }
});

// Get summary analytics
async function getSummaryAnalytics() {
    try {
        // Get total employees from worker_accounts
        const [totalEmployees] = await db.execute(`
            SELECT COUNT(*) as count FROM worker_accounts WHERE status = 'active'
        `);
        
        // Get department distribution
        const [deptDistribution] = await db.execute(`
            SELECT department, COUNT(*) as count 
            FROM worker_accounts 
            WHERE status = 'active' 
            GROUP BY department
        `);
        
        // Get new hires (last 90 days)
        const [newHires] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM worker_accounts 
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
            AND status = 'active'
        `);
        
        // Get total workforce cost from workforce_budgets
        const [workforceCost] = await db.execute(`
            SELECT SUM(total_proposed) as total_cost 
            FROM workforce_budgets 
            WHERE status = 'approved'
            AND submission_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
        `);
        
        // Calculate YTD change (mock data for now)
        const ytdChange = 6.7; // This would be calculated from historical data
        
        return {
            totalEmployees: totalEmployees[0]?.count || 0,
            departmentDistribution: deptDistribution,
            newHiresQ1: newHires[0]?.count || 0,
            annualWorkforceCost: workforceCost[0]?.total_cost || 0,
            ytdChange: ytdChange,
            newHiresChange: 33 // Mock data
        };
    } catch (error) {
        console.error('Error getting summary analytics:', error);
        return {
            totalEmployees: 0,
            departmentDistribution: [],
            newHiresQ1: 0,
            annualWorkforceCost: 0,
            ytdChange: 0,
            newHiresChange: 0
        };
    }
}

// Get turnover analytics
async function getTurnoverAnalytics() {
    try {
        // Get terminated employees in last year
        const [terminatedEmployees] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM worker_accounts 
            WHERE status = 'terminated'
            AND updated_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
        `);
        
        // Get total employees for calculation
        const [totalEmployees] = await db.execute(`
            SELECT COUNT(*) as count FROM worker_accounts
        `);
        
        const totalEmps = totalEmployees[0]?.count || 1;
        const terminatedCount = terminatedEmployees[0]?.count || 0;
        
        // Calculate turnover rates (mock data for voluntary/involuntary split)
        const annualTurnoverRate = totalEmps > 0 ? (terminatedCount / totalEmps) * 100 : 0;
        const voluntaryTurnover = annualTurnoverRate * 0.67; // 67% voluntary
        const involuntaryTurnover = annualTurnoverRate * 0.33; // 33% involuntary
        
        return {
            annualTurnoverRate: annualTurnoverRate.toFixed(1),
            voluntaryTurnover: voluntaryTurnover.toFixed(1),
            involuntaryTurnover: involuntaryTurnover.toFixed(1)
        };
    } catch (error) {
        console.error('Error getting turnover analytics:', error);
        return {
            annualTurnoverRate: '0.0',
            voluntaryTurnover: '0.0',
            involuntaryTurnover: '0.0'
        };
    }
}

// Get performance analytics
async function getPerformanceAnalytics() {
    try {
        // Get attendance rate
        const [attendanceData] = await db.execute(`
            SELECT 
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                COUNT(*) as total_count
            FROM attendance 
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `);
        
        const attendanceRate = attendanceData[0]?.total_count > 0 
            ? (attendanceData[0].present_count / attendanceData[0].total_count) * 100 
            : 0;
        
        // Mock data for productivity and training (would come from actual performance tables)
        const productivityIndex = 87.3;
        const trainingCompletion = 76.8;
        
        return {
            productivityIndex: productivityIndex.toFixed(1),
            attendanceRate: attendanceRate.toFixed(1),
            trainingCompletion: trainingCompletion.toFixed(1)
        };
    } catch (error) {
        console.error('Error getting performance analytics:', error);
        return {
            productivityIndex: '0.0',
            attendanceRate: '0.0',
            trainingCompletion: '0.0'
        };
    }
}

// Get compliance analytics
async function getComplianceAnalytics() {
    try {
        // Check contracts compliance
        const [contractsCompliance] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN contract_status = 'active' AND end_date > CURDATE() THEN 1 END) as compliant
            FROM contracts
        `);
        
        const contractComplianceRate = contractsCompliance[0]?.total > 0
            ? (contractsCompliance[0].compliant / contractsCompliance[0].total) * 100
            : 100;
        
        // Mock data for other compliance areas
        const laborLawCompliance = 'Compliant';
        const safetyRegulations = 'Compliant';
        
        return {
            laborLawCompliance,
            safetyRegulations,
            contractCompliance: `${contractComplianceRate.toFixed(0)}% Compliant`
        };
    } catch (error) {
        console.error('Error getting compliance analytics:', error);
        return {
            laborLawCompliance: 'Unknown',
            safetyRegulations: 'Unknown',
            contractCompliance: '0% Compliant'
        };
    }
}

module.exports = router;
