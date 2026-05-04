const mysql = require('mysql2/promise');
require('dotenv').config();

async function testSimpleConnection() {
    console.log('🔍 Testing simple MySQL connection...');
    
    try {
        // Test with minimal configuration
        const connection = await mysql.createConnection({
            host: 'centerbeam.proxy.rlwy.net',
            port: 11044,
            user: 'root',
            password: 'LzDEYGJIiYfVRSTnBrufpsSwRIDnZRvz',
            database: 'railway',
            ssl: {
                rejectUnauthorized: false
            }
        });
        
        console.log('✅ Connection established');
        
        // Test query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Query successful:', rows);
        
        await connection.end();
        console.log('✅ Connection closed successfully');
        
        return true;
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        console.log('❌ Error code:', error.code);
        console.log('❌ Error number:', error.errno);
        return false;
    }
}

testSimpleConnection();
