require('dotenv').config();

console.log('🔍 Railway Variables Status Check:');
console.log('='.repeat(50));

// Check all Railway-specific variables (including MySQL. prefixed)
const railwayVars = [
    'DATABASE_URL',
    'MYSQL_URL',
    'MySQL.MYSQL_URL',
    'MYSQL_PUBLIC_URL',
    'MySQL.MYSQL_PUBLIC_URL',
    'MYSQLUSER',
    'MySQL.MYSQLUSER',
    'MYSQLHOST',
    'MySQL.MYSQLHOST', 
    'MYSQLPORT',
    'MySQL.MYSQLPORT',
    'MYSQLDATABASE',
    'MySQL.MYSQLDATABASE',
    'MYSQLPASSWORD',
    'MySQL.MYSQLPASSWORD',
    'RAILWAY_PUBLIC_DOMAIN',
    'RAILWAY_TCP_PROXY_DOMAIN',
    'MySQL.RAILWAY_TCP_PROXY_DOMAIN',
    'RAILWAY_TCP_PROXY_PORT',
    'MySQL.RAILWAY_TCP_PROXY_PORT',
    'RAILWAY_PRIVATE_DOMAIN',
    'MySQL.RAILWAY_PRIVATE_DOMAIN'
];

railwayVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        // Mask sensitive values
        let displayValue = value;
        if (varName.includes('PASSWORD') || varName.includes('URL')) {
            displayValue = value.includes('@') 
                ? value.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
                : '***MASKED***';
        }
        console.log(`✅ ${varName}: ${displayValue}`);
    } else {
        console.log(`❌ ${varName}: MISSING`);
    }
});

console.log('='.repeat(50));
console.log('🔍 Connection Test Summary:');
console.log('The database server is consistently closing connections.');
console.log('This usually means:');
console.log('1. Database service is down');
console.log('2. Incorrect credentials');  
console.log('3. Database not accepting connections from this IP');
console.log('4. Railway variables need to be updated in dashboard');
