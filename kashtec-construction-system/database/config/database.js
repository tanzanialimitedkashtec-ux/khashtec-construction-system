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
            
            // Use Railway's DATABASE_URL or individual DB credentials
            const databaseUrl = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('${') 
                ? process.env.DATABASE_URL 
                : "mysql://root:LzDEYGJIiYfVRSTnBrufpsSwRIDnZRvz@centerbeam.proxy.rlwy.net:11044/railway";
            
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
                    acquireTimeout: 60000, // 60 seconds
                    timeout: 60000, // 60 seconds
                    reconnect: true,
                    idleTimeout: 300000, // 5 minutes
                    ssl: {
                        rejectUnauthorized: false
                    }
                });
            } else {
                // Fallback to individual environment variables
                this.pool = mysql.createPool({
                    host: process.env.DB_HOST || "centerbeam.proxy.rlwy.net",
                    port: process.env.DB_PORT || 11044,
                    user: process.env.DB_USER || "root",
                    password: process.env.DB_PASSWORD || "LzDEYGJIiYfVRSTnBrufpsSwRIDnZRvz",
                    database: process.env.DB_NAME || "railway",
                    waitForConnections: true,
                    connectionLimit: 5, // Reduced for Railway
                    queueLimit: 0,
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 0,
                    acquireTimeout: 60000, // 60 seconds
                    timeout: 60000, // 60 seconds
                    reconnect: true,
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

    async execute(query, params = []) {
        // Try to execute query with retry logic
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                if (!this.isConnected) {
                    await this.connect();
                }
                
                const [rows] = await this.pool.execute(query, params);
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

    async query(query, params = []) {
        return this.execute(query, params);
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
