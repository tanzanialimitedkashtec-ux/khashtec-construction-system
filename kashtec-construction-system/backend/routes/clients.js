const express = require('express');
const router = express.Router();

// Add this at the very top to test if the file loads
console.log('🚀 Clients route file is being loaded...');

try {
    const db = require('../../database/config/database');
    console.log('✅ Database connection loaded successfully');
} catch (error) {
    console.error('❌ Database connection failed:', error);
}

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
                details: 'client_type, full_name, phone_number, email_address, nida_number, and physical_address are required',
                received: { client_type, full_name, phone_number, email_address, nida_number, physical_address }
            });
        }
        
        console.log('🔍 About to execute client insert query...');
        
        // Insert client into clients table
        const query = `
            INSERT INTO clients (
                client_id, client_type, full_name, company_name, phone_number, 
                email_address, nida_number, tin_number, physical_address, 
                property_interest, budget_range, additional_notes, registered_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
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
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
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
        const [clients] = await db.execute('SELECT * FROM clients ORDER BY created_at DESC');
        res.json(clients);
    } catch (error) {
        console.error('❌ Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});

// Get client by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 Fetching client with ID:', id);
        
        const [client] = await db.execute('SELECT * FROM clients WHERE client_id = ?', [id]);
        
        if (client.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        res.json(client[0]);
    } catch (error) {
        console.error('❌ Error fetching client:', error);
        res.status(500).json({ error: 'Failed to fetch client' });
    }
});

// Update client
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        console.log('🔄 Updating client with ID:', id);
        console.log('📝 Updates:', updates);
        
        const [result] = await db.execute(
            'UPDATE clients SET ? WHERE client_id = ?',
            [updates, id]
        );
        
        console.log('✅ Client updated successfully:', result);
        
        res.json({
            message: 'Client updated successfully',
            affected_rows: result.affectedRows
        });
        
    } catch (error) {
        console.error('❌ Error updating client:', error);
        res.status(500).json({ 
            error: 'Failed to update client',
            details: error.message 
        });
    }
});

// Delete client
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Deleting client:', id);
        
        const resultResult = await db.execute('DELETE FROM clients WHERE id = ?', [id]);
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        console.log('✅ Client deleted successfully:', result);
        
        res.json({
            message: 'Client deleted successfully',
            affected_rows: result.affectedRows
        });
        
    } catch (error) {
        console.error('❌ Error deleting client:', error);
        res.status(500).json({ 
            error: 'Failed to delete client',
            details: error.message 
        });
    }
});

module.exports = router;
