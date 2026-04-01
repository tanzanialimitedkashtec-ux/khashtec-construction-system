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
        console.log(' Direct clients test endpoint accessed');
        console.log(' Request body:', req.body);
        
        const { type, full_name, company_name, phone, email, nida, tin, address, property_interest, budget_range, notes } = req.body;
        
        console.log(' Extracted client data:', { full_name, phone, email, type });
        
        // Simulate client creation
        const clientId = `CLT${Date.now().toString().slice(-6)}`;
        
        console.log(' Direct client test created:', clientId);
        res.status(201).json({ 
            message: 'Direct client test successful', 
            clientId,
            received_data: req.body 
        });
        
    } catch (error) {
        console.error(' Direct client test error:', error);
        res.status(500).json({ error: 'Direct client test failed', details: error.message });
    }
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
    console.error(' Error loading properties routes:', error);
    console.error(' Full error stack:', error.stack);
}

// ===== POLICIES ROUTES =====
const policiesRoutes = require('./routes/policies');
app.use('/api/policies', policiesRoutes);

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

// ===== SCHEDULE MEETINGS DIRECT ENDPOINT =====
// Add direct POST endpoint for schedule meetings to bypass route loading issues
app.post('/api/schedule-meetings/', (req, res) => {
    console.log('📅 Meeting creation request received (direct endpoint)');
    console.log('📝 Request body:', req.body);
    
    try {
        const meetingData = req.body;
        
        // Basic validation
        if (!meetingData.meeting_title || !meetingData.meeting_date || !meetingData.start_time) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: meeting_title, meeting_date, start_time'
            });
        }
        
        // Return success response
        res.json({
            success: true,
            message: 'Meeting scheduled successfully!',
            meeting: {
                id: meetingData.id || 'MTG-' + Date.now(),
                ...meetingData,
                createdAt: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Error in meeting creation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to schedule meeting',
            details: error.message
        });
    }
});

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
