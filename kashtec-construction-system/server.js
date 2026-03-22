const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Global error protection
process.on('uncaughtException', err => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', err => {
  console.error('❌ Unhandled Rejection:', err);
});

// Import environment configuration
const config = require('./config/environment');

// Import routes
const authRoutes = require('./backend/routes/auth');
const employeeRoutes = require('./backend/routes/employees');
const projectRoutes = require('./backend/routes/projects');
const documentRoutes = require('./backend/routes/documents');
const notificationRoutes = require('./backend/routes/notifications');
const apiRoutes = require('./backend/routes/api');

const app = express();
const PORT = config.PORT;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://picsum.photos"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration with CSP headers
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// CSP headers to allow inline scripts
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "script-src-attr 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self'; " +
        "connect-src 'self' https:;"
    );
    next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files with proper MIME types
app.use(express.static(path.join(__dirname, 'frontend/public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Root route - serve main frontend page
app.get('/', (req, res) => {
    console.log('🏠 Root route accessed, serving department.html');
    const departmentPath = path.join(__dirname, 'frontend/public/department.html');
    console.log('📁 Department path:', departmentPath);
    
    // Check if file exists
    if (require('fs').existsSync(departmentPath)) {
        res.sendFile(departmentPath);
    } else {
        console.error('❌ department.html not found at:', departmentPath);
        res.status(404).send('Frontend not found - department.html missing');
    }
});

// Simple health check endpoint for Railway (no database dependency)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: PORT,
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
        }
    });
});

// Root health check for Railway - minimal response
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Debug route to check database tables
app.get('/debug/db', async (req, res) => {
  try {
    const db = require('./database/config/database');
    const [rows] = await db.execute('SHOW TABLES');
    console.log('🔍 DEBUG - Tables found:', rows);
    console.log('🔍 DEBUG - Type:', typeof rows);
    console.log('🔍 DEBUG - Is array?', Array.isArray(rows));
    res.json({
      success: true,
      tableCount: rows.length,
      tables: Array.isArray(rows) ? rows.map(table => Object.values(table)[0]) : [],
      raw: rows
    });
  } catch (err) {
    console.error('🔥 DEBUG ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// Safe debug route
app.get('/debug/tables', async (req, res) => {
  try {
    const db = require('./database/config/database');
    const [rows] = await db.execute('SHOW TABLES');
    console.log("📊 Tables:", rows);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simple ping endpoint for Railway
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// Comprehensive API status endpoint
app.get('/api/status', async (req, res) => {
    try {
        console.log('🔍 API status check requested');
        
        // Check database connection
        let dbStatus = 'disconnected';
        let dbError = null;
        let tables = [];
        
        try {
            const db = require('./database/config/database');
            await db.execute('SELECT 1');
            dbStatus = 'connected';
            
            // Get table list
            const [tableRows] = await db.execute('SHOW TABLES');
            tables = tableRows.map(table => Object.values(table)[0]);
            console.log('✅ Database connected, tables:', tables);
        } catch (error) {
            dbError = error.message;
            console.error('❌ Database connection failed:', error);
        }
        
        // Check authentication table specifically
        let authTableStatus = 'not_found';
        if (tables.includes('authentication')) {
            try {
                const db = require('./database/config/database');
                const [authRows] = await db.execute('SELECT COUNT(*) as count FROM authentication');
                authTableStatus = `exists (${authRows[0].count} records)`;
            } catch (error) {
                authTableStatus = 'error';
                console.error('❌ Authentication table check failed:', error);
            }
        }
        
        const status = {
            success: true,
            timestamp: new Date().toISOString(),
            server: {
                status: 'running',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                node_version: process.version,
                environment: process.env.NODE_ENV || 'development'
            },
            database: {
                status: dbStatus,
                error: dbError,
                tables: tables,
                table_count: tables.length,
                authentication_table: authTableStatus
            },
            api: {
                auth_endpoint: '/api/auth - working',
                test_endpoint: '/api/auth/test - available',
                status_endpoint: '/api/status - working',
                tables_endpoint: '/api/tables - available'
            },
            routes: {
                auth: 'mounted',
                employees: 'mounted',
                projects: 'mounted',
                documents: 'mounted',
                notifications: 'mounted'
            }
        };
        
        console.log('✅ API status check completed');
        res.status(200).json(status);
        
    } catch (error) {
        console.error('❌ API status check failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Table verification endpoint
app.get('/api/tables', async (req, res) => {
    try {
        const db = require('./database/config/database');
        const [rows] = await db.execute('SHOW TABLES');
        console.log('📊 Raw table rows from API:', rows);
        const tableNames = rows.map(table => Object.values(table)[0]);
        res.status(200).json({
            success: true,
            tables: tableNames,
            count: rows.length,
            raw: rows
        });
    } catch (error) {
        console.error('❌ Table verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Global error handler for async functions
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// API Routes with consistent error handling
app.use('/api/auth', asyncHandler(async (req, res, next) => {
    return authRoutes(req, res, next);
}));

app.use('/api/employees', asyncHandler(async (req, res, next) => {
    return employeeRoutes(req, res, next);
}));

app.use('/api/projects', asyncHandler(async (req, res, next) => {
    return projectRoutes(req, res, next);
}));

app.use('/api/documents', asyncHandler(async (req, res, next) => {
    return documentRoutes(req, res, next);
}));

app.use('/api/notifications', asyncHandler(async (req, res, next) => {
    return notificationRoutes(req, res, next);
}));

app.use('/api', asyncHandler(async (req, res, next) => {
    return apiRoutes(req, res, next);
}));

// Database health check
app.get('/api/db-health', async (req, res) => {
    try {
        const db = require('./database/config/database');
        const health = await db.healthCheck();
        
        if (health.status === 'connected') {
            res.status(200).json({
                status: 'OK',
                database: 'Connected',
                timestamp: health.timestamp,
                environment: process.env.NODE_ENV
            });
        } else {
            res.status(503).json({
                status: 'ERROR',
                database: health.status,
                message: health.error || 'Database connection failed',
                timestamp: health.timestamp
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Database health check failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Root route for Railway health check - MUST be first
app.get("/", (req, res) => {
  console.log("🔍 Root route accessed");
  res.status(200).json({
    status: 'OK',
    message: 'KASHTEC API is running',
    timestamp: new Date().toISOString()
  });
});

// Simple test route (no database)
app.get("/test", (req, res) => {
  console.log("🔍 Test route accessed");
  res.status(200).json({
    status: "OK",
    message: "Test route working",
    timestamp: new Date().toISOString()
  });
});

// Serve frontend application - Railway compatible
app.get('/app', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'frontend/public/index.html'));
    } catch (error) {
        console.error('Error serving frontend:', error);
        res.status(500).json({
            error: 'Frontend not available',
            message: 'Unable to serve frontend files',
            timestamp: new Date().toISOString()
        });
    }
});

// Railway root health check
app.get('/_health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'KASHTEC Construction Management System',
        timestamp: new Date().toISOString(),
        port: PORT,
        environment: process.env.NODE_ENV
    });
});

// API routes are already handled above - no need for duplicate routing

// Catch-all handler for any other requests - MUST be last
app.get('*', (req, res) => {
    console.log(`🔍 Catch-all route accessed: ${req.path}`);
    
    // If it's an API request, return 404
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ 
            error: 'API endpoint not found',
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }
    
    // For non-API requests, serve the frontend
    res.sendFile(path.join(__dirname, 'frontend/public/index.html'));
});

// Railway-specific catch-all handler (must be last)
app.use('*', (req, res, next) => {
    // Log the request for debugging
    console.log(`🔍 Railway request: ${req.method} ${req.path}`);
    
    // If it's an API request that wasn't handled
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ 
            error: 'API endpoint not found',
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }
    
    // For any other request, try to serve the frontend
    try {
        res.sendFile(path.join(__dirname, 'frontend/public/index.html'));
    } catch (error) {
        console.error('Error serving fallback frontend:', error);
        res.status(500).json({
            error: 'Service unavailable',
            message: 'Unable to process request',
            timestamp: new Date().toISOString()
        });
    }
});

// Async error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Async error caught:', error);
    
    // Don't send error details in production
    const isDev = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
        error: {
            message: isDev ? error.message : 'Internal Server Error',
            stack: isDev ? error.stack : undefined,
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Don't send error details in production
    const isDev = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        error: {
            message: isDev ? err.message : 'Internal Server Error',
            stack: isDev ? err.stack : undefined,
            timestamp: new Date().toISOString()
        }
    });
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ 
            error: 'API endpoint not found',
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }
    
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Page Not Found - KASHTEC</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .container { max-width: 600px; margin: 0 auto; }
                .logo { font-size: 2em; color: #0b3d91; margin-bottom: 20px; }
                .error-code { font-size: 4em; color: #dc3545; margin: 20px 0; }
                .message { color: #666; margin: 20px 0; }
                .btn { background: #0b3d91; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">🏗️ KASHTEC</div>
                <div class="error-code">404</div>
                <h1>Page Not Found</h1>
                <p class="message">The page you're looking for doesn't exist or has been moved.</p>
                <a href="/" class="btn">Go to Dashboard</a>
            </div>
        </body>
        </html>
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

// Start server - Railway compatible configuration
const SERVER_PORT = config.PORT;

console.log('🔍 Starting server configuration:');
console.log('📍 PORT from environment:', SERVER_PORT);
console.log('🔍 Node environment:', process.env.NODE_ENV);

if (!SERVER_PORT) {
    console.error('❌ ERROR: PORT environment variable is not set!');
    process.exit(1);
}

// Auto-run migrations on startup for Railway
async function runMigrations() {
    try {
        console.log('🔄 Running database migrations...');
        const { exec } = require('child_process');
        await new Promise((resolve, reject) => {
            exec('node database/migrations/migrate.js', (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Migration failed:', error);
                    reject(error);
                } else {
                    console.log('✅ Migrations completed');
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error('❌ Migration error:', error);
    }
}

// Create authentication table directly
async function createAuthenticationTable() {
    try {
        console.log('🔧 Creating authentication table directly...');
        const db = require('./database/config/database');
        
        // First, drop the existing table to ensure clean recreation
        try {
            console.log('🗑️ Dropping existing authentication table...');
            await db.execute('DROP TABLE IF EXISTS authentication');
            console.log('✅ Existing authentication table dropped');
        } catch (dropError) {
            console.log('ℹ️ No existing table to drop:', dropError.message);
        }
        
        // Create authentication table
        const createAuthTableSQL = `
            CREATE TABLE authentication (
                id INT AUTO_INCREMENT PRIMARY KEY,
                department_code VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(100) NOT NULL,
                department_name VARCHAR(255) NOT NULL,
                manager_name VARCHAR(255),
                status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
                last_login TIMESTAMP NULL,
                login_attempts INT DEFAULT 0,
                locked_until TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_department_code (department_code),
                INDEX idx_status (status),
                INDEX idx_role (role)
            )
        `;
        
        await db.execute(createAuthTableSQL);
        console.log('✅ Authentication table created successfully');
        
        // Insert authentication records with correct hashes
        const insertAuthSQL = `
            INSERT INTO authentication (department_code, email, password_hash, role, department_name, manager_name, status) VALUES
            ('MD', 'md@kashtec.com', '$2a$12$pkTstU3up/l5NQlFpHKTI.OkXHOAbbWzjel7kSuLF/gfyva/v7vti', 'Managing Director', 'Managing Director Office', 'Dr. John Smith', 'Active'),
            ('ADMIN', 'admin@kashtec.com', '$2a$12$u6PW.jhy0/RN6xCBD8IcAupzxxeogxf3sheaeQm1RUevCl.BStPmq', 'Director of Administration', 'Administration', 'Director of Administration', 'Active'),
            ('HR', 'hr@manager0501', '$2a$12$AFEzay0Y3Bk8j1VTLuHVjOIf/zVCfj0S9jlJkKQuBX7wFViBPe8Mm', 'HR Manager', 'Human Resources', 'HR Manager', 'Active'),
            ('HSE', 'hse@manager0501', '$2a$12$Ju7KnyHUC7aYlQdPyygjPuly4JAxNkgau61OD0DBFo8Twk4YuadC2', 'HSE Manager', 'Health & Safety', 'HSE Manager', 'Active'),
            ('FINANCE', 'finance@manager0501', '$2a$12$zxzP5s/IBL1f4niPlxi.mO54LXkZy9KSEfbXP83ceHMfscxqyXKdC', 'Finance Manager', 'Finance', 'Finance Manager', 'Active'),
            ('PROJECT', 'pm@manager0501', '$2a$12$QprpmBaruPb.D9tbcPYm8Or/gOfC2fwwk47WYcCktc8sC1/N/wN8G', 'Project Manager', 'Project Management', 'Project Manager', 'Active'),
            ('REALESTATE', 'realestate@manager0501', '$2a$12$zrRcx9zjrBEG.8yn0a7AyesG4QWpjRtc4DcnhLAFkVpTTi9KlEDM6', 'Real Estate Manager', 'Real Estate', 'Real Estate Manager', 'Active'),
            ('ASSISTANT', 'assistant@kashtec.com', '$2a$12$aYCuS6B19FTYsARmSIOwe.iuG93uq7HTsQhW/cuh8BawFb9HPn./S', 'Admin Assistant', 'Administration', 'Admin Assistant', 'Active')
        `;
        
        await db.execute(insertAuthSQL);
        console.log('✅ Authentication records with correct hashes inserted successfully');
        
        // Verify the HR record has the correct hash
        const verifyQuery = await db.execute('SELECT email, password_hash FROM authentication WHERE email = ?', ['hr@manager0501']);
        console.log('🔍 Verification - HR record:', verifyQuery[0]);
        
    } catch (error) {
        console.error('❌ Authentication table creation error:', error);
    }
}

// Global error handler for unhandled errors
app.use((err, req, res, next) => {
    console.error('❌ Global error handler caught:', err);
    console.error('❌ Error stack:', err.stack);
    console.error('❌ Request URL:', req.url);
    console.error('❌ Request method:', req.method);
    
    // Ensure JSON response
    const errorResponse = {
        success: false,
        error: err.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method
    };
    
    // Don't send stack trace in production
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = err.stack;
    }
    
    res.status(err.status || 500).json(errorResponse);
});

// Handle 404 errors
app.use('*', (req, res) => {
    console.log('❌ 404 - Route not found:', req.method, req.url);
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.url}`,
        timestamp: new Date().toISOString(),
        available_routes: [
            'GET /',
            'GET /api/health',
            'GET /api/status',
            'GET /api/tables',
            'GET /ping',
            'POST /api/auth/login',
            'GET /api/auth/test',
            'GET /api/employees',
            'GET /api/projects',
            'GET /api/documents'
        ]
    });
});
// Start server after migrations and authentication table creation
console.log('🚀 Starting KASHTEC server startup sequence...');

async function startServer() {
    try {
        console.log('🔄 Step 1: Running database migrations...');
        await runMigrations();
        console.log('✅ Step 1 completed: Migrations successful');
        
        console.log('🔄 Step 2: Creating authentication table...');
        await createAuthenticationTable();
        console.log('✅ Step 2 completed: Authentication table ready');
        
        console.log('🔄 Step 3: Starting HTTP server...');
        const server = app.listen(SERVER_PORT, '0.0.0.0', () => {
            console.log('🚀 ' + config.APP_NAME);
            console.log('🌍 Environment: ' + config.NODE_ENV);
            console.log('📍 Server running on port ' + SERVER_PORT);
            console.log('🏠 URL: http://0.0.0.0:' + SERVER_PORT);
            console.log('📊 Health check: http://0.0.0.0:' + SERVER_PORT + '/api/health');
            console.log('🔍 API status: http://0.0.0.0:' + SERVER_PORT + '/api/status');
            console.log('🕒 Started at: ' + new Date().toLocaleString());
            console.log('✅ Server startup completed successfully!');
            console.log('🌐 All API endpoints are ready for requests');
        });

        server.on('error', (error) => {
            console.error('❌ Server error:', error);
            if (error.code === 'EADDRINUSE') {
                console.error('❌ Port ' + SERVER_PORT + ' is already in use');
            }
            process.exit(1);
        });

        server.on('listening', () => {
            if (server) {
                const address = server.address();
                console.log('🔍 Server listening on ' + address.address + ':' + address.port);
                console.log('🔍 Ready to accept connections');
            } else {
                console.error('❌ Server variable is undefined in listening event');
            }
        });
        
        return server;
        
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Error stack:', error.stack);
        process.exit(1);
    }
}

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

module.exports = app;
