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

// CORS configuration
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'frontend/public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Root route - serve main frontend page
app.get('/', (req, res) => {
    console.log('🏠 Root route accessed, serving index.html');
    const indexPath = path.join(__dirname, 'frontend/public/index.html');
    console.log('📁 Index path:', indexPath);
    
    // Check if file exists
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        console.error('❌ index.html not found at:', indexPath);
        res.status(404).send('Frontend not found - index.html missing');
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

// API Routes with error handling
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
const SERVER_PORT = process.env.PORT;

console.log('🔍 Starting server configuration:');
console.log('📍 PORT from environment:', SERVER_PORT);
console.log('🔍 Node environment:', process.env.NODE_ENV);

if (!SERVER_PORT) {
    console.error('❌ ERROR: PORT environment variable is not set!');
    process.exit(1);
}

const server = app.listen(SERVER_PORT, '0.0.0.0', () => {
    console.log(`
🚀 ${config.APP_NAME}
🌍 Environment: ${config.NODE_ENV}
📍 Server running on port ${SERVER_PORT}
🏠 URL: http://0.0.0.0:${SERVER_PORT}
📊 Health check: http://0.0.0.0:${SERVER_PORT}/health
🕒 Started at: ${new Date().toLocaleString()}
🔍 Debug: Server ready for connections
🌐 External access should be available
    `);
    
    // Test health endpoint immediately
    console.log('🧪 Testing health endpoint...');
    fetch(`http://0.0.0.0:${SERVER_PORT}/health`)
        .then(response => response.text())
        .then(result => console.log('✅ Health check result:', result))
        .catch(err => console.log('❌ Health check failed:', err.message));
});

// Add server error handling
server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${SERVER_PORT} is already in use`);
    }
});

// Log when server is actually listening
server.on('listening', () => {
    const address = server.address();
    console.log(`🔍 Server listening on ${address.address}:${address.port}`);
    console.log('🔍 Ready to accept connections');
});

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
