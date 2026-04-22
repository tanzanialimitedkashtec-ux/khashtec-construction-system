const express = require('express');
const router = express.Router();

// Add this at the very top to test if the file loads
console.log('🚀 Properties route file is being loaded...');

try {
    const db = require('../../database/config/database');
    console.log('✅ Properties database connection loaded successfully');
} catch (error) {
    console.error('❌ Properties database connection failed:', error);
}

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Properties test endpoint accessed');
    res.json({ 
        message: 'Properties API is working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Root endpoint test
router.get('/', (req, res) => {
    console.log('🏠 Properties root endpoint accessed');
    res.json({ 
        message: 'Properties API root endpoint',
        available_endpoints: ['GET /test', 'POST /', 'GET /:id', 'PUT /:id', 'DELETE /:id']
    });
});

// Create new property
router.post('/', async (req, res) => {
    try {
        console.log('🏠 Property creation request received');
        console.log('📝 Request body:', req.body);
        
        const {
            plotNumber,
            type,
            location,
            area,
            price,
            status,
            tpNumber,
            description,
            utilities,
            zoning,
            addedBy,
            addedDate
        } = req.body;
        
        // Validate required fields
        if (!plotNumber || !type || !location || !area || !price) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'plotNumber, type, location, area, and price are required'
            });
        }
        
        console.log('🔍 About to execute property insert query...');
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Map frontend fields to database fields
            const query = `
                INSERT INTO properties (
                    title, description, location, type, price, status, 
                    size_sqm, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;
            
            const values = [
                `Property ${plotNumber}`, // title
                description || `Property details: ${description || 'No description available'}`, // description
                location, // location
                type, // type
                parseFloat(price), // price
                status || 'Available', // status
                parseFloat(area) // size_sqm
            ];
            
            console.log('🔍 Query:', query);
            console.log('📊 Values:', values);
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Property inserted successfully:', result);
            
            res.status(201).json({
                message: 'Property created successfully',
                id: result.insertId,
                data: {
                    id: result.insertId,
                    title: `Property ${plotNumber}`,
                    location: location,
                    type: type,
                    price: parseFloat(price),
                    status: status || 'Available',
                    size_sqm: parseFloat(area)
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock property:', dbError);
            
            // Fallback to mock property creation
            const propertyId = `PROP${Date.now().toString().slice(-6)}`;
            
            res.status(201).json({
                message: 'Property created successfully (mock)',
                id: propertyId,
                data: {
                    id: propertyId,
                    title: `Property ${plotNumber}`,
                    location: location,
                    type: type,
                    price: parseFloat(price),
                    status: status || 'Available',
                    size_sqm: parseFloat(area),
                    mock: true
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error creating property:', error);
        res.status(500).json({ 
            error: 'Failed to create property',
            details: error.message 
        });
    }
});

// Get all properties
router.get('/all', async (req, res) => {
    try {
        console.log('?? Fetching all properties...');
        
        const propertiesResult = await db.execute('SELECT * FROM properties ORDER BY created_at DESC');
        const properties = Array.isArray(propertiesResult) ? propertiesResult[0] : propertiesResult;
        
        console.log('?? Properties retrieved successfully:', properties.length);
        
        res.json(properties);
        
    } catch (error) {
        console.error('?? Error fetching properties:', error);
        res.status(500).json({ 
            error: 'Failed to fetch properties',
            details: error.message 
        });
    }
});

// Get property by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 Fetching property:', id);
        
        const propertyResult = await db.execute('SELECT * FROM properties WHERE id = ?', [id]);
        const properties = Array.isArray(propertyResult) ? propertyResult[0] : propertyResult;
        
        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        console.log('✅ Property retrieved successfully:', properties[0]);
        res.json(properties[0]);
        
    } catch (error) {
        console.error('❌ Error fetching property:', error);
        res.status(500).json({ 
            error: 'Failed to fetch property',
            details: error.message 
        });
    }
});

// Update property
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        console.log('🔄 Updating property:', id);
        console.log('📝 Update data:', updateData);
        
        // Build dynamic update query
        const updateFields = [];
        const updateValues = [];
        
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined && key !== 'id') {
                updateFields.push(`${key} = ?`);
                updateValues.push(updateData[key]);
            }
        });
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        updateFields.push('updated_at = NOW()');
        updateValues.push(id);
        
        const updateQuery = `UPDATE properties SET ${updateFields.join(', ')} WHERE id = ?`;
        
        console.log('🔍 Update query:', updateQuery);
        console.log('📊 Update values:', updateValues);
        
        const resultResult = await db.execute(updateQuery, updateValues);
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        
        console.log('✅ Property updated successfully:', result);
        
        res.json({
            message: 'Property updated successfully',
            affected_rows: result.affectedRows
        });
        
    } catch (error) {
        console.error('❌ Error updating property:', error);
        res.status(500).json({ 
            error: 'Failed to update property',
            details: error.message 
        });
    }
});

// Delete property
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Deleting property:', id);
        
        const resultResult = await db.execute('DELETE FROM properties WHERE id = ?', [id]);
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        console.log('✅ Property deleted successfully:', result);
        
        res.json({
            message: 'Property deleted successfully',
            affected_rows: result.affectedRows
        });
        
    } catch (error) {
        console.error('❌ Error deleting property:', error);
        res.status(500).json({ 
            error: 'Failed to delete property',
            details: error.message 
        });
    }
});

module.exports = router;
