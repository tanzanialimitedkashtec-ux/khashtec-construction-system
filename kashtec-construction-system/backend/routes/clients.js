const express = require('express');
const router = express.Router();

console.log('🚀 Clients route file is being loaded...');

// Add a simple test endpoint to verify the route is working
router.get('/test-simple', (req, res) => {
    console.log('🧪 Simple clients test endpoint accessed');
    res.json({ 
        message: 'Clients API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully'
    });
});

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Clients test endpoint accessed');
    res.json({ 
        message: 'Clients API is working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Root endpoint test
router.get('/', (req, res) => {
    console.log('🏠 Clients root endpoint accessed');
    res.json({ 
        message: 'Clients API root endpoint',
        available_endpoints: ['GET /test', 'POST /', 'GET /:id', 'PUT /:id', 'DELETE /:id']
    });
});

// Create new client
router.post('/', async (req, res) => {
    try {
        console.log('👥 Client registration request received');
        console.log('📝 Request body:', req.body);
        
        const db = require('../../database/config/database');
        
        // Map frontend field names to database field names
        const {
            id: client_id,
            type: client_type,
            fullName: full_name,
            companyName: company_name,
            phone: phone_number,
            email: email_address,
            nida: nida_number,
            tin: tin_number,
            address: physical_address,
            propertyInterest: property_interest,
            budgetRange: budget_range,
            notes: additional_notes,
            registeredBy: registered_by
        } = req.body;
        
        // Validate required fields
        if (!client_type || !full_name || !phone_number || !email_address || !nida_number || !physical_address) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'client_type, full_name, phone_number, email_address, nida_number, and physical_address are required'
            });
        }
        
        console.log('🔍 About to execute client insert query...');
        
        // Insert client into clients table
        const query = `INSERT INTO clients (
                client_id, client_type, full_name, company_name, phone_number, 
                email_address, nida_number, tin_number, physical_address, 
                property_interest, budget_range, additional_notes, registered_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const values = [
            client_id || `CLT${Date.now().toString().slice(-6)}`,
            client_type || 'Individual',
            full_name, 
            company_name || '', 
            phone_number,
            email_address, 
            nida_number, 
            tin_number || '', 
            physical_address,
            property_interest || '', 
            budget_range || '', 
            additional_notes || '', 
            registered_by || 'system'
        ];
        
        console.log('🔍 Executing query:', query);
        console.log('🔍 With values:', values);
        
        const result = await db.execute(query, values);
        
        console.log('✅ Client created successfully:', result);
        
        res.status(201).json({
            message: 'Client registered successfully',
            clientId: client_id || `CLT${Date.now().toString().slice(-6)}`,
            clientData: {
                client_type, full_name, company_name, phone_number, email_address
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating client:', error);
        res.status(500).json({ 
            error: 'Failed to create client',
            details: error.message
        });
    }
});

module.exports = router;
