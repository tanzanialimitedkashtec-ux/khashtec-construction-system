const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false
});
const jwt = require('jsonwebtoken');
const router = express.Router();

if (!process.env.JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET environment variable is missing.');
    process.exit(1);
}


// Test endpoint to verify API is working
router.get('/test', (req, res) => {
    console.log('🧪 Auth test endpoint accessed');
    res.json({
        message: 'Auth API is working',
        timestamp: new Date().toISOString(),
        status: 'OK'
    });
});

// Login endpoint
router.post('/login', loginLimiter, async (req, res) => {
    try {
        console.log('🔐 Login request received:', { email: req.body.email, role: req.body.role });
        const { email, password, role } = req.body;

        // Validate input (role is now optional - auto-detected from database)
        if (!email || !password) {
            console.log('Missing required fields:', { email: !!email, password: !!password });
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Find user by email and role
        let db;
        try {
            console.log('🔍 Attempting database connection...');
            db = require('../../database/config/database');
            console.log('✅ Database module loaded successfully');
            
            // Test the connection with a simple query
            console.log('🧪 Testing database connection...');
            const testResult = await db.execute('SELECT 1 as test');
            console.log('✅ Database connection test result:', testResult);
            console.log('📊 Test result type:', typeof testResult);
            console.log('📊 Test result is array:', Array.isArray(testResult));
            
            if (!testResult || !Array.isArray(testResult) || testResult.length === 0) {
                throw new Error('Database connection test failed - invalid result');
            }
            
            console.log('✅ Database connection established and working');
        } catch (dbError) {
            console.error('❌ Database connection failed:', dbError);
            console.error('❌ Error details:', dbError.message);
            console.error('❌ Error code:', dbError.code);
            console.error('❌ Error stack:', dbError.stack);
            return res.status(500).json({
                error: 'Database connection failed',
                message: 'Unable to connect to authentication database. Please try again later.',
                details: dbError.message
            });
        }
        
        // Also test if the authentication table exists
        try {
            console.log('🔍 Checking if authentication table exists...');
            const tableCheck = await db.execute('SHOW TABLES LIKE "authentication"');
            console.log('📊 Table check result:', tableCheck);
            console.log('📊 Table check is array:', Array.isArray(tableCheck));
            console.log('📊 Table check length:', tableCheck ? tableCheck.length : 'undefined');
            
            // SHOW TABLES returns an array of objects, each object has a column named like the table
            if (!tableCheck || !Array.isArray(tableCheck) || tableCheck.length === 0) {
                console.error('❌ Authentication table does not exist');
                return res.status(500).json({
                    error: 'Authentication table not found',
                    message: 'The authentication table has not been created. Please contact the system administrator.',
                    details: 'Table authentication does not exist in database'
                });
            }
            
            // Check if any row contains the authentication table
            const tableExists = tableCheck.some(row => {
                const tableName = row['Tables_in_railway'] || row['Tables_in_' + process.env.DB_NAME] || Object.values(row)[0];
                return tableName === 'authentication';
            });
            
            if (!tableExists) {
                console.error('❌ Authentication table not found in results');
                return res.status(500).json({
                    error: 'Authentication table not found',
                    message: 'The authentication table has not been created. Please contact the system administrator.',
                    details: 'Table authentication does not exist in database'
                });
            }
            
            console.log('✅ Authentication table exists');
            
            // Ensure lockout columns exist
            try {
                await db.execute('ALTER TABLE authentication ADD COLUMN failed_attempts INT DEFAULT 0');
                console.log('✅ Added failed_attempts column');
            } catch (e) { /* column exists */ }
            try {
                await db.execute('ALTER TABLE authentication ADD COLUMN lockout_until TIMESTAMP NULL');
                console.log('✅ Added lockout_until column');
            } catch (e) { /* column exists */ }
            
            // Ensure default MD user exists with correct credentials
            try {
                const mdCheck = await db.execute(
                    'SELECT id FROM authentication WHERE email = ?',
                    ['md@kashtec.com']
                );
                const bcryptHash = await bcrypt.hash('admin123', 12);
                if (!mdCheck || mdCheck.length === 0) {
                    await db.execute(
                        `INSERT INTO authentication (department_code, email, password_hash, role, department_name, manager_name, status)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        ['DEPT-MD', 'md@kashtec.com', bcryptHash, 'Managing Director', 'Managing Director', 'Managing Director', 'Active']
                    );
                    console.log('✅ Default MD user seeded into authentication table');
                } else {
                    await db.execute(
                        'UPDATE authentication SET password_hash = ?, role = ?, department_name = ?, status = ? WHERE email = ?',
                        [bcryptHash, 'Managing Director', 'Managing Director', 'Active', 'md@kashtec.com']
                    );
                    console.log('✅ MD user password updated');
                }
            } catch (seedErr) {
                console.log('ℹ️ MD seed check:', seedErr.message);
            }

            // Ensure default Admin Assistant user exists with correct credentials
            try {
                const assistantCheck = await db.execute(
                    'SELECT id FROM authentication WHERE email = ?',
                    ['assistant@kashtec.com']
                );
                const assistantHash = await bcrypt.hash('assistant123', 12);
                if (!assistantCheck || assistantCheck.length === 0) {
                    await db.execute(
                        `INSERT INTO authentication (department_code, email, password_hash, role, department_name, manager_name, status)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        ['ASSISTANT', 'assistant@kashtec.com', assistantHash, 'Admin Assistant', 'Administration', 'Admin Assistant', 'Active']
                    );
                    console.log('✅ Default Admin Assistant user seeded into authentication table');
                } else {
                    await db.execute(
                        'UPDATE authentication SET password_hash = ?, role = ?, department_name = ?, status = ? WHERE email = ?',
                        [assistantHash, 'Admin Assistant', 'Administration', 'Active', 'assistant@kashtec.com']
                    );
                    console.log('✅ Admin Assistant user password updated');
                }
            } catch (seedErr) {
                console.log('ℹ️ Assistant seed check:', seedErr.message);
            }
        } catch (tableError) {
            console.error('❌ Table check failed:', tableError);
            // Continue anyway - the main query will fail if table doesn't exist
        }
        
        console.log('🔍 Querying authentication table for:', email);
        
        try {
            console.log('🔍 Executing authentication query...');
            console.log('📝 Query:', 'SELECT id, email, password_hash, role, department_name, manager_name, status, nav_access, failed_attempts, lockout_until FROM authentication WHERE email = ? AND status = ?');
            console.log('📝 Parameters:', [email, 'Active']);
            
            // The database.execute() method already returns just the rows array
            const authRows = await db.execute(
                'SELECT id, email, password_hash, role, department_name, manager_name, status, nav_access, failed_attempts, lockout_until FROM authentication WHERE email = ? AND status = ?',
                [email, 'Active']
            );
            
            console.log('📊 Auth rows type:', typeof authRows);
            console.log('📊 Auth rows:', authRows);
            console.log('📊 Auth rows is array:', Array.isArray(authRows));
            console.log('📊 Auth rows length:', authRows ? authRows.length : 'undefined');
            
            // Check if authRows is valid
            if (!authRows || !Array.isArray(authRows)) {
                console.error('❌ Invalid authRows:', authRows);
                throw new Error('Database query returned invalid result format');
            }
            
            console.log('📊 Query successful, rows found:', authRows.length);
        
            if (authRows.length === 0) {
                console.log('❌ No authentication record found for:', email);
                // Record failed login attempt
                try {
                    await db.execute(`CREATE TABLE IF NOT EXISTS login_audit_logs (
                        id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NULL, email VARCHAR(255) NOT NULL,
                        user_name VARCHAR(255) NULL, role VARCHAR(100) NULL, department_name VARCHAR(255) NULL,
                        action VARCHAR(50) NOT NULL DEFAULT 'login', ip_address VARCHAR(45) NULL,
                        user_agent TEXT NULL, status VARCHAR(50) NOT NULL DEFAULT 'success',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX idx_email (email), INDEX idx_created_at (created_at), INDEX idx_action (action)
                    )`);
                    await db.execute(
                        `INSERT INTO login_audit_logs (email, role, action, ip_address, user_agent, status) VALUES (?, ?, 'login', ?, ?, 'failed')`,
                        [email, role || null, req.ip || req.connection?.remoteAddress || 'unknown', req.headers['user-agent'] || 'unknown']
                    );
                } catch (auditErr) { console.error('Login audit log error:', auditErr.message); }
                return res.status(401).json({
                    error: 'Invalid credentials',
                    message: 'No account found with this email'
                });
            }
            
            const authUser = authRows[0];
            console.log('👤 Found authentication record:', { id: authUser.id, email: authUser.email, role: authUser.role });
            
            // Check lockout status
            if (authUser.lockout_until && new Date(authUser.lockout_until) > new Date()) {
                console.log('❌ Account locked for:', email);
                return res.status(403).json({
                    error: 'Account locked',
                    message: 'Account temporarily locked due to multiple failed login attempts. Please try again later.'
                });
            }
            
            // Check password
            const isValidPassword = await bcrypt.compare(password, authUser.password_hash);
            console.log('🔐 Password comparison result:', { isValid: isValidPassword });
            
            if (!isValidPassword) {
                console.log('❌ Password mismatch for:', email);
                
                // Increment failed attempts and handle lockout
                let newAttempts = (authUser.failed_attempts || 0) + 1;
                let lockQuery = 'UPDATE authentication SET failed_attempts = ? WHERE email = ?';
                let lockParams = [newAttempts, email];
                
                if (newAttempts >= 5) {
                    lockQuery = 'UPDATE authentication SET failed_attempts = ?, lockout_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE email = ?';
                    console.log('🔒 Account locked due to 5 failed attempts:', email);
                }
                
                try {
                    await db.execute(lockQuery, lockParams);
                } catch (updateErr) {
                    console.error('Failed to update lockout status:', updateErr.message);
                }
                
                // Record failed login attempt
                try {
                    await db.execute(
                        `INSERT INTO login_audit_logs (user_id, email, user_name, role, department_name, action, ip_address, user_agent, status)
                         VALUES (?, ?, ?, ?, ?, 'login', ?, ?, 'failed')`,
                        [authUser.id, authUser.email, authUser.manager_name || authUser.email, authUser.role, authUser.department_name || null,
                         req.ip || req.connection?.remoteAddress || 'unknown', req.headers['user-agent'] || 'unknown']
                    );
                } catch (auditErr) { console.error('Login audit log error:', auditErr.message); }
                return res.status(401).json({
                    error: 'Invalid credentials',
                    message: newAttempts >= 5 ? 'Account locked due to multiple failed login attempts. Please try again later.' : 'Incorrect password'
                });
            }
            
            // Reset failed attempts if necessary
            if (authUser.failed_attempts > 0 || authUser.lockout_until) {
                try {
                    await db.execute('UPDATE authentication SET failed_attempts = 0, lockout_until = NULL WHERE email = ?', [email]);
                } catch (updateErr) {
                    console.error('Failed to reset lockout status:', updateErr.message);
                }
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: authUser.id,
                    email: authUser.email,
                    role: authUser.role,
                    department_name: authUser.department_name,
                    manager_name: authUser.manager_name
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );
            
            // Update last login
            await db.execute(
                'UPDATE authentication SET last_login = NOW() WHERE email = ?',
                [email]
            );
            
            // Record login in audit log
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS login_audit_logs (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NULL,
                        email VARCHAR(255) NOT NULL,
                        user_name VARCHAR(255) NULL,
                        role VARCHAR(100) NULL,
                        department_name VARCHAR(255) NULL,
                        action VARCHAR(50) NOT NULL DEFAULT 'login',
                        ip_address VARCHAR(45) NULL,
                        user_agent TEXT NULL,
                        status VARCHAR(50) NOT NULL DEFAULT 'success',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX idx_email (email),
                        INDEX idx_created_at (created_at),
                        INDEX idx_action (action)
                    )
                `);
                await db.execute(
                    `INSERT INTO login_audit_logs (user_id, email, user_name, role, department_name, action, ip_address, user_agent, status)
                     VALUES (?, ?, ?, ?, ?, 'login', ?, ?, 'success')`,
                    [
                        authUser.id,
                        authUser.email,
                        authUser.manager_name || authUser.email,
                        authUser.role,
                        authUser.department_name || null,
                        req.ip || req.connection?.remoteAddress || 'unknown',
                        req.headers['user-agent'] || 'unknown'
                    ]
                );
            } catch (auditErr) {
                console.error('Login audit log error (non-blocking):', auditErr.message);
            }
            
            console.log('🎫 JWT token generated for:', email);
            
            const response = {
                message: 'Login successful',
                token,
                user: {
                    id: authUser.id,
                    email: authUser.email,
                    role: authUser.role,
                    department_name: authUser.department_name,
                    manager_name: authUser.manager_name,
                    nav_access: authUser.nav_access
                }
            };
            
            console.log('✅ Sending login response:', response);
            
            // Emit Socket.IO event for user login
            if (req.app.get('io')) {
                req.app.get('io').emit('user_logged_in', {
                    message: `${authUser.manager_name || authUser.email} has logged in`,
                    user: authUser.manager_name || authUser.email,
                    role: authUser.role,
                    department: authUser.department_name
                });
            }
            
            res.json(response);
            
        } catch (queryError) {
            console.error('❌ Database query error:', queryError);
            console.error('❌ Query error details:', queryError.message);
            console.error('❌ Query error code:', queryError.code);
            console.error('❌ Query error stack:', queryError.stack);
            console.error('❌ Query that failed:', 'SELECT id, email, password_hash, role, department_name, manager_name, status FROM authentication WHERE email = ? AND status = ?');
            console.error('❌ Query parameters:', [email, 'Active']);
            
            // Check if it's a table doesn't exist error
            if (queryError.message.includes('Table') && queryError.message.includes("doesn't exist")) {
                return res.status(500).json({
                    error: 'Authentication table not found',
                    message: 'The authentication table has not been created. Please contact the system administrator.',
                    details: 'Table authentication does not exist in database'
                });
            }
            
            return res.status(500).json({
                error: 'Database query failed',
                message: 'Authentication query failed. Please try again later.',
                details: queryError.message
            });
        }

    } catch (error) {
        console.error('❌ Login error:', error);
        console.error('❌ Error stack:', error.stack);
        
        // Ensure we always send JSON response
        try {
            res.status(500).json({
                error: 'Internal server error',
                message: 'Login failed due to server error',
                details: error.message
            });
        } catch (jsonError) {
            console.error('❌ Failed to send JSON response:', jsonError);
            res.status(500).end('{"error": "Internal server error"}');
        }
    }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        res.json({
            valid: true,
            user: {
                id: decoded.id,
                email: decoded.email,
                name: decoded.manager_name || decoded.email,
                role: decoded.role,
                department_name: decoded.department_name,
                nav_access: decoded.nav_access
            }
        });

    } catch (error) {
        res.status(401).json({
            error: 'Invalid token'
        });
    }
});

// Logout endpoint (client-side token removal)
router.post('/logout', async (req, res) => {
    // Record logout in audit log
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const db = require('../../database/config/database');
            await db.execute(
                `INSERT INTO login_audit_logs (user_id, email, user_name, role, department_name, action, ip_address, user_agent, status)
                 VALUES (?, ?, ?, ?, ?, 'logout', ?, ?, 'success')`,
                [decoded.id || null, decoded.email || 'unknown', decoded.manager_name || decoded.email || 'unknown',
                 decoded.role || null, decoded.department_name || null,
                 req.ip || req.connection?.remoteAddress || 'unknown', req.headers['user-agent'] || 'unknown']
            );
        }
    } catch (auditErr) {
        console.error('Logout audit log error (non-blocking):', auditErr.message);
    }
    res.json({
        message: 'Logout successful'
    });
});


// ==========================================
// ACCESS MANAGEMENT (Users Table) ENDPOINTS
// ==========================================

// Get all users
router.get('/users', async (req, res) => {
    try {
        const db = require('../../database/config/database');
        const users = await db.execute(
            'SELECT id, email, role, department_name, manager_name, status, nav_access, last_login, created_at FROM authentication ORDER BY id DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

// Create new user
router.post('/users', async (req, res) => {
    try {
        const { email, password, role, department_name, manager_name, status, nav_access } = req.body;
        
        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role are required' });
        }

        const db = require('../../database/config/database');
        
        // Check if email already exists
        const existing = await db.execute('SELECT id FROM authentication WHERE email = ?', [email]);
        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'A user with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Generate a unique department code
        const deptCode = 'DEPT-' + Date.now().toString().slice(-4) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        
        const result = await db.execute(
            `INSERT INTO authentication (department_code, email, password_hash, role, department_name, manager_name, status, nav_access) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [deptCode, email, hashedPassword, role, department_name || null, manager_name || null, status || 'Active', nav_access || null]
        );
        
        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
});

// Update user
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, password, role, department_name, manager_name, status, nav_access } = req.body;
        
        if (!email || !role) {
            return res.status(400).json({ error: 'Email and role are required' });
        }

        const db = require('../../database/config/database');
        
        // Check if email belongs to another user
        const existing = await db.execute('SELECT id FROM authentication WHERE email = ? AND id != ?', [email, id]);
        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'This email is already in use by another account' });
        }

        let query = `UPDATE authentication SET email = ?, role = ?, department_name = ?, manager_name = ?, status = ?, nav_access = ?`;
        let params = [email, role, department_name || null, manager_name || null, status || 'Active', nav_access || null];

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 12);
            query += `, password_hash = ?`;
            params.push(hashedPassword);
        }

        query += ` WHERE id = ?`;
        params.push(id);

        await db.execute(query, params);
        
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
});

// Delete user (we will just mark as Inactive for safety)
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = require('../../database/config/database');
        
        await db.execute('UPDATE authentication SET status = ? WHERE id = ?', ['Inactive', id]);
        
        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Error deactivating user:', error);
        res.status(500).json({ error: 'Failed to deactivate user', details: error.message });
    }
});

router.delete('/users/:id/permanent', async (req, res) => {
    try {
        const { id } = req.params;
        const db = require('../../database/config/database');

        // Prevent deleting core system accounts (id <= 8)
        if (parseInt(id) <= 8) {
            return res.status(403).json({ error: 'Cannot delete core system accounts' });
        }

        await db.execute('DELETE FROM authentication WHERE id = ?', [id]);

        res.json({ success: true, message: 'User deleted permanently' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
});

module.exports = router;


