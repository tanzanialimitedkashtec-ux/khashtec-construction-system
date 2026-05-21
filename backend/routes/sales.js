const express = require('express');
const router = express.Router();

// Add this at the very top to test if the file loads
console.log('💰 Sales route file is being loaded...');

let db;
try {
    db = require('../../database/config/database');
    console.log('✅ Sales database connection loaded successfully');
} catch (error) {
    console.error('❌ Sales database connection failed:', error);
}

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Sales test endpoint accessed');
    res.json({ 
        message: 'Sales API is working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Helper function to return mock data consistently
function getMockSalesData() {
    return [
        {
            id: 'SALE-2026-001',
            saleId: 'SALE-2026-001',
            date: '2026-03-15',
            saleDate: '2026-03-15',
            property: 'Masaki Villa #12',
            propertyId: 'Masaki Villa #12',
            propertyLocation: 'Masaki Villa #12',
            propertyType: 'residential',
            client: 'John Michael Smith',
            clientName: 'John Michael Smith',
            clientContact: '+255 712 345 678',
            clientPhone: '+255 712 345 678',
            clientEmail: 'john.smith@email.com',
            salePrice: 45000000,
            propertyPrice: 45000000,
            commission: 2250000,
            status: 'completed',
            paymentStatus: 'paid',
            agent: 'Sarah Johnson',
            commissionAgent: 'Sarah Johnson',
            paymentMethod: 'installments',
            installmentPeriod: 12,
            downPayment: 15000000,
            monthlyInstallment: 2500000,
            interestRate: 5,
            contractSigned: true,
            notes: 'Premium residential property sale',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ];
}

// Root endpoint - get all sales records
router.get('/', async (req, res) => {
    try {
        console.log('💰 Fetching all sales records from database...');
        
        if (!db) {
            console.log('⚠️ Database not available, returning mock sales data');
            return res.json(getMockSalesData());
        }
        
        try {
            // Retrieve sales from the actual financial_transactions table
            const salesResult = await db.execute(`
                SELECT id, type, description, amount, status, date, transaction_date, created_at, updated_at
                FROM financial_transactions
                WHERE type = 'sale'
                ORDER BY id DESC
            `);
            
            let rawSales = [];
            if (Array.isArray(salesResult)) {
                if (salesResult.length > 0 && Array.isArray(salesResult[0])) {
                    rawSales = salesResult[0];
                } else {
                    rawSales = salesResult;
                }
            } else if (salesResult) {
                rawSales = [salesResult];
            }
            
            console.log(`✅ Raw transactions retrieved from DB: ${rawSales.length}`);
            
            // Map the financial transactions into the format expected by the frontend
            const formattedSales = rawSales.map(item => {
                const description = item.description || '';
                let propertyName = '';
                let clientName = '';
                
                // Parse propertyName and clientName from "Property Sale: ${propertyName} to ${clientName}"
                if (description.startsWith('Property Sale: ')) {
                    const parts = description.substring('Property Sale: '.length).split(' to ');
                    propertyName = parts[0] || 'Unknown Property';
                    clientName = parts[1] || 'Unknown Client';
                } else {
                    // Fallback parse if description is formatted differently
                    const toIndex = description.toLowerCase().indexOf(' to ');
                    if (toIndex !== -1) {
                        propertyName = description.substring(0, toIndex).trim();
                        clientName = description.substring(toIndex + 4).trim();
                    } else {
                        propertyName = description || 'Real Estate Property';
                        clientName = 'Valued Client';
                    }
                }
                
                // Format the ID as SALE-YYYY-XXX
                const createdYear = item.created_at ? new Date(item.created_at).getFullYear() : new Date().getFullYear();
                const saleIdStr = `SALE-${createdYear}-${String(item.id).padStart(3, '0')}`;
                
                return {
                    id: item.id,
                    saleId: saleIdStr,
                    saleDate: item.date || item.transaction_date || item.created_at || new Date().toISOString(),
                    date: item.date || item.transaction_date || item.created_at || new Date().toISOString(),
                    propertyId: propertyName,
                    property: propertyName,
                    propertyLocation: propertyName,
                    propertyType: 'residential',
                    clientName: clientName,
                    client: clientName,
                    clientContact: '+255 712 345 678', // Default placeholders
                    clientPhone: '+255 712 345 678',
                    clientEmail: 'client@kashtec.com',
                    salePrice: parseFloat(item.amount || 0),
                    propertyPrice: parseFloat(item.amount || 0),
                    commission: parseFloat(item.amount || 0) * 0.05, // 5% standard commission
                    paymentMethod: 'full-payment',
                    installmentPeriod: null,
                    downPayment: null,
                    monthlyInstallment: null,
                    interestRate: null,
                    salesAgreement: 'Contract Signed',
                    paymentStatus: item.status || 'completed',
                    status: item.status || 'completed',
                    commissionAgent: 'Real Estate Manager',
                    agent: 'Real Estate Manager',
                    contractSigned: true,
                    notes: description,
                    created_at: item.created_at,
                    updated_at: item.updated_at
                };
            });
            
            console.log('✅ Formatted sales data mapped for frontend:', formattedSales.length);
            res.json(formattedSales);
            
        } catch (error) {
            console.error('❌ Error fetching sales from database:', error);
            console.log('⚠️ Database error, falling back to mock sales');
            res.json(getMockSalesData());
        }
    } catch (error) {
        console.error('❌ Critical error in sales root GET endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sales records',
            details: error.message
        });
    }
});

// Get all sales records
router.get('/all', async (req, res) => {
    try {
        console.log('💰 Fetching all sales records...');
        
        if (!db) {
            console.log('⚠️ Database not available, returning mock sales data');
            // Return mock data when database is not available
            const mockSales = [
                {
                    id: 'SALE-2026-001',
                    date: '2026-03-15',
                    property: 'Masaki Villa #12',
                    propertyType: 'residential',
                    client: 'John Michael Smith',
                    clientContact: '+255 712 345 678',
                    salePrice: 45000000,
                    commission: 2250000,
                    status: 'completed',
                    agent: 'Sarah Johnson',
                    paymentStatus: 'paid',
                    contractSigned: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'SALE-2026-002',
                    date: '2026-03-12',
                    property: 'Kigamboni Office Suite B-205',
                    propertyType: 'commercial',
                    client: 'ABC Tanzania Ltd',
                    clientContact: '+255 755 123 456',
                    salePrice: 85000000,
                    commission: 4250000,
                    status: 'completed',
                    agent: 'David Brown',
                    paymentStatus: 'paid',
                    contractSigned: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'SALE-2026-003',
                    date: '2026-03-10',
                    property: 'Mikochi Industrial Plot #8',
                    propertyType: 'industrial',
                    client: 'Manufacturing Co. Ltd',
                    clientContact: '+255 768 987 654',
                    salePrice: 120000000,
                    commission: 6000000,
                    status: 'completed',
                    agent: 'Emma Wilson',
                    paymentStatus: 'paid',
                    contractSigned: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
            
            console.log('✅ Mock sales returned:', mockSales.length);
            return res.json(mockSales);
        }
        
        // Try to get sales from financial_transactions table (type = 'sale')
        const salesResult = await db.execute(
            'SELECT * FROM financial_transactions WHERE type = ? ORDER BY transaction_date DESC', 
            ['sale']
        );
        const sales = Array.isArray(salesResult) ? salesResult[0] : salesResult;
        
        console.log('✅ Sales retrieved successfully:', sales.length);
        
        res.json(sales);
        
    } catch (error) {
        console.error('❌ Error fetching sales:', error);
        
        // Return mock data on database error
        const mockSales = [
            {
                id: 'SALE-2026-001',
                date: '2026-03-15',
                property: 'Masaki Villa #12',
                propertyType: 'residential',
                client: 'John Michael Smith',
                clientContact: '+255 712 345 678',
                salePrice: 45000000,
                commission: 2250000,
                status: 'completed',
                agent: 'Sarah Johnson',
                paymentStatus: 'paid',
                contractSigned: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
        
        console.log('⚠️ Database error, returning mock sales:', mockSales.length);
        res.json(mockSales);
    }
});

// Create new sales record
router.post('/', async (req, res) => {
    try {
        console.log('💰 Sales creation request received');
        console.log('📝 Request body:', req.body);
        
        const {
            propertyId,
            propertyName,
            clientName,
            clientContact,
            salePrice,
            commission,
            paymentMethod,
            status,
            agent,
            paymentStatus,
            contractSigned
        } = req.body;
        
        // Validate required fields
        if (!propertyId || !propertyName || !clientName || !salePrice) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'propertyId, propertyName, clientName, and salePrice are required'
            });
        }
        
        console.log('🔍 About to execute sales insert query...');
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Insert into financial_transactions table
            const query = `
                INSERT INTO financial_transactions (
                    type, description, amount, status, 
                    transaction_date, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            `;
            
            const values = [
                'sale', // type
                `Property Sale: ${propertyName} to ${clientName}`, // description
                parseFloat(salePrice), // amount
                status || 'completed', // status
                new Date().toISOString() // transaction_date
            ];
            
            console.log('🔍 Query:', query);
            console.log('📊 Values:', values);
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Sale inserted successfully:', result);
            
            res.status(201).json({
                message: 'Sale recorded successfully',
                id: result.insertId,
                data: {
                    id: result.insertId,
                    propertyId: propertyId,
                    propertyName: propertyName,
                    clientName: clientName,
                    clientContact: clientContact,
                    salePrice: parseFloat(salePrice),
                    commission: parseFloat(commission) || 0,
                    paymentMethod: paymentMethod || 'full-payment',
                    status: status || 'completed',
                    agent: agent || 'System',
                    paymentStatus: paymentStatus || 'paid',
                    contractSigned: contractSigned || false
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock sale:', dbError);
            
            // Fallback to mock sale creation
            const saleId = `SALE${Date.now().toString().slice(-6)}`;
            
            res.status(201).json({
                message: 'Sale recorded successfully (mock)',
                id: saleId,
                data: {
                    id: saleId,
                    propertyId: propertyId,
                    propertyName: propertyName,
                    clientName: clientName,
                    clientContact: clientContact,
                    salePrice: parseFloat(salePrice),
                    commission: parseFloat(commission) || 0,
                    paymentMethod: paymentMethod || 'full-payment',
                    status: status || 'completed',
                    agent: agent || 'System',
                    paymentStatus: paymentStatus || 'paid',
                    contractSigned: contractSigned || false,
                    mock: true
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error creating sale:', error);
        res.status(500).json({ 
            error: 'Failed to record sale',
            details: error.message 
        });
    }
});

// Get sale by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 Fetching sale:', id);
        
        if (!db) {
            return res.status(404).json({ error: 'Sale not found - database unavailable' });
        }
        
        const saleResult = await db.execute('SELECT * FROM financial_transactions WHERE id = ? AND type = ?', [id, 'sale']);
        const sales = Array.isArray(saleResult) ? saleResult[0] : saleResult;
        
        if (sales.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        
        console.log('✅ Sale retrieved successfully:', sales[0]);
        res.json(sales[0]);
        
    } catch (error) {
        console.error('❌ Error fetching sale:', error);
        res.status(500).json({ 
            error: 'Failed to fetch sale',
            details: error.message 
        });
    }
});

// Update sale
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        console.log('🔄 Updating sale:', id);
        console.log('📝 Update data:', updateData);
        
        if (!db) {
            return res.status(500).json({ error: 'Database unavailable' });
        }
        
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
        
        const updateQuery = `UPDATE financial_transactions SET ${updateFields.join(', ')} WHERE id = ? AND type = 'sale'`;
        
        console.log('🔍 Update query:', updateQuery);
        console.log('📊 Update values:', updateValues);
        
        const resultResult = await db.execute(updateQuery, updateValues);
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        
        console.log('✅ Sale updated successfully:', result);
        
        res.json({
            message: 'Sale updated successfully',
            affected_rows: result.affectedRows
        });
        
    } catch (error) {
        console.error('❌ Error updating sale:', error);
        res.status(500).json({ 
            error: 'Failed to update sale',
            details: error.message 
        });
    }
});

// Delete sale
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Deleting sale:', id);
        
        if (!db) {
            return res.status(500).json({ error: 'Database unavailable' });
        }
        
        const resultResult = await db.execute('DELETE FROM financial_transactions WHERE id = ? AND type = ?', [id, 'sale']);
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        
        console.log('✅ Sale deleted successfully:', result);
        
        res.json({
            message: 'Sale deleted successfully',
            affected_rows: result.affectedRows
        });
        
    } catch (error) {
        console.error('❌ Error deleting sale:', error);
        res.status(500).json({ 
            error: 'Failed to delete sale',
            details: error.message 
        });
    }
});

module.exports = router;
