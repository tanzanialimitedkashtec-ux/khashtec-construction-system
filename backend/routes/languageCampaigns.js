const express = require('express');
const router = express.Router();

console.log('🚀 Language Campaigns route file is being loaded...');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    console.log('🧪 Language Campaigns test endpoint accessed');
    res.json({ 
        message: 'Language Campaigns API is working!',
        timestamp: new Date().toISOString(),
        status: 'routes_loaded_successfully',
        debug: 'Language Campaigns routes are loaded and responding'
    });
});

// Root endpoint - get all language campaigns
router.get('/', async (req, res) => {
    try {
        console.log('📝 Language Campaigns root endpoint accessed');
        
        let campaigns = [];
        
        try {
            const db = require('../../database/config/database');
            
            // Ensure language_campaigns table exists
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS language_campaigns (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        campaign_name VARCHAR(255) NOT NULL,
                        target_language VARCHAR(100) NOT NULL,
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
                console.log('✅ Language Campaigns table verified/created successfully');
            } catch (tableError) {
                console.log('⚠️ Could not create language_campaigns table:', tableError.message);
            }
            
            const campaignsResult = await db.execute(`
                SELECT * FROM language_campaigns 
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
            
            console.log('✅ Language Campaigns records fetched from database:', campaigns.length);
        } catch (dbError) {
            console.error('❌ Database error, using fallback language campaigns:', dbError);
            
            // Fallback to mock language campaigns
            campaigns = [
                {
                    id: 1,
                    campaign_name: 'English Proficiency Program',
                    target_language: 'English',
                    description: 'Comprehensive English language training for all staff members',
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
                    target_language: 'Swahili',
                    description: 'Basic Swahili language skills for expatriate staff',
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
                    target_language: 'French',
                    description: 'French language training for project managers working with French-speaking clients',
                    start_date: '2026-06-01',
                    end_date: '2026-08-31',
                    status: 'planning',
                    target_audience: 'Project Managers',
                    budget: 75000.00,
                    actual_cost: 0.00,
                    participants_count: 8,
                    completion_rate: 0.0,
                    created_by: 'Training Department',
                    created_at: '2026-05-04T00:00:00Z',
                    updated_at: '2026-05-04T00:00:00Z'
                },
                {
                    id: 4,
                    campaign_name: 'Mandarin Business Basics',
                    target_language: 'Mandarin',
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
        console.error('❌ Error fetching language campaigns:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch language campaigns',
            details: error.message 
        });
    }
});

// Get active language campaigns
router.get('/active', async (req, res) => {
    try {
        console.log('📝 Active language campaigns endpoint accessed');
        
        let campaigns = [];
        
        try {
            const db = require('../../database/config/database');
            
            const campaignsResult = await db.execute(`
                SELECT * FROM language_campaigns 
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
                    target_language: 'English',
                    description: 'Comprehensive English language training for all staff members',
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
                    target_language: 'Swahili',
                    description: 'Basic Swahili language skills for expatriate staff',
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
        console.error('❌ Error fetching active language campaigns:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch active language campaigns',
            details: error.message 
        });
    }
});

// Get language campaign by ID
router.get('/:id', async (req, res) => {
    try {
        const campaignId = req.params.id;
        console.log('🔍 Fetching language campaign:', campaignId);
        
        let campaign = null;
        
        try {
            const db = require('../../database/config/database');
            const campaignResult = await db.execute('SELECT * FROM language_campaigns WHERE id = ?', [campaignId]);
            const campaignData = Array.isArray(campaignResult) ? campaignResult[0] : campaignResult;
            
            if (campaignData.length > 0) {
                campaign = campaignData[0];
                console.log('✅ Language campaign found:', campaign);
            }
        } catch (dbError) {
            console.error('❌ Database error, using fallback campaign:', dbError);
            
            // Fallback to mock campaign data
            const mockCampaigns = [
                {
                    id: 1,
                    campaign_name: 'English Proficiency Program',
                    target_language: 'English',
                    description: 'Comprehensive English language training for all staff members',
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
                    target_language: 'Swahili',
                    description: 'Basic Swahili language skills for expatriate staff',
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
                error: 'Language campaign not found' 
            });
        }
        
        res.json({
            success: true,
            campaign: campaign
        });
        
    } catch (error) {
        console.error('❌ Error fetching language campaign:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch language campaign',
            details: error.message 
        });
    }
});

// Create new language campaign
router.post('/', async (req, res) => {
    try {
        console.log('📝 Language Campaign creation request received');
        console.log('📝 Request body:', req.body);
        
        const {
            campaign_name,
            campaign_description,
            target_language,
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
        if (!campaign_name || !target_language || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                details: 'campaign_name, target_language, start_date, and end_date are required'
            });
        }
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            const query = `
                INSERT INTO language_campaigns (
                    campaign_name, target_language, description, start_date, end_date,
                    status, target_audience, budget, created_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            const values = [
                campaign_name,
                target_language,
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
            
            console.log('✅ Language campaign created successfully:', result);
            
            // Fetch the created campaign
            const createdCampaignResult = await db.execute('SELECT * FROM language_campaigns WHERE id = ?', [result.insertId]);
            const createdCampaign = Array.isArray(createdCampaignResult) ? createdCampaignResult[0] : createdCampaignResult;
            
            res.status(201).json({
                success: true,
                message: 'Language campaign created successfully',
                campaignId: result.insertId,
                campaign: createdCampaign[0]
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock campaign creation:', dbError);
            
            // Fallback to mock campaign creation
            const campaignId = `LC${Date.now().toString().slice(-6)}`;
            
            res.status(201).json({
                success: true,
                message: 'Language campaign created successfully (mock)',
                campaignId: campaignId,
                campaign: {
                    id: campaignId,
                    campaign_name,
                    target_language,
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
        console.error('❌ Error creating language campaign:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create language campaign',
            details: error.message 
        });
    }
});

// Update language campaign
router.put('/:id', async (req, res) => {
    try {
        const campaignId = req.params.id;
        const updateData = req.body;
        
        console.log('🔄 Updating language campaign:', campaignId);
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
            
            const updateQuery = `UPDATE language_campaigns SET ${updateFields.join(', ')} WHERE id = ?`;
            
            const resultResult = await db.execute(updateQuery, updateValues);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Language campaign updated successfully:', result);
            
            res.json({
                success: true,
                message: 'Language campaign updated successfully',
                affected_rows: result.affectedRows
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using mock update:', dbError);
            
            // Fallback to mock update
            res.json({
                success: true,
                message: 'Language campaign updated successfully (mock)',
                affected_rows: 1,
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error updating language campaign:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update language campaign',
            details: error.message 
        });
    }
});

// Delete language campaign
router.delete('/:id', async (req, res) => {
    try {
        const campaignId = req.params.id;
        console.log('🗑️ Deleting language campaign:', campaignId);
        
        // Try database first, fallback to mock
        try {
            const db = require('../../database/config/database');
            
            // Check if campaign exists
            const campaignResult = await db.execute('SELECT campaign_name FROM language_campaigns WHERE id = ?', [campaignId]);
            const campaignData = Array.isArray(campaignResult) ? campaignResult[0] : campaignResult;
            
            if (campaignData.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Language campaign not found'
                });
            }
            
            // Delete campaign
            const resultResult = await db.execute('DELETE FROM language_campaigns WHERE id = ?', [campaignId]);
            const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
            
            console.log('✅ Language campaign deleted successfully');
            
            res.json({
                success: true,
                message: 'Language campaign deleted successfully',
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
                message: 'Language campaign deleted successfully (mock)',
                deleted_campaign: {
                    id: campaignId,
                    campaign_name: 'Mock Campaign'
                },
                mock: true
            });
        }
        
    } catch (error) {
        console.error('❌ Error deleting language campaign:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete language campaign',
            details: error.message 
        });
    }
});

module.exports = router;
