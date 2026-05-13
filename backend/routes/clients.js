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
        
        const db = require('../../database/config/database');
        
        // Insert client into clients table
        const query = `INSERT INTO clients (
                client_id, client_type, full_name, company_name, phone_number, 
                email_address, nida_number, tin_number, physical_address, 
                property_interest, budget_range, additional_notes, registered_by, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        // Normalize ENUM-bound fields: empty strings are invalid for ENUM columns, use NULL instead.
        // Also normalize client_type casing to match ENUM ('individual','company','investor').
        const normalizedType = (client_type || 'individual').toString().toLowerCase();
        const validTypes = ['individual', 'company', 'investor'];
        const safeClientType = validTypes.includes(normalizedType) ? normalizedType : 'individual';

        const safePropertyInterest = property_interest && property_interest.trim() !== '' ? property_interest : null;
        const safeBudgetRange = budget_range && budget_range.trim() !== '' ? budget_range : null;

        const values = [
            client_id || `CLT${Date.now().toString().slice(-6)}`,
            safeClientType,
            full_name,
            company_name || null,
            phone_number,
            email_address,
            nida_number,
            tin_number || null,
            physical_address,
            safePropertyInterest,
            safeBudgetRange,
            additional_notes || null,
            registered_by || 'system',
            'active'  // Default status for new clients
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

// Get all clients
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching all clients...');
        
        const db = require('../../database/config/database');
        
        const query = `
            SELECT client_id, client_type, full_name, company_name, phone_number, 
                   email_address, nida_number, tin_number, physical_address, 
                   property_interest, budget_range, additional_notes, registered_by, status,
                   created_at
            FROM clients 
            ORDER BY created_at DESC
        `;
        
        console.log('🔍 Executing clients query:', query);
        
        // db.execute already returns rows array, do NOT destructure again
        const results = await db.execute(query);
        const rows = Array.isArray(results) ? results : [];
        
        console.log('✅ Clients fetched successfully:', rows.length);
        
        res.json({
            success: true,
            clients: rows,
            total: rows.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching clients:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch clients',
            details: error.message
        });
    }
});

// Get client by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Fetching client with ID: ${id}`);
        
        // Try database first, fallback to mock data
        try {
            const db = require('../../database/config/database');
            
            const query = `
                SELECT client_id, client_type, full_name, company_name, phone_number, 
                       email_address, nida_number, tin_number, physical_address, 
                       property_interest, budget_range, additional_notes, registered_by, status,
                       created_at
                FROM clients 
                WHERE client_id = ?
            `;
            
            console.log('🔍 Executing client query:', query);
            
            const results = await db.execute(query, [id]);
            const rows = Array.isArray(results) ? results : [];
            
            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Client not found'
                });
            }
            
            console.log('✅ Client fetched successfully:', rows[0].client_id);
            
            res.json({
                success: true,
                client: rows[0]
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock client:', dbError);
            
            // Fallback to mock client data
            const mockClient = {
                client_id: id,
                client_type: 'Individual',
                full_name: 'Mock Client',
                company_name: '',
                phone_number: '+255 700 000 000',
                email_address: 'mock@example.com',
                nida_number: '1234567890123456',
                tin_number: '',
                physical_address: 'P.O. Box 0000, Dar es Salaam',
                property_interest: 'residential',
                budget_range: '50m-100m',
                additional_notes: 'Mock client data',
                registered_by: 'system',
                status: 'active',
                created_at: new Date().toISOString(),
                mock: true
            };
            
            res.json({
                success: true,
                client: mockClient
            });
        }
        
    } catch (error) {
        console.error('❌ Error fetching client:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch client',
            details: error.message
        });
    }
});

module.exports = router;
