const express = require('express');
const app = express();

// Health check route for Railway
app.get('/', (req, res) => {
    console.log('🔍 Root route accessed');
    res.status(200).json({
        status: 'OK',
        message: 'KASHTEC API is running',
        timestamp: new Date().toISOString()
    });
});

// Test route
app.get('/test', (req, res) => {
    console.log('🔍 Test route accessed');
    res.status(200).json({
        status: 'OK',
        message: 'Test route working',
        timestamp: new Date().toISOString()
    });
});

// Use Railway's port or fallback to 3000
const PORT = process.env.PORT || process.env.RAILWAY_PORT || 3000;
console.log('🔍 PORT from env.PORT:', process.env.PORT);
console.log('🔍 PORT from env.RAILWAY_PORT:', process.env.RAILWAY_PORT);
console.log('🔍 Using PORT:', PORT);

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Simple server running on port ${PORT}`);
    console.log(`🔍 Server bound to 0.0.0.0:${PORT}`);
    console.log('🔍 Ready to accept connections');
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
});

server.on('listening', () => {
    const address = server.address();
    console.log(`🔍 Server listening on ${address.address}:${address.port}`);
});
