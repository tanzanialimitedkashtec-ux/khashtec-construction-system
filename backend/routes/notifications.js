const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all notifications
router.get('/', async (req, res) => {
    try {
        console.log('🔔 Fetching notifications...');
        
        // Ensure notifications table exists with all needed columns
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    type VARCHAR(50) DEFAULT 'info',
                    priority VARCHAR(50) DEFAULT 'normal',
                    recipient_type VARCHAR(50) DEFAULT 'all',
                    recipients VARCHAR(255) DEFAULT 'All Staff',
                    sent_by VARCHAR(255) DEFAULT 'System',
                    status VARCHAR(50) DEFAULT 'draft',
                    sent_date DATE,
                    scheduled_date DATETIME,
                    read_rate DECIMAL(5,2) DEFAULT 0,
                    is_read BOOLEAN DEFAULT FALSE,
                    user_id VARCHAR(50),
                    category VARCHAR(50) DEFAULT 'system',
                    action_url VARCHAR(500) NULL,
                    expires_at TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Notifications table verified/created successfully');
        } catch (tableError) {
            console.log('⚠️ Could not create notifications table:', tableError.message);
        }
        
        const { userId, type, category, read, unread } = req.query;
        
        let query = 'SELECT *, recipient_type as recipientType, recipients, sent_by as sentBy FROM notifications WHERE 1=1';
        const params = [];
        
        if (userId) {
            query += ' AND user_id = ?';
            params.push(userId);
        }
        
        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }
        
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        
        if (read === 'true') {
            query += ' AND is_read = 1';
        }
        
        if (unread === 'true') {
            query += ' AND is_read = 0';
        }
        
        query += ' ORDER BY created_at DESC';
        
        const notificationsResult = await db.execute(query, params);
        
        // Handle different MySQL2 return formats
        let notifications = [];
        if (Array.isArray(notificationsResult)) {
            notifications = notificationsResult;
        } else if (notificationsResult && Array.isArray(notificationsResult[0])) {
            notifications = notificationsResult[0];
        } else if (notificationsResult && notificationsResult.rows) {
            notifications = notificationsResult.rows;
        } else {
            notifications = [];
        }
        
        console.log(`✅ Found ${notifications.length} notifications`);
        
        res.json({
            success: true,
            notifications: notifications,
            total: notifications.length,
            unread: notifications.filter(n => !n.is_read).length
        });
    } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        
        res.json({
            success: true,
            notifications: [],
            total: 0,
            unread: 0
        });
    }
});

// Get notification by ID
router.get('/:id', async (req, res) => {
    try {
        console.log('🔔 Fetching notification by ID:', req.params.id);
        
        const notificationsResult = await db.execute(
            'SELECT * FROM notifications WHERE id = ?',
            [req.params.id]
        );
        
        // Handle different MySQL2 return formats
        let notifications = [];
        if (Array.isArray(notificationsResult)) {
            notifications = notificationsResult;
        } else if (notificationsResult && Array.isArray(notificationsResult[0])) {
            notifications = notificationsResult[0];
        } else if (notificationsResult && notificationsResult.rows) {
            notifications = notificationsResult.rows;
        }
        
        if (notifications.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }
        
        res.json({
            success: true,
            notification: notifications[0]
        });
    } catch (error) {
        console.error('❌ Error fetching notification:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch notification',
            details: error.message
        });
    }
});

// Create new notification
router.post('/', async (req, res) => {
    try {
        const { title, message, type = 'info', userId, category = 'system' } = req.body;
        
        // Validate input
        if (!title || !message || !userId) {
            return res.status(400).json({
                error: 'Title, message, and userId are required'
            });
        }
        
        // Validate type
        const validTypes = ['info', 'success', 'warning', 'error'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: 'Invalid notification type'
            });
        }
        
        // Create new notification
        const resultResult = await db.execute(
            `INSERT INTO notifications (title, message, type, user_id, category, is_read, created_at) 
             VALUES (?, ?, ?, ?, ?, 0, NOW())`,
            [title, message, type, userId, category]
        );
        const result = Array.isArray(resultResult) ? resultResult[0] : resultResult;
        
        // Get the created notification
        const newNotificationResult = await db.execute(
            'SELECT * FROM notifications WHERE id = ?',
            [result.insertId]
        );
        const newNotification = Array.isArray(newNotificationResult) ? newNotificationResult[0] : newNotificationResult;
        
        res.status(201).json({
            message: 'Notification created successfully',
            notification: Array.isArray(newNotification) ? newNotification[0] : newNotification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const [result] = await db.execute(
            'UPDATE notifications SET is_read = 1 WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Notification not found'
            });
        }
        
        const [updatedNotification] = await db.execute(
            'SELECT * FROM notifications WHERE id = ?',
            [req.params.id]
        );
        
        res.json({
            message: 'Notification marked as read',
            notification: updatedNotification[0]
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark notification as unread
router.put('/:id/unread', async (req, res) => {
    try {
        const [result] = await db.execute(
            'UPDATE notifications SET is_read = 0 WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Notification not found'
            });
        }
        
        const [updatedNotification] = await db.execute(
            'SELECT * FROM notifications WHERE id = ?',
            [req.params.id]
        );
        
        res.json({
            message: 'Notification marked as unread',
            notification: updatedNotification[0]
        });
    } catch (error) {
        console.error('Error marking notification as unread:', error);
        res.status(500).json({ error: 'Failed to mark notification as unread' });
    }
});

// Mark all notifications as read for a user (or all users)
router.put('/read-all', async (req, res) => {
    try {
        const { userId } = req.body;
        
        let result;
        if (!userId || userId === 'all') {
            // Mark ALL unread notifications as read
            [result] = await db.execute(
                'UPDATE notifications SET is_read = 1 WHERE is_read = 0'
            );
        } else {
            // Mark unread notifications for a specific user
            [result] = await db.execute(
                'UPDATE notifications SET is_read = 1 WHERE recipient_id = ? AND is_read = 0',
                [userId]
            );
        }
        
        res.json({
            message: `${result.affectedRows} notifications marked as read`,
            count: result.affectedRows
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

// Delete notification
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.execute(
            'DELETE FROM notifications WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Notification not found'
            });
        }
        
        res.json({
            message: 'Notification deleted successfully',
            id: req.params.id
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

// Clear all notifications for a user
router.delete('/clear', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                error: 'userId is required'
            });
        }
        
        const [result] = await db.execute(
            'DELETE FROM notifications WHERE recipient_id = ?',
            [userId]
        );
        
        res.json({
            message: `${result.affectedRows} notifications cleared`,
            count: result.affectedRows
        });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

// Get notification statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const { userId } = req.query;
        
        let baseQuery = 'SELECT * FROM notifications';
        let countQuery = 'SELECT COUNT(*) as total FROM notifications';
        const params = [];
        
        if (userId) {
            baseQuery += ' WHERE recipient_id = ?';
            countQuery += ' WHERE recipient_id = ?';
            params.push(userId);
        }
        
        // Get total, read, unread counts
        const [totalResult] = await db.execute(countQuery, params);
        const [readResult] = await db.execute(`${countQuery} AND is_read = 1`, params);
        const [unreadResult] = await db.execute(`${countQuery} AND is_read = 0`, params);
        
        const total = totalResult[0].total;
        const read = readResult[0].total;
        const unread = unreadResult[0].total;
        
        // Type breakdown
        const typeQuery = userId 
            ? 'SELECT type, COUNT(*) as count FROM notifications WHERE recipient_id = ? GROUP BY type'
            : 'SELECT type, COUNT(*) as count FROM notifications GROUP BY type';
        const [typeStats] = await db.execute(typeQuery, params);
        
        // Category breakdown - Note: category field doesn't exist in schema, using type instead
        const categoryQuery = userId
            ? 'SELECT type as category, COUNT(*) as count FROM notifications WHERE recipient_id = ? GROUP BY type'
            : 'SELECT type as category, COUNT(*) as count FROM notifications GROUP BY type';
        const [categoryStats] = await db.execute(categoryQuery, params);
        
        // Recent notifications
        const recentQuery = userId
            ? 'SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC LIMIT 10'
            : 'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10';
        const [recentNotifications] = await db.execute(recentQuery, params);
        
        res.json({
            total,
            unread,
            read,
            types: typeStats,
            categories: categoryStats,
            recent: recentNotifications
        });
    } catch (error) {
        console.error('Error getting notification statistics:', error);
        res.status(500).json({ error: 'Failed to get notification statistics' });
    }
});

// Send broadcast notification to all users
router.post('/broadcast', async (req, res) => {
    try {
        console.log('📢 Broadcast notification request received');
        console.log('📝 Request body:', req.body);
        
        const { 
            title, 
            message, 
            type = 'info', 
            category = 'system',
            priority = 'Medium',
            recipientType = 'all',
            recipients = 'All Staff',
            sentBy = 'System'
        } = req.body;
        
        // Validate input
        if (!title || !message) {
            console.log('❌ Validation failed: missing title or message');
            return res.status(400).json({
                error: 'Title and message are required'
            });
        }
        
        console.log('✅ Input validation passed');
        
        // Create broadcast notification with proper handling of foreign key constraints
        try {
            // First, let's check if we need to add columns for recipient_type, recipients, and sent_by
            await db.execute(`
                ALTER TABLE notifications 
                ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(50) DEFAULT 'all',
                ADD COLUMN IF NOT EXISTS recipients VARCHAR(255) DEFAULT 'All Staff',
                ADD COLUMN IF NOT EXISTS sent_by VARCHAR(255) DEFAULT 'System'
            `);
            
            // Insert notification with all the required fields
            const result = await db.execute(
                `INSERT INTO notifications (title, message, type, priority, recipient_type, recipients, sent_by, recipient_id, sender_id, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, NOW())`,
                [
                    title,
                    message,
                    type.charAt(0).toUpperCase() + type.slice(1), // Capitalize for ENUM: Info, Warning, Error, Success
                    priority.charAt(0).toUpperCase() + priority.slice(1), // Capitalize for ENUM: Low, Medium, High, Urgent
                    recipientType,
                    recipients,
                    sentBy
                ]
            );
            
            console.log(`✅ Successfully created broadcast notification:`, result);
            
            res.status(201).json({
                message: 'Broadcast notification created successfully',
                notificationId: result.insertId,
                count: 1
            });
        } catch (dbError) {
            console.error('❌ Database error in broadcast:', dbError);
            console.error('❌ Database error details:', {
                code: dbError.code,
                errno: dbError.errno,
                sqlState: dbError.sqlState,
                sqlMessage: dbError.sqlMessage,
                message: dbError.message
            });
            
            // If it's a foreign key constraint error, try without recipient_id
            if (dbError.code === 'ER_NO_REFERENCED_ROW_2' || dbError.errno === 1452) {
                try {
                    console.log('🔄 Trying alternative approach without foreign key constraints...');
                    const altResult = await db.execute(
                        `INSERT INTO notifications (title, message, type, priority, recipient_type, recipients, sent_by, created_at) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
                        [
                            title,
                            message,
                            type.charAt(0).toUpperCase() + type.slice(1),
                            priority.charAt(0).toUpperCase() + priority.slice(1),
                            recipientType,
                            recipients,
                            sentBy
                        ]
                    );
                    
                    console.log(`✅ Successfully created broadcast notification (alternative):`, altResult);
                    
                    res.status(201).json({
                        message: 'Broadcast notification created successfully',
                        notificationId: altResult.insertId,
                        count: 1
                    });
                } catch (altError) {
                    console.error('❌ Alternative approach also failed:', altError);
                    throw altError;
                }
            } else {
                throw dbError;
            }
        }
    } catch (error) {
        console.error('❌ Error sending broadcast notification:', error);
        console.error('❌ Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            error: 'Failed to create broadcast notification',
            details: error.message
        });
    }
});

module.exports = router;
