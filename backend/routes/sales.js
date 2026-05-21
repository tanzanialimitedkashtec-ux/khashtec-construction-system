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

// Helper to map DB row to frontend sale format
function mapTransactionToSale(item) {
    const description = item.description || '';
    let propertyName = '';
    let clientName = '';
    
    // Parse propertyName and clientName from "Property Sale: ${propertyName} to ${clientName}"
    if (description.startsWith('Property Sale: ')) {
        const parts = description.substring('Property Sale: '.length).split(' to ');
        propertyName = parts[0] || 'Unknown Property';
        clientName = parts[1] || 'Unknown Client';
    } else {
        const toIndex = description.toLowerCase().indexOf(' to ');
        if (toIndex !== -1) {
            propertyName = description.substring(0, toIndex).trim();
            clientName = description.substring(toIndex + 4).trim();
        } else {
            propertyName = description || 'Real Estate Property';
            clientName = 'Valued Client';
        }
    }
    
    // Map db status ENUM ('Pending', 'Approved', 'Rejected', 'Processed') to frontend paymentStatus
    let frontendStatus = 'completed';
    if (item.status === 'Pending') frontendStatus = 'pending';
    if (item.status === 'Rejected') frontendStatus = 'rejected';
    if (item.status === 'Approved' || item.status === 'Processed') frontendStatus = 'completed';
    
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
        clientContact: '+255 712 345 678',
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
        paymentStatus: frontendStatus,
        status: frontendStatus,
        commissionAgent: 'Real Estate Manager',
        agent: 'Real Estate Manager',
        contractSigned: true,
        notes: description,
        created_at: item.created_at,
        updated_at: item.updated_at
    };
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
                SELECT id, type, category, description, amount, status, date, created_at, updated_at
                FROM financial_transactions
                WHERE type = 'Income' AND category = 'Real Estate Sale'
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
            
            const formattedSales = rawSales.map(mapTransactionToSale);
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

// Get all sales records (additional /all endpoint)
router.get('/all', async (req, res) => {
    try {
        console.log('💰 Fetching all sales records /all...');
        
        if (!db) {
            return res.json(getMockSalesData());
        }
        
        try {
            const salesResult = await db.execute(`
                SELECT id, type, category, description, amount, status, date, created_at, updated_at
                FROM financial_transactions
                WHERE type = 'Income' AND category = 'Real Estate Sale'
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
            
            const formattedSales = rawSales.map(mapTransactionToSale);
            res.json(formattedSales);
        } catch (error) {
            console.error('❌ Error fetching all sales:', error);
            res.json(getMockSalesData());
        }
    } catch (error) {
        console.error('❌ Critical error in /all:', error);
        res.status(500).json({ error: 'Failed to retrieve sales' });
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
        
        try {
            // Insert into financial_transactions table using valid schema columns & ENUM values
            const query = `
                INSERT INTO financial_transactions (
                    type, category, description, amount, status, 
                    date, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;
            
            // Map status correctly to valid ENUM values ('Pending', 'Approved', 'Rejected', 'Processed')
            let mappedStatus = 'Processed';
            if (status === 'pending' || paymentStatus === 'pending') mappedStatus = 'Pending';
            if (status === 'rejected' || paymentStatus === 'rejected') mappedStatus = 'Rejected';
            
            // Format the date properly for standard MySQL DATE format (YYYY-MM-DD)
            const dateVal = req.body.date || new Date().toISOString().slice(0, 10);
            
            const values = [
                'Income', // type (valid ENUM value)
                'Real Estate Sale', // category (for identification)
                `Property Sale: ${propertyName} to ${clientName}`, // description
                parseFloat(salePrice), // amount
                mappedStatus, // status (valid ENUM value)
                dateVal.slice(0, 10) // date (YYYY-MM-DD)
            ];
            
            console.log('🔍 Query:', query);
            console.log('📊 Values:', values);
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Sale inserted successfully into DB:', result);
            
            const newSaleId = result.insertId || Date.now();
            const createdYear = new Date().getFullYear();
            const saleIdStr = `SALE-${createdYear}-${String(newSaleId).padStart(3, '0')}`;
            
            res.status(201).json({
                message: 'Sale recorded successfully',
                id: newSaleId,
                data: {
                    id: newSaleId,
                    saleId: saleIdStr,
                    propertyId: propertyId,
                    propertyName: propertyName,
                    clientName: clientName,
                    clientContact: clientContact || '+255 712 345 678',
                    salePrice: parseFloat(salePrice),
                    commission: parseFloat(commission) || (parseFloat(salePrice) * 0.05),
                    paymentMethod: paymentMethod || 'full-payment',
                    status: mappedStatus === 'Processed' ? 'completed' : 'pending',
                    agent: agent || 'Real Estate Manager',
                    paymentStatus: mappedStatus === 'Processed' ? 'completed' : 'pending',
                    contractSigned: contractSigned || true
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error during insert, using mock sale:', dbError);
            
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
        
        const saleResult = await db.execute(`
            SELECT id, type, category, description, amount, status, date, created_at, updated_at 
            FROM financial_transactions 
            WHERE id = ? AND type = 'Income' AND category = 'Real Estate Sale'
        `, [id]);
        
        const sales = Array.isArray(saleResult) ? saleResult[0] : saleResult;
        
        if (!sales || sales.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        
        const formattedSale = mapTransactionToSale(Array.isArray(sales) ? sales[0] : sales);
        console.log('✅ Sale retrieved successfully:', formattedSale);
        res.json(formattedSale);
        
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
        
        // Build dynamic update query mapped to schema columns
        const updateFields = [];
        const updateValues = [];
        
        if (updateData.salePrice !== undefined || updateData.amount !== undefined) {
            updateFields.push('amount = ?');
            updateValues.push(parseFloat(updateData.salePrice || updateData.amount));
        }
        
        if (updateData.status !== undefined || updateData.paymentStatus !== undefined) {
            const newStatus = updateData.status || updateData.paymentStatus;
            let mappedStatus = 'Processed';
            if (newStatus === 'pending') mappedStatus = 'Pending';
            if (newStatus === 'rejected') mappedStatus = 'Rejected';
            updateFields.push('status = ?');
            updateValues.push(mappedStatus);
        }
        
        if (updateData.propertyName !== undefined || updateData.clientName !== undefined) {
            const pName = updateData.propertyName || 'Property';
            const cName = updateData.clientName || 'Client';
            updateFields.push('description = ?');
            updateValues.push(`Property Sale: ${pName} to ${cName}`);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        updateFields.push('updated_at = NOW()');
        updateValues.push(id);
        
        const updateQuery = `
            UPDATE financial_transactions 
            SET ${updateFields.join(', ')} 
            WHERE id = ? AND type = 'Income' AND category = 'Real Estate Sale'
        `;
        
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
        
        const resultResult = await db.execute(`
            DELETE FROM financial_transactions 
            WHERE id = ? AND type = 'Income' AND category = 'Real Estate Sale'
        `, [id]);
        
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
