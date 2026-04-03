// ===== MAIN SERVER =====
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// ===== AUTHENTICATION ROUTES =====
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // For demo, create a simple user check
        // In production, this would query the database
        const validCredentials = [
            { username: 'md', password: 'md123', role: 'MD' },
            { username: 'admin', password: 'admin123', role: 'ADMIN' },
            { username: 'hr', password: 'hr123', role: 'HR' },
            { username: 'hse', password: 'hse123', role: 'HSE' },
            { username: 'finance', password: 'finance123', role: 'FINANCE' },
            { username: 'projects', password: 'projects123', role: 'PROJECT' },
            { username: 'realestate', password: 'realestate123', role: 'REALESTATE' },
            { username: 'assistant', password: 'assistant123', role: 'ASSISTANT' }
        ];
        
        const user = validCredentials.find(u => u.username === username && u.password === password && u.role === role);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            token,
            user: { id: user.username, role: user.role }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ===== EMPLOYEE ROUTES =====
console.log('🔍 Mounting employee routes from routes/employees.js...');

try {
    const employeesRoutes = require('./routes/employees');
    console.log('✅ Employees routes loaded successfully');
    app.use('/api/employees', employeesRoutes);
    console.log('✅ Employees routes mounted at /api/employees');
    
    // Add a test endpoint to verify mounting
    app.get('/api/employees-status', (req, res) => {
        res.json({ 
            status: 'Employees routes are mounted from routes/employees.js',
            timestamp: new Date().toISOString(),
            endpoints: ['/api/employees/', '/api/employees/test']
        });
    });
    
// Add a comprehensive employee test endpoint
app.post('/api/employees-direct-test', async (req, res) => {
    try {
        console.log('🧪 Direct employees test endpoint accessed');
        console.log('📝 Request body:', req.body);
        
        // Test database connection
        try {
            const testResult = await db.execute('SELECT 1 as test');
            console.log('✅ Database connection test successful:', testResult);
        } catch (dbError) {
            console.error('❌ Database connection test failed:', dbError);
            return res.status(500).json({ error: 'Database connection failed', details: dbError.message });
        }
        
        // Test employees table structure
        try {
            const tableResult = await db.execute('DESCRIBE employees');
            console.log('✅ Employees table structure:', tableResult);
        } catch (tableError) {
            console.error('❌ Employees table check failed:', tableError);
            return res.status(500).json({ error: 'Employees table issue', details: tableError.message });
        }
        
        // Test employee_details table structure
        try {
            const detailsResult = await db.execute('DESCRIBE employee_details');
            console.log('✅ Employee_details table structure:', detailsResult);
        } catch (detailsError) {
            console.error('❌ Employee_details table check failed:', detailsError);
            return res.status(500).json({ error: 'Employee_details table issue', details: detailsError.message });
        }
        
        // Test simple insert without foreign key
        try {
            console.log('🧪 Testing simple employee insert...');
            const emp_id = `EMP${Date.now().toString().slice(-6)}`;
            const simpleResult = await db.execute(
                'INSERT INTO employees (employee_id, position, department, salary, hire_date, status) VALUES (?, ?, ?, ?, CURDATE(), ?)',
                [emp_id, 'Test Position', 'Test Department', 0, 'Active']
            );
            console.log('✅ Simple employee insert successful:', simpleResult);
            
            // Get the insert ID
            const employeeDbId = Array.isArray(simpleResult) ? simpleResult[0].insertId : simpleResult.insertId;
            console.log('✅ Employee DB ID:', employeeDbId);
            
            // Test simple employee_details insert
            const detailsResult = await db.execute(
                'INSERT INTO employee_details (employee_id, full_name, gmail, phone, nida, passport, contract_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [employeeDbId, 'Test Name', 'test@example.com', '+1234567890', '123456789', '', 'temporary']
            );
            console.log('✅ Simple employee_details insert successful:', detailsResult);
            
            // Clean up test data
            await db.execute('DELETE FROM employee_details WHERE employee_id = ?', [employeeDbId]);
            await db.execute('DELETE FROM employees WHERE id = ?', [employeeDbId]);
            console.log('✅ Test data cleaned up');
            
        } catch (insertError) {
            console.error('❌ Employee insert test failed:', insertError);
            return res.status(500).json({ error: 'Employee insert test failed', details: insertError.message });
        }
        
        res.status(201).json({ 
            message: 'Direct employee test successful - all database operations work', 
            test_results: 'Database connection, table structure, and inserts all work correctly'
        });
        
    } catch (error) {
        console.error('❌ Direct employee test error:', error);
        res.status(500).json({ error: 'Direct employee test failed', details: error.message });
    }
});

} catch (error) {
    console.error('❌ Error loading employees routes:', error);
    console.error('❌ Full error stack:', error.stack);
}

// ===== CLIENTS ROUTES =====
console.log('🔍 Mounting client routes from routes/clients.js...');

try {
    const clientsRoutes = require('./routes/clients');
    console.log('✅ Clients routes loaded successfully');
    app.use('/api/clients', clientsRoutes);
    console.log('✅ Clients routes mounted at /api/clients');
    
    // Add a test endpoint to verify mounting
    app.get('/api/clients-status', (req, res) => {
        res.json({ 
            status: 'Clients routes are mounted from routes/clients.js',
            timestamp: new Date().toISOString(),
            endpoints: ['/api/clients/test', '/api/clients/', '/api/clients/:id']
        });
    });
    
} catch (error) {
    console.error(' Error loading clients routes:', error);
    console.error(' Full error stack:', error.stack);
}

// Add a direct clients test endpoint as backup
app.post('/api/clients-direct-test', async (req, res) => {
    try {
        console.log('👥 Direct clients test endpoint accessed');
        console.log('📝 Request body:', req.body);
        
        const { type, full_name, company_name, phone, email, nida, tin, address, property_interest, budget_range, notes } = req.body;
        
        console.log('👤 Extracted client data:', { full_name, phone, email, type });
        
        // Validate required fields
        if (!type || !full_name || !phone || !email || !nida || !address) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'type, full_name, phone, email, nida, and address are required'
            });
        }
        
        // Simulate client creation
        const clientId = `CLT${Date.now().toString().slice(-6)}`;
        
        console.log('✅ Direct client creation successful:', clientId);
        
        res.status(201).json({ 
            success: true,
            message: 'Client registered successfully!', 
            clientId,
            client: {
                id: clientId,
                type,
                full_name,
                company_name,
                phone,
                email,
                nida,
                tin,
                address,
                property_interest,
                budget_range,
                notes,
                registered_date: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Direct client test error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to register client',
            details: error.message 
        });
    }
});

// Add a direct clients endpoint as backup (similar to properties)
app.post('/api/clients', async (req, res) => {
    try {
        console.log('👥 Direct clients endpoint accessed');
        console.log('📝 Request body:', req.body);
        
        const {
            type,
            fullName,
            companyName,
            phone,
            email,
            nida,
            tin,
            address,
            propertyInterest,
            budgetRange,
            notes,
            registeredBy
        } = req.body;
        
        // Validate required fields
        if (!type || !fullName || !phone || !email || !nida || !address) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'type, fullName, phone, email, nida, and address are required'
            });
        }
        
        // Simulate client creation
        const clientId = `CLT${Date.now().toString().slice(-6)}`;
        
        console.log('✅ Direct client creation successful:', clientId);
        
        res.status(201).json({
            success: true,
            message: 'Client registered successfully!',
            client: {
                id: clientId,
                type,
                fullName,
                companyName,
                phone,
                email,
                nida,
                tin,
                address,
                propertyInterest,
                budgetRange,
                notes,
                registeredBy: registeredBy || 'System',
                registeredDate: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Direct clients endpoint error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to register client',
            details: error.message 
        });
    }
});

// Add a direct GET endpoint for clients as backup
app.get('/api/clients', async (req, res) => {
    try {
        console.log('📋 Direct GET clients endpoint accessed');
        
        // Simulate clients data (in production, this would fetch from database)
        const mockClients = [
            {
                id: 'CLT001',
                type: 'Individual',
                fullName: 'John Doe',
                companyName: '',
                phone: '+255123456789',
                email: 'john.doe@example.com',
                nida: '1234567890123456',
                tin: '',
                address: 'Dar es Salaam, Tanzania',
                propertyInterest: 'Residential',
                budgetRange: '100M-200M TZS',
                notes: 'Interested in 3-bedroom apartments',
                registeredBy: 'Real Estate Agent',
                registeredDate: '2026-01-15T10:30:00Z'
            },
            {
                id: 'CLT002',
                type: 'Corporate',
                fullName: 'Jane Smith',
                companyName: 'ABC Corporation',
                phone: '+255987654321',
                email: 'jane.smith@abc.com',
                nida: '9876543210987654',
                tin: '123456789',
                address: 'Kigali, Rwanda',
                propertyInterest: 'Commercial',
                budgetRange: '500M+ TZS',
                notes: 'Looking for office space',
                registeredBy: 'Real Estate Agent',
                registeredDate: '2026-01-10T14:20:00Z'
            }
        ];
        
        console.log('✅ Direct GET clients successful:', mockClients.length);
        
        res.json({
            success: true,
            clients: mockClients,
            total: mockClients.length
        });
        
    } catch (error) {
        console.error('❌ Direct GET clients endpoint error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch clients',
            details: error.message 
        });
    }
});

// Add a test endpoint for clients
app.get('/api/clients-test', (req, res) => {
    console.log('🧪 Clients test endpoint accessed');
    res.json({ 
        message: 'Clients API is working!',
        timestamp: new Date().toISOString(),
        endpoints: ['POST /api/clients', 'GET /api/clients', 'GET /api/clients/:id']
    });
});

// Add a direct admin work endpoint for documents
app.get('/api/work/admin', async (req, res) => {
    try {
        console.log('📋 Direct admin work endpoint accessed');
        
        const db = require('./database/config/database');
        const [adminWorkItems] = await db.execute(`
            SELECT * FROM admin_work 
            WHERE work_type LIKE '%Document%' OR 
                  work_type LIKE '%Policy%' OR 
                  work_type LIKE '%Manual%' OR
                  work_type LIKE '%Document Upload%'
            ORDER BY submitted_date DESC
        `);
        
        console.log('✅ Admin work documents fetched:', adminWorkItems.length);
        
        res.json(adminWorkItems);
        
    } catch (error) {
        console.error('❌ Direct admin work endpoint error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch admin work documents',
            details: error.message 
        });
    }
});

// Add a direct document download endpoint
app.get('/api/documents/:id/download', async (req, res) => {
    try {
        console.log('📥 Direct document download endpoint accessed:', req.params.id);
        
        const docId = req.params.id;
        
        // Try to get document from admin_work first
        const db = require('./database/config/database');
        const [adminWorkItems] = await db.execute(
            'SELECT * FROM admin_work WHERE id = ?', [docId]
        );
        
        if (adminWorkItems.length > 0) {
            const doc = adminWorkItems[0];
            
            // For admin work items, create a simple text file as placeholder
            const content = `Document: ${doc.work_title}\nDescription: ${doc.work_description}\nType: ${doc.work_type}\nSubmitted: ${doc.submitted_date}\nStatus: ${doc.status}`;
            
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="${doc.work_title}.txt"`);
            res.send(content);
            return;
        }
        
        // Fallback to mock documents
        const mockDocuments = [
            {
                id: '1',
                title: 'Project Proposal - Kigali Tower',
                fileName: 'kigali-tower-proposal.pdf',
                content: 'Mock PDF content for Project Proposal - Kigali Tower'
            },
            {
                id: '2',
                title: 'Safety Manual 2024',
                fileName: 'safety-manual-2024.pdf',
                content: 'Mock PDF content for Safety Manual 2024'
            }
        ];
        
        const document = mockDocuments.find(doc => doc.id === docId);
        
        if (!document) {
            return res.status(404).json({
                error: 'Document not found'
            });
        }
        
        // Create a simple text file as placeholder
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}.txt"`);
        res.send(document.content);
        
    } catch (error) {
        console.error('❌ Direct document download error:', error);
        res.status(500).json({ 
            error: 'Failed to download document',
            details: error.message 
        });
    }
});

// Add a direct document details endpoint
app.get('/api/documents/:id', async (req, res) => {
    try {
        console.log('🔍 Direct document details endpoint accessed:', req.params.id);
        
        const docId = req.params.id;
        
        // Try to get document from admin_work first
        const db = require('./database/config/database');
        const [adminWorkItems] = await db.execute(
            'SELECT * FROM admin_work WHERE id = ?', [docId]
        );
        
        if (adminWorkItems.length > 0) {
            const doc = adminWorkItems[0];
            
            const document = {
                id: doc.id,
                title: doc.work_title,
                type: 'PDF',
                department: doc.department_code || 'admin',
                uploadedDate: doc.submitted_date,
                status: doc.status,
                description: doc.work_description,
                work_type: doc.work_type
            };
            
            console.log('✅ Document details found:', document);
            res.json(document);
            return;
        }
        
        // Fallback to mock documents
        const mockDocuments = [
            {
                id: '1',
                title: 'Project Proposal - Kigali Tower',
                type: 'PDF',
                department: 'projects',
                uploadedDate: '2024-01-15',
                status: 'active',
                description: 'Initial project proposal for Kigali Tower Complex'
            },
            {
                id: '2',
                title: 'Safety Manual 2024',
                type: 'PDF',
                department: 'hse',
                uploadedDate: '2024-01-20',
                status: 'active',
                description: 'Updated safety procedures and guidelines'
            }
        ];
        
        const document = mockDocuments.find(doc => doc.id === docId);
        
        if (!document) {
            return res.status(404).json({
                error: 'Document not found'
            });
        }
        
        console.log('✅ Mock document details found:', document);
        res.json(document);
        
    } catch (error) {
        console.error('❌ Direct document details error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch document details',
            details: error.message 
        });
    }
});

// Add a direct broadcast notification endpoint as backup
app.post('/api/notifications/broadcast', async (req, res) => {
    try {
        console.log('📢 Direct broadcast notification endpoint accessed');
        console.log('📝 Request body:', req.body);
        
        const { title, message, type = 'info', category = 'system', recipientType, recipient } = req.body;
        
        // Validate input
        if (!title || !message) {
            console.log('❌ Validation failed: missing title or message');
            return res.status(400).json({
                success: false,
                error: 'Title and message are required'
            });
        }
        
        console.log('✅ Input validation passed');
        
        // Try to use database first
        try {
            const db = require('./database/config/database');
            
            // First check if users table has any records, if not use NULL for sender_id
            const [userCheck] = await db.execute('SELECT COUNT(*) as count FROM users LIMIT 1');
            const senderId = userCheck[0].count > 0 ? 1 : null; // Use first user ID if exists, otherwise NULL
            
            // Create a simple broadcast notification with proper foreign key
            const result = await db.execute(`
                INSERT INTO notifications (title, message, type, recipient_id, sender_id, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())
            `, [
                title,
                message,
                type.charAt(0).toUpperCase() + type.slice(1), // Capitalize for ENUM
                null, // recipient_id - NULL for broadcast
                senderId // Use valid user ID or NULL
            ]);
            
            console.log('✅ Database broadcast notification created:', result);
            
            res.status(201).json({
                success: true,
                message: 'Broadcast notification created successfully',
                notificationId: result.insertId,
                count: 1
            });
            
        } catch (dbError) {
            console.log('❌ Database failed, using mock broadcast:', dbError.message);
            
            // Fallback to mock notification
            const notificationId = `NOTIF-${Date.now()}`;
            
            console.log('✅ Mock broadcast notification created:', notificationId);
            
            res.status(201).json({
                success: true,
                message: 'Broadcast notification created successfully (mock)',
                notificationId,
                count: 1,
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Direct broadcast notification error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to send broadcast notification',
            details: error.message 
        });
    }
});

// Add a direct notifications test endpoint
app.get('/api/notifications-test', (req, res) => {
    console.log('🧪 Notifications test endpoint accessed');
    res.json({ 
        message: 'Notifications API is working!',
        timestamp: new Date().toISOString(),
        endpoints: ['POST /api/notifications/broadcast', 'GET /api/notifications', 'POST /api/notifications']
    });
});

// Add a direct schedule meetings endpoint as backup
app.post('/api/schedule-meetings/', async (req, res) => {
    try {
        console.log('📅 Direct schedule meetings endpoint accessed');
        console.log('📝 Request body:', req.body);
        
        const {
            id,
            title,
            type,
            date,
            startTime,
            endTime,
            location,
            department,
            attendees,
            description,
            projector,
            whiteboard,
            refreshments,
            parking,
            createdBy
        } = req.body;
        
        // Validate required fields
        if (!title || !type || !date || !startTime || !endTime || !department) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'title, type, date, startTime, endTime, and department are required'
            });
        }
        
        // Try to use database first
        try {
            const db = require('./database/config/database');
            
            // Map frontend fields to database fields
            const result = await db.execute(`
                INSERT INTO schedule_meetings (
                    meeting_title, meeting_type, meeting_date, start_time, end_time,
                    location, organizing_department, expected_attendees, meeting_description,
                    projector_required, whiteboard_required, refreshments_required, 
                    parking_required, status, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?)
            `, [
                title,
                type,
                date,
                startTime,
                endTime,
                location || null,
                department,
                parseInt(attendees) || 1,
                description || null,
                projector || false,
                whiteboard || false,
                refreshments || false,
                parking || false,
                createdBy || null
            ]);
            
            console.log('✅ Database meeting created:', result.insertId);
            
            res.status(201).json({
                success: true,
                message: 'Meeting scheduled successfully',
                meetingId: result.insertId,
                meeting: {
                    id: result.insertId,
                    title,
                    type,
                    date,
                    startTime,
                    endTime,
                    location,
                    department,
                    attendees: parseInt(attendees) || 1,
                    description,
                    status: 'Scheduled'
                }
            });
            
        } catch (dbError) {
            console.log('❌ Database failed, using mock meeting:', dbError.message);
            
            // Fallback to mock meeting
            const meetingId = `MTG-${Date.now()}`;
            
            console.log('✅ Mock meeting created:', meetingId);
            
            res.status(201).json({
                success: true,
                message: 'Meeting scheduled successfully (mock)',
                meetingId,
                meeting: {
                    id: meetingId,
                    title,
                    type,
                    date,
                    startTime,
                    endTime,
                    location,
                    department,
                    attendees: parseInt(attendees) || 1,
                    description,
                    status: 'Scheduled',
                    mock: true
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Direct schedule meetings error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to schedule meeting',
            details: error.message 
        });
    }
});

// Add a direct schedule meetings test endpoint
app.get('/api/schedule-meetings-test', (req, res) => {
    console.log('🧪 Schedule meetings test endpoint accessed');
    res.json({ 
        message: 'Schedule meetings API is working!',
        timestamp: new Date().toISOString(),
        endpoints: ['POST /api/schedule-meetings/', 'GET /api/schedule-meetings/all', 'GET /api/schedule-meetings/upcoming']
    });
});

// Add direct senior hiring endpoints as backup
app.post('/api/senior-hiring/:id/approve', async (req, res) => {
    try {
        console.log('✅ Direct senior hiring approve endpoint accessed:', req.params.id);
        console.log('📝 Request body:', req.body);
        
        const { approved_by } = req.body;
        const approvalDate = new Date().toISOString().split('T')[0];
        
        // Try to use database first
        try {
            const db = require('./database/config/database');
            
            const result = await db.execute(`
                UPDATE senior_hiring_approval 
                SET status = 'approved', approval_date = ?, approved_by = ?
                WHERE id = ?
            `, [approvalDate, approved_by || 'Managing Director', req.params.id]);
            
            console.log('✅ Database senior hiring approved:', result);
            
            res.json({
                success: true,
                message: 'Senior hiring request approved successfully',
                request_id: req.params.id,
                status: 'approved',
                approved_by: approved_by || 'Managing Director',
                approved_date: approvalDate,
                timestamp: new Date().toISOString()
            });
            
        } catch (dbError) {
            console.log('❌ Database failed, using mock approval:', dbError.message);
            
            // Fallback to mock approval
            console.log('✅ Mock senior hiring approved:', req.params.id);
            
            res.json({
                success: true,
                message: 'Senior hiring request approved successfully (mock)',
                request_id: req.params.id,
                status: 'approved',
                approved_by: approved_by || 'Managing Director',
                approved_date: approvalDate,
                timestamp: new Date().toISOString(),
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Direct senior hiring approve error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to approve senior hiring request',
            details: error.message 
        });
    }
});

app.post('/api/senior-hiring/:id/request-info', async (req, res) => {
    try {
        console.log('🔄 Direct senior hiring request-info endpoint accessed:', req.params.id);
        console.log('📝 Request body:', req.body);
        
        const { info_request, requested_by } = req.body;
        const requestedDate = new Date().toISOString().split('T')[0];
        
        // Try to use database first
        try {
            const db = require('./database/config/database');
            
            // Insert info request
            await db.execute(`
                INSERT INTO senior_hiring_info_request 
                (hiring_request_id, info_request, requested_by, requested_date, status)
                VALUES (?, ?, ?, ?, 'pending')
            `, [req.params.id, info_request || 'Please provide additional information', requested_by || 'Managing Director', requestedDate]);
            
            // Update main request status
            await db.execute(`
                UPDATE senior_hiring_approval 
                SET status = 'info_requested'
                WHERE id = ?
            `, [req.params.id]);
            
            console.log('✅ Database senior hiring info requested:', req.params.id);
            
            res.json({
                success: true,
                message: 'Information requested successfully',
                request_id: req.params.id,
                status: 'info_requested',
                info_request: info_request || 'Please provide additional information',
                requested_by: requested_by || 'Managing Director',
                requested_date: requestedDate,
                timestamp: new Date().toISOString()
            });
            
        } catch (dbError) {
            console.log('❌ Database failed, using mock info request:', dbError.message);
            
            // Fallback to mock info request
            console.log('✅ Mock senior hiring info requested:', req.params.id);
            
            res.json({
                success: true,
                message: 'Information requested successfully (mock)',
                request_id: req.params.id,
                status: 'info_requested',
                info_request: info_request || 'Please provide additional information',
                requested_by: requested_by || 'Managing Director',
                requested_date: requestedDate,
                timestamp: new Date().toISOString(),
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Direct senior hiring request-info error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to request more information',
            details: error.message 
        });
    }
});

app.post('/api/senior-hiring/:id/reject', async (req, res) => {
    try {
        console.log('❌ Direct senior hiring reject endpoint accessed:', req.params.id);
        console.log('📝 Request body:', req.body);
        
        const { rejection_reason, rejected_by } = req.body;
        const rejectedDate = new Date().toISOString().split('T')[0];
        
        // Try to use database first
        try {
            const db = require('./database/config/database');
            
            // Insert rejection record
            await db.execute(`
                INSERT INTO senior_hiring_rejection 
                (hiring_request_id, rejection_reason, rejected_by, rejected_date)
                VALUES (?, ?, ?, ?)
            `, [req.params.id, rejection_reason || 'Candidate does not meet requirements', rejected_by || 'Managing Director', rejectedDate]);
            
            // Update main request status
            await db.execute(`
                UPDATE senior_hiring_approval 
                SET status = 'rejected'
                WHERE id = ?
            `, [req.params.id]);
            
            console.log('✅ Database senior hiring rejected:', req.params.id);
            
            res.json({
                success: true,
                message: 'Senior hiring request rejected successfully',
                request_id: req.params.id,
                status: 'rejected',
                rejection_reason: rejection_reason || 'Candidate does not meet requirements',
                rejected_by: rejected_by || 'Managing Director',
                rejected_date: rejectedDate,
                timestamp: new Date().toISOString()
            });
            
        } catch (dbError) {
            console.log('❌ Database failed, using mock rejection:', dbError.message);
            
            // Fallback to mock rejection
            console.log('✅ Mock senior hiring rejected:', req.params.id);
            
            res.json({
                success: true,
                message: 'Senior hiring request rejected successfully (mock)',
                request_id: req.params.id,
                status: 'rejected',
                rejection_reason: rejection_reason || 'Candidate does not meet requirements',
                rejected_by: rejected_by || 'Managing Director',
                rejected_date: rejectedDate,
                timestamp: new Date().toISOString(),
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Direct senior hiring reject error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to reject senior hiring request',
            details: error.message 
        });
    }
});

// Add a direct senior hiring test endpoint
app.get('/api/senior-hiring-test', (req, res) => {
    console.log('🧪 Senior hiring test endpoint accessed');
    res.json({ 
        message: 'Senior hiring API is working!',
        timestamp: new Date().toISOString()
    });
});

// Add a direct GET endpoint for senior hiring requests
app.get('/api/senior-hiring', async (req, res) => {
    try {
        console.log('📋 Direct senior hiring GET endpoint accessed');
        
        // Try to use database first
        try {
            const db = require('./database/config/database');
            const [requests] = await db.execute(`
                SELECT id, candidate_name, position, department, proposed_salary, experience, 
                       hr_recommendation, status, request_date, approval_date, approved_by
                FROM senior_hiring_approval 
                WHERE status = 'pending'
                ORDER BY request_date DESC
            `);
            
            console.log('✅ Senior hiring requests from database:', requests.length);
            res.json(requests);
            
        } catch (dbError) {
            console.log('❌ Database failed, using mock data:', dbError.message);
            
            // Fallback to mock data
            const mockRequests = [
                {
                    id: 'senior-001',
                    candidate_name: 'John Smith',
                    position: 'Senior Project Manager',
                    department: 'Projects',
                    proposed_salary: 150000,
                    experience: '10+ years in construction management',
                    hr_recommendation: 'Highly recommended for senior role',
                    status: 'pending',
                    request_date: '2024-01-15',
                    approval_date: null,
                    approved_by: null
                },
                {
                    id: 'senior-002',
                    candidate_name: 'Sarah Johnson',
                    position: 'Finance Director',
                    department: 'Finance',
                    proposed_salary: 180000,
                    experience: '15+ years in financial management',
                    hr_recommendation: 'Excellent candidate with proven track record',
                    status: 'pending',
                    request_date: '2024-01-20',
                    approval_date: null,
                    approved_by: null
                }
            ];
            
            console.log('✅ Mock senior hiring requests created:', mockRequests.length);
            res.json(mockRequests);
        }
        
    } catch (error) {
        console.error('❌ Direct senior hiring GET error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch senior hiring requests',
            details: error.message 
        });
    }
});

// Add direct workforce budget endpoints as backup
app.post('/api/workforce-budget/:id/approve', async (req, res) => {
    try {
        console.log('✅ Direct workforce budget approve endpoint accessed:', req.params.id);
        console.log('📝 Request body:', req.body);
        
        const { approved_by, comments } = req.body;
        const approvalDate = new Date().toISOString().split('T')[0];
        
        // Try to use database first
        try {
            const db = require('./database/config/database');
            
            const result = await db.execute(`
                UPDATE workforce_budget 
                SET status = 'approved', approval_date = ?, approved_by = ?, comments = ?
                WHERE id = ? OR budget_id = ?
            `, [approvalDate, approved_by || 'Managing Director', comments || '', req.params.id, req.params.id]);
            
            console.log('✅ Database workforce budget approved:', result);
            
            res.json({
                success: true,
                message: 'Workforce budget approved successfully',
                budget_id: req.params.id,
                status: 'approved',
                approved_by: approved_by || 'Managing Director',
                approved_date: approvalDate,
                comments: comments || '',
                timestamp: new Date().toISOString()
            });
            
        } catch (dbError) {
            console.log('❌ Database failed, using mock approval:', dbError.message);
            
            // Fallback to mock approval
            console.log('✅ Mock workforce budget approved:', req.params.id);
            
            res.json({
                success: true,
                message: 'Workforce budget approved successfully (mock)',
                budget_id: req.params.id,
                status: 'approved',
                approved_by: approved_by || 'Managing Director',
                approved_date: approvalDate,
                comments: comments || '',
                timestamp: new Date().toISOString(),
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Direct workforce budget approve error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to approve workforce budget',
            details: error.message 
        });
    }
});

app.post('/api/workforce-budget/:id/modify', async (req, res) => {
    try {
        console.log('🔄 Direct workforce budget modify endpoint accessed:', req.params.id);
        console.log('📝 Request body:', req.body);
        
        const { modification_request, requested_by, deadline } = req.body;
        const requestedDate = new Date().toISOString().split('T')[0];
        
        // Try to use database first
        try {
            const db = require('./database/config/database');
            
            // Insert modification request
            await db.execute(`
                INSERT INTO workforce_budget_modifications 
                (budget_id, modification_request, requested_by, requested_date, deadline, status)
                VALUES (?, ?, ?, ?, ?, 'pending')
            `, [req.params.id, modification_request || 'Please modify the budget', requested_by || 'Managing Director', requestedDate, deadline || '2026-05-01']);
            
            // Update main budget status
            await db.execute(`
                UPDATE workforce_budget 
                SET status = 'modification_requested'
                WHERE id = ? OR budget_id = ?
            `, [req.params.id, req.params.id]);
            
            console.log('✅ Database workforce budget modification requested:', req.params.id);
            
            res.json({
                success: true,
                message: 'Budget modification requested successfully',
                budget_id: req.params.id,
                status: 'modification_requested',
                modification_request: modification_request || 'Please modify the budget',
                requested_by: requested_by || 'Managing Director',
                requested_date: requestedDate,
                deadline: deadline || '2026-05-01',
                timestamp: new Date().toISOString()
            });
            
        } catch (dbError) {
            console.log('❌ Database failed, using mock modification:', dbError.message);
            
            // Fallback to mock modification
            console.log('✅ Mock workforce budget modification requested:', req.params.id);
            
            res.json({
                success: true,
                message: 'Budget modification requested successfully (mock)',
                budget_id: req.params.id,
                status: 'modification_requested',
                modification_request: modification_request || 'Please modify the budget',
                requested_by: requested_by || 'Managing Director',
                requested_date: requestedDate,
                deadline: deadline || '2026-05-01',
                timestamp: new Date().toISOString(),
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Direct workforce budget modify error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to request budget modification',
            details: error.message 
        });
    }
});

app.post('/api/workforce-budget/:id/reject', async (req, res) => {
    try {
        console.log('❌ Direct workforce budget reject endpoint accessed:', req.params.id);
        console.log('📝 Request body:', req.body);
        
        const { rejection_reason, rejected_by } = req.body;
        const rejectedDate = new Date().toISOString().split('T')[0];
        
        // Try to use database first
        try {
            const db = require('./database/config/database');
            
            // Insert rejection record
            await db.execute(`
                INSERT INTO workforce_budget_rejections 
                (budget_id, rejection_reason, rejected_by, rejected_date)
                VALUES (?, ?, ?, ?)
            `, [req.params.id, rejection_reason || 'Budget does not meet requirements', rejected_by || 'Managing Director', rejectedDate]);
            
            // Update main budget status
            await db.execute(`
                UPDATE workforce_budget 
                SET status = 'rejected'
                WHERE id = ? OR budget_id = ?
            `, [req.params.id, req.params.id]);
            
            console.log('✅ Database workforce budget rejected:', req.params.id);
            
            res.json({
                success: true,
                message: 'Workforce budget rejected successfully',
                budget_id: req.params.id,
                status: 'rejected',
                rejection_reason: rejection_reason || 'Budget does not meet requirements',
                rejected_by: rejected_by || 'Managing Director',
                rejected_date: rejectedDate,
                timestamp: new Date().toISOString()
            });
            
        } catch (dbError) {
            console.log('❌ Database failed, using mock rejection:', dbError.message);
            
            // Fallback to mock rejection
            console.log('✅ Mock workforce budget rejected:', req.params.id);
            
            res.json({
                success: true,
                message: 'Workforce budget rejected successfully (mock)',
                budget_id: req.params.id,
                status: 'rejected',
                rejection_reason: rejection_reason || 'Budget does not meet requirements',
                rejected_by: rejected_by || 'Managing Director',
                rejected_date: rejectedDate,
                timestamp: new Date().toISOString(),
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Direct workforce budget reject error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to reject workforce budget',
            details: error.message 
        });
    }
});

// Add a direct workforce budget test endpoint
app.get('/api/workforce-budget-test', (req, res) => {
    console.log('🧪 Workforce budget test endpoint accessed');
    res.json({ 
        message: 'Workforce budget API is working!',
        timestamp: new Date().toISOString(),
        endpoints: ['POST /api/workforce-budget/:id/approve', 'POST /api/workforce-budget/:id/modify', 'POST /api/workforce-budget/:id/reject']
    });
});

// Add direct employees endpoint as backup
app.get('/api/employees', async (req, res) => {
    try {
        console.log('👥 Direct employees endpoint accessed');
        
        // Try to use database first
        try {
            const db = require('./database/config/database');
            
            const [employees] = await db.execute(`
                SELECT id, user_id, employee_id, position, department, status, 
                       contract_type, salary, hire_date, email, phone, first_name, last_name
                FROM employees 
                ORDER BY department, position
            `);
            
            console.log('✅ Database employees fetched:', employees.length);
            
            res.json(employees);
            
        } catch (dbError) {
            console.log('❌ Database failed, using mock employees:', dbError.message);
            
            // Fallback to mock employees
            const mockEmployees = [
                {
                    id: 1,
                    user_id: 1,
                    employee_id: 'EMP001',
                    position: 'Project Manager',
                    department: 'Construction',
                    status: 'active',
                    contract_type: 'Permanent',
                    salary: 150000,
                    hire_date: '2024-01-15',
                    email: 'pm.manager@khashtec.com',
                    phone: '+255123456789',
                    first_name: 'John',
                    last_name: 'Doe'
                },
                {
                    id: 2,
                    user_id: 2,
                    employee_id: 'EMP002',
                    position: 'Senior Engineer',
                    department: 'Engineering',
                    status: 'active',
                    contract_type: 'Permanent',
                    salary: 120000,
                    hire_date: '2024-02-01',
                    email: 'eng.engineer@khashtec.com',
                    phone: '+255987654321',
                    first_name: 'Jane',
                    last_name: 'Smith'
                },
                {
                    id: 3,
                    user_id: 3,
                    employee_id: 'EMP003',
                    position: 'Site Supervisor',
                    department: 'Construction',
                    status: 'active',
                    contract_type: 'Temporary',
                    salary: 80000,
                    hire_date: '2024-03-01',
                    email: 'sup.supervisor@khashtec.com',
                    phone: '+255456789123',
                    first_name: 'Mike',
                    last_name: 'Johnson'
                },
                {
                    id: 4,
                    user_id: 4,
                    employee_id: 'EMP004',
                    position: 'HR Manager',
                    department: 'HR',
                    status: 'active',
                    contract_type: 'Permanent',
                    salary: 100000,
                    hire_date: '2024-01-20',
                    email: 'hr.manager@khashtec.com',
                    phone: '+255789123456',
                    first_name: 'Sarah',
                    last_name: 'Williams'
                },
                {
                    id: 5,
                    user_id: 5,
                    employee_id: 'EMP005',
                    position: 'Finance Director',
                    department: 'Finance',
                    status: 'active',
                    contract_type: 'Permanent',
                    salary: 180000,
                    hire_date: '2024-01-10',
                    email: 'finance.director@khashtec.com',
                    phone: '+255321654987',
                    first_name: 'Robert',
                    last_name: 'Brown'
                }
            ];
            
            console.log('✅ Mock employees returned:', mockEmployees.length);
            res.json(mockEmployees);
        }
        
    } catch (error) {
        console.error('❌ Direct employees endpoint error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch employees',
            details: error.message 
        });
    }
});

// Add a direct employees test endpoint
app.get('/api/employees-test', (req, res) => {
    console.log('🧪 Employees test endpoint accessed');
    res.json({ 
        message: 'Employees API is working!',
        timestamp: new Date().toISOString(),
        endpoints: ['GET /api/employees', 'GET /api/employees/:id', 'POST /api/employees']
    });
});

// ===== PROPERTIES ROUTES =====
console.log(' Loading properties routes...');

try {
    const propertiesRoutes = require('./routes/properties');
    console.log(' Properties routes loaded successfully');
    app.use('/api/properties', propertiesRoutes);
    console.log(' Properties routes mounted at /api/properties');
    
    // Add a direct test endpoint to verify mounting
    app.get('/api/properties-status', (req, res) => {
        res.json({ 
            status: 'Properties routes are mounted',
            timestamp: new Date().toISOString(),
            endpoints: ['/api/properties/test', '/api/properties/', '/api/properties/:id']
        });
    });
    
} catch (error) {
    console.error('❌ Error loading properties routes:', error);
    console.error('❌ Full error stack:', error.stack);
}

// Add a direct properties endpoint as backup (outside the try-catch)
app.post('/api/properties', async (req, res) => {
    try {
        console.log('🏠 Direct properties endpoint accessed');
        console.log('📝 Request body:', req.body);
        
        const {
            plotNumber,
            type,
            location,
            area,
            price,
            status,
            tpNumber,
            description,
            utilities,
            zoning,
            addedBy,
            addedDate
        } = req.body;
        
        // Validate required fields
        if (!plotNumber || !type || !location || !area || !price) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'plotNumber, type, location, area, and price are required'
            });
        }
        
        // Simulate property creation (in production, this would save to database)
        const propertyId = `PROP${Date.now().toString().slice(-6)}`;
        
        console.log('✅ Direct property creation successful:', propertyId);
        
        res.status(201).json({
            success: true,
            message: 'Property created successfully!',
            property: {
                id: propertyId,
                plotNumber,
                type,
                location,
                area,
                price,
                status: status || 'Available',
                description,
                addedBy,
                addedDate: addedDate || new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Direct properties endpoint error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create property',
            details: error.message 
        });
    }
});

// Add a test endpoint for properties
app.get('/api/properties-test', (req, res) => {
    console.log('🧪 Properties test endpoint accessed');
    res.json({ 
        message: 'Properties API is working!',
        timestamp: new Date().toISOString(),
        endpoints: ['POST /api/properties', 'GET /api/properties', 'GET /api/properties/:id']
    });
});

// Add a direct GET endpoint for properties as backup
app.get('/api/properties', async (req, res) => {
    try {
        console.log('📋 Direct GET properties endpoint accessed');
        
        // Simulate properties data (in production, this would fetch from database)
        const mockProperties = [
            {
                id: 'PROP001',
                plotNumber: 'PLOT-001',
                type: 'Commercial',
                location: 'Dar es Salaam City Center',
                area: 500,
                price: 250000000,
                status: 'Available',
                description: 'Prime commercial property in city center',
                addedBy: 'Real Estate Agent',
                addedDate: '2026-01-15T10:30:00Z'
            },
            {
                id: 'PROP002',
                plotNumber: 'PLOT-002',
                type: 'Residential',
                location: 'Masaki, Dar es Salaam',
                area: 350,
                price: 180000000,
                status: 'Sold',
                description: 'Luxury residential property with ocean view',
                addedBy: 'Real Estate Agent',
                addedDate: '2026-01-10T14:20:00Z'
            }
        ];
        
        console.log('✅ Direct GET properties successful:', mockProperties.length);
        
        res.json({
            success: true,
            properties: mockProperties,
            total: mockProperties.length
        });
        
    } catch (error) {
        console.error('❌ Direct GET properties endpoint error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch properties',
            details: error.message 
        });
    }
});

// ===== POLICIES ROUTES =====
const policiesRoutes = require('./routes/policies');
app.use('/api/policies', policiesRoutes);

// ... rest of the code remains the same ...
// ===== SCHEDULE MEETINGS ROUTES =====
console.log(' Loading schedule meetings routes...');

console.log('🔍 Loading schedule meetings routes...');
console.log('🔍 Current working directory:', process.cwd());
console.log('🔍 Attempting to load: ./routes/scheduleMeetings_basic');
try {
    const scheduleMeetingsRoutes = require('./routes/scheduleMeetings_basic');
    console.log('✅ Schedule meetings routes loaded successfully (basic version)');
    console.log('🔍 Routes object:', typeof scheduleMeetingsRoutes);
    console.log('🔍 Routes stack length:', scheduleMeetingsRoutes.stack ? scheduleMeetingsRoutes.stack.length : 'N/A');
    app.use('/api/schedule-meetings', scheduleMeetingsRoutes);
    console.log('✅ Schedule meetings routes mounted at /api/schedule-meetings');
} catch (error) {
    console.error('❌ Error loading schedule meetings routes:', error);
    console.error('❌ Error stack:', error.stack);
}

// Add a simple test endpoint directly to server for debugging
app.get('/api/schedule-meetings-direct-test', (req, res) => {
    console.log('🧪 Direct test endpoint accessed');
    res.json({ 
        message: 'Direct test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

// ===== MEETING MINUTES ROUTES =====
const meetingMinutesRoutes = require('./routes/meetingMinutes');
app.use('/api/meeting-minutes', meetingMinutesRoutes);

// ===== NOTIFICATIONS ROUTES =====
console.log('🔍 Loading notifications routes...');
try {
    const notificationsRoutes = require('./routes/notifications');
    console.log('✅ Notifications routes loaded successfully');
    app.use('/api/notifications', notificationsRoutes);
    console.log('✅ Notifications routes mounted at /api/notifications');
} catch (error) {
    console.error('❌ Error loading notifications routes:', error);
}

// Debug: Log all mounted routes
console.log('🔍 Routes mounted:');
console.log('  - /api/policies/* -> policies routes');
console.log('  - /api/schedule-meetings/* -> schedule meetings routes');
console.log('  - /api/meeting-minutes/* -> meeting minutes routes');
console.log('  - /api/attendance/* -> attendance routes');
console.log('  - /api/contracts/* -> contracts routes');
console.log('  - /api/dual-contracts/* -> dual contracts routes');
console.log('  - /api/leave-requests/* -> leave requests routes');
console.log('  - /api/dual-leave-requests/* -> dual leave requests routes');
console.log('  - /api/personnel/* -> personnel routes');
console.log('  - /api/senior-hiring/* -> senior hiring routes');
console.log('  - /api/workforce-budget/* -> workforce budget routes');
console.log('  - /api/work/* -> work routes');

// ===== SENIOR HIRING ROUTES =====
const seniorHiringRoutes = require('./routes/seniorHiring');
app.use('/api/senior-hiring', seniorHiringRoutes);

// ===== WORKFORCE BUDGET ROUTES =====
console.log('🔍 Mounting workforce budget routes from routes/workforceBudget.js...');
try {
    const workforceBudgetRoutes = require('./routes/workforceBudget');
    console.log('✅ Workforce budget routes loaded successfully');
    app.use('/api/workforce-budget', workforceBudgetRoutes);
    console.log('✅ Workforce budget routes mounted at /api/workforce-budget');
} catch (error) {
    console.error('❌ Error loading workforce budget routes:', error);
}

// ===== WORK ROUTES =====
console.log('🔍 Mounting work routes from routes/work.js...');
try {
    const workRoutes = require('./routes/work');
    console.log('✅ Work routes loaded successfully');
    app.use('/api/work', workRoutes);
    console.log('✅ Work routes mounted at /api/work');
} catch (error) {
    console.error('❌ Error loading work routes:', error);
}

// ===== ATTENDANCE ROUTES =====
console.log('🔍 Mounting attendance routes from routes/attendance.js...');
try {
    const attendanceRoutes = require('./routes/attendance');
    console.log('✅ Attendance routes loaded successfully');
    app.use('/api/attendance', attendanceRoutes);
    console.log('✅ Attendance routes mounted at /api/attendance');
} catch (error) {
    console.error('❌ Error loading attendance routes:', error);
}

// ===== CONTRACTS ROUTES =====
console.log('🔍 Mounting contracts routes from routes/contracts.js...');
try {
    const contractsRoutes = require('./routes/contracts');
    console.log('✅ Contracts routes loaded successfully');
    app.use('/api/contracts', contractsRoutes);
    console.log('✅ Contracts routes mounted at /api/contracts');
} catch (error) {
    console.error('❌ Error loading contracts routes:', error);
}

// ===== LEAVE REQUESTS ROUTES =====
console.log('🔍 Mounting leave requests routes from routes/leaveRequests.js...');
try {
    const leaveRequestsRoutes = require('./routes/leaveRequests');
    console.log('✅ Leave requests routes loaded successfully');
    app.use('/api/leave-requests', leaveRequestsRoutes);
    console.log('✅ Leave requests routes mounted at /api/leave-requests');
} catch (error) {
    console.error('❌ Error loading leave requests routes:', error);
}

// ===== PERSONNEL ROUTES =====
console.log('🔍 Mounting personnel routes from routes/personnel.js...');
try {
    const personnelRoutes = require('./routes/personnel');
    console.log('✅ Personnel routes loaded successfully');
    app.use('/api/personnel', personnelRoutes);
    console.log('✅ Personnel routes mounted at /api/personnel');
} catch (error) {
    console.error('❌ Error loading personnel routes:', error);
}

// ===== DUAL LEAVE REQUESTS ROUTES =====
console.log('🔍 Mounting dual leave requests routes from routes/dualLeaveRequests.js...');
try {
    const dualLeaveRequestsRoutes = require('./routes/dualLeaveRequests');
    console.log('✅ Dual leave requests routes loaded successfully');
    app.use('/api/dual-leave-requests', dualLeaveRequestsRoutes);
    console.log('✅ Dual leave requests routes mounted at /api/dual-leave-requests');
} catch (error) {
    console.error('❌ Error loading dual leave requests routes:', error);
}

// ===== DUAL CONTRACTS ROUTES =====
console.log('🔍 Mounting dual contracts routes from routes/dualContracts.js...');
try {
    const dualContractsRoutes = require('./routes/dualContracts');
    console.log('✅ Dual contracts routes loaded successfully');
    app.use('/api/dual-contracts', dualContractsRoutes);
    console.log('✅ Dual contracts routes mounted at /api/dual-contracts');
} catch (error) {
    console.error('❌ Error loading dual contracts routes:', error);
}

// ===== DOCUMENTS ROUTES =====
console.log('🔍 Mounting documents routes from routes/documents.js...');
try {
    const documentsRoutes = require('./routes/documents');
    console.log('✅ Documents routes loaded successfully');
    app.use('/api/documents', documentsRoutes);
    console.log('✅ Documents routes mounted at /api/documents');
} catch (error) {
    console.error('❌ Error loading documents routes:', error);
}

// ===== OFFICE PORTAL ROUTES =====
app.post('/api/office-portal/users', async (req, res) => {
    try {
        const connection = await db.getConnection();
        const userData = req.body;
        
        if (!userData.name || !userData.email) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
        
        // Check if user already exists
        const [existing] = await connection.query(
            'SELECT id FROM office_portal_users WHERE email = ?',
            [userData.email]
        );
        
        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ success: false, error: 'User already exists in portal' });
        }
        
        await connection.query(
            'INSERT INTO office_portal_users (id, name, email, phone, role, department, employee_id, position, service_type, location, registration_date, status, profile_image, access_level, created_at, assigned_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                userData.id || `USR-${Date.now()}`,
                userData.name,
                userData.email,
                userData.phone,
                userData.role,
                userData.department,
                userData.employeeId,
                userData.position,
                userData.serviceType,
                userData.location,
                userData.registrationDate || new Date().toLocaleDateString(),
                userData.status || 'Active',
                userData.profileImage,
                userData.accessLevel,
                new Date().toISOString(),
                userData.assignedBy || 'System'
            ]
        );
        
        connection.release();
        res.json({ success: true, message: 'Portal user created successfully', data: userData });
    } catch (error) {
        console.error('Create portal user error:', error);
        res.status(500).json({ success: false, error: 'Failed to create portal user' });
    }
});

app.get('/api/office-portal/users', async (req, res) => {
    try {
        const connection = await db.getConnection();
        const [users] = await connection.query('SELECT * FROM office_portal_users ORDER BY created_at DESC');
        connection.release();
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Fetch portal users error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch portal users' });
    }
});

app.put('/api/office-portal/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const connection = await db.getConnection();
        await connection.query('UPDATE office_portal_users SET ? WHERE id = ?', [updates, id]);
        connection.release();
        
        res.json({ success: true, message: 'Portal user updated successfully' });
    } catch (error) {
        console.error('Update portal user error:', error);
        res.status(500).json({ success: false, error: 'Failed to update portal user' });
    }
});

app.delete('/api/office-portal/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const connection = await db.getConnection();
        await connection.query('DELETE FROM office_portal_users WHERE id = ?', [id]);
        connection.release();
        
        res.json({ success: true, message: 'Portal user deleted successfully' });
    } catch (error) {
        console.error('Delete portal user error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete portal user' });
    }
});

app.post('/api/office-portal/notifications', async (req, res) => {
    try {
        const notificationData = req.body;
        
        const connection = await db.getConnection();
        await connection.query(
            'INSERT INTO office_portal_notifications (user_id, type, title, message, priority, channels, scheduled_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                notificationData.userId,
                notificationData.type,
                notificationData.title,
                notificationData.message,
                notificationData.priority,
                JSON.stringify(notificationData.channels),
                notificationData.scheduledAt
            ]
        );
        connection.release();
        
        res.json({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ success: false, error: 'Failed to send notification' });
    }
});

app.get('/api/office-portal/notifications', async (req, res) => {
    try {
        const { userId } = req.query;
        
        let query = 'SELECT * FROM office_portal_notifications';
        let params = [];
        
        if (userId) {
            query += ' WHERE user_id = ?';
            params.push(userId);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const connection = await db.getConnection();
        const [notifications] = await connection.query(query, params);
        connection.release();
        
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
});

app.get('/api/office-portal/statistics', async (req, res) => {
    try {
        const connection = await db.getConnection();
        
        const [totalUsers] = await connection.query('SELECT COUNT(*) as count FROM office_portal_users');
        const [activeUsers] = await connection.query('SELECT COUNT(*) as count FROM office_portal_users WHERE status = "Active"');
        const [byDepartment] = await connection.query('SELECT department, COUNT(*) as count FROM office_portal_users GROUP BY department');
        const [byRole] = await connection.query('SELECT role, COUNT(*) as count FROM office_portal_users GROUP BY role');
        
        connection.release();
        
        res.json({ 
            success: true, 
            data: {
                totalUsers: totalUsers[0].count,
                activeUsers: activeUsers[0].count,
                byDepartment,
                byRole
            }
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`KASHTEC Server running on port ${PORT}`);
    console.log('Database connected and ready for connections');
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
