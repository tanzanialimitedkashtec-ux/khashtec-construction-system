// Simple database connection test
const db = require('./database/config/database');

async function testDatabase() {
    try {
        console.log('🔍 Testing database connection...');
        
        // Test connection
        const [rows] = await db.execute('SELECT 1 as test');
        console.log('✅ Database connection successful:', rows);
        
        // Test authentication table
        const [authRows] = await db.execute('SELECT COUNT(*) as count FROM authentication');
        console.log('📊 Authentication table records:', authRows[0].count);
        
        // Test specific user
        const [userRows] = await db.execute(
            'SELECT email, role, department_name FROM authentication WHERE email = ?',
            ['hr@manager0501']
        );
        console.log('👤 Test user found:', userRows);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database test failed:', error);
        process.exit(1);
    }
}

testDatabase();
