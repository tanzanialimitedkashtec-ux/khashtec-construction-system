// Debug environment variables
require('dotenv').config();

console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('');

console.log('=== DATABASE VARIABLES ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('DB_PORT:', process.env.DB_PORT || 'NOT SET');
console.log('');

console.log('=== RAILWAY MYSQL VARIABLES ===');
console.log('MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL ? 'SET' : 'NOT SET');
console.log('MYSQLHOST:', process.env.MYSQLHOST || 'NOT SET');
console.log('MYSQLUSER:', process.env.MYSQLUSER || 'NOT SET');
console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? 'SET' : 'NOT SET');
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE || 'NOT SET');
console.log('MYSQLPORT:', process.env.MYSQLPORT || 'NOT SET');
console.log('');

console.log('=== RAILWAY VARIABLES ===');
console.log('RAILWAY_PUBLIC_DOMAIN:', process.env.RAILWAY_PUBLIC_DOMAIN || 'NOT SET');
console.log('RAILWAY_PRIVATE_DOMAIN:', process.env.RAILWAY_PRIVATE_DOMAIN || 'NOT SET');
console.log('RAILWAY_TCP_PROXY_DOMAIN:', process.env.RAILWAY_TCP_PROXY_DOMAIN || 'NOT SET');
console.log('RAILWAY_TCP_PROXY_PORT:', process.env.RAILWAY_TCP_PROXY_PORT || 'NOT SET');
console.log('');

console.log('=== ALL ENVIRONMENT VARIABLES ===');
Object.keys(process.env).forEach(key => {
    if (key.includes('MYSQL') || key.includes('RAILWAY') || key.includes('DATABASE') || key.includes('DB_')) {
        console.log(`${key}:`, process.env[key] ? 'SET' : 'NOT SET');
    }
});

console.log('=== END DEBUG ===');
