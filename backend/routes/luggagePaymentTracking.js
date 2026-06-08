const express = require('express');
const router = express.Router();

console.log('🚀 Luggage Payment Tracking route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Luggage Payment Tracking test endpoint accessed');
    res.json({ 
        message: 'Luggage Payment Tracking API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully',
        debug: 'Luggage Payment Tracking routes are loaded and responding'
    });
});

async function ensureLuggagePaymentTrackingTable(db) {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS luggage_payment_tracking (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tracking_reference VARCHAR(50) UNIQUE NOT NULL,
            purchase_id INT NULL,
            purchase_reference VARCHAR(50) NULL,
            employee_id VARCHAR(50) NOT NULL,
            employee_name VARCHAR(255) NOT NULL,
            department VARCHAR(100) NULL,
            luggage VARCHAR(100) NOT NULL,
            course_name VARCHAR(255) NOT NULL,
            total_amount DECIMAL(20,2) NOT NULL,
            currency VARCHAR(10) DEFAULT 'TZS',
            payment_method VARCHAR(50) DEFAULT 'company_sponsored',
            payment_status ENUM('pending', 'partial', 'paid', 'refunded', 'cancelled') DEFAULT 'pending',
            amount_paid DECIMAL(20,2) DEFAULT 0.00,
            balance_amount DECIMAL(20,2) DEFAULT 0.00,
            payment_schedule ENUM('full_payment', 'monthly_installments', 'quarterly_installments', 'custom') DEFAULT 'full_payment',
            total_installments INT DEFAULT 1,
            paid_installments INT DEFAULT 0,
            next_payment_date DATE NULL,
            next_payment_amount DECIMAL(20,2) NULL,
            payment_history JSON NULL,
            payment_stage VARCHAR(100) NULL,
            payment_reference VARCHAR(255) NULL,
            bank_reference VARCHAR(255) NULL,
            transaction_id VARCHAR(255) NULL,
            notes TEXT NULL,
            payment_date DATE NULL,
            approval_status ENUM('pending_approval', 'approved', 'rejected', 'processed') DEFAULT 'pending_approval',
            approved_by VARCHAR(100) NULL,
            approved_date TIMESTAMP NULL,
            finance_notes TEXT NULL,
            hr_notes TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_employee (employee_id),
            INDEX idx_purchase (purchase_id),
            INDEX idx_status (payment_status, approval_status),
            INDEX idx_payment_date (next_payment_date)
        )
    `);
    await db.execute(`ALTER TABLE luggage_payment_tracking MODIFY COLUMN total_amount DECIMAL(20,2) NOT NULL`);
    await db.execute(`ALTER TABLE luggage_payment_tracking MODIFY COLUMN amount_paid DECIMAL(20,2) NOT NULL`);
    await db.execute(`ALTER TABLE luggage_payment_tracking MODIFY COLUMN balance_amount DECIMAL(20,2) NOT NULL`);
    await db.execute(`ALTER TABLE luggage_payment_tracking MODIFY COLUMN next_payment_amount DECIMAL(20,2) NULL`);
}

// Root endpoint - get all payment tracking records
router.get('/', async (req, res) => {
    try {
        console.log('📝 Luggage Payment Tracking root endpoint accessed');
        
        let tracking = [];
        
        try {
            const db = require('../../database/config/database');
            await ensureLuggagePaymentTrackingTable(db);
            
            // Ensure new tracking columns exist (for existing tables)
            const newCols = [
                { name: 'payment_stage', def: 'VARCHAR(100) NULL' },
                { name: 'payment_reference', def: 'VARCHAR(255) NULL' },
                { name: 'bank_reference', def: 'VARCHAR(255) NULL' },
                { name: 'transaction_id', def: 'VARCHAR(255) NULL' },
                { name: 'notes', def: 'TEXT NULL' },
                { name: 'payment_date', def: 'DATE NULL' }
            ];
            for (const col of newCols) {
                try {
                    await db.execute(`ALTER TABLE luggage_payment_tracking ADD COLUMN ${col.name} ${col.def}`);
                } catch (e) { /* column already exists */ }
            }
            
            const trackingResult = await db.execute(`
                SELECT lpt.*, lp.purchase_reference AS lp_reference, 
                       lc.campaign_name AS purchase_name
                FROM luggage_payment_tracking lpt
                LEFT JOIN luggage_purchases lp ON lpt.purchase_id = lp.id
                LEFT JOIN luggage_campaigns lc ON lp.campaign_id = lc.id
                ORDER BY lpt.created_at DESC
            `);
            
            if (Array.isArray(trackingResult)) {
                tracking = trackingResult;
            } else if (trackingResult && Array.isArray(trackingResult[0])) {
                tracking = trackingResult[0];
            } else if (trackingResult && trackingResult.rows) {
                tracking = trackingResult.rows;
            } else {
                tracking = [];
            }
            
            console.log('✅ Luggage Payment Tracking records fetched from database:', tracking.length);
        } catch (dbError) {
            console.error('❌ Database error fetching luggage payment tracking:', dbError.message);
            tracking = [];
        }
        
        res.json({
            success: true,
            tracking: tracking,
            total: tracking.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching luggage payment tracking:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch luggage payment tracking',
            details: error.message 
        });
    }
});

// Get payment tracking by ID
router.get('/:id', async (req, res) => {
    try {
        const trackingId = req.params.id;
        console.log('🔍 Fetching luggage payment tracking:', trackingId);
        
        let tracking = null;
        
        try {
            const db = require('../../database/config/database');
            await ensureLuggagePaymentTrackingTable(db);
            const trackingResult = await db.execute('SELECT * FROM luggage_payment_tracking WHERE id = ?', [trackingId]);
            const trackingData = Array.isArray(trackingResult) ? trackingResult[0] : trackingResult;
            
            if (trackingData.length > 0) {
                tracking = trackingData[0];
                console.log('✅ Luggage payment tracking found:', tracking);
            }
        } catch (dbError) {
            console.error('❌ Database error fetching luggage payment tracking:', dbError);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch luggage payment tracking',
                details: dbError.message
            });
        }
        
        if (!tracking) {
            return res.status(404).json({ 
                success: false,
                error: 'Luggage payment tracking not found' 
            });
        }
        
        res.json({
            success: true,
            tracking: tracking
        });
        
    } catch (error) {
        console.error('❌ Error fetching luggage payment tracking:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch luggage payment tracking',
            details: error.message 
        });
    }
});

// Create new payment tracking record
router.post('/', async (req, res) => {
    try {
        console.log('📝 Luggage Payment Tracking creation request received');
        console.log('📝 Request body:', req.body);
        
        const {
            purchase_id,
            purchase_reference,
            employee_id,
            employee_name,
            department,
            luggage,
            course_name,
            total_amount,
            currency,
            payment_method,
            payment_schedule,
            total_installments,
            finance_notes,
            hr_notes,
            approved_by,
            payment_stage,
            payment_reference: paymentRef,
            bank_reference,
            transaction_id,
            notes,
            amount
        } = req.body;
        
        // Validate required fields
        if (!employee_id || !employee_name || !luggage || !course_name || !total_amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'employee_id, employee_name, luggage, course_name, and total_amount are required'
            });
        }
        
        // Generate tracking reference
        const tracking_reference = `LPT${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Date.now()).slice(-3)}`;
        
        // Calculate initial payment amounts
        let amount_paid = 0.00;
        let balance_amount = total_amount;
        let paid_installments = 0;
        let next_payment_amount = 0.00;
        let next_payment_date = null;
        
        if (payment_method === 'full_payment') {
            amount_paid = total_amount;
            balance_amount = 0.00;
            paid_installments = 1;
            total_installments = 1;
        } else if (payment_schedule === 'monthly_installments' || payment_schedule === 'quarterly_installments') {
            next_payment_amount = total_amount / total_installments;
            // Set next payment date to 30 days from now
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + 30);
            next_payment_date = nextDate.toISOString().split('T')[0];
        }
        
        try {
            const db = require('../../database/config/database');

            await ensureLuggagePaymentTrackingTable(db);
            
            const query = `
                INSERT INTO luggage_payment_tracking (
                    tracking_reference, purchase_id, purchase_reference, employee_id, employee_name,
                    department, luggage, course_name, total_amount, currency, payment_method,
                    payment_status, amount_paid, balance_amount, payment_schedule, total_installments,
                    paid_installments, next_payment_date, next_payment_amount, payment_history,
                    payment_stage, payment_reference, bank_reference, transaction_id, notes, payment_date,
                    approval_status, finance_notes, hr_notes, approved_by, approved_date, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            const values = [
                tracking_reference,
                purchase_id || null,
                purchase_reference || null,
                employee_id,
                employee_name,
                department || null,
                luggage,
                course_name,
                total_amount,
                currency || 'TZS',
                payment_method || 'company_sponsored',
                amount_paid > 0 ? 'paid' : 'pending',
                amount_paid,
                balance_amount,
                payment_schedule || 'full_payment',
                total_installments || 1,
                paid_installments,
                next_payment_date,
                next_payment_amount,
                JSON.stringify([]),
                payment_stage || null,
                paymentRef || null,
                bank_reference || null,
                transaction_id || null,
                notes || null,
                new Date().toISOString().split('T')[0],
                approved_by ? 'approved' : 'pending_approval',
                finance_notes || null,
                hr_notes || null,
                approved_by || null,
                approved_by ? new Date() : null
            ];
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Luggage payment tracking created successfully:', result);
            
            // Fetch the created tracking record
            const createdTrackingResult = await db.execute('SELECT * FROM luggage_payment_tracking WHERE id = ?', [result.insertId]);
            const createdTracking = Array.isArray(createdTrackingResult) ? createdTrackingResult[0] : createdTrackingResult;
            
            res.status(201).json({
                success: true,
                message: 'Luggage payment tracking created successfully',
                trackingId: result.insertId,
                tracking: createdTracking[0]
            });
            
        } catch (dbError) {
            console.error('❌ Database error creating luggage payment tracking:', dbError);
            return res.status(500).json({
                success: false,
                error: 'Failed to create luggage payment tracking',
                details: dbError.message
            });
        }
        
    } catch (error) {
        console.error('❌ Error creating luggage payment tracking:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create luggage payment tracking',
            details: error.message 
        });
    }
});

// Update payment tracking
router.put('/:id', async (req, res) => {
    try {
        const trackingId = req.params.id;
        const updateData = req.body;
        
        console.log('🔄 Updating luggage payment tracking:', trackingId);
        console.log('📝 Update data:', updateData);
        
        try {
            const db = require('../../database/config/database');
            await ensureLuggagePaymentTrackingTable(db);
            
            // Build dynamic update query
            const updateFields = [];
            const updateValues = [];
            
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined && key !== 'id') {
                    updateFields.push(`${key} = ?`);
                    updateValues.push(updateData[key]);
                }
            });
            
            if (updateFields.length === 0) {
                return res.status(400).json({ 
                    success: false,
                    error: 'No valid fields to update' 
                });
            }
            
            updateFields.push('updated_at = NOW()');
            updateValues.push(trackingId);
            
            const updateQuery = `UPDATE luggage_payment_tracking SET ${updateFields.join(', ')} WHERE id = ?`;
            
            const resultResult = await db.execute(updateQuery, updateValues);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Luggage payment tracking updated successfully:', result);
            
            res.json({
                success: true,
                message: 'Luggage payment tracking updated successfully',
                affected_rows: result.affectedRows
            });
            
        } catch (dbError) {
            console.error('❌ Database error updating luggage payment tracking:', dbError);
            return res.status(500).json({
                success: false,
                error: 'Failed to update luggage payment tracking',
                details: dbError.message
            });
        }
        
    } catch (error) {
        console.error('❌ Error updating luggage payment tracking:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update luggage payment tracking',
            details: error.message 
        });
    }
});

// Delete payment tracking
router.delete('/:id', async (req, res) => {
    try {
        const trackingId = req.params.id;
        console.log('🗑️ Deleting luggage payment tracking:', trackingId);
        
        try {
            const db = require('../../database/config/database');
            await ensureLuggagePaymentTrackingTable(db);
            
            // Check if tracking exists
            const trackingResult = await db.execute('SELECT tracking_reference FROM luggage_payment_tracking WHERE id = ?', [trackingId]);
            const trackingData = Array.isArray(trackingResult) ? trackingResult[0] : trackingResult;
            
            if (trackingData.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Luggage payment tracking not found'
                });
            }
            
            // Delete tracking
            const resultResult = await db.execute('DELETE FROM luggage_payment_tracking WHERE id = ?', [trackingId]);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Luggage payment tracking deleted successfully');
            
            res.json({
                success: true,
                message: 'Luggage payment tracking deleted successfully',
                deleted_tracking: {
                    id: trackingId,
                    tracking_reference: trackingData[0].tracking_reference
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error deleting luggage payment tracking:', dbError);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete luggage payment tracking',
                details: dbError.message
            });
        }
        
    } catch (error) {
        console.error('❌ Error deleting luggage payment tracking:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete luggage payment tracking',
            details: error.message 
        });
    }
});

module.exports = router;
