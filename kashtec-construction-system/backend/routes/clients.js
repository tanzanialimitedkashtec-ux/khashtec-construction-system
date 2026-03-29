const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Clients test endpoint accessed');
    res.json({ 
        message: 'Clients API is working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Create new client
router.post('/', async (req, res) => {
    try {
        console.log('👥 Client registration request received');
        console.log('📝 Request body:', req.body);
        
        const {
            client_id,
            client_type,
            full_name,
            company_name,
            phone_number,
            email_address,
            nida_number,
            tin_number,
            physical_address,
            property_interest,
            budget_range,
            additional_notes,
            registered_by
        } = req.body;
        
        // Validate required fields
        if (!client_id || !client_type || !full_name || !phone_number || !email_address || !nida_number || !physical_address) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'client_id, client_type, full_name, phone_number, email_address, nida_number, and physical_address are required'
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
            client_id, client_type, full_name, company_name, phone_number,
            email_address, nida_number, tin_number, physical_address,
            property_interest, budget_range, additional_notes, registered_by
        ];
        
        console.log('🔍 Query:', query);
        console.log('📊 Values:', values);
        
        const resultResult = await db.execute(query, values);
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        
        console.log('✅ Client inserted successfully:', result);
        
        res.status(201).json({
            message: 'Client registered successfully',
            id: result.insertId,
            client_id: client_id,
            data: {
                id: result.insertId,
                client_id: client_id,
                client_type: client_type,
                full_name: full_name,
                phone_number: phone_number,
                email_address: email_address
            }
        });
        
    } catch (error) {
        console.error('❌ Error registering client:', error);
        
        // Check for duplicate client_id
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Client ID already exists',
                details: 'Please use a different client ID'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to register client',
            details: error.message 
        });
    }
});

// Get all clients
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching all clients...');
        
        const clientsResult = await db.execute('SELECT * FROM clients ORDER BY registration_date DESC');
        const clients = Array.isArray(clientsResult) ? clientsResult[0] : clientsResult;
        
        console.log('✅ Clients retrieved successfully:', clients.length);
        
        res.json(clients);
        
    } catch (error) {
        console.error('❌ Error fetching clients:', error);
        res.status(500).json({ 
            error: 'Failed to fetch clients',
            details: error.message 
        });
    }
});

// Get client by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 Fetching client:', id);
        
        const clientResult = await db.execute('SELECT * FROM clients WHERE id = ?', [id]);
        const clients = Array.isArray(clientResult) ? clientResult[0] : clientResult;
        
        if (clients.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        console.log('✅ Client retrieved successfully:', clients[0]);
        res.json(clients[0]);
        
    } catch (error) {
        console.error('❌ Error fetching client:', error);
        res.status(500).json({ 
            error: 'Failed to fetch client',
            details: error.message 
        });
    }
});

// Update client
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        console.log('🔄 Updating client:', id);
        console.log('📝 Update data:', updateData);
        
        // Build dynamic update query
        const updateFields = [];
        const updateValues = [];
        
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined && key !== 'id' && key !== 'client_id') {
                updateFields.push(`${key} = ?`);
                updateValues.push(updateData[key]);
            }
        });
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        updateValues.push(id);
        
        const updateQuery = `UPDATE clients SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        console.log('🔍 Update query:', updateQuery);
        console.log('📊 Update values:', updateValues);
        
        const resultResult = await db.execute(updateQuery, updateValues);
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        
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
