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
console.log('🔍 Setting up employee routes...');

app.post('/api/employees', async (req, res) => {
    try {
        console.log('👨‍💼 Employee registration request received');
        console.log('📝 Request body:', req.body);
        
        const connection = await db.getConnection();
        const { full_name, phone, email, position, department, job_category, contract, salary, hire_date, status } = req.body;
        
        console.log('🔍 Extracted employee data:', { full_name, phone, email, position, department });
        
        const emp_id = `EMP${Date.now().toString().slice(-6)}`;
        
        await connection.query(
            'INSERT INTO employees (emp_id, full_name, phone, email, position, department, job_category, contract, salary, hire_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [emp_id, full_name, phone, email, position, department, job_category, contract, salary, hire_date, status, req.user?.id || 'system']
        );
        
        // Automatically assign to office portal
        try {
            // Map position to portal role
            const roleMapping = {
                'Managing Director': 'Administrator',
                'Director': 'Administrator',
                'Manager': 'Manager',
                'Supervisor': 'Supervisor',
                'Engineer': 'Professional',
                'Accountant': 'Professional',
                'HR Manager': 'HR Staff',
                'Safety Officer': 'Safety Staff',
                'Project Manager': 'Project Staff',
                'Sales Agent': 'Sales Staff',
                'Administrative Assistant': 'Admin Staff'
            };
            
            const portalRole = roleMapping[position] || 'Staff';
            const accessLevel = getAccessLevel(position);
            
            // Check if user already exists in portal
            const [existing] = await connection.query(
                'SELECT id FROM office_portal_users WHERE email = ?',
                [email]
            );
            
            if (existing.length === 0) {
                await connection.query(
                    'INSERT INTO office_portal_users (id, name, email, phone, role, department, employee_id, position, service_type, location, registration_date, status, profile_image, access_level, created_at, assigned_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        `USR-${Date.now()}`,
                        full_name,
                        email,
                        phone,
                        portalRole,
                        department,
                        emp_id,
                        position,
                        'Internal Services',
                        'Main Office',
                        new Date().toLocaleDateString(),
                        'Active',
                        `https://picsum.photos/seed/${email}/200/200.jpg`,
                        accessLevel,
                        new Date().toISOString(),
                        'System'
                    ]
                );
                
                console.log('Employee automatically assigned to office portal:', full_name);
            }
        } catch (portalError) {
            console.error('Portal assignment error:', portalError);
            // Don't fail the employee creation if portal assignment fails
        }
        
        connection.release();
        console.log('✅ Employee created successfully:', emp_id);
        res.status(201).json({ message: 'Employee created successfully', emp_id });
    } catch (error) {
        console.error('❌ Employee creation error:', error);
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

function getAccessLevel(position) {
    const accessLevels = {
        'Managing Director': 'Full Access',
        'Director': 'Full Access',
        'Manager': 'High Access',
        'Supervisor': 'Medium Access',
        'Engineer': 'Medium Access',
        'Accountant': 'Medium Access',
        'HR Manager': 'High Access',
        'Safety Officer': 'Medium Access',
        'Project Manager': 'High Access',
        'Sales Agent': 'Low Access',
        'Administrative Assistant': 'Medium Access'
    };
    
    return accessLevels[position] || 'Basic Access';
}

app.get('/api/employees', async (req, res) => {
    try {
        console.log('📋 Fetching all employees...');
        const connection = await db.getConnection();
        const [employees] = await connection.query('SELECT * FROM employees ORDER BY created_at DESC');
        connection.release();
        console.log('✅ Employees retrieved successfully:', employees.length);
        res.json(employees);
    } catch (error) {
        console.error('❌ Fetch employees error:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Add a test endpoint for employees
app.get('/api/employees-test', (req, res) => {
    console.log('🧪 Employees test endpoint accessed');
    res.json({ 
        message: 'Employees API is working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

console.log('✅ Employee routes setup complete');

// ===== CLIENT ROUTES =====
app.post('/api/clients', async (req, res) => {
    try {
        const connection = await db.getConnection();
        const { type, full_name, company_name, phone, email, nida, tin, address, property_interest, budget_range, notes } = req.body;
        
        const clientId = `CLT${Date.now().toString().slice(-6)}`;
        
        await connection.query(
            'INSERT INTO clients (type, full_name, company_name, phone, email, nida, tin, address, property_interest, budget_range, notes, registered_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [type, full_name, company_name, phone, email, nida, tin, address, property_interest, budget_range, notes, req.user?.id || 'system']
        );
        
        connection.release();
        res.json({ success: true, message: 'Client registered successfully', clientId });
        
    } catch (error) {
        console.error('Client creation error:', error);
        res.status(500).json({ error: 'Failed to create client' });
    }
});

// ===== WORK ASSIGNMENT ROUTES =====
const workRoutes = require('./routes/work');
app.use('/api/hr/work', workRoutes);
app.use('/api/hse/work', workRoutes);
app.use('/api/finance/work', workRoutes);
app.use('/api/project/work', workRoutes);
app.use('/api/realestate/work', workRoutes);
app.use('/api/admin/work', workRoutes);

// ===== CLIENTS ROUTES =====
console.log('🔍 Loading clients routes...');
try {
    const clientsRoutes = require('./routes/clients');
    console.log('✅ Clients routes loaded successfully');
    app.use('/api/clients', clientsRoutes);
    console.log('✅ Clients routes mounted at /api/clients');
    
    // Add a direct test endpoint to verify mounting
    app.get('/api/clients-status', (req, res) => {
        res.json({ 
            status: 'Clients routes are mounted',
            timestamp: new Date().toISOString(),
            endpoints: ['/api/clients/test', '/api/clients/', '/api/clients/:id']
        });
    });
    
} catch (error) {
    console.error('❌ Error loading clients routes:', error);
    console.error('❌ Full error stack:', error.stack);
}

// ===== PROPERTIES ROUTES =====
console.log('🔍 Loading properties routes...');
try {
    const propertiesRoutes = require('./routes/properties');
    console.log('✅ Properties routes loaded successfully');
    app.use('/api/properties', propertiesRoutes);
    console.log('✅ Properties routes mounted at /api/properties');
    
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

// ===== POLICIES ROUTES =====
const policiesRoutes = require('./routes/policies');
app.use('/api/policies', policiesRoutes);

// ===== SCHEDULE MEETINGS ROUTES =====
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
console.log('  - /api/notifications/* -> notifications routes');
console.log('  - /api/senior-hiring/* -> senior hiring routes');

// ===== SENIOR HIRING ROUTES =====
const seniorHiringRoutes = require('./routes/seniorHiring');
app.use('/api/senior-hiring', seniorHiringRoutes);

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
