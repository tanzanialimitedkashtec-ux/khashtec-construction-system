require('dotenv').config();

console.log('🔍 Environment Variables Analysis:');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test DATABASE_URL parsing
if (process.env.DATABASE_URL) {
    try {
        const url = new URL(process.env.DATABASE_URL);
        console.log('✅ URL Parsing successful:');
        console.log('  Host:', url.hostname);
        console.log('  Port:', url.port);
        console.log('  User:', url.username);
        console.log('  Database:', url.pathname.substring(1));
    } catch (err) {
        console.log('❌ URL Parsing failed:', err.message);
    }
}
