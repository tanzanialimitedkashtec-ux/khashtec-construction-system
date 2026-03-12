// Production Database Configuration
const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            // Debug environment variables
            console.log('🔍 Database Environment Variables:');
            console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
            console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
            console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
            console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
            console.log('DB_PORT:', process.env.DB_PORT || 'NOT SET');
            
            // Use Railway's DATABASE_URL or individual DB credentials
            const databaseUrl = process.env.DATABASE_URL;
            
            if (databaseUrl) {
                console.log('🔗 Using DATABASE_URL connection');
                // Parse DATABASE_URL format: mysql://user:password@host:port/database
                const url = new URL(databaseUrl);
                console.log('📍 Connecting to:', url.hostname + ':' + (url.port || 3306));
                console.log('👤 User:', url.username);
                console.log('💾 Database:', url.pathname.substring(1));
                
                this.pool = mysql.createPool({
                    host: url.hostname,
                    port: url.port || 3306,
                    user: url.username,
                    password: url.password,
                    database: url.pathname.substring(1),
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0,
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 0,
                    ssl: {
                        rejectUnauthorized: false
                    }
                });
            } else {
                console.log('🔧 Using individual environment variables');
                console.log('📍 Connecting to:', process.env.DB_HOST + ':' + (process.env.DB_PORT || 3306));
                console.log('👤 User:', process.env.DB_USER);
                console.log('💾 Database:', process.env.DB_NAME);
                
                // Fallback to individual environment variables
                this.pool = mysql.createPool({
                    host: process.env.DB_HOST || 'localhost',
                    port: process.env.DB_PORT || 3306,
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASSWORD || '',
                    database: process.env.DB_NAME || 'kashtec_db',
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0,
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 0,
                    ssl: {
                        rejectUnauthorized: false
                    }
                });
            }

            // Test connection
            console.log('🔌 Testing database connection...');
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            
            this.isConnected = true;
            console.log('✅ Database connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            console.error('🔍 Full error:', error);
            this.isConnected = false;
            return false;
        }
    }

    async execute(query, params = []) {
        if (!this.isConnected) {
            await this.connect();
        }

        try {
            const [rows] = await this.pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error.message);
            throw error;
        }
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

// Auto-connect on module load
db.connect().catch(console.error);

module.exports = db;
