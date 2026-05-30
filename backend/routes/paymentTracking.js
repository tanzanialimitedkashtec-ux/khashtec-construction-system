const express = require('express');
const router = express.Router();

console.log('🚀 Payment Tracking route file is being loaded...');

function normalizeRows(result) {
    if (!Array.isArray(result)) {
        return result && Array.isArray(result.rows) ? result.rows : [];
    }

    if (Array.isArray(result[0]) && result[1] && Array.isArray(result[1])) {
        return result[0];
    }

    return result;
}

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Payment Tracking test endpoint accessed');
    res.json({ 
        message: 'Payment Tracking API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully',
        debug: 'Payment Tracking routes are loaded and responding'
    });
});

// Root endpoint - get all payment tracking records
router.get('/', async (req, res) => {
    try {
        console.log('📝 Payment Tracking root endpoint accessed');
        
        let tracking = [];
        
        try {
            const db = require('../../database/config/database');
            
            // Ensure payment_tracking table exists
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS payment_tracking (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        tracking_reference VARCHAR(50) UNIQUE NOT NULL,
                        transaction_id VARCHAR(50) NULL,
                        transaction_type ENUM('sale', 'purchase', 'expense', 'salary', 'refund', 'other') DEFAULT 'sale',
                        amount DECIMAL(10,2) NOT NULL,
                        currency VARCHAR(10) DEFAULT 'USD',
                        payment_method ENUM('cash', 'card', 'bank_transfer', 'mobile_money', 'check', 'company_account') DEFAULT 'bank_transfer',
                        payment_status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
                        paid_by VARCHAR(255) NULL,
                        paid_to VARCHAR(255) NULL,
                        payment_date DATE NULL,
                        due_date DATE NULL,
                        description TEXT NULL,
                        category VARCHAR(100) NULL,
                        department VARCHAR(100) NULL,
                        project_id VARCHAR(50) NULL,
                        invoice_number VARCHAR(50) NULL,
                        receipt_number VARCHAR(50) NULL,
                        approved_by VARCHAR(100) NULL,
                        approved_date TIMESTAMP NULL,
                        processed_by VARCHAR(100) NULL,
                        processed_date TIMESTAMP NULL,
                        notes TEXT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_transaction_type (transaction_type),
                        INDEX idx_status (payment_status),
                        INDEX idx_payment_date (payment_date),
                        INDEX idx_department (department),
                        INDEX idx_project (project_id)
                    )
                `);
                console.log('✅ Payment Tracking table verified/created successfully');
            } catch (tableError) {
                console.log('⚠️ Could not create payment_tracking table:', tableError.message);
            }
            
            const trackingResult = await db.execute(`
                SELECT * FROM payment_tracking 
                ORDER BY created_at DESC
            `);
            
            tracking = normalizeRows(trackingResult);
            
            console.log('✅ Payment Tracking records fetched from database:', tracking.length);
        } catch (dbError) {
            console.error('❌ Database error fetching payment tracking:', dbError);
        }
        
        res.json({
            success: true,
            tracking: tracking,
            total: tracking.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching payment tracking:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch payment tracking',
            details: error.message 
        });
    }
});

// Get payment tracking by ID
router.get('/:id', async (req, res, next) => {
    // Skip non-numeric ids so they fall through to named routes like /statistics
    if (!/^\d+$/.test(req.params.id)) {
        return next();
    }
    try {
        const trackingId = req.params.id;
        console.log('🔍 Fetching payment tracking:', trackingId);
        
        let tracking = null;
        
        try {
            const db = require('../../database/config/database');
            const trackingResult = await db.execute('SELECT * FROM payment_tracking WHERE id = ?', [trackingId]);
            const trackingData = Array.isArray(trackingResult) ? trackingResult[0] : trackingResult;
            
            if (trackingData.length > 0) {
                tracking = trackingData[0];
                console.log('✅ Payment tracking found:', tracking);
            }
        } catch (dbError) {
            console.error('❌ Database error fetching payment tracking:', dbError);
        }
        
        if (!tracking) {
            return res.status(404).json({ 
                success: false,
                error: 'Payment tracking not found' 
            });
        }
        
        res.json({
            success: true,
            tracking: tracking
        });
        
    } catch (error) {
        console.error('❌ Error fetching payment tracking:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch payment tracking',
            details: error.message 
        });
    }
});

// Create new payment tracking record
router.post('/', async (req, res) => {
    try {
        console.log('📝 Payment Tracking creation request received');
        console.log('📝 Request body:', req.body);
        
        const {
            transaction_id,
            transaction_type,
            amount,
            currency,
            payment_method,
            paid_by,
            paid_to,
            payment_date,
            due_date,
            description,
            category,
            department,
            project_id,
            invoice_number,
            receipt_number,
            notes,
            approved_by
        } = req.body;
        
        // Validate required fields
        if (!transaction_type || !amount || !paid_by || !paid_to) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'transaction_type, amount, paid_by, and paid_to are required'
            });
        }
        
        // Generate tracking reference
        const tracking_reference = `PT${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Date.now()).slice(-3)}`;
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            const query = `
                INSERT INTO payment_tracking (
                    tracking_reference, transaction_id, transaction_type, amount, currency,
                    payment_method, payment_status, paid_by, paid_to, payment_date, due_date,
                    description, category, department, project_id, invoice_number, receipt_number,
                    notes, approved_by, approved_date, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            const values = [
                tracking_reference,
                transaction_id || null,
                transaction_type,
                amount,
                currency || 'USD',
                payment_method || 'bank_transfer',
                approved_by ? 'approved' : 'pending',
                paid_by,
                paid_to,
                payment_date || null,
                due_date || null,
                description || null,
                category || null,
                department || null,
                project_id || null,
                invoice_number || null,
                receipt_number || null,
                notes || null,
                approved_by || null,
                approved_by ? new Date() : null
            ];
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Payment tracking created successfully:', result);
            
            // Fetch the created tracking record
            const createdTrackingResult = await db.execute('SELECT * FROM payment_tracking WHERE id = ?', [result.insertId]);
            const createdTracking = Array.isArray(createdTrackingResult) ? createdTrackingResult[0] : createdTrackingResult;
            
            res.status(201).json({
                success: true,
                message: 'Payment tracking created successfully',
                trackingId: result.insertId,
                tracking: createdTracking[0]
            });
            
        } catch (dbError) {
            console.error('❌ Database error creating payment tracking:', dbError);
            res.status(500).json({
                success: false,
                error: 'Database error creating payment tracking',
                details: dbError.message
            });
        }
        
    } catch (error) {
        console.error('❌ Error creating payment tracking:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create payment tracking',
            details: error.message 
        });
    }
});

// Update payment tracking
router.put('/:id', async (req, res) => {
    try {
        const trackingId = req.params.id;
        const updateData = req.body;
        
        console.log('🔄 Updating payment tracking:', trackingId);
        console.log('📝 Update data:', updateData);
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
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
            
            const updateQuery = `UPDATE payment_tracking SET ${updateFields.join(', ')} WHERE id = ?`;
            
            const resultResult = await db.execute(updateQuery, updateValues);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Payment tracking updated successfully:', result);
            
            res.json({
                success: true,
                message: 'Payment tracking updated successfully',
                affected_rows: result.affectedRows
            });
            
        } catch (dbError) {
            console.error('❌ Database error updating payment tracking:', dbError);
            res.status(500).json({
                success: false,
                error: 'Database error updating payment tracking',
                details: dbError.message
            });
        }
        
    } catch (error) {
        console.error('❌ Error updating payment tracking:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update payment tracking',
            details: error.message 
        });
    }
});

// Delete payment tracking
router.delete('/:id', async (req, res) => {
    try {
        const trackingId = req.params.id;
        console.log('🗑️ Deleting payment tracking:', trackingId);
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Check if tracking exists
            const trackingResult = await db.execute('SELECT tracking_reference FROM payment_tracking WHERE id = ?', [trackingId]);
            const trackingData = Array.isArray(trackingResult) ? trackingResult[0] : trackingResult;
            
            if (trackingData.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Payment tracking not found'
                });
            }
            
            // Delete tracking
            const resultResult = await db.execute('DELETE FROM payment_tracking WHERE id = ?', [trackingId]);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Payment tracking deleted successfully');
            
            res.json({
                success: true,
                message: 'Payment tracking deleted successfully',
                deleted_tracking: {
                    id: trackingId,
                    tracking_reference: trackingData[0].tracking_reference
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error deleting payment tracking:', dbError);
            res.status(500).json({
                success: false,
                error: 'Database error deleting payment tracking',
                details: dbError.message
            });
        }
        
    } catch (error) {
        console.error('❌ Error deleting payment tracking:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete payment tracking',
            details: error.message 
        });
    }
});

// Get payment tracking statistics
router.get('/statistics', async (req, res) => {
    try {
        console.log('📊 Fetching payment tracking statistics...');
        
        let statistics = {
            total_transactions: 0,
            total_amount: 0,
            completed_payments: 0,
            pending_payments: 0,
            failed_payments: 0,
            by_transaction_type: {},
            by_payment_method: {},
            by_payment_status: {},
            monthly_summary: [],
            recent_transactions: []
        };
        
        try {
            const db = require('../../database/config/database');
            
            // Get overall statistics
            const overallStatsResult = await db.execute(`
                SELECT 
                    COUNT(*) as total_transactions,
                    SUM(amount) as total_amount,
                    SUM(CASE WHEN payment_status = 'completed' THEN 1 ELSE 0 END) as completed_payments,
                    SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
                    SUM(CASE WHEN payment_status = 'failed' THEN 1 ELSE 0 END) as failed_payments
                FROM payment_tracking
            `);
            
            const overallStats = Array.isArray(overallStatsResult) ? overallStatsResult[0] : overallStatsResult;
            if (overallStats && overallStats.length > 0) {
                statistics = {
                    ...statistics,
                    total_transactions: overallStats[0].total_transactions || 0,
                    total_amount: overallStats[0].total_amount || 0,
                    completed_payments: overallStats[0].completed_payments || 0,
                    pending_payments: overallStats[0].pending_payments || 0,
                    failed_payments: overallStats[0].failed_payments || 0
                };
            }
            
            // Get statistics by transaction type
            const typeStatsResult = await db.execute(`
                SELECT transaction_type, COUNT(*) as count, SUM(amount) as total_amount
                FROM payment_tracking
                GROUP BY transaction_type
            `);
            
            const typeStats = Array.isArray(typeStatsResult) ? typeStatsResult[0] : typeStatsResult;
            if (typeStats && typeStats.length > 0) {
                statistics.by_transaction_type = {};
                typeStats.forEach(stat => {
                    statistics.by_transaction_type[stat.transaction_type] = {
                        count: stat.count,
                        total_amount: stat.total_amount
                    };
                });
            }
            
            // Get statistics by payment method
            const methodStatsResult = await db.execute(`
                SELECT payment_method, COUNT(*) as count, SUM(amount) as total_amount
                FROM payment_tracking
                GROUP BY payment_method
            `);
            
            const methodStats = Array.isArray(methodStatsResult) ? methodStatsResult[0] : methodStatsResult;
            if (methodStats && methodStats.length > 0) {
                statistics.by_payment_method = {};
                methodStats.forEach(stat => {
                    statistics.by_payment_method[stat.payment_method] = {
                        count: stat.count,
                        total_amount: stat.total_amount
                    };
                });
            }
            
            // Get statistics by payment status
            const statusStatsResult = await db.execute(`
                SELECT payment_status, COUNT(*) as count, SUM(amount) as total_amount
                FROM payment_tracking
                GROUP BY payment_status
            `);
            
            const statusStats = Array.isArray(statusStatsResult) ? statusStatsResult[0] : statusStatsResult;
            if (statusStats && statusStats.length > 0) {
                statistics.by_payment_status = {};
                statusStats.forEach(stat => {
                    statistics.by_payment_status[stat.payment_status] = {
                        count: stat.count,
                        total_amount: stat.total_amount
                    };
                });
            }
            
            // Get recent transactions (last 50) with all fields needed by the frontend
            const recentResult = await db.execute(`
                SELECT id, tracking_reference, transaction_id, transaction_type, amount, currency,
                       payment_method, payment_status, paid_by, paid_to, payment_date, due_date,
                       description, category, department, project_id, invoice_number, receipt_number,
                       notes, created_at, updated_at
                FROM payment_tracking
                ORDER BY created_at DESC
                LIMIT 50
            `);
            
            statistics.recent_transactions = normalizeRows(recentResult);
            
            console.log('✅ Payment tracking statistics fetched from database');
            
        } catch (dbError) {
            console.error('❌ Database error fetching payment tracking statistics:', dbError);
        }
        
        res.json({
            success: true,
            statistics: statistics,
            generated_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error fetching payment tracking statistics:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch payment tracking statistics',
            details: error.message 
        });
    }
});

module.exports = router;
