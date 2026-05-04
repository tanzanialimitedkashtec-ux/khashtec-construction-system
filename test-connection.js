const db = require('./database/config/database');

async function testConnection() {
    console.log('🔍 Testing database connection...');
    
    try {
        const connected = await db.connect();
        
        if (connected) {
            console.log('✅ Database connection successful!');
            
            // Test a simple query
            const result = await db.execute('SELECT 1 as test, NOW() as current_time');
            console.log('✅ Database query successful:', result);
            
            // Test table access
            try {
                const tables = await db.execute('SHOW TABLES');
                console.log('✅ Tables found:', tables.length);
                console.log('📊 Available tables:', tables.map(t => Object.values(t)[0]));
            } catch (tableErr) {
                console.log('⚠️ Could not list tables:', tableErr.message);
            }
            
            await db.close();
            console.log('✅ Database connection test completed successfully');
            return true;
        } else {
            console.log('❌ Database connection failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Database connection error:', error.message);
        console.log('❌ Full error:', error);
        return false;
    }
}

testConnection();
