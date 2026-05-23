const express = require('express');
const router = express.Router();

console.log('🚀 Luggage Campaigns route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Luggage Campaigns test endpoint accessed');
    res.json({ 
        message: 'Luggage Campaigns API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully',
        debug: 'Luggage Campaigns routes are loaded and responding'
    });
});

// Root endpoint - get all luggage campaigns
router.get('/', async (req, res) => {
    try {
        console.log('📝 Luggage Campaigns root endpoint accessed');
        
        let campaigns = [];
        
        try {
            const db = require('../../database/config/database');
            
            // Ensure luggage_campaigns table exists
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS luggage_campaigns (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        campaign_name VARCHAR(255) NOT NULL,
                        target_luggage VARCHAR(100) NOT NULL,
                        description TEXT NULL,
                        start_date DATE NOT NULL,
                        end_date DATE NOT NULL,
                        status ENUM('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning',
                        target_audience VARCHAR(255) NULL,
                        budget DECIMAL(10,2) NULL,
                        actual_cost DECIMAL(10,2) NULL,
                        participants_count INT DEFAULT 0,
                        completion_rate DECIMAL(5,2) DEFAULT 0.00,
                        created_by VARCHAR(100) NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_status (status),
                        INDEX idx_dates (start_date, end_date)
                    )
                `);
                console.log('✅ Luggage Campaigns table verified/created successfully');
            } catch (tableError) {
                console.log('⚠️ Could not create luggage_campaigns table:', tableError.message);
            }
            
            const campaignsResult = await db.execute(`
                SELECT * FROM luggage_campaigns 
                ORDER BY created_at DESC
            `);
            
            // Handle different database response formats
            if (Array.isArray(campaignsResult)) {
                campaigns = campaignsResult;
            } else if (campaignsResult && Array.isArray(campaignsResult[0])) {
                campaigns = campaignsResult[0];
            } else if (campaignsResult && campaignsResult.rows) {
                campaigns = campaignsResult.rows;
            } else {
                campaigns = [];
            }
            
            console.log('✅ Luggage Campaigns records fetched from database:', campaigns.length);
        } catch (dbError) {
            console.error('❌ Database error:', dbError);
        }
        
        // If no campaigns in database, use fallback data
        if (campaigns.length === 0) {
            console.log('📋 No campaigns in database, using fallback data...');
            campaigns = [
                {
                    id: 1,
                    campaign_name: 'English Proficiency Program',
                    target_luggage: 'English',
                    description: 'Comprehensive English luggage training for all staff members',
                    start_date: '2026-05-01',
                    end_date: '2026-06-30',
                    status: 'active',
                    target_audience: 'All Staff',
                    budget: 50000.00,
                    actual_cost: 12500.00,
                    participants_count: 45,
                    completion_rate: 25.0,
                    created_by: 'HR Department',
                    created_at: '2026-05-01T00:00:00Z',
                    updated_at: '2026-05-04T00:00:00Z'
                },
                {
                    id: 2,
                    campaign_name: 'Swahili Communication Skills',
                    target_luggage: 'Swahili',
                    description: 'Basic Swahili luggage skills for expatriate staff',
                    start_date: '2026-04-15',
                    end_date: '2026-05-15',
                    status: 'completed',
                    target_audience: 'Expatriates',
                    budget: 25000.00,
                    actual_cost: 22000.00,
                    participants_count: 12,
                    completion_rate: 95.0,
                    created_by: 'Operations Manager',
                    created_at: '2026-04-15T00:00:00Z',
                    updated_at: '2026-05-15T00:00:00Z'
                },
                {
                    id: 3,
                    campaign_name: 'French for Project Management',
                    target_luggage: 'French',
                    description: 'French luggage training for project managers working with French-speaking clients',
                    start_date: '2026-06-01',
                    end_date: '2026-08-31',
                    status: 'planning',
                    target_audience: 'Project Managers',
                    budget: 75000.00,
                    actual_cost: 0,
                    participants_count: 8,
                    completion_rate: 0,
                    created_by: 'Training Department',
                    created_at: '2026-05-04T00:00:00Z',
                    updated_at: '2026-05-04T00:00:00Z'
                },
                {
                    id: 4,
                    campaign_name: 'Mandarin Business Basics',
                    target_luggage: 'Mandarin',
                    description: 'Essential Mandarin phrases for business communication with Chinese partners',
                    start_date: '2026-07-01',
                    end_date: '2026-09-30',
                    status: 'planning',
                    target_audience: 'Senior Management',
                    budget: 100000.00,
                    actual_cost: 0.00,
                    participants_count: 5,
                    completion_rate: 0.0,
                    created_by: 'CEO Office',
                    created_at: '2026-05-04T00:00:00Z',
                    updated_at: '2026-05-04T00:00:00Z'
                }
            ];
        }
        
        res.json({
            success: true,
            campaigns: campaigns,
            total: campaigns.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching luggage campaigns:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch luggage campaigns',
            details: error.message 
        });
    }
});

// Get active luggage campaigns
router.get('/active', async (req, res) => {
    try {
        console.log('📝 Active luggage campaigns endpoint accessed');
        
        let campaigns = [];
        
        try {
            const db = require('../../database/config/database');
            
            const campaignsResult = await db.execute(`
                SELECT * FROM luggage_campaigns 
                WHERE status = 'active' 
                ORDER BY start_date ASC
            `);
            
            // Handle different MySQL2 return formats
            if (Array.isArray(campaignsResult)) {
                campaigns = campaignsResult;
            } else if (campaignsResult && Array.isArray(campaignsResult[0])) {
                campaigns = campaignsResult[0];
            } else if (campaignsResult && campaignsResult.rows) {
                campaigns = campaignsResult.rows;
            } else {
                campaigns = [];
            }
            
            console.log('✅ Active campaigns fetched from database:', campaigns.length);
        } catch (dbError) {
            console.error('❌ Database error, using fallback active campaigns:', dbError);
            
            // Fallback to mock active campaigns
            campaigns = [
                {
                    id: 1,
                    campaign_name: 'English Proficiency Program',
                    target_luggage: 'English',
                    description: 'Comprehensive English luggage training for all staff members',
                    start_date: '2026-05-01',
                    end_date: '2026-06-30',
                    status: 'active',
                    target_audience: 'All Staff',
                    budget: 50000.00,
                    actual_cost: 12500.00,
                    participants_count: 45,
                    completion_rate: 25.0,
                    created_by: 'HR Department',
                    created_at: '2026-05-01T00:00:00Z',
                    updated_at: '2026-05-04T00:00:00Z'
                },
                {
                    id: 2,
                    campaign_name: 'Swahili Communication Skills',
                    target_luggage: 'Swahili',
                    description: 'Basic Swahili luggage skills for expatriate staff',
                    start_date: '2026-04-15',
                    end_date: '2026-07-15',
                    status: 'active',
                    target_audience: 'Expatriate Staff',
                    budget: 30000.00,
                    actual_cost: 8000.00,
                    participants_count: 12,
                    completion_rate: 35.0,
                    created_by: 'HR Department',
                    created_at: '2026-04-15T00:00:00Z',
                    updated_at: '2026-05-04T00:00:00Z'
                }
            ];
        }
        
        res.json({
            success: true,
            campaigns: campaigns,
            total: campaigns.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching active luggage campaigns:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch active luggage campaigns',
            details: error.message 
        });
    }
});

// Get luggage campaign by ID
router.get('/:id', async (req, res) => {
    try {
        const campaignId = req.params.id;
        console.log('🔍 Fetching luggage campaign:', campaignId);
        
        let campaign = null;
        
        try {
            const db = require('../../database/config/database');
            const campaignResult = await db.execute('SELECT * FROM luggage_campaigns WHERE id = ?', [campaignId]);
            const campaignData = Array.isArray(campaignResult) ? campaignResult[0] : campaignResult;
            
            if (campaignData.length > 0) {
                campaign = campaignData[0];
                console.log('✅ Luggage campaign found:', campaign);
            }
        } catch (dbError) {
            console.error('❌ Database error, using fallback campaign:', dbError);
            
            // Fallback to mock campaign data
            const mockCampaigns = [
                {
                    id: 1,
                    campaign_name: 'English Proficiency Program',
                    target_luggage: 'English',
                    description: 'Comprehensive English luggage training for all staff members',
                    start_date: '2026-05-01',
                    end_date: '2026-06-30',
                    status: 'active',
                    target_audience: 'All Staff',
                    budget: 50000.00,
                    actual_cost: 12500.00,
                    participants_count: 45,
                    completion_rate: 25.0,
                    created_by: 'HR Department',
                    created_at: '2026-05-01T00:00:00Z',
                    updated_at: '2026-05-04T00:00:00Z'
                },
                {
                    id: 2,
                    campaign_name: 'Swahili Communication Skills',
                    target_luggage: 'Swahili',
                    description: 'Basic Swahili luggage skills for expatriate staff',
                    start_date: '2026-04-15',
                    end_date: '2026-05-15',
                    status: 'completed',
                    target_audience: 'Expatriates',
                    budget: 25000.00,
                    actual_cost: 22000.00,
                    participants_count: 12,
                    completion_rate: 95.0,
                    created_by: 'Operations Manager',
                    created_at: '2026-04-15T00:00:00Z',
                    updated_at: '2026-05-15T00:00:00Z'
                }
            ];
            
            campaign = mockCampaigns.find(c => c.id == campaignId);
        }
        
        if (!campaign) {
            return res.status(404).json({ 
                success: false,
                error: 'Luggage campaign not found' 
            });
        }
        
        res.json({
            success: true,
            campaign: campaign
        });
        
    } catch (error) {
        console.error('❌ Error fetching luggage campaign:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch luggage campaign',
            details: error.message 
        });
    }
});

// Create new luggage campaign
router.post('/', async (req, res) => {
    try {
        console.log('📝 Luggage Campaign creation request received');
        console.log('📝 Request body:', req.body);
        
        const {
            campaign_name,
            campaign_description,
            target_luggage,
            description,
            start_date,
            end_date,
            status,
            target_audience,
            budget,
            created_by
        } = req.body;
        
        // Handle both frontend and backend field names
        const finalDescription = campaign_description || description;
        
        // Validate required fields
        if (!campaign_name || !target_luggage || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'campaign_name, target_luggage, start_date, and end_date are required'
            });
        }
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            const query = `
                INSERT INTO luggage_campaigns (
                    campaign_name, target_luggage, description, start_date, end_date,
                    status, target_audience, budget, created_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            const values = [
                campaign_name,
                target_luggage,
                finalDescription || null,
                start_date,
                end_date,
                status || 'planning',
                target_audience || null,
                budget || null,
                created_by || null
            ];
            
            const resultResult = await db.execute(query, values);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Luggage campaign created successfully:', result);
            
            // Fetch the created campaign
            const createdCampaignResult = await db.execute('SELECT * FROM luggage_campaigns WHERE id = ?', [result.insertId]);
            const createdCampaign = Array.isArray(createdCampaignResult) ? createdCampaignResult[0] : createdCampaignResult;
            
            res.status(201).json({
                success: true,
                message: 'Luggage campaign created successfully',
                campaignId: result.insertId,
                campaign: createdCampaign[0]
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock campaign creation:', dbError);
            
            // Fallback to mock campaign creation
            const campaignId = `LC${Date.now().toString().slice(-6)}`;
            
            res.status(201).json({
                success: true,
                message: 'Luggage campaign created successfully (mock)',
                campaignId: campaignId,
                campaign: {
                    id: campaignId,
                    campaign_name,
                    target_luggage,
                    description,
                    start_date,
                    end_date,
                    status: status || 'planning',
                    target_audience,
                    budget,
                    created_by,
                    created_at: new Date().toISOString(),
                    mock: true
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error creating luggage campaign:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create luggage campaign',
            details: error.message 
        });
    }
});

// Update luggage campaign
router.put('/:id', async (req, res) => {
    try {
        const campaignId = req.params.id;
        const updateData = req.body;
        
        console.log('🔄 Updating luggage campaign:', campaignId);
        console.log('📝 Update data:', updateData);
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
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
                return res.status(400).json({ 
                    success: false,
                    error: 'No valid fields to update' 
                });
            }
            
            updateFields.push('updated_at = NOW()');
            updateValues.push(campaignId);
            
            const updateQuery = `UPDATE luggage_campaigns SET ${updateFields.join(', ')} WHERE id = ?`;
            
            const resultResult = await db.execute(updateQuery, updateValues);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Luggage campaign updated successfully:', result);
            
            res.json({
                success: true,
                message: 'Luggage campaign updated successfully',
                affected_rows: result.affectedRows
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock update:', dbError);
            
            // Fallback to mock update
            res.json({
                success: true,
                message: 'Luggage campaign updated successfully (mock)',
                affected_rows: 1,
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error updating luggage campaign:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update luggage campaign',
            details: error.message 
        });
    }
});

// Delete luggage campaign
router.delete('/:id', async (req, res) => {
    try {
        const campaignId = req.params.id;
        console.log('🗑️ Deleting luggage campaign:', campaignId);
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Check if campaign exists
            const campaignResult = await db.execute('SELECT campaign_name FROM luggage_campaigns WHERE id = ?', [campaignId]);
            const campaignData = Array.isArray(campaignResult) ? campaignResult[0] : campaignResult;
            
            if (campaignData.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Luggage campaign not found'
                });
            }
            
            // Delete campaign
            const resultResult = await db.execute('DELETE FROM luggage_campaigns WHERE id = ?', [campaignId]);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Luggage campaign deleted successfully');
            
            res.json({
                success: true,
                message: 'Luggage campaign deleted successfully',
                deleted_campaign: {
                    id: campaignId,
                    campaign_name: campaignData[0].campaign_name
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock delete:', dbError);
            
            // Fallback to mock delete
            res.json({
                success: true,
                message: 'Luggage campaign deleted successfully (mock)',
                deleted_campaign: {
                    id: campaignId,
                    campaign_name: 'Mock Campaign'
                },
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error deleting luggage campaign:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete luggage campaign',
            details: error.message 
        });
    }
});

module.exports = router;
