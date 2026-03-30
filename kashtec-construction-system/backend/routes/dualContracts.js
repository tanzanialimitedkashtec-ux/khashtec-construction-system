const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

console.log('🚀 Dual contract management routes module loaded successfully');

// Test endpoint to verify dual contract API is working
router.get('/test', (req, res) => {
    console.log('🧪 Dual contract API test endpoint accessed');
    res.json({ 
        message: 'Dual contract API is working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Create new contract (saves to BOTH hr_work and contracts tables)
router.post('/', async (req, res) => {
    try {
        console.log('📝 POST /api/dual-contracts accessed - Creating dual contract...');
        console.log('📊 Request body:', req.body);
        console.log('📊 Request headers:', req.headers);
        console.log('📊 Request URL:', req.originalUrl);
        
        const {
            employee: employee_id,
            employee_name,
            contract_type,
            start_date,
            end_date,
            salary,
            contract_status = 'active',
            contract_terms,
            contract_document,
            created_by,
            // Additional fields for hr_work table
            priority = 'Medium',
            department_code = 'HR',
            submitted_by = 'HR Manager'
        } = req.body;
        
        // Validate required fields
        if (!employee_id || !employee_name || !contract_type || !start_date || !salary) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['employee', 'employee_name', 'contract_type', 'start_date', 'salary'],
                received: { employee_id, employee_name, contract_type, start_date, salary }
            });
        }
        
        console.log('🔄 Step 1: Saving to hr_work table...');
        
        // Step 1: Save to hr_work table (for existing compatibility)
        const hrWorkQuery = `
            INSERT INTO hr_work (
                department_code, work_type, work_title, work_description,
                employee_name, employee_email, priority, submitted_by,
                submitted_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const hrWorkValues = [
            department_code,
            'Contract Management',
            `Contract - ${contract_type}`,
            contract_terms || `${contract_type} contract for ${employee_name}`,
            employee_name,
            `${employee_id}@kashtec.com`, // Generate email
            priority,
            submitted_by,
            new Date().toISOString().split('T')[0],
            'pending'
        ];
        
        console.log('🔍 Executing hr_work query:', hrWorkQuery);
        console.log('🔍 hr_work values:', hrWorkValues);
        
        let hrWorkResult;
        try {
            hrWorkResult = await db.execute(hrWorkQuery, hrWorkValues);
            console.log('✅ hr_work record created successfully:', hrWorkResult);
        } catch (hrError) {
            console.error('❌ Error saving to hr_work table:', hrError);
            // Continue with contracts table even if hr_work fails
        }
        
        console.log('🔄 Step 2: Saving to contracts table...');
        
        // Step 2: Save to contracts table (new dedicated table)
        const contractQuery = `
            INSERT INTO contracts (
                employee_id, employee_name, contract_type, start_date, end_date,
                salary, contract_status, contract_terms, contract_document, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const contractValues = [
            employee_id,
            employee_name || 'Unknown Employee',
            contract_type,
            start_date,
            end_date || null,
            salary,
            contract_status,
            contract_terms || null,
            contract_document || null,
            created_by || 'HR Manager'
        ];
        
        console.log('🔍 Executing contracts query:', contractQuery);
        console.log('🔍 contracts values:', contractValues);
        
        let contractResult;
        try {
            contractResult = await db.execute(contractQuery, contractValues);
            console.log('✅ contracts record created successfully:', contractResult);
        } catch (contractError) {
            console.error('❌ Error saving to contracts table:', contractError);
            throw new Error(`Failed to save to contracts table: ${contractError.message}`);
        }
        
        // Get the IDs from both operations
        const hrWorkId = hrWorkResult ? (Array.isArray(hrWorkResult) ? hrWorkResult[0].insertId : hrWorkResult.insertId) : null;
        const contractId = Array.isArray(contractResult) ? contractResult[0].insertId : contractResult.insertId;
        
        console.log('✅ Both records created successfully');
        console.log('🔍 hr_work ID:', hrWorkId);
        console.log('🔍 contracts ID:', contractId);
        
        // Verify the data was actually inserted into contracts table
        try {
            const [verification] = await db.execute(
                'SELECT * FROM contracts WHERE id = ?',
                [contractId]
            );
            console.log('🔍 Verification - Retrieved contract:', verification);
            console.log('🔍 Verification - Contract exists:', verification && verification.length > 0);
        } catch (verifyError) {
            console.error('❌ Verification error:', verifyError);
        }
        
        res.status(201).json({
            message: 'Contract created successfully in both tables',
            hr_work_id: hrWorkId,
            contract_id: contractId,
            data: {
                employee_id,
                employee_name,
                contract_type,
                start_date,
                end_date,
                salary,
                contract_status,
                contract_terms,
                contract_document,
                created_by
            },
            tables_updated: {
                hr_work: hrWorkId ? 'success' : 'failed',
                contracts: 'success'
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating dual contract:', error);
        res.status(500).json({ 
            error: 'Failed to create contract',
            details: error.message
        });
    }
});

// Get contracts from both tables
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching contracts from both tables...');
        
        // Get from hr_work table
        const [hrWorkContracts] = await db.execute(`
            SELECT 
                id, work_title, work_description, employee_name, 
                submitted_date, status, priority
            FROM hr_work 
            WHERE work_type = 'Contract Management'
            ORDER BY submitted_date DESC
        `);
        
        // Get from contracts table
        const [contracts] = await db.execute(`
            SELECT 
                id, employee_id, employee_name, contract_type, start_date, end_date,
                salary, contract_status, contract_terms, contract_document, created_by,
                created_at
            FROM contracts 
            ORDER BY created_at DESC
        `);
        
        console.log('✅ Contracts fetched successfully');
        console.log('🔍 hr_work contracts:', hrWorkContracts.length);
        console.log('🔍 contracts:', contracts.length);
        
        res.json({
            success: true,
            data: {
                hr_work_contracts: hrWorkContracts || [],
                contracts: contracts || [],
                summary: {
                    total_hr_work: hrWorkContracts.length || 0,
                    total_contracts: contracts.length || 0,
                    combined_total: (hrWorkContracts.length || 0) + (contracts.length || 0)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching contracts:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch contracts',
            details: error.message
        });
    }
});

// Get contract by ID from contracts table
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('📋 Fetching contract:', id);
        
        const [contracts] = await db.execute(`
            SELECT * FROM contracts WHERE id = ?
        `, [id]);
        
        if (contracts.length === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }
        
        console.log('✅ Contract fetched successfully');
        res.json({
            success: true,
            data: contracts[0]
        });
        
    } catch (error) {
        console.error('❌ Error fetching contract:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch contract',
            details: error.message
        });
    }
});

// Get contracts by employee
router.get('/employee/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        console.log('📋 Fetching contracts for employee:', employeeId);
        
        const [contracts] = await db.execute(`
            SELECT * FROM contracts 
            WHERE employee_id = ?
            ORDER BY created_at DESC
        `, [employeeId]);
        
        console.log('✅ Employee contracts fetched:', contracts.length);
        res.json({
            success: true,
            data: contracts || []
        });
        
    } catch (error) {
        console.error('❌ Error fetching employee contracts:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch employee contracts',
            details: error.message
        });
    }
});

// Update contract (updates both tables)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            employee_name,
            contract_type,
            start_date,
            end_date,
            salary,
            contract_status,
            contract_terms,
            contract_document
        } = req.body;
        
        console.log('📝 Updating contract:', id, 'in both tables');
        
        // Update contracts table
        const [contractResult] = await db.execute(`
            UPDATE contracts SET
                employee_name = ?, contract_type = ?, start_date = ?, end_date = ?,
                salary = ?, contract_status = ?, contract_terms = ?, contract_document = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [employee_name, contract_type, start_date, end_date, salary, contract_status, contract_terms, contract_document, id]);
        
        // Update hr_work table (find corresponding record)
        const [hrResult] = await db.execute(`
            UPDATE hr_work SET
                status = ?, work_description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE work_type = 'Contract Management' AND 
                  work_description IN (SELECT contract_terms FROM contracts WHERE id = ?)
        `, [contract_status === 'active' ? 'Completed' : 'Pending', contract_terms || `${contract_type} contract`, id]);
        
        if (contractResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }
        
        console.log('✅ Contract updated successfully in both tables');
        res.json({ 
            success: true,
            message: 'Contract updated successfully in both tables',
            contract_status,
            updated_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error updating contract:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update contract',
            details: error.message
        });
    }
});

// Delete contract (deletes from both tables)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🗑️ Deleting contract:', id, 'from both tables');
        
        // Get contract details before deletion
        const [contractDetails] = await db.execute(
            'SELECT * FROM contracts WHERE id = ?',
            [id]
        );
        
        if (contractDetails.length === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }
        
        const contract = contractDetails[0];
        
        // Delete from contracts table
        const [contractResult] = await db.execute(
            'DELETE FROM contracts WHERE id = ?',
            [id]
        );
        
        // Delete from hr_work table (find corresponding record)
        const [hrResult] = await db.execute(`
            DELETE FROM hr_work 
            WHERE work_type = 'Contract Management' AND 
                  work_description = ?
        `, [contract.contract_terms || `${contract.contract_type} contract`]);
        
        console.log('✅ Contract deleted successfully from both tables');
        res.json({ 
            success: true,
            message: 'Contract deleted successfully from both tables',
            deleted_from: {
                contracts: contractResult.affectedRows > 0 ? 'success' : 'not_found',
                hr_work: hrResult.affectedRows > 0 ? 'success' : 'not_found'
            }
        });
        
    } catch (error) {
        console.error('❌ Error deleting contract:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete contract',
            details: error.message
        });
    }
});

// Get contracts summary
router.get('/summary/active', async (req, res) => {
    try {
        console.log('📊 Generating contracts summary...');
        
        const [summary] = await db.execute(`
            SELECT 
                COUNT(*) as total_contracts,
                COUNT(CASE WHEN contract_status = 'active' THEN 1 END) as active_contracts,
                COUNT(CASE WHEN contract_status = 'expired' THEN 1 END) as expired_contracts,
                COUNT(CASE WHEN contract_status = 'terminated' THEN 1 END) as terminated_contracts,
                AVG(salary) as average_salary,
                COUNT(CASE WHEN contract_type = 'permanent' THEN 1 END) as permanent_contracts,
                COUNT(CASE WHEN contract_type = 'temporary' THEN 1 END) as temporary_contracts,
                COUNT(CASE WHEN contract_type = 'probation' THEN 1 END) as probation_contracts
            FROM contracts
        `);
        
        console.log('✅ Contracts summary generated:', summary[0]);
        res.json({
            success: true,
            data: summary[0]
        });
        
    } catch (error) {
        console.error('❌ Error generating contracts summary:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate contracts summary',
            details: error.message
        });
    }
});

module.exports = router;
