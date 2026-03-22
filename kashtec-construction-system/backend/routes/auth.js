const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Department-specific login credentials
const users = [
    {
        id: 1,
        email: 'admin@kashtec.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: admin
        role: 'admin',
        name: 'System Administrator'
    },
    {
        id: 2,
        email: 'hr@manager0501',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: hr0501
        role: 'hr',
        name: 'HR Manager 0501'
    },
    {
        id: 3,
        email: 'hr@manager0502',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: hr0502
        role: 'hr',
        name: 'HR Manager 0502'
    },
    {
        id: 4,
        email: 'hr@manager0503',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: hr0503
        role: 'hr',
        name: 'HR Manager 0503'
    },
    {
        id: 5,
        email: 'pm@manager0501',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: pm0501
        role: 'project_manager',
        name: 'Project Manager 0501'
    },
    {
        id: 6,
        email: 'pm@manager0502',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: pm0502
        role: 'project_manager',
        name: 'Project Manager 0502'
    },
    {
        id: 7,
        email: 'pm@manager0503',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: pm0503
        role: 'project_manager',
        name: 'Project Manager 0503'
    },
    {
        id: 8,
        email: 'finance@manager0501',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: finance0501
        role: 'finance',
        name: 'Finance Manager 0501'
    },
    {
        id: 9,
        email: 'finance@manager0502',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: finance0502
        role: 'finance',
        name: 'Finance Manager 0502'
    },
    {
        id: 10,
        email: 'finance@manager0503',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: finance0503
        role: 'finance',
        name: 'Finance Manager 0503'
    },
    {
        id: 11,
        email: 'operations@manager0501',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: operations0501
        role: 'operations',
        name: 'Operations Manager 0501'
    },
    {
        id: 12,
        email: 'operations@manager0502',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: operations0502
        role: 'operations',
        name: 'Operations Manager 0502'
    },
    {
        id: 13,
        email: 'operations@manager0503',
        password: '$2a$12$LQv3c1yqqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: operations0503
        role: 'operations',
        name: 'Operations Manager 0503'
    }
];

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
router.post('/login', async (req, res) => {
    try {
        console.log('🔐 Login request received:', req.body);
        const { email, password, role } = req.body;

        // Validate input
        if (!email || !password || !role) {
            console.log('❌ Missing required fields:', { email: !!email, password: !!password, role: !!role });
            return res.status(400).json({
                error: 'Email, password, and role are required'
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
            
            if (!tableCheck || !Array.isArray(tableCheck) || tableCheck.length === 0) {
                console.error('❌ Authentication table does not exist');
                return res.status(500).json({
                    error: 'Authentication table not found',
                    message: 'The authentication table has not been created. Please contact the system administrator.',
                    details: 'Table authentication does not exist in database'
                });
            }
            
            console.log('✅ Authentication table exists');
        } catch (tableError) {
            console.error('❌ Table check failed:', tableError);
            // Continue anyway - the main query will fail if table doesn't exist
        }
        
        console.log('🔍 Querying authentication table for:', email);
        
        try {
            console.log('🔍 Executing authentication query...');
            console.log('📝 Query:', 'SELECT id, email, password_hash, role, department_name, manager_name, status FROM authentication WHERE email = ? AND status = ?');
            console.log('📝 Parameters:', [email, 'Active']);
            
            // The database.execute() method already returns just the rows array
            const authRows = await db.execute(
                'SELECT id, email, password_hash, role, department_name, manager_name, status FROM authentication WHERE email = ? AND status = ?',
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
                return res.status(401).json({
                    error: 'Invalid credentials',
                    message: 'No account found with this email'
                });
            }
            
            const authUser = authRows[0];
            console.log('👤 Found authentication record:', { id: authUser.id, email: authUser.email, role: authUser.role });
            
            // Check password
            const isValidPassword = await bcrypt.compare(password, authUser.password_hash);
            console.log('🔐 Password comparison result:', { isValid: isValidPassword, providedPassword: password });
            
            if (!isValidPassword) {
                console.log('❌ Password mismatch for:', email);
                return res.status(401).json({
                    error: 'Invalid credentials',
                    message: 'Incorrect password'
                });
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
                process.env.JWT_SECRET || 'fallback-secret-key',
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );
            
            // Update last login
            await db.execute(
                'UPDATE authentication SET last_login = NOW() WHERE email = ?',
                [email]
            );
            
            console.log('🎫 JWT token generated for:', email);
            
            const response = {
                message: 'Login successful',
                token,
                user: {
                    id: authUser.id,
                    email: authUser.email,
                    role: authUser.role,
                    department_name: authUser.department_name,
                    manager_name: authUser.manager_name
                }
            };
            
            console.log('✅ Sending login response:', response);
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

// Register endpoint (for demo purposes)
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // Validate input
        if (!email || !password || !name || !role) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({
                error: 'User already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = {
            id: users.length + 1,
            email,
            password: hashedPassword,
            name,
            role
        };

        users.push(newUser);

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email, 
                role: newUser.role 
            },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        
        const user = users.find(u => u.id === decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                error: 'User not found'
            });
        }

        res.json({
            valid: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        res.status(401).json({
            error: 'Invalid token'
        });
    }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
    res.json({
        message: 'Logout successful'
    });
});

module.exports = router;
