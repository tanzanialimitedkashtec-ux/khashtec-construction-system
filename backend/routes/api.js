const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await db.execute('SELECT id, name, email, role, department, status FROM users');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user by ID with full details
router.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        console.log('🔍 Fetching user details:', userId);
        
        const [users] = await db.execute(`
            SELECT u.*, e.position, e.department as emp_department, e.salary, e.hire_date,
                   ed.full_name, ed.gmail, ed.phone, ed.nida, ed.passport, ed.profile_image,
                   ed.contract_type, ed.passport_image, ed.address
            FROM users u
            LEFT JOIN employees e ON u.id = e.user_id
            LEFT JOIN employee_details ed ON e.id = ed.employee_id
            WHERE u.id = ? OR ed.employee_id = ?
            ORDER BY u.created_at DESC
            LIMIT 1
        `, [userId, userId]);
        
        if (users.length > 0) {
            const user = users[0];
            const formattedUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                department: user.department || user.emp_department,
                status: user.status,
                position: user.position,
                salary: user.salary,
                hire_date: user.hire_date,
                full_name: user.full_name || user.name,
                gmail: user.gmail || user.email,
                phone: user.phone,
                nida: user.nida,
                passport: user.passport,
                profile_image: user.profile_image,
                contract_type: user.contract_type,
                passport_image: user.passport_image,
                address: user.address,
                created_at: user.created_at,
                updated_at: user.updated_at
            };
            
            console.log('✅ User details retrieved successfully');
            res.json({ success: true, data: formattedUser });
        } else {
            console.log('❌ User not found:', userId);
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (error) {
        console.error('❌ Error fetching user details:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all projects
router.get('/projects', async (req, res) => {
    try {
        const projects = await db.execute(`
            SELECT p.*, u.name as manager_name 
            FROM projects p 
            LEFT JOIN users u ON p.manager_id = u.id
        `);
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all employees
router.get('/employees', async (req, res) => {
    try {
        const employees = await db.execute(`
            SELECT e.*, u.name, u.email, u.phone 
            FROM employees e 
            LEFT JOIN users u ON e.user_id = u.id
        `);
        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all properties
router.get('/properties', async (req, res) => {
    try {
        const properties = await db.execute(`
            SELECT p.*, u.name as agent_name 
            FROM properties p 
            LEFT JOIN users u ON p.agent_id = u.id
        `);
        res.json({ success: true, data: properties });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get financial transactions
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await db.execute(`
            SELECT ft.*, u1.name as created_by_name, u2.name as approved_by_name 
            FROM financial_transactions ft 
            LEFT JOIN users u1 ON ft.created_by = u1.id 
            LEFT JOIN users u2 ON ft.approved_by = u2.id
            ORDER BY ft.date DESC
        `);
        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get HSE incidents
router.get('/incidents', async (req, res) => {
    try {
        const incidents = await db.execute(`
            SELECT hi.*, u.name as reported_by_name, p.name as project_name 
            FROM hse_incidents hi 
            LEFT JOIN users u ON hi.reported_by = u.id 
            LEFT JOIN projects p ON hi.project_id = p.id
            ORDER BY hi.incident_date DESC
        `);
        res.json({ success: true, data: incidents });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add new user
router.post('/users', async (req, res) => {
    try {
        const { name, email, phone, location, role, department, password } = req.body;
        
        // Check if user exists
        const existing = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }
        
        const result = await db.execute(`
            INSERT INTO users (name, email, phone, location, role, department, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [name, email, phone, location, role, department, password]);
        
        res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add new project
router.post('/projects', async (req, res) => {
    try {
        const { name, description, location, start_date, end_date, budget, manager_id } = req.body;
        
        const result = await db.execute(`
            INSERT INTO projects (name, description, location, start_date, end_date, budget, manager_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [name, description, location, start_date, end_date, budget, manager_id]);
        
        res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update project status
router.put('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, actual_cost } = req.body;
        
        await db.execute(`
            UPDATE projects SET status = ?, actual_cost = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [status, actual_cost, id]);
        
        res.json({ success: true, message: 'Project updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add financial transaction
router.post('/transactions', async (req, res) => {
    try {
        const { type, category, description, amount, date, created_by } = req.body;
        
        const result = await db.execute(`
            INSERT INTO financial_transactions (type, category, description, amount, date, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [type, category, description, amount, date, created_by]);
        
        res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all documents
router.get('/documents', async (req, res) => {
    try {
        console.log('📄 Fetching documents from database...');
        
        // Check if documents table exists, if not create it
        await db.execute(`
            CREATE TABLE IF NOT EXISTS documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                name VARCHAR(255),
                filename VARCHAR(255),
                file_path VARCHAR(500),
                file_size INT,
                mime_type VARCHAR(100),
                status ENUM('active', 'expired', 'pending') DEFAULT 'active',
                expiry_date DATE,
                description TEXT,
                uploaded_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        const documents = await db.execute(`
            SELECT d.*, u.name as uploaded_by_name 
            FROM documents d 
            LEFT JOIN users u ON d.uploaded_by = u.id
            ORDER BY d.created_at DESC
        `);
        
        console.log(`✅ Found ${documents.length} documents`);
        res.json({ success: true, data: documents });
    } catch (error) {
        console.error('❌ Error fetching documents:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload document
router.post('/documents/upload', async (req, res) => {
    try {
        console.log('📤 Processing document upload...');
        
        // Check if documents table exists
        await db.execute(`
            CREATE TABLE IF NOT EXISTS documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                name VARCHAR(255),
                filename VARCHAR(255),
                file_path VARCHAR(500),
                file_size INT,
                mime_type VARCHAR(100),
                status ENUM('active', 'expired', 'pending') DEFAULT 'active',
                expiry_date DATE,
                description TEXT,
                uploaded_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Since we don't have multer middleware, we'll simulate file upload with form data
        const { type, name, filename, file_size, mime_type, expiry_date, description, uploaded_by } = req.body;
        
        if (!type) {
            return res.status(400).json({ success: false, error: 'Document type is required' });
        }
        
        // Insert document record
        const result = await db.execute(`
            INSERT INTO documents (type, name, filename, file_size, mime_type, expiry_date, description, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [type, name || `${type} Certificate`, filename, file_size, mime_type, expiry_date, description, uploaded_by || 1]);
        
        console.log('✅ Document uploaded successfully:', result.insertId);
        res.json({ 
            success: true, 
            data: { 
                id: result.insertId,
                message: 'Document uploaded successfully'
            }
        });
    } catch (error) {
        console.error('❌ Error uploading document:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Download document
router.get('/documents/:id/download', async (req, res) => {
    try {
        const documentId = req.params.id;
        console.log('⬇️ Downloading document:', documentId);
        
        const documents = await db.execute('SELECT * FROM documents WHERE id = ?', [documentId]);
        
        if (documents.length === 0) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }
        
        const document = documents[0];
        
        // For now, return a mock file since we don't have actual file storage
        res.setHeader('Content-Type', document.mime_type || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${document.filename || 'document.pdf'}"`);
        res.send('Mock file content - implement actual file storage');
        
    } catch (error) {
        console.error('❌ Error downloading document:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        const [userCount, projectCount, propertyCount, transactionSum] = await Promise.all([
            db.execute('SELECT COUNT(*) as count FROM users'),
            db.execute('SELECT COUNT(*) as count FROM projects'),
            db.execute('SELECT COUNT(*) as count FROM properties'),
            db.execute('SELECT SUM(amount) as total FROM financial_transactions WHERE type = "Income"')
        ]);
        
        res.json({
            success: true,
            data: {
                users: userCount[0].count,
                projects: projectCount[0].count,
                properties: propertyCount[0].count,
                total_income: transactionSum[0].total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== LANGUAGE PURCHASE TRACKING API ENDPOINTS =====

// Get all language campaigns
router.get('/language-campaigns', async (req, res) => {
    try {
        const [campaigns] = await db.execute(`
            SELECT lc.*, u.name as created_by_name
            FROM language_campaigns lc
            LEFT JOIN users u ON lc.created_by = u.id
            ORDER BY lc.created_at DESC
        `);
        res.json({ success: true, data: campaigns });
    } catch (error) {
        console.error('Error fetching language campaigns:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new language campaign
router.post('/language-campaigns', async (req, res) => {
    try {
        const {
            campaign_name,
            campaign_description,
            language_name,
            language_code,
            price_per_unit,
            total_units_available,
            campaign_start_date,
            campaign_end_date,
            status,
            created_by
        } = req.body;

        const [result] = await db.execute(`
            INSERT INTO language_campaigns 
            (campaign_name, campaign_description, language_name, language_code, 
             price_per_unit, total_units_available, campaign_start_date, 
             campaign_end_date, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            campaign_name,
            campaign_description,
            language_name,
            language_code,
            price_per_unit,
            total_units_available,
            campaign_start_date,
            campaign_end_date,
            status || 'Draft',
            created_by
        ]);

        res.json({ 
            success: true, 
            data: { id: result.insertId, message: 'Campaign created successfully' }
        });
    } catch (error) {
        console.error('Error creating language campaign:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all language purchases
router.get('/language-purchases', async (req, res) => {
    try {
        const [purchases] = await db.execute(`
            SELECT lp.*, lc.campaign_name, lc.language_name, u.name as created_by_name
            FROM language_purchases lp
            LEFT JOIN language_campaigns lc ON lp.campaign_id = lc.id
            LEFT JOIN users u ON lp.created_by = u.id
            ORDER BY lp.purchase_date DESC
        `);
        res.json({ success: true, data: purchases });
    } catch (error) {
        console.error('Error fetching language purchases:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new language purchase
router.post('/language-purchases', async (req, res) => {
    try {
        const {
            campaign_id,
            buyer_name,
            buyer_email,
            buyer_phone,
            buyer_address,
            units_purchased,
            payment_method,
            notes,
            created_by
        } = req.body;

        // Generate unique purchase ID and tracking number
        const purchase_id = 'PURCHASE_' + Date.now();
        const tracking_number = 'TRACK_' + Math.random().toString(36).substr(2, 9).toUpperCase();

        // Get campaign details to calculate total amount
        const [campaign] = await db.execute(
            'SELECT price_per_unit FROM language_campaigns WHERE id = ?',
            [campaign_id]
        );

        if (campaign.length === 0) {
            return res.status(400).json({ success: false, error: 'Campaign not found' });
        }

        const total_amount = units_purchased * campaign[0].price_per_unit;

        const [result] = await db.execute(`
            INSERT INTO language_purchases 
            (purchase_id, campaign_id, buyer_name, buyer_email, buyer_phone, 
             buyer_address, units_purchased, total_amount, payment_method, 
             payment_status, tracking_number, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            purchase_id,
            campaign_id,
            buyer_name,
            buyer_email,
            buyer_phone,
            buyer_address,
            units_purchased,
            total_amount,
            payment_method,
            'Pending',
            tracking_number,
            notes,
            created_by
        ]);

        // Update campaign units sold
        await db.execute(
            'UPDATE language_campaigns SET units_sold = units_sold + ? WHERE id = ?',
            [units_purchased, campaign_id]
        );

        res.json({ 
            success: true, 
            data: { 
                id: result.insertId, 
                purchase_id,
                tracking_number,
                total_amount,
                message: 'Purchase recorded successfully' 
            }
        });
    } catch (error) {
        console.error('Error creating language purchase:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all payment tracking records
router.get('/language-payment-tracking', async (req, res) => {
    try {
        const [tracking] = await db.execute(`
            SELECT lpt.*, lp.purchase_id, lp.buyer_name, u.name as created_by_name
            FROM language_payment_tracking lpt
            LEFT JOIN language_purchases lp ON lpt.purchase_id = lp.id
            LEFT JOIN users u ON lpt.created_by = u.id
            ORDER BY lpt.payment_date DESC
        `);
        res.json({ success: true, data: tracking });
    } catch (error) {
        console.error('Error fetching payment tracking:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new payment tracking record
router.post('/language-payment-tracking', async (req, res) => {
    try {
        const {
            purchase_id,
            payment_stage,
            payment_reference,
            bank_reference,
            transaction_id,
            amount,
            notes,
            created_by
        } = req.body;

        // Generate unique tracking number
        const tracking_number = 'TRACK_' + Math.random().toString(36).substr(2, 9).toUpperCase();

        const [result] = await db.execute(`
            INSERT INTO language_payment_tracking 
            (purchase_id, tracking_number, payment_stage, payment_reference, 
             bank_reference, transaction_id, amount, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            purchase_id,
            tracking_number,
            payment_stage,
            payment_reference,
            bank_reference,
            transaction_id,
            amount,
            notes,
            created_by
        ]);

        // Update purchase payment status if completed
        if (payment_stage === 'Completed') {
            await db.execute(
                'UPDATE language_purchases SET payment_status = ?, payment_date = NOW() WHERE id = ?',
                ['Paid', purchase_id]
            );
        }

        res.json({ 
            success: true, 
            data: { 
                id: result.insertId, 
                tracking_number,
                message: 'Payment tracking created successfully' 
            }
        });
    } catch (error) {
        console.error('Error creating payment tracking:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get active campaigns for purchase form
router.get('/language-campaigns/active', async (req, res) => {
    try {
        const [campaigns] = await db.execute(`
            SELECT id, campaign_name, language_name, price_per_unit, total_units_available, units_sold
            FROM language_campaigns 
            WHERE status = 'Active' 
            ORDER BY campaign_name
        `);
        res.json({ success: true, data: campaigns });
    } catch (error) {
        console.error('Error fetching active campaigns:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get purchases for tracking form
router.get('/language-purchases/for-tracking', async (req, res) => {
    try {
        const [purchases] = await db.execute(`
            SELECT id, purchase_id, buyer_name, total_amount, campaign_name
            FROM language_purchases lp
            LEFT JOIN language_campaigns lc ON lp.campaign_id = lc.id
            ORDER BY lp.purchase_date DESC
        `);
        res.json({ success: true, data: purchases });
    } catch (error) {
        console.error('Error fetching purchases for tracking:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update campaign status
router.put('/language-campaigns/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await db.execute(
            'UPDATE language_campaigns SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, id]
        );

        res.json({ success: true, message: 'Campaign status updated successfully' });
    } catch (error) {
        console.error('Error updating campaign status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update purchase payment status
router.put('/language-purchases/:id/payment-status', async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        await db.execute(
            'UPDATE language_purchases SET payment_status = ?, payment_date = NOW() WHERE id = ?',
            [payment_status, id]
        );

        res.json({ success: true, message: 'Payment status updated successfully' });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== PAYMENT TRACKING API ENDPOINTS =====

// Get all payment tracking data with sales and client information
router.get('/payment-tracking', async (req, res) => {
    try {
        const [payments] = await db.execute(`
            SELECT 
                s.id as sale_id,
                s.sale_id as sale_reference,
                s.total_amount,
                s.paid_amount,
                s.outstanding_balance,
                s.payment_status,
                s.installment_amount,
                s.next_payment_date,
                s.installment_months,
                s.completed_date,
                c.full_name as client_name,
                c.phone as client_phone,
                c.email as client_email,
                p.property_title,
                p.property_type,
                p.location as property_location,
                u.name as created_by_name,
                s.created_at
            FROM sales s
            LEFT JOIN clients c ON s.client_id = c.id
            LEFT JOIN properties p ON s.property_id = p.id
            LEFT JOIN users u ON s.created_by = u.id
            WHERE s.payment_status IN ('pending', 'partial', 'completed', 'overdue')
            ORDER BY s.next_payment_date ASC, s.created_at DESC
        `);
        
        res.json({ success: true, data: payments });
    } catch (error) {
        console.error('Error fetching payment tracking data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get payment statistics and summary
router.get('/payment-tracking/statistics', async (req, res) => {
    try {
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as active_installments,
                SUM(CASE WHEN outstanding_balance > 0 THEN outstanding_balance ELSE 0 END) as total_outstanding,
                SUM(CASE WHEN payment_status = 'completed' THEN paid_amount ELSE 0 END) as total_collected,
                SUM(CASE WHEN DATE(next_payment_date) = DATE(CURDATE()) THEN installment_amount ELSE 0 END) as due_today,
                SUM(CASE WHEN DATE(next_payment_date) < DATE(CURDATE()) AND payment_status != 'completed' THEN 1 ELSE 0 END) as overdue_count,
                SUM(CASE WHEN DATE(next_payment_date) BETWEEN DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND DATE(CURDATE()) THEN paid_amount ELSE 0 END) as this_month_collections
            FROM sales 
            WHERE payment_status IN ('pending', 'partial', 'completed', 'overdue')
        `);
        
        const [monthlyData] = await db.execute(`
            SELECT 
                DATE_FORMAT(payment_date, '%Y-%m') as month,
                SUM(amount) as total_collected
            FROM payment_history 
            WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
            ORDER BY month DESC
        `);
        
        res.json({ 
            success: true, 
            data: {
                statistics: stats[0],
                monthly_collections: monthlyData
            }
        });
    } catch (error) {
        console.error('Error fetching payment statistics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Record new payment
router.post('/payment-tracking/record-payment', async (req, res) => {
    try {
        const {
            sale_id,
            payment_amount,
            payment_method,
            payment_date,
            notes,
            created_by
        } = req.body;

        // Get current sale details
        const [sale] = await db.execute(
            'SELECT * FROM sales WHERE id = ?',
            [sale_id]
        );

        if (sale.length === 0) {
            return res.status(404).json({ success: false, error: 'Sale not found' });
        }

        const currentSale = sale[0];
        const newPaidAmount = currentSale.paid_amount + payment_amount;
        const newOutstandingBalance = currentSale.total_amount - newPaidAmount;
        let newPaymentStatus = currentSale.payment_status;

        // Update payment status based on new balance
        if (newOutstandingBalance <= 0) {
            newPaymentStatus = 'completed';
        } else if (newPaidAmount > 0) {
            newPaymentStatus = 'partial';
        }

        // Start transaction
        await db.execute('START TRANSACTION');

        try {
            // Add payment history record
            await db.execute(`
                INSERT INTO payment_history 
                (sale_id, amount, payment_method, payment_date, notes, created_by)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [sale_id, payment_amount, payment_method, payment_date, notes, created_by]);

            // Update sale record
            await db.execute(`
                UPDATE sales SET 
                    paid_amount = ?,
                    outstanding_balance = ?,
                    payment_status = ?,
                    last_payment_date = ?,
                    updated_at = NOW()
                WHERE id = ?
            `, [newPaidAmount, newOutstandingBalance, newPaymentStatus, payment_date, sale_id]);

            // Update next payment date if not completed
            if (newPaymentStatus !== 'completed') {
                await db.execute(`
                    UPDATE sales SET 
                        next_payment_date = DATE_ADD(?, INTERVAL 1 MONTH)
                    WHERE id = ? AND payment_status != 'completed'
                `, [currentSale.next_payment_date, sale_id]);
            } else {
                await db.execute(`
                    UPDATE sales SET 
                        completed_date = ?,
                        next_payment_date = NULL
                    WHERE id = ?
                `, [payment_date, sale_id]);
            }

            await db.execute('COMMIT');

            res.json({ 
                success: true, 
                message: 'Payment recorded successfully',
                data: {
                    new_paid_amount: newPaidAmount,
                    new_outstanding_balance: newOutstandingBalance,
                    new_payment_status: newPaymentStatus
                }
            });
        } catch (error) {
            await db.execute('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get payment history for a specific sale
router.get('/payment-tracking/history/:saleId', async (req, res) => {
    try {
        const { saleId } = req.params;
        
        const [history] = await db.execute(`
            SELECT 
                ph.*,
                u.name as recorded_by_name
            FROM payment_history ph
            LEFT JOIN users u ON ph.created_by = u.id
            WHERE ph.sale_id = ?
            ORDER BY ph.payment_date DESC
        `, [saleId]);
        
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send payment reminder (placeholder for email/sms integration)
router.post('/payment-tracking/send-reminder/:saleId', async (req, res) => {
    try {
        const { saleId } = req.params;
        const { reminder_type, created_by } = req.body;

        // Get sale and client details
        const [sale] = await db.execute(`
            SELECT s.*, c.full_name, c.phone, c.email
            FROM sales s
            LEFT JOIN clients c ON s.client_id = c.id
            WHERE s.id = ?
        `, [saleId]);

        if (sale.length === 0) {
            return res.status(404).json({ success: false, error: 'Sale not found' });
        }

        const saleData = sale[0];

        // Log reminder for now (in production, integrate with email/SMS service)
        await db.execute(`
            INSERT INTO payment_reminders 
            (sale_id, client_id, reminder_type, sent_date, created_by)
            VALUES (?, ?, ?, NOW(), ?)
        `, [saleId, saleData.client_id, reminder_type, created_by]);

        // TODO: Integrate with actual email/SMS service
        // sendEmail(saleData.email, reminderContent);
        // sendSMS(saleData.phone, reminderContent);

        res.json({ 
            success: true, 
            message: `Payment reminder sent to ${saleData.full_name} via ${reminder_type}`,
            data: {
                client_name: saleData.full_name,
                client_email: saleData.email,
                client_phone: saleData.phone,
                outstanding_balance: saleData.outstanding_balance,
                next_payment_date: saleData.next_payment_date
            }
        });
    } catch (error) {
        console.error('Error sending reminder:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
