const express = require('express');
const db = require('../../database/config/database');

const app = express();
app.use(express.json());

// Simple test endpoint
app.get('/test-attendance', (req, res) => {
    console.log('🧪 Test attendance endpoint accessed');
    res.json({ 
        message: 'Attendance test endpoint working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const [result] = await db.execute('SELECT 1 as test');
        res.json({ 
            message: 'Database connection working',
            result: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Database connection failed',
            details: error.message
        });
    }
});

// Test attendance table
app.get('/test-attendance-table', async (req, res) => {
    try {
        const [attendance] = await db.execute('SELECT COUNT(*) as count FROM attendance');
        res.json({ 
            message: 'Attendance table test',
            count: attendance[0].count,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Attendance table test failed',
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🧪 Test server running on port ${PORT}`);
    console.log(`📡 Test endpoints:`);
    console.log(`   GET http://localhost:${PORT}/test-attendance`);
    console.log(`   GET http://localhost:${PORT}/test-db`);
    console.log(`   GET http://localhost:${PORT}/test-attendance-table`);
});
