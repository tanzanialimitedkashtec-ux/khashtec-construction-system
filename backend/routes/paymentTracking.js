const express = require('express');
const router = express.Router();

console.log('🚀 Payment Tracking route file is being loaded...');

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
            
            // Handle different database response formats
            if (Array.isArray(trackingResult)) {
                tracking = trackingResult;
            } else if (trackingResult && Array.isArray(trackingResult[0])) {
                tracking = trackingResult[0];
            } else if (trackingResult && trackingResult.rows) {
                tracking = trackingResult.rows;
            } else {
                tracking = [];
            }
            
            console.log('✅ Payment Tracking records fetched from database:', tracking.length);
        } catch (dbError) {
            console.error('❌ Database error, using fallback payment tracking:', dbError);
            
            // Fallback to mock payment tracking
            tracking = [
                {
                    id: 1,
                    tracking_reference: 'PT202605001',
                    transaction_id: 'TXN001',
                    transaction_type: 'sale',
                    amount: 150000.00,
                    currency: 'USD',
                    payment_method: 'bank_transfer',
                    payment_status: 'completed',
                    paid_by: 'Client ABC Corporation',
                    paid_to: 'KASHTEC Tanzania Limited',
                    payment_date: '2026-05-01',
                    due_date: '2026-05-01',
                    description: 'Payment for construction project Phase 1',
                    category: 'construction',
                    department: 'Projects',
                    project_id: 'PRJ001',
                    invoice_number: 'INV001',
                    receipt_number: 'REC001',
                    approved_by: 'Finance Manager',
                    approved_date: '2026-05-01T09:00:00Z',
                    processed_by: 'Accounting Team',
                    processed_date: '2026-05-01T10:00:00Z',
                    notes: 'Payment received on time, project progressing well',
                    created_at: '2026-05-01T08:00:00Z',
                    updated_at: '2026-05-01T10:00:00Z'
                },
                {
                    id: 2,
                    tracking_reference: 'PT202605002',
                    transaction_id: 'TXN002',
                    transaction_type: 'purchase',
                    amount: 25000.00,
                    currency: 'USD',
                    payment_method: 'card',
                    payment_status: 'completed',
                    paid_by: 'KASHTEC Tanzania Limited',
                    paid_to: 'Construction Supplies Ltd',
                    payment_date: '2026-05-03',
                    due_date: '2026-05-03',
                    description: 'Purchase of construction materials',
                    category: 'procurement',
                    department: 'Procurement',
                    project_id: 'PRJ002',
                    invoice_number: 'INV002',
                    receipt_number: 'REC002',
                    approved_by: 'Procurement Manager',
                    approved_date: '2026-05-03T11:00:00Z',
                    processed_by: 'Finance Team',
                    processed_date: '2026-05-03T14:00:00Z',
                    notes: 'Materials delivered as expected',
                    created_at: '2026-05-03T10:00:00Z',
                    updated_at: '2026-05-03T14:00:00Z'
                },
                {
                    id: 3,
                    tracking_reference: 'PT202605003',
                    transaction_id: 'TXN003',
                    transaction_type: 'salary',
                    amount: 8500.00,
                    currency: 'USD',
                    payment_method: 'bank_transfer',
                    payment_status: 'completed',
                    paid_by: 'KASHTEC Tanzania Limited',
                    paid_to: 'John Doe',
                    payment_date: '2026-05-05',
                    due_date: '2026-05-05',
                    description: 'Monthly salary payment - May 2026',
                    category: 'payroll',
                    department: 'HR',
                    project_id: null,
                    invoice_number: 'PAY001',
                    receipt_number: 'PAYREC001',
                    approved_by: 'HR Manager',
                    approved_date: '2026-05-05T08:00:00Z',
                    processed_by: 'Payroll Team',
                    processed_date: '2026-05-05T16:00:00Z',
                    notes: 'Monthly salary processed for all employees',
                    created_at: '2026-05-05T08:00:00Z',
                    updated_at: '2026-05-05T16:00:00Z'
                },
                {
                    id: 4,
                    tracking_reference: 'PT202605004',
                    transaction_id: 'TXN004',
                    transaction_type: 'expense',
                    amount: 12000.00,
                    currency: 'USD',
                    payment_method: 'mobile_money',
                    payment_status: 'pending',
                    paid_by: 'KASHTEC Tanzania Limited',
                    paid_to: 'Equipment Rental Service',
                    payment_date: null,
                    due_date: '2026-05-15',
                    description: 'Heavy equipment rental for construction site',
                    category: 'operations',
                    department: 'Operations',
                    project_id: 'PRJ003',
                    invoice_number: 'EXP001',
                    receipt_number: null,
                    approved_by: 'Operations Manager',
                    approved_date: '2026-05-10T14:00:00Z',
                    processed_by: null,
                    processed_date: null,
                    notes: 'Payment to be processed by May 15th',
                    created_at: '2026-05-10T14:00:00Z',
                    updated_at: '2026-05-10T14:00:00Z'
                },
                {
                    id: 5,
                    tracking_reference: 'PT202605005',
                    transaction_id: 'TXN005',
                    transaction_type: 'refund',
                    amount: 5000.00,
                    currency: 'USD',
                    payment_method: 'bank_transfer',
                    payment_status: 'completed',
                    paid_by: 'KASHTEC Tanzania Limited',
                    paid_to: 'Client XYZ Corporation',
                    payment_date: '2026-05-08',
                    due_date: '2026-05-08',
                    description: 'Refund for cancelled construction work',
                    category: 'refund',
                    department: 'Finance',
                    project_id: 'PRJ004',
                    invoice_number: 'REF001',
                    receipt_number: 'REFREC001',
                    approved_by: 'Finance Director',
                    approved_date: '2026-05-07T15:00:00Z',
                    processed_by: 'Finance Team',
                    processed_date: '2026-05-08T11:00:00Z',
                    notes: 'Refund processed as per client request',
                    created_at: '2026-05-07T15:00:00Z',
                    updated_at: '2026-05-08T11:00:00Z'
                },
                {
                    id: 6,
                    tracking_reference: 'PT202605006',
                    transaction_id: 'TXN006',
                    transaction_type: 'other',
                    amount: 3500.00,
                    currency: 'USD',
                    payment_method: 'check',
                    payment_status: 'processing',
                    paid_by: 'KASHTEC Tanzania Limited',
                    paid_to: 'Consulting Services Ltd',
                    payment_date: null,
                    due_date: '2026-05-20',
                    description: 'Consulting fees for project planning',
                    category: 'consulting',
                    department: 'Management',
                    project_id: 'PRJ005',
                    invoice_number: 'CON001',
                    receipt_number: null,
                    approved_by: 'CEO',
                    approved_date: '2026-05-12T10:00:00Z',
                    processed_by: null,
                    processed_date: null,
                    notes: 'Payment pending consultant invoice verification',
                    created_at: '2026-05-12T10:00:00Z',
                    updated_at: '2026-05-12T10:00:00Z'
                }
            ];
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
router.get('/:id', async (req, res) => {
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
            console.error('❌ Database error, using fallback tracking:', dbError);
            
            // Fallback to mock tracking data (using first few from the main mock data)
            const mockTracking = [
                {
                    id: 1,
                    tracking_reference: 'PT202605001',
                    transaction_id: 'TXN001',
                    transaction_type: 'sale',
                    amount: 150000.00,
                    currency: 'USD',
                    payment_method: 'bank_transfer',
                    payment_status: 'completed',
                    paid_by: 'Client ABC Corporation',
                    paid_to: 'KASHTEC Tanzania Limited',
                    payment_date: '2026-05-01',
                    due_date: '2026-05-01',
                    description: 'Payment for construction project Phase 1',
                    category: 'construction',
                    department: 'Projects',
                    project_id: 'PRJ001',
                    invoice_number: 'INV001',
                    receipt_number: 'REC001',
                    approved_by: 'Finance Manager',
                    approved_date: '2026-05-01T09:00:00Z',
                    processed_by: 'Accounting Team',
                    processed_date: '2026-05-01T10:00:00Z',
                    notes: 'Payment received on time, project progressing well',
                    created_at: '2026-05-01T08:00:00Z',
                    updated_at: '2026-05-01T10:00:00Z'
                }
            ];
            
            tracking = mockTracking.find(t => t.id == trackingId);
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
            console.error('❌ Database error, using mock tracking creation:', dbError);
            
            // Fallback to mock tracking creation
            const trackingId = `PT${Date.now().toString().slice(-6)}`;
            
            res.status(201).json({
                success: true,
                message: 'Payment tracking created successfully (mock)',
                trackingId: trackingId,
                tracking: {
                    id: trackingId,
                    tracking_reference,
                    transaction_id,
                    transaction_type,
                    amount,
                    currency,
                    payment_method,
                    payment_status: approved_by ? 'approved' : 'pending',
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
                    approved_by,
                    created_at: new Date().toISOString(),
                    mock: true
                }
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
            console.error('❌ Database error, using mock update:', dbError);
            
            // Fallback to mock update
            res.json({
                success: true,
                message: 'Payment tracking updated successfully (mock)',
                affected_rows: 1,
                mock: true
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
            console.error('❌ Database error, using mock delete:', dbError);
            
            // Fallback to mock delete
            res.json({
                success: true,
                message: 'Payment tracking deleted successfully (mock)',
                deleted_tracking: {
                    id: trackingId,
                    tracking_reference: 'Mock Tracking'
                },
                mock: true
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

module.exports = router;
