const express = require('express');
const router = express.Router();

console.log('🚀 Luggage Campaigns route file is being loaded...');

// Helper to get DB and ensure table has correct columns
async function getDb() {
    const db = require('../../database/config/database');

    // Create table if it doesn't exist (with correct schema)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS luggage_campaigns (
            id INT AUTO_INCREMENT PRIMARY KEY,
            campaign_name VARCHAR(255) NOT NULL DEFAULT '',
            luggage_name VARCHAR(255) NOT NULL DEFAULT '',
            luggage_code VARCHAR(20) NOT NULL DEFAULT '',
            price_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            total_units INT NOT NULL DEFAULT 0,
            units_sold INT NOT NULL DEFAULT 0,
            description TEXT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            status ENUM('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning',
            created_by VARCHAR(100) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_dates (start_date, end_date)
        )
    `);

    // Add missing columns to existing tables — works on MySQL 5.7 AND 8.0.
    // "ADD COLUMN IF NOT EXISTS" is MySQL 8.0+ only, so we check INFORMATION_SCHEMA first.
    const columnsToAdd = [
        { name: 'luggage_name',   sql: "ALTER TABLE luggage_campaigns ADD COLUMN luggage_name VARCHAR(255) NOT NULL DEFAULT '' AFTER campaign_name" },
        { name: 'luggage_code',   sql: "ALTER TABLE luggage_campaigns ADD COLUMN luggage_code VARCHAR(20) NOT NULL DEFAULT '' AFTER luggage_name" },
        { name: 'price_per_unit', sql: "ALTER TABLE luggage_campaigns ADD COLUMN price_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0.00" },
        { name: 'total_units',    sql: "ALTER TABLE luggage_campaigns ADD COLUMN total_units INT NOT NULL DEFAULT 0" },
        { name: 'units_sold',     sql: "ALTER TABLE luggage_campaigns ADD COLUMN units_sold INT NOT NULL DEFAULT 0" }
    ];
    for (const col of columnsToAdd) {
        try {
            const existing = await db.execute(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'luggage_campaigns' AND COLUMN_NAME = ?`,
                [col.name]
            );
            if (!existing || existing.length === 0) {
                await db.execute(col.sql);
                console.log(`✅ Migration: added column '${col.name}' to luggage_campaigns`);
            }
        } catch (e) {
            console.warn(`⚠️ Migration warning for column '${col.name}':`, e.message);
        }
    }

    return db;
}

// Test endpoint
router.get('/test', (req, res) => {
    res.json({
        message: 'Luggage Campaigns API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully'
    });
});

// GET all campaigns
router.get('/', async (req, res) => {
    try {
        console.log('📝 Fetching all luggage campaigns from database');
        const db = await getDb();

        // db.execute() returns the rows array directly (already unwrapped by Database class)
        const rows = await db.execute('SELECT * FROM luggage_campaigns ORDER BY created_at DESC');

        console.log(`✅ Found ${rows.length} campaign(s)`);
        res.json({ success: true, campaigns: rows, total: rows.length });
    } catch (error) {
        console.error('❌ Error fetching campaigns:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch luggage campaigns',
            details: error.message
        });
    }
});

// GET active campaigns
router.get('/active', async (req, res) => {
    try {
        const db = await getDb();
        const rows = await db.execute("SELECT * FROM luggage_campaigns WHERE status = 'active' ORDER BY start_date ASC");
        res.json({ success: true, campaigns: rows, total: rows.length });
    } catch (error) {
        console.error('❌ Error fetching active campaigns:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch active campaigns',
            details: error.message
        });
    }
});

// GET single campaign by ID
router.get('/:id', async (req, res) => {
    try {
        const db = await getDb();
        const rows = await db.execute('SELECT * FROM luggage_campaigns WHERE id = ?', [req.params.id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Campaign not found' });
        }
        res.json({ success: true, campaign: rows[0] });
    } catch (error) {
        console.error('❌ Error fetching campaign:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch campaign',
            details: error.message
        });
    }
});

// POST create campaign
router.post('/', async (req, res) => {
    try {
        console.log('📝 Creating new luggage campaign, body:', req.body);

        const {
            campaign_name,
            luggage_name,
            luggage_code,
            price_per_unit,
            total_units,
            description,
            campaign_description,
            start_date,
            end_date,
            status,
            created_by
        } = req.body;

        // Support both new and legacy field names from the frontend form
        const finalCampaignName = campaign_name || '';
        const finalLuggageName = luggage_name || req.body.target_luggage || '';
        const finalLuggageCode = luggage_code ||
            (finalLuggageName ? finalLuggageName.substring(0, 3).toUpperCase() : 'UNK');
        const finalPrice = parseFloat(price_per_unit || req.body.budget || 0);
        const finalUnits = parseInt(total_units || req.body.total_units_available || 0);
        const finalDesc = campaign_description || description || null;

        if (!finalCampaignName || !finalLuggageName || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: campaign_name, luggage_name, start_date, end_date'
            });
        }

        const db = await getDb();

        // db.execute() returns rows directly — for INSERT it returns a ResultSetHeader object
        const result = await db.execute(
            `INSERT INTO luggage_campaigns
                (campaign_name, luggage_name, luggage_code, price_per_unit, total_units, units_sold, description, start_date, end_date, status, created_by)
             VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
            [finalCampaignName, finalLuggageName, finalLuggageCode, finalPrice, finalUnits, finalDesc, start_date, end_date, status || 'planning', created_by || null]
        );

        const insertId = result.insertId;
        const createdRows = await db.execute('SELECT * FROM luggage_campaigns WHERE id = ?', [insertId]);

        console.log('✅ Campaign created, ID:', insertId);
        res.status(201).json({
            success: true,
            message: 'Luggage campaign created successfully',
            campaignId: insertId,
            campaign: createdRows[0]
        });

    } catch (error) {
        console.error('❌ Error creating campaign:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create campaign',
            details: error.message
        });
    }
});

// PUT update campaign
router.put('/:id', async (req, res) => {
    try {
        const campaignId = req.params.id;
        const updateData = req.body;

        const allowedFields = [
            'campaign_name', 'luggage_name', 'luggage_code', 'price_per_unit',
            'total_units', 'units_sold', 'description', 'start_date', 'end_date', 'status', 'created_by'
        ];
        const updateFields = [];
        const updateValues = [];

        allowedFields.forEach(key => {
            if (updateData[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updateData[key]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
        }

        updateValues.push(campaignId);
        const db = await getDb();
        const result = await db.execute(
            `UPDATE luggage_campaigns SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            updateValues
        );

        console.log('✅ Campaign updated:', campaignId);
        res.json({
            success: true,
            message: 'Campaign updated successfully',
            affected_rows: result.affectedRows
        });

    } catch (error) {
        console.error('❌ Error updating campaign:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update campaign',
            details: error.message
        });
    }
});

// DELETE campaign
router.delete('/:id', async (req, res) => {
    try {
        const campaignId = req.params.id;
        const db = await getDb();

        const existing = await db.execute('SELECT campaign_name FROM luggage_campaigns WHERE id = ?', [campaignId]);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, error: 'Campaign not found' });
        }

        await db.execute('DELETE FROM luggage_campaigns WHERE id = ?', [campaignId]);

        console.log('✅ Campaign deleted:', campaignId);
        res.json({
            success: true,
            message: 'Campaign deleted successfully',
            deleted_campaign: { id: campaignId, campaign_name: existing[0].campaign_name }
        });

    } catch (error) {
        console.error('❌ Error deleting campaign:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete campaign',
            details: error.message
        });
    }
});

module.exports = router;
