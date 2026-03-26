const express = require('express');
const router = express.Router();
const db = require('../database/config/database');

// Get all worker accounts
router.get('/', async (req, res) => {
    try {
        const [workers] = await db.execute(
            'SELECT * FROM worker_accounts ORDER BY created_at DESC'
        );
        res.json(workers);
    } catch (error) {
        console.error('Error fetching worker accounts:', error);
        res.status(500).json({ error: 'Failed to fetch worker accounts' });
    }
});

// Get worker account by ID
router.get('/:id', async (req, res) => {
    try {
        const [workers] = await db.execute('SELECT * FROM worker_accounts WHERE id = ?', [req.params.id]);
        
        if (workers.length === 0) {
            return res.status(404).json({ error: 'Worker account not found' });
        }
        
        res.json(workers[0]);
    } catch (error) {
        console.error('Error fetching worker account:', error);
        res.status(500).json({ error: 'Failed to fetch worker account' });
    }
});

// Create new worker account
router.post('/', async (req, res) => {
    console.log('🔍 Worker account creation request received');
    console.log('📋 Request body:', req.body);
    
    const { 
        employeeId, 
        fullName, 
        workEmail, 
        phoneNumber, 
        department, 
        jobTitle, 
        accountType, 
        accessLevel, 
        temporaryPassword, 
        accountNotes,
        profilePicture,
        idDocument,
        contractDocument
    } = req.body;
    
    console.log('📝 Extracted worker data:', { 
        employeeId, 
        fullName, 
        workEmail, 
        phoneNumber, 
        department, 
        jobTitle, 
        accountType, 
        accessLevel 
    });
    
    // Validate input
    if (!employeeId || !fullName || !workEmail || !phoneNumber || !department || !jobTitle || !accountType || !accessLevel || !temporaryPassword) {
        console.log('❌ Validation failed - missing required fields');
        return res.status(400).json({
            error: 'All required fields must be provided',
            received: { employeeId, fullName, workEmail, phoneNumber, department, jobTitle, accountType, accessLevel, temporaryPassword }
        });
    }
    
    try {
        console.log('🔍 Checking if worker account already exists...');
        // Check if worker account already exists
        const [existingWorkers] = await db.execute(
            'SELECT id FROM worker_accounts WHERE employee_id = ? OR work_email = ?',
            [employeeId, workEmail]
        );
        
        console.log('📊 Existing workers check result:', existingWorkers);
        
        if (existingWorkers && existingWorkers.length > 0) {
            console.log('❌ Worker account already exists');
            return res.status(409).json({
                error: 'Worker account with this Employee ID or Email already exists'
            });
        }
        
        console.log('✅ Creating new worker account...');
        
        // Create worker account
        const workerResult = await db.execute(
            `INSERT INTO worker_accounts (
                employee_id, full_name, work_email, phone_number, department, 
                job_title, account_type, access_level, temporary_password, 
                account_notes, profile_picture, id_document, contract_document
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                employeeId,
                fullName,
                workEmail,
                phoneNumber,
                department,
                jobTitle,
                accountType,
                accessLevel,
                temporaryPassword,
                accountNotes || '',
                profilePicture || '',
                idDocument || '',
                contractDocument || ''
            ]
        );
        
        console.log('✅ Worker account created:', workerResult);
        
        // Return the created worker account
        const [newWorker] = await db.execute(
            'SELECT * FROM worker_accounts WHERE id = ?',
            [workerResult.insertId]
        );
        
        console.log('✅ Worker account creation successful:', newWorker[0]);
        
        res.status(201).json({
            message: 'Worker account created successfully',
            worker: newWorker[0]
        });
        
    } catch (error) {
        console.error('❌ Error creating worker account:', error);
        console.error('❌ Error details:', error.message);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Worker account with this Employee ID or Email already exists'
            });
        }
        
        res.status(500).json({
            error: 'Failed to create worker account',
            details: error.message
        });
    }
});

// Update worker account
router.put('/:id', async (req, res) => {
    try {
        // Check if worker account exists
        const [existingWorkers] = await db.execute('SELECT id FROM worker_accounts WHERE id = ?', [req.params.id]);
        
        if (existingWorkers.length === 0) {
            return res.status(404).json({ error: 'Worker account not found' });
        }
        
        const { 
            fullName, workEmail, phoneNumber, department, jobTitle, 
            accountType, accessLevel, temporaryPassword, accountNotes,
            profilePicture, idDocument, contractDocument, status
        } = req.body;
        
        // Build dynamic update query
        const updates = [];
        const values = [];
        
        if (fullName !== undefined) {
            updates.push('full_name = ?');
            values.push(fullName);
        }
        if (workEmail !== undefined) {
            updates.push('work_email = ?');
            values.push(workEmail);
        }
        if (phoneNumber !== undefined) {
            updates.push('phone_number = ?');
            values.push(phoneNumber);
        }
        if (department !== undefined) {
            updates.push('department = ?');
            values.push(department);
        }
        if (jobTitle !== undefined) {
            updates.push('job_title = ?');
            values.push(jobTitle);
        }
        if (accountType !== undefined) {
            updates.push('account_type = ?');
            values.push(accountType);
        }
        if (accessLevel !== undefined) {
            updates.push('access_level = ?');
            values.push(accessLevel);
        }
        if (temporaryPassword !== undefined) {
            updates.push('temporary_password = ?');
            values.push(temporaryPassword);
        }
        if (accountNotes !== undefined) {
            updates.push('account_notes = ?');
            values.push(accountNotes);
        }
        if (profilePicture !== undefined) {
            updates.push('profile_picture = ?');
            values.push(profilePicture);
        }
        if (idDocument !== undefined) {
            updates.push('id_document = ?');
            values.push(idDocument);
        }
        if (contractDocument !== undefined) {
            updates.push('contract_document = ?');
            values.push(contractDocument);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            values.push(status);
        }
        
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(req.params.id);
        
        await db.execute(
            `UPDATE worker_accounts SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        // Return updated worker account
        const [updatedWorker] = await db.execute('SELECT * FROM worker_accounts WHERE id = ?', [req.params.id]);
        
        res.json({
            message: 'Worker account updated successfully',
            worker: updatedWorker[0]
        });
        
    } catch (error) {
        console.error('Error updating worker account:', error);
        res.status(500).json({ error: 'Failed to update worker account' });
    }
});

// Delete worker account
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM worker_accounts WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Worker account not found' });
        }
        
        res.json({ message: 'Worker account deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting worker account:', error);
        res.status(500).json({ error: 'Failed to delete worker account' });
    }
});

// Get worker accounts by department
router.get('/department/:department', async (req, res) => {
    try {
        const [workers] = await db.execute(
            'SELECT * FROM worker_accounts WHERE department = ? ORDER BY full_name ASC',
            [req.params.department]
        );
        res.json(workers);
    } catch (error) {
        console.error('Error fetching worker accounts by department:', error);
        res.status(500).json({ error: 'Failed to fetch worker accounts by department' });
    }
});

// Get worker account statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [totalWorkers] = await db.execute('SELECT COUNT(*) as total FROM worker_accounts');
        const [activeWorkers] = await db.execute('SELECT COUNT(*) as active FROM worker_accounts WHERE status = "active"');
        const [inactiveWorkers] = await db.execute('SELECT COUNT(*) as inactive FROM worker_accounts WHERE status = "inactive"');
        
        // Department breakdown
        const [departmentStats] = await db.execute('SELECT department, COUNT(*) as count FROM worker_accounts GROUP BY department');
        
        // Account type breakdown
        const [accountTypeStats] = await db.execute('SELECT account_type, COUNT(*) as count FROM worker_accounts GROUP BY account_type');
        
        // Access level breakdown
        const [accessLevelStats] = await db.execute('SELECT access_level, COUNT(*) as count FROM worker_accounts GROUP BY access_level');
        
        // Recent registrations
        const [recentRegistrations] = await db.execute('SELECT * FROM worker_accounts ORDER BY created_at DESC LIMIT 5');
        
        res.json({
            total: totalWorkers[0].total,
            active: activeWorkers[0].active,
            inactive: inactiveWorkers[0].inactive,
            departments: departmentStats,
            accountTypes: accountTypeStats,
            accessLevels: accessLevelStats,
            recentRegistrations: recentRegistrations
        });
        
    } catch (error) {
        console.error('Error fetching worker account statistics:', error);
        res.status(500).json({ error: 'Failed to fetch worker account statistics' });
    }
});

module.exports = router;
