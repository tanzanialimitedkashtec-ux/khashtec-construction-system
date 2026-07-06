const notify = require('../utils/notify');
const express = require('express');
const router = express.Router();

console.log('🚀 Luggage Purchases route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Luggage Purchases test endpoint accessed');
    res.json({ 
        message: 'Luggage Purchases API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully',
        debug: 'Luggage Purchases routes are loaded and responding'
    });
});

// Root endpoint - get all luggage purchases
router.get('/', async (req, res) => {
    try {
        console.log('📝 Luggage Purchases root endpoint accessed');
        
        let purchases = [];
        
        try {
            const db = require('../../database/config/database');
            
            // Ensure luggage_purchases table exists
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS luggage_purchases (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        purchase_reference VARCHAR(50) UNIQUE NOT NULL,
                        campaign_id INT NULL,
                        campaign_name VARCHAR(255) NULL,
                        employee_id VARCHAR(50) NOT NULL,
                        employee_name VARCHAR(255) NOT NULL,
                        department VARCHAR(100) NULL,
                        luggage VARCHAR(100) NOT NULL,
                        course_type ENUM('basic', 'intermediate', 'advanced', 'business') DEFAULT 'basic',
                        purchase_date DATE NOT NULL,
                        amount DECIMAL(10,2) NOT NULL,
                        currency VARCHAR(10) DEFAULT 'USD',
                        payment_method ENUM('cash', 'card', 'bank_transfer', 'company_sponsored') DEFAULT 'company_sponsored',
                        payment_status ENUM('pending', 'paid', 'refunded', 'cancelled') DEFAULT 'paid',
                        enrollment_status ENUM('enrolled', 'in_progress', 'completed', 'dropped', 'suspended') DEFAULT 'enrolled',
                        start_date DATE NULL,
                        end_date DATE NULL,
                        instructor VARCHAR(255) NULL,
                        location VARCHAR(255) NULL,
                        schedule VARCHAR(255) NULL,
                        progress_percentage DECIMAL(5,2) DEFAULT 0.00,
                        certificate_issued BOOLEAN DEFAULT FALSE,
                        certificate_date DATE NULL,
                        notes TEXT NULL,
                        approved_by VARCHAR(100) NULL,
                        approved_date TIMESTAMP NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_employee (employee_id),
                        INDEX idx_campaign (campaign_id),
                        INDEX idx_luggage (luggage),
                        INDEX idx_status (payment_status, enrollment_status),
                        INDEX idx_purchase_date (purchase_date)
                    )
                `);
                console.log('✅ Luggage Purchases table verified/created successfully');
            } catch (tableError) {
                console.log('⚠️ Could not create luggage_purchases table:', tableError.message);
            }
            
            const [columnRows] = await db.execute(`
                SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'luggage_purchases' AND COLUMN_NAME = 'luggage_name'
            `);
            const columnCount = Array.isArray(columnRows) && columnRows[0] ? (columnRows[0].cnt || columnRows[0]['COUNT(*)'] || 0) : 0;
            if (!columnCount) {
                try {
                    await db.execute('ALTER TABLE luggage_purchases ADD COLUMN luggage_name VARCHAR(100) NULL AFTER buyer_phone');
                } catch (alterErr) {
                    if (alterErr && (alterErr.code === 'ER_DUP_FIELDNAME' || /Duplicate column name/i.test(alterErr.message || ''))) {
                        console.warn('luggage_name column already exists, ignoring ALTER TABLE');
                    } else {
                        throw alterErr;
                    }
                }
            }
            const purchasesResult = await db.execute(`
                SELECT lp.*, lc.campaign_name, COALESCE(lp.luggage_name, lc.luggage_name) AS display_luggage_name
                FROM luggage_purchases lp
                LEFT JOIN luggage_campaigns lc ON lp.campaign_id = lc.id
                ORDER BY lp.purchase_date DESC, lp.created_at DESC
            `);
            
            // Handle different database response formats
            if (Array.isArray(purchasesResult)) {
                purchases = purchasesResult;
            } else if (purchasesResult && Array.isArray(purchasesResult[0])) {
                purchases = purchasesResult[0];
            } else if (purchasesResult && purchasesResult.rows) {
                purchases = purchasesResult.rows;
            } else {
                purchases = [];
            }
            
            console.log('✅ Luggage Purchases records fetched from database:', purchases.length);
            
        } catch (dbError) {
            console.error('❌ Database error fetching purchases:', dbError);
        }
        
        res.json({
            success: true,
            data: purchases,
            total: purchases.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching luggage purchases:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch luggage purchases',
            details: error.message 
        });
    }
});

// Get luggage purchases for payment tracking
router.get('/for-tracking', async (req, res) => {
    try {
        console.log('📝 Luggage purchases for tracking endpoint accessed');
        
        let purchases = [];
        const db = require('../../database/config/database');
        
        const purchasesResult = await db.execute(`
            SELECT lp.*, lc.campaign_name AS campaign_display_name
            FROM luggage_purchases lp
            LEFT JOIN luggage_campaigns lc ON lp.campaign_id = lc.id
            ORDER BY lp.purchase_date DESC, lp.created_at DESC
        `);
        
        if (Array.isArray(purchasesResult)) {
            purchases = purchasesResult;
        } else if (purchasesResult && Array.isArray(purchasesResult[0])) {
            purchases = purchasesResult[0];
        } else if (purchasesResult && purchasesResult.rows) {
            purchases = purchasesResult.rows;
        } else {
            purchases = [];
        }
        
        console.log('✅ Luggage purchases for tracking fetched from database:', purchases.length);
        
        res.json({
            success: true,
            purchases: purchases,
            total: purchases.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching luggage purchases for tracking:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch luggage purchases for tracking',
            details: error.message 
        });
    }
});

// Get luggage purchase by ID
router.get('/:id', async (req, res) => {
    try {
        const purchaseId = req.params.id;
        console.log('🔍 Fetching luggage purchase:', purchaseId);
        
        let purchase = null;
        
        try {
            const db = require('../../database/config/database');
            const purchaseResult = await db.execute('SELECT * FROM luggage_purchases WHERE id = ?', [purchaseId]);
            const purchaseData = Array.isArray(purchaseResult) ? purchaseResult[0] : purchaseResult;
            
            if (purchaseData.length > 0) {
                purchase = purchaseData[0];
                console.log('✅ Luggage purchase found:', purchase);
            }
        } catch (dbError) {
            console.error('❌ Database error, using fallback purchase:', dbError);
            
            // Fallback to mock purchase data (using first few from the main mock data)
            const mockPurchases = [
                {
                    id: 1,
                    purchase_reference: 'LP202605001',
                    campaign_id: 1,
                    campaign_name: 'English Proficiency Program',
                    employee_id: 'EMP001',
                    employee_name: 'John Doe',
                    department: 'IT',
                    luggage: 'English',
                    course_type: 'intermediate',
                    purchase_date: '2026-05-01',
                    amount: 1500.00,
                    currency: 'USD',
                    payment_method: 'company_sponsored',
                    payment_status: 'paid',
                    enrollment_status: 'in_progress',
                    start_date: '2026-05-01',
                    end_date: '2026-06-30',
                    instructor: 'Sarah Johnson',
                    location: 'Training Center - Room A',
                    schedule: 'Mon-Wed-Fri 9:00-11:00',
                    progress_percentage: 35.5,
                    certificate_issued: false,
                    certificate_date: null,
                    notes: 'Good progress, active participation',
                    approved_by: 'HR Manager',
                    approved_date: '2026-05-01T08:00:00Z',
                    created_at: '2026-05-01T08:00:00Z',
                    updated_at: '2026-05-04T00:00:00Z'
                },
                {
                    id: 2,
                    purchase_reference: 'LP202604002',
                    campaign_id: 2,
                    campaign_name: 'Swahili Communication Skills',
                    employee_id: 'EMP002',
                    employee_name: 'Jane Smith',
                    department: 'Operations',
                    luggage: 'Swahili',
                    course_type: 'basic',
                    purchase_date: '2026-04-15',
                    amount: 800.00,
                    currency: 'USD',
                    payment_method: 'company_sponsored',
                    payment_status: 'paid',
                    enrollment_status: 'completed',
                    start_date: '2026-04-15',
                    end_date: '2026-05-15',
                    instructor: 'Joseph Mwangi',
                    location: 'Conference Room B',
                    schedule: 'Tue-Thu 14:00-16:00',
                    progress_percentage: 100.0,
                    certificate_issued: true,
                    certificate_date: '2026-05-15T00:00:00Z',
                    notes: 'Excellent performance, certificate awarded',
                    approved_by: 'Operations Manager',
                    approved_date: '2026-04-15T09:00:00Z',
                    created_at: '2026-04-15T09:00:00Z',
                    updated_at: '2026-05-15T17:00:00Z'
                }
            ];
            
            purchase = mockPurchases.find(p => p.id == purchaseId);
        }
        
        if (!purchase) {
            return res.status(404).json({ 
                success: false,
                error: 'Luggage purchase not found' 
            });
        }
        
        res.json({
            success: true,
            purchase: purchase
        });
        
    } catch (error) {
        console.error('❌ Error fetching luggage purchase:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch luggage purchase',
            details: error.message 
        });
    }
});

// Create new luggage purchase
router.post('/', async (req, res) => {
    try {
        console.log('📝 Luggage Purchase creation request received');
        console.log('📝 Request body:', req.body);
        
        const {
            campaign_id,
            buyer_name,
            buyer_email,
            buyer_phone,
            luggage_name,
            units_purchased,
            price_per_unit,
            total_amount,
            payment_method,
            buyer_address,
            purchase_notes,
            purchase_status,
            purchase_date,
            created_by,
            // Legacy/alternative field names for backward compatibility
            amount,
            notes,
            employee_id
        } = req.body;
        
        // Validate required fields - must have buyer info and purchase details
        if (!buyer_name || !buyer_email || !units_purchased || !purchase_date) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'buyer_name, buyer_email, units_purchased, and purchase_date are required'
            });
        }
        
        // Use provided total_amount or the legacy 'amount' field
        const finalAmount = total_amount || amount;
        if (!finalAmount) {
            return res.status(400).json({
                success: false,
                error: 'Missing amount',
                details: 'total_amount or amount is required'
            });
        }
        
        // Calculate price_per_unit if not provided
        const finalPricePerUnit = price_per_unit || (finalAmount / units_purchased);
        
        // Try database insert with actual schema columns
        try {
            const db = require('../../database/config/database');
            const [columnRows] = await db.execute(`
                SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'luggage_purchases' AND COLUMN_NAME = 'luggage_name'
            `);
            const columnCount = Array.isArray(columnRows) && columnRows[0] ? (columnRows[0].cnt || columnRows[0]['COUNT(*)'] || 0) : 0;
            if (!columnCount) {
                try {
                    await db.execute('ALTER TABLE luggage_purchases ADD COLUMN luggage_name VARCHAR(100) NULL AFTER buyer_phone');
                } catch (alterErr) {
                    if (alterErr && (alterErr.code === 'ER_DUP_FIELDNAME' || /Duplicate column name/i.test(alterErr.message || ''))) {
                        console.warn('luggage_name column already exists, ignoring ALTER TABLE');
                    } else {
                        throw alterErr;
                    }
                }
            }
            
            const query = `
                INSERT INTO luggage_purchases (
                    campaign_id, buyer_name, buyer_email, buyer_phone,
                    luggage_name, units_purchased, price_per_unit, total_amount,
                    payment_method, buyer_address, purchase_notes,
                    purchase_status, purchase_date, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                campaign_id || null,
                buyer_name,
                buyer_email,
                buyer_phone || null,
                luggage_name || null,
                units_purchased,
                finalPricePerUnit,
                finalAmount,
                payment_method || 'Bank Transfer',
                buyer_address || null,
                purchase_notes || notes || null,
                purchase_status || 'Confirmed',
                purchase_date,
                created_by || employee_id || null
            ];
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Luggage purchase created successfully:', result);
            
            // Fetch the created purchase
            // Update campaign sold units for linked campaign records
            if (campaign_id) {
                const purchasedQty = parseInt(units_purchased, 10) || 0;
                if (purchasedQty > 0) {
                    await db.execute(
                        'UPDATE luggage_campaigns SET units_sold = units_sold + ? WHERE id = ?',
                        [purchasedQty, campaign_id]
                    );
                }
            }

            const createdPurchaseResult = await db.execute('SELECT * FROM luggage_purchases WHERE id = ?', [result.insertId]);
            const createdPurchase = Array.isArray(createdPurchaseResult) ? createdPurchaseResult[0] : createdPurchaseResult;
            
            notify('Luggage Purchase', 'Luggage purchase recorded: ' + (req.body.item_name || req.body.description || 'Item') + ' - Qty: ' + (req.body.quantity || '1') + ', Amount: ' + (req.body.amount || req.body.total_cost || '0'), 'info', 'MD', 'Real Estate Manager');
            res.status(201).json({
                success: true,
                message: 'Luggage purchase created successfully',
                purchaseId: result.insertId,
                purchase: createdPurchase[0]
            });
            
        } catch (dbError) {
            console.error('❌ Database error creating purchase:', dbError);
            res.status(500).json({ 
                success: false,
                error: 'Database connection error',
                details: 'Unable to save purchase to database. Please check database connection and try again.',
                message: dbError.message
            });
            return;
        }
        
    } catch (error) {
        console.error('❌ Error creating luggage purchase:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create luggage purchase',
            details: error.message 
        });
    }
});

// Update luggage purchase
router.put('/:id', async (req, res) => {
    try {
        const purchaseId = req.params.id;
        const updateData = req.body;
        
        console.log('🔄 Updating luggage purchase:', purchaseId);
        console.log('📝 Update data:', updateData);
        
        // Try database first
        try {
            const db = require('../../database/config/database');
            
            // Build dynamic update query
            const updateFields = [];
            const updateValues = [];
            
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined && key !== 'id' && key !== 'purchase_reference') {
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
            updateValues.push(purchaseId);
            
            const updateQuery = `UPDATE luggage_purchases SET ${updateFields.join(', ')} WHERE id = ?`;
            
            const resultResult = await db.execute(updateQuery, updateValues);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Luggage purchase updated successfully:', result);
            
            res.json({
                success: true,
                message: 'Luggage purchase updated successfully',
                affected_rows: result.affectedRows
            });
            
        } catch (dbError) {
            console.error('❌ Database error updating purchase:', dbError);
            res.status(500).json({
                success: false,
                error: 'Failed to update luggage purchase',
                details: dbError.message
            });
            return;
        }
    } catch (error) {
        console.error('❌ Error updating luggage purchase:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update luggage purchase',
            details: error.message 
        });
    }
});

// Delete luggage purchase
router.delete('/:id', async (req, res) => {
    try {
        const purchaseId = req.params.id;
        console.log('🗑️ Deleting luggage purchase:', purchaseId);
        
        // Try database first
        try {
            const db = require('../../database/config/database');
            
            // Check if purchase exists
            const purchaseResult = await db.execute('SELECT id FROM luggage_purchases WHERE id = ?', [purchaseId]);
            const purchaseData = Array.isArray(purchaseResult) ? purchaseResult[0] : purchaseResult;
            
            if (purchaseData.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Luggage purchase not found'
                });
            }
            
            // Delete purchase
            const resultResult = await db.execute('DELETE FROM luggage_purchases WHERE id = ?', [purchaseId]);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Luggage purchase deleted successfully');
            
            res.json({
                success: true,
                message: 'Luggage purchase deleted successfully',
                deleted_purchase: {
                    id: purchaseId
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error deleting purchase:', dbError);
            res.status(500).json({
                success: false,
                error: 'Failed to delete luggage purchase',
                details: dbError.message
            });
            return;
        }
    } catch (error) {
        console.error('❌ Error deleting luggage purchase:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete luggage purchase',
            details: error.message 
        });
    }
});

module.exports = router;
