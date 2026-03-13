// Test Frontend-Backend Connection
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
    console.log('=== DATABASE CONNECTION TEST ===');
    
    try {
        // Test with DATABASE_URL
        const databaseUrl = process.env.DATABASE_URL;
        console.log('🔗 DATABASE_URL:', databaseUrl ? 'SET' : 'NOT SET');
        
        if (databaseUrl) {
            console.log('📍 Testing DATABASE_URL connection...');
            const url = new URL(databaseUrl);
            
            const connection = await mysql.createConnection({
                host: url.hostname,
                port: url.port || 3306,
                user: url.username,
                password: url.password,
                database: url.pathname.substring(1),
                ssl: {
                    rejectUnauthorized: false
                }
            });
            
            await connection.ping();
            console.log('✅ DATABASE_URL connection successful');
            await connection.end();
        }
        
        // Test with individual variables
        console.log('\n🔧 Testing individual variables...');
        const config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'railway',
            ssl: {
                rejectUnauthorized: false
            }
        };
        
        console.log('📍 Host:', config.host);
        console.log('👤 User:', config.user);
        console.log('💾 Database:', config.database);
        console.log('🔌 Port:', config.port);
        
        const connection2 = await mysql.createConnection(config);
        await connection2.ping();
        console.log('✅ Individual variables connection successful');
        
        // Test database query
        const [rows] = await connection2.execute('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?', [config.database]);
        console.log(`📊 Database has ${rows[0].count} tables`);
        
        await connection2.end();
        
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('🔍 Full error:', error);
        return false;
    }
}

async function testBackendAPI() {
    console.log('\n=== BACKEND API TEST ===');
    
    // Wait a moment for server to start (Railway deployment)
    console.log('⏰ Waiting 3 seconds for server to start...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
        // Try to connect with a longer timeout for Railway deployment
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
        
        const response = await fetch('http://localhost:3000/api/health', {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        console.log('✅ Backend API is running');
        console.log('📊 Health check response:', data);
        return true;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('⏰ Backend API test timeout (server might be starting up)');
            return false;
        } else if (error.code === 'ECONNREFUSED') {
            console.log('⏰ Backend API not ready yet (server starting up)');
            return false;
        } else {
            console.error('❌ Backend API test failed:', error.message);
            return false;
        }
    }
}

async function testFrontendFiles() {
    console.log('\n=== FRONTEND FILES TEST ===');
    
    const fs = require('fs');
    const path = require('path');
    
    const requiredFiles = [
        'frontend/public/department.html',
        'frontend/public/js/database-api.js',
        'frontend/public/css/style.css'
    ];
    
    let allFilesExist = true;
    
    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, file);
        const exists = fs.existsSync(filePath);
        console.log(`${exists ? '✅' : '❌'} ${file}`);
        if (!exists) allFilesExist = false;
    }
    
    return allFilesExist;
}

async function runAllTests() {
    console.log('🚀 KASHTEC SYSTEM TESTS\n');
    
    // Test environment variables
    console.log('=== ENVIRONMENT VARIABLES ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PORT:', process.env.PORT);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
    console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
    console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
    
    const dbTest = await testDatabaseConnection();
    const apiTest = await testBackendAPI();
    const frontendTest = await testFrontendFiles();
    
    console.log('\n=== TEST RESULTS ===');
    console.log('Database Connection:', dbTest ? '✅ PASS' : '❌ FAIL');
    console.log('Backend API:', apiTest ? '✅ PASS' : '❌ FAIL');
    console.log('Frontend Files:', frontendTest ? '✅ PASS' : '❌ FAIL');
    
    if (dbTest && apiTest && frontendTest) {
        console.log('\n🎉 ALL TESTS PASSED! System is working properly.');
    } else {
        console.log('\n⚠️  Some tests failed. Check the logs above.');
    }
}

// Run tests
runAllTests().catch(console.error);
