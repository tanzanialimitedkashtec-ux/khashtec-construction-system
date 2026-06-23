const express = require('express');
const router = express.Router();

// Add this at the very top to test if the file loads
console.log('🚀 Properties route file is being loaded...');

let db;
try {
    db = require('../../database/config/database');
    console.log('✅ Properties database connection loaded successfully');
    // Ensure optional property detail columns exist
    db.query("ALTER TABLE properties ADD COLUMN IF NOT EXISTS utilities TEXT")
        .then(() => console.log('✅ Properties utilities column ensured'))
        .catch(err => console.warn('⚠️ Utilities column check:', err.message));
    db.query("ALTER TABLE properties ADD COLUMN IF NOT EXISTS zoning VARCHAR(50) DEFAULT 'residential'")
        .then(() => console.log('✅ Properties zoning column ensured'))
        .catch(err => console.warn('⚠️ Zoning column check:', err.message));
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
            plotNumber: plotNumberRaw,
            propertyName,
            type: typeRaw,
            propertyType,
            location,
            area: areaRaw,
            size,
            price: priceRaw,
            value,
            status,
            tpNumber,
            description,
            utilities,
            zoning,
            addedBy,
            addedDate,
            owner,
            contactInfo
        } = req.body;
        
        // Support both field naming conventions
        const plotNumber = plotNumberRaw || propertyName;
        const type = typeRaw || propertyType;
        const area = areaRaw || size;
        const price = priceRaw || value;
        
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
            await db.query("ALTER TABLE properties ADD COLUMN IF NOT EXISTS utilities TEXT")
                .catch(err => console.warn('⚠️ Utilities column check:', err.message));
            await db.query("ALTER TABLE properties ADD COLUMN IF NOT EXISTS zoning VARCHAR(50) DEFAULT 'residential'")
                .catch(err => console.warn('⚠️ Zoning column check:', err.message));
            
            // Map frontend property types to database ENUM values
            const typeMapping = {
                'residential': 'Residential',
                'commercial': 'Commercial', 
                'industrial': 'Industrial',
                'agricultural': 'Land',
                'land': 'Land',
                'mixed-use': 'Mixed Use'
            };
            
            const mappedType = typeMapping[type.toLowerCase()] || 'Residential';
            
            console.log('DEBUG: Original type:', type, '-> Mapped type:', mappedType);
            
            // Map frontend status to database ENUM values
            const statusMapping = {
                'available': 'Available',
                'sold': 'Sold',
                'reserved': 'Under Offer',
                'under-offer': 'Under Offer',
                'under offer': 'Under Offer',
                'under-development': 'Off Market',
                'under development': 'Off Market',
                'rented': 'Rented',
                'off-market': 'Off Market',
                'off market': 'Off Market'
            };
            
            const mappedStatus = statusMapping[String(status || '').trim().toLowerCase()] || 'Available';
            
            console.log('DEBUG: Original status:', status, '-> Mapped status:', mappedStatus);
            
            const utilitiesStr = Array.isArray(utilities) ? JSON.stringify(utilities) : (utilities || '[]');

            // Map frontend fields to database fields
            const query = `
                INSERT INTO properties (
                    title, description, location, type, price, status, 
                    size_sqm, utilities, zoning, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;
            
            const values = [
                `Property ${plotNumber}`, // title
                description || `Property details: ${description || 'No description available'}`, // description
                location, // location
                mappedType, // mapped type
                parseFloat(price), // price
                mappedStatus, // mapped status
                parseFloat(area), // size_sqm
                utilitiesStr, // utilities
                zoning || 'residential' // zoning
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
                    size_sqm: parseFloat(area),
                    utilities: utilitiesStr,
                    zoning: zoning || 'residential'
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error:', dbError);
            res.status(500).json({ success: false, error: 'Database error', details: dbError.message || dbError });
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
        console.log('🏠 Fetching all properties...');
        
        if (!db) {
            console.log('⚠️ Database not available');
            return res.status(500).json({ success: false, error: 'Database error', details: 'Database not connected' });
        }
        
        const propertiesResult = await db.execute('SELECT * FROM properties ORDER BY created_at DESC');
        const properties = Array.isArray(propertiesResult) ? propertiesResult[0] : propertiesResult;
        
        console.log('✅ Properties retrieved successfully:', properties.length);
        
        res.json(properties);
        
    } catch (error) {
        console.error('❌ Error fetching properties:', error);
        
        res.status(500).json({ success: false, error: 'Database error', details: error.message || error });
    }
});

// Get property by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 Fetching property:', id);
        
        const propertyResult = await db.execute('SELECT * FROM properties WHERE id = ?', [id]);
        const properties = Array.isArray(propertyResult)
            ? (Array.isArray(propertyResult[0]) ? propertyResult[0] : propertyResult)
            : (propertyResult && propertyResult.rows ? propertyResult.rows : []);
        
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
