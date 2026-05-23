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

// Root endpoint - get all payment tracking records
router.get('/', async (req, res) => {
    try {
        console.log('📝 Luggage Payment Tracking root endpoint accessed');
        
        let tracking = [];
        
        try {
            const db = require('../../database/config/database');
            
            // Ensure luggage_payment_tracking table exists
            try {
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
                        total_amount DECIMAL(10,2) NOT NULL,
                        currency VARCHAR(10) DEFAULT 'USD',
                        payment_method ENUM('cash', 'card', 'bank_transfer', 'company_sponsored', 'installment') DEFAULT 'company_sponsored',
                        payment_status ENUM('pending', 'partial', 'paid', 'refunded', 'cancelled') DEFAULT 'pending',
                        amount_paid DECIMAL(10,2) DEFAULT 0.00,
                        balance_amount DECIMAL(10,2) DEFAULT 0.00,
                        payment_schedule ENUM('full_payment', 'monthly_installments', 'quarterly_installments', 'custom') DEFAULT 'full_payment',
                        total_installments INT DEFAULT 1,
                        paid_installments INT DEFAULT 0,
                        next_payment_date DATE NULL,
                        next_payment_amount DECIMAL(10,2) NULL,
                        payment_history JSON NULL,
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
                console.log('✅ Luggage Payment Tracking table verified/created successfully');
            } catch (tableError) {
                console.log('⚠️ Could not create luggage_payment_tracking table:', tableError.message);
            }
            
            const trackingResult = await db.execute(`
                SELECT * FROM luggage_payment_tracking 
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
            
            console.log('✅ Luggage Payment Tracking records fetched from database:', tracking.length);
        } catch (dbError) {
            console.error('❌ Database error, using fallback luggage payment tracking:', dbError);
            
            // Fallback to mock luggage payment tracking
            tracking = [
                {
                    id: 1,
                    tracking_reference: 'LPT202605001',
                    purchase_id: 1,
                    purchase_reference: 'LP202605001',
                    employee_id: 'EMP001',
                    employee_name: 'John Doe',
                    department: 'IT',
                    luggage: 'English',
                    course_name: 'English Proficiency Program - Intermediate',
                    total_amount: 1500.00,
                    currency: 'USD',
                    payment_method: 'company_sponsored',
                    payment_status: 'paid',
                    amount_paid: 1500.00,
                    balance_amount: 0.00,
                    payment_schedule: 'full_payment',
                    total_installments: 1,
                    paid_installments: 1,
                    next_payment_date: null,
                    next_payment_amount: null,
                    payment_history: JSON.stringify([
                        {
                            date: '2026-05-01',
                            amount: 1500.00,
                            method: 'company_sponsored',
                            status: 'paid',
                            reference: 'PAY001',
                            notes: 'Full payment processed'
                        }
                    ]),
                    approval_status: 'approved',
                    approved_by: 'HR Manager',
                    approved_date: '2026-05-01T08:00:00Z',
                    finance_notes: 'Approved for full company sponsorship',
                    hr_notes: 'Employee enrolled in intermediate English course',
                    created_at: '2026-05-01T08:00:00Z',
                    updated_at: '2026-05-01T08:00:00Z'
                },
                {
                    id: 2,
                    tracking_reference: 'LPT202604002',
                    purchase_id: 2,
                    purchase_reference: 'LP202604002',
                    employee_id: 'EMP002',
                    employee_name: 'Jane Smith',
                    department: 'Operations',
                    luggage: 'Swahili',
                    course_name: 'Swahili Communication Skills - Basic',
                    total_amount: 800.00,
                    currency: 'USD',
                    payment_method: 'company_sponsored',
                    payment_status: 'paid',
                    amount_paid: 800.00,
                    balance_amount: 0.00,
                    payment_schedule: 'full_payment',
                    total_installments: 1,
                    paid_installments: 1,
                    next_payment_date: null,
                    next_payment_amount: null,
                    payment_history: JSON.stringify([
                        {
                            date: '2026-04-15',
                            amount: 800.00,
                            method: 'company_sponsored',
                            status: 'paid',
                            reference: 'PAY002',
                            notes: 'Full payment for Swahili course'
                        }
                    ]),
                    approval_status: 'approved',
                    approved_by: 'Operations Manager',
                    approved_date: '2026-04-15T09:00:00Z',
                    finance_notes: 'Approved for operations department training',
                    hr_notes: 'Basic Swahili course for expatriate staff',
                    created_at: '2026-04-15T09:00:00Z',
                    updated_at: '2026-04-15T09:00:00Z'
                },
                {
                    id: 3,
                    tracking_reference: 'LPT202606003',
                    purchase_id: 3,
                    purchase_reference: 'LP202606003',
                    employee_id: 'EMP003',
                    employee_name: 'Mike Johnson',
                    department: 'Projects',
                    luggage: 'French',
                    course_name: 'French for Project Management - Business',
                    total_amount: 2500.00,
                    currency: 'USD',
                    payment_method: 'monthly_installments',
                    payment_status: 'partial',
                    amount_paid: 833.33,
                    balance_amount: 1666.67,
                    payment_schedule: 'monthly_installments',
                    total_installments: 3,
                    paid_installments: 1,
                    next_payment_date: '2026-07-01',
                    next_payment_amount: 833.33,
                    payment_history: JSON.stringify([
                        {
                            date: '2026-06-01',
                            amount: 833.33,
                            method: 'company_sponsored',
                            status: 'paid',
                            reference: 'PAY003',
                            notes: 'First installment payment'
                        }
                    ]),
                    approval_status: 'approved',
                    approved_by: 'Project Director',
                    approved_date: '2026-06-01T10:00:00Z',
                    finance_notes: 'Approved for 3-month installment plan',
                    hr_notes: 'French business course for project manager',
                    created_at: '2026-06-01T10:00:00Z',
                    updated_at: '2026-06-01T10:00:00Z'
                },
                {
                    id: 4,
                    tracking_reference: 'LPT202607004',
                    purchase_id: 4,
                    purchase_reference: 'LP202607004',
                    employee_id: 'EMP004',
                    employee_name: 'Sarah Wilson',
                    department: 'Management',
                    luggage: 'Mandarin',
                    course_name: 'Mandarin Business Basics',
                    total_amount: 3000.00,
                    currency: 'USD',
                    payment_method: 'quarterly_installments',
                    payment_status: 'pending',
                    amount_paid: 0.00,
                    balance_amount: 3000.00,
                    payment_schedule: 'quarterly_installments',
                    total_installments: 3,
                    paid_installments: 0,
                    next_payment_date: '2026-07-15',
                    next_payment_amount: 1000.00,
                    payment_history: JSON.stringify([]),
                    approval_status: 'pending_approval',
                    approved_by: null,
                    approved_date: null,
                    finance_notes: 'Pending finance approval for quarterly installments',
                    hr_notes: 'Senior management priority enrollment',
                    created_at: '2026-07-01T08:00:00Z',
                    updated_at: '2026-07-01T08:00:00Z'
                },
                {
                    id: 5,
                    tracking_reference: 'LPT202605005',
                    purchase_id: 5,
                    purchase_reference: 'LP202605005',
                    employee_id: 'EMP005',
                    employee_name: 'Robert Chen',
                    department: 'Finance',
                    luggage: 'English',
                    course_name: 'English Proficiency Program - Advanced',
                    total_amount: 2000.00,
                    currency: 'USD',
                    payment_method: 'card',
                    payment_status: 'partial',
                    amount_paid: 500.00,
                    balance_amount: 1500.00,
                    payment_schedule: 'custom',
                    total_installments: 4,
                    paid_installments: 1,
                    next_payment_date: '2026-06-03',
                    next_payment_amount: 500.00,
                    payment_history: JSON.stringify([
                        {
                            date: '2026-05-03',
                            amount: 500.00,
                            method: 'card',
                            status: 'paid',
                            reference: 'PAY005',
                            notes: 'Self-funded - first installment'
                        }
                    ]),
                    approval_status: 'approved',
                    approved_by: 'Finance Manager',
                    approved_date: '2026-05-03T11:00:00Z',
                    finance_notes: 'Self-funded payment plan approved',
                    hr_notes: 'Advanced English course for finance staff',
                    created_at: '2026-05-03T11:00:00Z',
                    updated_at: '2026-05-03T11:00:00Z'
                },
                {
                    id: 6,
                    tracking_reference: 'LPT202605006',
                    purchase_id: null,
                    purchase_reference: null,
                    employee_id: 'EMP006',
                    employee_name: 'David Kim',
                    department: 'HR',
                    luggage: 'Spanish',
                    course_name: 'Spanish for HR Management',
                    total_amount: 1200.00,
                    currency: 'USD',
                    payment_method: 'company_sponsored',
                    payment_status: 'refunded',
                    amount_paid: 0.00,
                    balance_amount: 0.00,
                    payment_schedule: 'full_payment',
                    total_installments: 1,
                    paid_installments: 0,
                    next_payment_date: null,
                    next_payment_amount: null,
                    payment_history: JSON.stringify([
                        {
                            date: '2026-05-10',
                            amount: 1200.00,
                            method: 'company_sponsored',
                            status: 'refunded',
                            reference: 'REF001',
                            notes: 'Course cancelled - full refund processed'
                        }
                    ]),
                    approval_status: 'rejected',
                    approved_by: 'HR Director',
                    approved_date: '2026-05-10T14:00:00Z',
                    finance_notes: 'Refund processed due to course cancellation',
                    hr_notes: 'Course not available - employee will take alternative course',
                    created_at: '2026-05-10T14:00:00Z',
                    updated_at: '2026-05-10T14:00:00Z'
                }
            ];
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
            const trackingResult = await db.execute('SELECT * FROM luggage_payment_tracking WHERE id = ?', [trackingId]);
            const trackingData = Array.isArray(trackingResult) ? trackingResult[0] : trackingResult;
            
            if (trackingData.length > 0) {
                tracking = trackingData[0];
                console.log('✅ Luggage payment tracking found:', tracking);
            }
        } catch (dbError) {
            console.error('❌ Database error, using fallback tracking:', dbError);
            
            // Fallback to mock tracking data (using first few from the main mock data)
            const mockTracking = [
                {
                    id: 1,
                    tracking_reference: 'LPT202605001',
                    purchase_id: 1,
                    purchase_reference: 'LP202605001',
                    employee_id: 'EMP001',
                    employee_name: 'John Doe',
                    department: 'IT',
                    luggage: 'English',
                    course_name: 'English Proficiency Program - Intermediate',
                    total_amount: 1500.00,
                    currency: 'USD',
                    payment_method: 'company_sponsored',
                    payment_status: 'paid',
                    amount_paid: 1500.00,
                    balance_amount: 0.00,
                    payment_schedule: 'full_payment',
                    total_installments: 1,
                    paid_installments: 1,
                    next_payment_date: null,
                    next_payment_amount: null,
                    payment_history: JSON.stringify([
                        {
                            date: '2026-05-01',
                            amount: 1500.00,
                            method: 'company_sponsored',
                            status: 'paid',
                            reference: 'PAY001',
                            notes: 'Full payment processed'
                        }
                    ]),
                    approval_status: 'approved',
                    approved_by: 'HR Manager',
                    approved_date: '2026-05-01T08:00:00Z',
                    finance_notes: 'Approved for full company sponsorship',
                    hr_notes: 'Employee enrolled in intermediate English course',
                    created_at: '2026-05-01T08:00:00Z',
                    updated_at: '2026-05-01T08:00:00Z'
                }
            ];
            
            tracking = mockTracking.find(t => t.id == trackingId);
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
            approved_by
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
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            const query = `
                INSERT INTO luggage_payment_tracking (
                    tracking_reference, purchase_id, purchase_reference, employee_id, employee_name,
                    department, luggage, course_name, total_amount, currency, payment_method,
                    payment_status, amount_paid, balance_amount, payment_schedule, total_installments,
                    paid_installments, next_payment_date, next_payment_amount, payment_history,
                    approval_status, finance_notes, hr_notes, approved_by, approved_date, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
                currency || 'USD',
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
            console.error('❌ Database error, using mock tracking creation:', dbError);
            
            // Fallback to mock tracking creation
            const trackingId = `LPT${Date.now().toString().slice(-6)}`;
            
            res.status(201).json({
                success: true,
                message: 'Luggage payment tracking created successfully (mock)',
                trackingId: trackingId,
                tracking: {
                    id: trackingId,
                    tracking_reference,
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
                    payment_status: amount_paid > 0 ? 'paid' : 'pending',
                    amount_paid,
                    balance_amount,
                    payment_schedule,
                    total_installments,
                    paid_installments,
                    next_payment_date,
                    next_payment_amount,
                    payment_history: JSON.stringify([]),
                    approval_status: approved_by ? 'approved' : 'pending_approval',
                    finance_notes,
                    hr_notes,
                    approved_by,
                    created_at: new Date().toISOString(),
                    mock: true
                }
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
            console.error('❌ Database error, using mock update:', dbError);
            
            // Fallback to mock update
            res.json({
                success: true,
                message: 'Luggage payment tracking updated successfully (mock)',
                affected_rows: 1,
                mock: true
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
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
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
            console.error('❌ Database error, using mock delete:', dbError);
            
            // Fallback to mock delete
            res.json({
                success: true,
                message: 'Luggage payment tracking deleted successfully (mock)',
                deleted_tracking: {
                    id: trackingId,
                    tracking_reference: 'Mock Tracking'
                },
                mock: true
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
