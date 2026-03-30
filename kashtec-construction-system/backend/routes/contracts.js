const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Test endpoint to verify contracts API is working
router.get('/test', (req, res) => {
    console.log('🧪 Contracts test endpoint accessed');
    res.json({ 
        message: 'Contracts API is working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Get all contracts
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching contracts...');
        
        const [contracts] = await db.execute(`
            SELECT * FROM contracts 
            ORDER BY created_at DESC
        `);
        
        console.log('✅ Contracts fetched:', contracts.length);
        res.json(contracts);
        
    } catch (error) {
        console.error('❌ Error fetching contracts:', error);
        res.status(500).json({ error: 'Failed to fetch contracts' });
    }
});

// Get contract by ID
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
        res.json(contracts[0]);
        
    } catch (error) {
        console.error('❌ Error fetching contract:', error);
        res.status(500).json({ error: 'Failed to fetch contract' });
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
        res.json(contracts);
        
    } catch (error) {
        console.error('❌ Error fetching employee contracts:', error);
        res.status(500).json({ error: 'Failed to fetch employee contracts' });
    }
});

// Create new contract
router.post('/', async (req, res) => {
    try {
        console.log('📝 Creating new contract...');
        console.log('📊 Request body:', req.body);
        
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
            created_by
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
        
        // Check if contract already exists for this employee
        const [existing] = await db.execute(
            'SELECT id FROM contracts WHERE employee_id = ? AND contract_status = "active"',
            [employee_id]
        );
        
        if (existing && existing.length > 0) {
            console.log('❌ Active contract already exists for this employee');
            return res.status(409).json({ 
                error: 'Active contract already exists for this employee',
                existing_id: existing[0].id
            });
        }
        
        // Insert new contract
        const result = await db.execute(`
            INSERT INTO contracts (
                employee_id, employee_name, contract_type, start_date, end_date,
                salary, contract_status, contract_terms, contract_document, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
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
        ]);
        
        // Handle different result formats from db.execute()
        const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;
        console.log('✅ Contract created successfully:', result);
        console.log('✅ Insert ID:', insertId);
        
        // Verify the data was actually inserted
        try {
            const [verification] = await db.execute(
                'SELECT * FROM contracts WHERE id = ?',
                [insertId]
            );
            console.log('🔍 Verification - Retrieved contract:', verification);
            console.log('🔍 Verification - Contract exists:', verification && verification.length > 0);
        } catch (verifyError) {
            console.error('❌ Verification error:', verifyError);
        }
        
        res.status(201).json({
            message: 'Contract created successfully',
            contract_id: insertId,
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
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating contract:', error);
        res.status(500).json({ 
            error: 'Failed to create contract',
            details: error.message
        });
    }
});

// Update contract
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
        
        console.log('📝 Updating contract:', id);
        
        const [result] = await db.execute(`
            UPDATE contracts SET
                employee_name = ?, contract_type = ?, start_date = ?, end_date = ?,
                salary = ?, contract_status = ?, contract_terms = ?, contract_document = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [employee_name, contract_type, start_date, end_date, salary, contract_status, contract_terms, contract_document, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }
        
        console.log('✅ Contract updated successfully');
        res.json({ message: 'Contract updated successfully' });
        
    } catch (error) {
        console.error('❌ Error updating contract:', error);
        res.status(500).json({ error: 'Failed to update contract' });
    }
});

// Delete contract
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🗑️ Deleting contract:', id);
        
        const [result] = await db.execute(
            'DELETE FROM contracts WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }
        
        console.log('✅ Contract deleted successfully');
        res.json({ message: 'Contract deleted successfully' });
        
    } catch (error) {
        console.error('❌ Error deleting contract:', error);
        res.status(500).json({ error: 'Failed to delete contract' });
    }
});

// Get contract summary
router.get('/summary/active', async (req, res) => {
    try {
        console.log('📊 Generating active contracts summary...');
        
        const [summary] = await db.execute(`
            SELECT 
                COUNT(*) as total_contracts,
                COUNT(CASE WHEN contract_status = 'active' THEN 1 END) as active_contracts,
                COUNT(CASE WHEN contract_status = 'expired' THEN 1 END) as expired_contracts,
                COUNT(CASE WHEN contract_status = 'terminated' THEN 1 END) as terminated_contracts,
                AVG(salary) as average_salary
            FROM contracts
        `);
        
        console.log('✅ Contract summary generated:', summary[0]);
        res.json(summary[0]);
        
    } catch (error) {
        console.error('❌ Error generating contract summary:', error);
        res.status(500).json({ error: 'Failed to generate contract summary' });
    }
});

module.exports = router;
