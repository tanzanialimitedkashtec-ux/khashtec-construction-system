// Production Database Configuration
const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.lastConnectionAttempt = 0;
        this.connectionCooldown = 5000; // 5 seconds cooldown between attempts
    }

    async connect() {
        const now = Date.now();
        
        // Prevent excessive connection attempts
        if (now - this.lastConnectionAttempt < this.connectionCooldown) {
            console.log('⏳ Database connection cooldown, skipping attempt');
            return false;
        }
        
        this.lastConnectionAttempt = now;

        try {
            // Reduce logging - only log essential info
            if (this.reconnectAttempts === 0) {
                console.log('🔗 Initializing database connection...');
            }
            
            // Debug environment variables (including Railway MySQL. prefixed variables)
            console.log('🔍 Environment Variables Debug:');
            console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');
            console.log('  - MYSQL_URL:', process.env.MYSQL_URL ? 'SET' : 'MISSING');
            console.log('  - MySQL.MYSQL_URL:', process.env['MySQL.MYSQL_URL'] ? 'SET' : 'MISSING');
            console.log('  - MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL ? 'SET' : 'MISSING');
            console.log('  - MySQL.MYSQL_PUBLIC_URL:', process.env['MySQL.MYSQL_PUBLIC_URL'] ? 'SET' : 'MISSING');
            console.log('  - MYSQLUSER:', process.env.MYSQLUSER || 'MISSING');
            console.log('  - MySQL.MYSQLUSER:', process.env['MySQL.MYSQLUSER'] || 'MISSING');
            console.log('  - MYSQLHOST:', process.env.MYSQLHOST || 'MISSING');
            console.log('  - MySQL.MYSQLHOST:', process.env['MySQL.MYSQLHOST'] || 'MISSING');
            console.log('  - MYSQLPORT:', process.env.MYSQLPORT || 'MISSING');
            console.log('  - MySQL.MYSQLPORT:', process.env['MySQL.MYSQLPORT'] || 'MISSING');
            console.log('  - MYSQLDATABASE:', process.env.MYSQLDATABASE || 'MISSING');
            console.log('  - MySQL.MYSQLDATABASE:', process.env['MySQL.MYSQLDATABASE'] || 'MISSING');
            console.log('  - MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? 'SET' : 'MISSING');
            console.log('  - MySQL.MYSQLPASSWORD:', process.env['MySQL.MYSQLPASSWORD'] ? 'SET' : 'MISSING');
            
            // Use Railway's DATABASE_URL or construct from individual variables
            let databaseUrl = process.env.DATABASE_URL;
            
            // Check if DATABASE_URL contains unresolved variables
            if (!databaseUrl || databaseUrl.includes('${')) {
                databaseUrl = process.env['MySQL.MYSQL_URL'] || process.env.MYSQL_URL || process.env['MySQL.MYSQL_PUBLIC_URL'] || process.env.MYSQL_PUBLIC_URL;
            }
            
            // If still no valid URL, construct from individual variables (prioritize Railway MySQL. prefixed)
            if (!databaseUrl || databaseUrl.includes('${')) {
                const dbHost = process.env['MySQL.MYSQLHOST'] || process.env.MYSQLHOST || process.env.RAILWAY_PRIVATE_DOMAIN || process.env.DB_HOST;
                const dbPort = process.env['MySQL.MYSQLPORT'] || process.env.MYSQLPORT || process.env.DB_PORT || 3306;
                const dbUser = process.env['MySQL.MYSQLUSER'] || process.env.MYSQLUSER || process.env.DB_USER;
                const dbPassword = process.env['MySQL.MYSQLPASSWORD'] || process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
                const dbName = process.env['MySQL.MYSQLDATABASE'] || process.env.MYSQLDATABASE || process.env.DB_NAME || "railway";
                
                if (dbUser && dbPassword && dbHost) {
                    databaseUrl = `mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
                }
            }
            
            console.log('🔗 Database URL configured:', databaseUrl ? 'Available' : 'Missing');
            if (databaseUrl) {
                console.log('🔗 Database URL (safe):', databaseUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
            }
            
            if (databaseUrl) {
                // Parse DATABASE_URL format: mysql://user:password@host:port/database
                const url = new URL(databaseUrl);
                
                this.pool = mysql.createPool({
                    host: url.hostname,
                    port: url.port || 3306,
                    user: url.username,
                    password: url.password,
                    database: url.pathname.substring(1),
                    waitForConnections: true,
                    connectionLimit: 5, // Reduced for Railway
                    queueLimit: 0,
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 0,
                    idleTimeout: 300000, // 5 minutes
                    ssl: {
                        rejectUnauthorized: false
                    }
                });
            } else {
                // Fallback to individual environment variables
                const dbHost = process.env.MYSQLHOST || process.env.DB_HOST || "centerbeam.proxy.rlwy.net";
                const dbPort = process.env.MYSQLPORT || process.env.DB_PORT || 3306;
                const dbUser = process.env.MYSQLUSER || process.env.DB_USER || "root";
                const dbPassword = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "FpJJluFwvIzgsMTsfDZApQLznVVVIzJd";
                const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || "railway";
                
                console.log('🔗 Using fallback database config:', `${dbUser}@${dbHost}:${dbPort}/${dbName}`);
                
                this.pool = mysql.createPool({
                    host: dbHost,
                    port: dbPort,
                    user: dbUser,
                    password: dbPassword,
                    database: dbName,
                    waitForConnections: true,
                    connectionLimit: 5, // Reduced for Railway
                    queueLimit: 0,
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 0,
                    idleTimeout: 300000, // 5 minutes
                    ssl: {
                        rejectUnauthorized: false
                    }
                });
            }

            // Test connection with timeout
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.reconnectDelay = 1000; // Reset delay
            
            if (this.reconnectAttempts === 0) {
                console.log('✅ Database connected successfully');
            } else {
                console.log('✅ Database reconnected successfully');
            }
            
            return true;
        } catch (error) {
            this.isConnected = false;
            this.reconnectAttempts++;
            
            // Only log errors at reasonable intervals to avoid spam
            if (this.reconnectAttempts === 1 || this.reconnectAttempts % 10 === 0) {
                console.error(`❌ Database connection failed (attempt ${this.reconnectAttempts}):`, error.message);
            }
            
            // Exponential backoff with jitter
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
                const jitter = Math.random() * 1000; // Add up to 1 second jitter
                setTimeout(() => this.connect(), this.reconnectDelay + jitter);
            } else if (this.reconnectAttempts === this.maxReconnectAttempts) {
                console.error('❌ Max reconnection attempts reached. Will retry periodically...');
                // Continue retrying but at longer intervals
                setInterval(() => this.connect(), 60000); // Retry every minute
            }
            
            return false;
        }
    }

    sendSystemNotificationEmail(query, params) {
        try {
            const queryStr = typeof query === 'string' ? query.trim() : '';
            if (!queryStr) return;
            const queryUpper = queryStr.toUpperCase();

            // Extract action, table, and column names
            let action = '';
            let table = '';
            let columns = [];
            
            if (queryUpper.startsWith('INSERT INTO')) {
                action = 'New Record Created';
                const tableMatch = queryStr.match(/INSERT\s+INTO\s+([^\s\(]+)/i);
                if (tableMatch) table = tableMatch[1];
                
                const colMatch = queryStr.match(/\(([^)]+)\)/);
                if (colMatch) {
                    columns = colMatch[1].split(',').map(c => c.trim().replace(/`/g, ''));
                }
            } else if (queryUpper.startsWith('UPDATE')) {
                action = 'Record Updated';
                const tableMatch = queryStr.match(/UPDATE\s+([^\s]+)/i);
                if (tableMatch) table = tableMatch[1];
                
                const setMatch = queryStr.match(/SET\s+(.+?)(?:\s+WHERE|$)/i);
                if (setMatch) {
                    const parts = setMatch[1].split(',');
                    columns = parts.map(p => p.split('=')[0].trim().replace(/`/g, ''));
                }
            } else if (queryUpper.startsWith('DELETE FROM')) {
                action = 'Record Deleted';
                const tableMatch = queryStr.match(/DELETE\s+FROM\s+([^\s]+)/i);
                if (tableMatch) table = tableMatch[1];
            }

            if (!action || !table) return;

            table = table.replace(/`/g, '');

            const monitoredTables = [
                'employees', 'worker_accounts', 'materials', 'financial_strategies',
                'senior_hiring_requests', 'senior_hiring_approvals', 'projects',
                'worker_assignments', 'attendance', 'finance_work', 'payment_requests',
                'site_reports', 'work', 'policies', 'compliance', 'hse_incidents', 'hse_work',
                'ppe_issuance', 'violations', 'inspections', 'workforce_budgets',
                'clients', 'procurement', 'nhif', 'nssf', 'company_cars', 'drivers',
                'properties', 'schedule_meetings', 'luggage_companies', 'luggage_purchases',
                'documents', 'file_uploads', 'suggestions', 'departments', 'claims',
                'discipline_monitoring', 'office_resources', 'talent_acquisition',
                'promotions', 'risk_management', 'notifications', 'hr_work', 'realestate_work', 'admin_work'
            ];

            let title = `System Change Alert: ${action} in ${table}`;
            
            // Format details nicely into an HTML table instead of raw JSON
            let htmlDetails = '<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">';
            if (params && params.length > 0) {
                for (let i = 0; i < params.length; i++) {
                    const key = columns[i] ? columns[i] : `Field ${i + 1}`;
                    let val = params[i];
                    if (val === undefined || val === null) val = 'N/A';
                    val = String(val);
                    if (val.length > 300) val = val.substring(0, 300) + '... (truncated)';
                    
                    htmlDetails += `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd; width: 35%; font-weight: bold; color: #555; background-color: #f9f9f9;">${key}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${val}</td>
                        </tr>
                    `;
                }
            } else {
                htmlDetails += '<tr><td style="padding: 10px;">No specific parameters provided in query.</td></tr>';
            }
            htmlDetails += '</table>';

            // Add action buttons for requests and approvals
            let actionButtons = '';
            const requiresApproval = [
                'senior_hiring_requests', 
                'workforce_budgets', 
                'leave_requests', 
                'payment_requests',
                'work', 'hr_work', 'finance_work', 'realestate_work', 'admin_work',
                'worker_assignments'
            ];

            if (requiresApproval.some(t => table.toLowerCase().includes(t))) {
                const systemUrl = process.env.PUBLIC_URL || 'https://khashtec-construction-system-production.up.railway.app';

                actionButtons = `
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; text-align: center;">
                        <p style="margin-bottom: 10px; color: #D32F2F; font-size: 16px; font-weight: bold;">Action Required for this Request</p>
                        <p style="margin-bottom: 20px; color: #555; font-size: 14px;">This request requires your attention. Please log in to the KASHTEC system to review, approve, reject, or request more information.</p>
                        <a href="${systemUrl}" style="display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-family: sans-serif;">Go to System Dashboard</a>
                    </div>
                `;
            }
            
            if (table.toUpperCase() === 'NOTIFICATIONS' && action === 'New Record Created') {
                title = (params && params.length > 0) ? params[0] : 'System Notification';
                const msg = (params && params.length > 1) ? params[1] : 'You have a new notification.';
                htmlDetails = `<p style="background: #f5f5f5; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3; white-space: pre-wrap;">${msg}</p>`;
            } else {
                if (!monitoredTables.includes(table.toLowerCase())) {
                    return;
                }
            }

            const https = require('https');
            const data = JSON.stringify({
                from: 'Kashtec Notification <onboarding@resend.dev>',
                to: 'tanzanialimitedkashtec@gmail.com',
                subject: 'New System Notification: ' + title,
                html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <div style="background-color: #1a237e; color: white; padding: 20px; text-align: center;">
                                <h2 style="margin: 0; font-size: 24px;">KASHTEC System Alert</h2>
                            </div>
                            <div style="padding: 25px; background-color: #ffffff;">
                                <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #2196F3; padding-bottom: 10px; display: inline-block;">${title}</h3>
                                <div style="margin: 20px 0;">
                                    <p style="margin: 5px 0;"><strong>Action Performed:</strong> <span style="color: #2196F3;">${action}</span></p>
                                    <p style="margin: 5px 0;"><strong>Module Affected:</strong> <span style="background-color: #e3f2fd; padding: 2px 8px; border-radius: 4px; color: #0d47a1;">${table.toUpperCase()}</span></p>
                                </div>
                                <h4 style="margin-bottom: 10px; color: #444;">Record Details:</h4>
                                ${htmlDetails}
                                ${actionButtons}
                            </div>
                            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-top: 1px solid #eee;">
                                <p style="margin: 0; font-size: 12px; color: #888;">This is an automated system notification from KASHTEC Construction Management System.</p>
                            </div>
                        </div>`
            });

            const req = https.request({
                hostname: 'api.resend.com',
                port: 443,
                path: '/emails',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer re_anoc42tU_MXy9ePaVpP8uHZvauksrB7Ad',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            }, (res) => {
                res.on('data', () => {}); // Consume data
            });

            req.on('error', (e) => console.error('Error sending Resend email:', e.message));
            req.write(data);
            req.end();
        } catch (err) {
            console.error('Failed to process system notification email:', err.message);
        }
    }

    async execute(query, params = []) {
        // Try to execute query with retry logic
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                if (!this.isConnected) {
                    await this.connect();
                }
                
                const [rows] = await this.pool.execute(query, params);

                // Intercept data changes to send an email via Resend
                this.sendSystemNotificationEmail(query, params);

                return rows;
            } catch (error) {
                // Handle connection-specific errors
                if (this.isConnectionError(error) && attempt < 3) {
                    console.warn(`⚠️ Connection error on attempt ${attempt}, retrying...`);
                    this.isConnected = false;
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Wait before retry
                    continue;
                }
                throw error;
            }
        }
    }

    isConnectionError(error) {
        const connectionErrors = [
            'PROTOCOL_CONNECTION_LOST',
            'ECONNRESET',
            'ENOTFOUND',
            'ECONNREFUSED',
            'ETIMEDOUT',
            'Connection lost: The server closed the connection'
        ];
        
        return connectionErrors.some(err => 
            error.code === err || 
            error.message?.includes(err) ||
            error.code === 'PROTOCOL_CONNECTION_LOST'
        );
    }

    async query(sql, params = []) {
        // Use pool.query() instead of pool.execute() for DDL support
        // pool.execute() uses prepared statements which don't support ALTER TABLE, CREATE TABLE, etc.
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                if (!this.isConnected) {
                    await this.connect();
                }
                
                const [rows] = await this.pool.query(sql, params);
                
                // Intercept data changes to send an email via Resend
                this.sendSystemNotificationEmail(sql, params);

                return rows;
            } catch (error) {
                if (this.isConnectionError(error) && attempt < 3) {
                    console.warn(`⚠️ Connection error on query attempt ${attempt}, retrying...`);
                    this.isConnected = false;
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    continue;
                }
                throw error;
            }
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            console.log('Database connection closed');
        }
    }

    async healthCheck() {
        try {
            if (!this.isConnected) {
                return { status: 'disconnected' };
            }
            
            const result = await this.execute('SELECT 1 as health');
            return { 
                status: 'connected', 
                timestamp: new Date().toISOString(),
                result: result[0]
            };
        } catch (error) {
            return { 
                status: 'error', 
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Create singleton instance
const db = new Database();

// Don't auto-connect on module load - let server start first
// db.connect().catch(console.error);

module.exports = db;
