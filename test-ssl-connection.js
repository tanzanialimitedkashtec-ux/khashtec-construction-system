const mysql = require('mysql2/promise');
require('dotenv').config();

async function testSSLConnection() {
    console.log('🔍 Testing different SSL configurations...');
    
    const configs = [
        {
            name: 'No SSL',
            ssl: false
        },
        {
            name: 'SSL with rejectUnauthorized: false',
            ssl: { rejectUnauthorized: false }
        },
        {
            name: 'SSL with required: true',
            ssl: { rejectUnauthorized: false, required: true }
        }
    ];
    
    for (const config of configs) {
        console.log(`\n🔍 Testing: ${config.name}`);
        
        try {
            const connection = await mysql.createConnection({
                host: 'centerbeam.proxy.rlwy.net',
                port: 11044,
                user: 'root',
                password: 'LzDEYGJIiYfVRSTnBrufpsSwRIDnZRvz',
                database: 'railway',
                ...config
            });
            
            console.log(`✅ Connection successful with: ${config.name}`);
            
            // Test query
            const [rows] = await connection.execute('SELECT 1 as test');
            console.log('✅ Query successful:', rows);
            
            await connection.end();
            console.log('✅ Connection closed');
            
            return config.name;
        } catch (error) {
            console.log(`❌ Failed with ${config.name}:`, error.message);
        }
    }
    
    return null;
}

testSSLConnection();
