// KASHTEC Construction Management System - Environment Configuration
// This file documents all environment variables used in the project

// Database Configuration
const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:LzDEYGJIiYfVRSTnBrufpsSwRIDnZRvz@centerbeam.proxy.rlwy.net:11044/railway";
const DB_HOST = process.env.DB_HOST || "centerbeam.proxy.rlwy.net";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "LzDEYGJIiYfVRSTnBrufpsSwRIDnZRvz";
const DB_NAME = process.env.DB_NAME || "railway";
const DB_PORT = process.env.DB_PORT || "11044";

// Application Configuration
const NODE_ENV = process.env.NODE_ENV || "production";
const PORT = parseInt(process.env.PORT) || 3000; // Ensure PORT is a number
const JWT_SECRET = process.env.JWT_SECRET || "kashtec-secret-key-2024";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Use environment variable only

// Security Configuration
const BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || "12";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Application Metadata
const APP_NAME = "KASHTEC Construction Management System";
const APP_VERSION = "1.0.0";
const APP_URL = process.env.APP_URL || `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;

// Export all configuration
module.exports = {
    // Database
    DATABASE_URL,
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT,
    
    // Application
    NODE_ENV,
    PORT,
    JWT_SECRET,
    GITHUB_TOKEN,
    
    // Security
    BCRYPT_ROUNDS,
    JWT_EXPIRE,
    CORS_ORIGIN,
    
    // Metadata
    APP_NAME,
    APP_VERSION,
    APP_URL
};

// Configuration validation
console.log('🔧 KASHTEC Configuration Loaded:');
console.log(`📍 Environment: ${NODE_ENV}`);
console.log(`🌐 Port: ${PORT}`);
console.log(`💾 Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}`);
console.log(`🔑 JWT Secret: ${JWT_SECRET ? 'SET' : 'NOT SET'}`);
console.log(`🐙 GitHub Token: ${GITHUB_TOKEN ? 'SET' : 'NOT SET'}`);
