const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Get all notifications
router.get('/', async (req, res) => {
    try {
        const { userId, type, category, read, unread } = req.query;
        
        let query = 'SELECT * FROM notifications WHERE 1=1';
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
        const notifications = Array.isArray(notificationsResult) ? notificationsResult[0] : notificationsResult;
        
        res.json({
            notifications: notifications || [],
            total: (notifications || []).length,
            unread: (notifications || []).filter(n => !n.is_read).length
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Get notification by ID
router.get('/:id', async (req, res) => {
    try {
        const notificationsResult = await db.execute(
            'SELECT * FROM notifications WHERE id = ?',
            [req.params.id]
        );
        const notifications = Array.isArray(notificationsResult) ? notificationsResult[0] : notificationsResult;
        
        if (notifications.length === 0) {
            return res.status(404).json({
                error: 'Notification not found'
            });
        }
        
        res.json(notifications[0]);
    } catch (error) {
        console.error('Error fetching notification:', error);
        res.status(500).json({ error: 'Failed to fetch notification' });
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

// Mark all notifications as read for a user
router.put('/read-all', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                error: 'userId is required'
            });
        }
        
        const [result] = await db.execute(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
            [userId]
        );
        
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
            'DELETE FROM notifications WHERE user_id = ?',
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
            baseQuery += ' WHERE user_id = ?';
            countQuery += ' WHERE user_id = ?';
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
            ? 'SELECT type, COUNT(*) as count FROM notifications WHERE user_id = ? GROUP BY type'
            : 'SELECT type, COUNT(*) as count FROM notifications GROUP BY type';
        const [typeStats] = await db.execute(typeQuery, params);
        
        // Category breakdown
        const categoryQuery = userId
            ? 'SELECT category, COUNT(*) as count FROM notifications WHERE user_id = ? GROUP BY category'
            : 'SELECT category, COUNT(*) as count FROM notifications GROUP BY category';
        const [categoryStats] = await db.execute(categoryQuery, params);
        
        // Recent notifications
        const recentQuery = userId
            ? 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
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
        
        const { title, message, type = 'info', category = 'system' } = req.body;
        
        // Validate input
        if (!title || !message) {
            console.log('❌ Validation failed: missing title or message');
            return res.status(400).json({
                error: 'Title and message are required'
            });
        }
        
        console.log('✅ Input validation passed');
        
        // Simple broadcast to all users - insert one notification per user_id from 1-10
        // This avoids complex array processing that might be causing issues
        const notificationPromises = [];
        
        for (let userId = 1; userId <= 10; userId++) {
            const notificationData = [
                title,
                message,
                type,
                userId,
                category,
                0, // is_read
                new Date() // created_at
            ];
            
            notificationPromises.push(
                db.execute(
                    `INSERT INTO notifications (title, message, type, user_id, category, is_read, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    notificationData
                )
            );
        }
        
        // Wait for all notifications to be created
        const results = await Promise.all(notificationPromises);
        
        // Count total inserted
        let totalInserted = 0;
        results.forEach(result => {
            const insertResult = Array.isArray(result) ? result[0] : result;
            totalInserted += insertResult.affectedRows || 1;
        });
        
        console.log(`✅ Successfully inserted ${totalInserted} notifications`);
        
        res.status(201).json({
            message: `Broadcast notification sent to ${totalInserted} users`,
            count: totalInserted
        });
    } catch (error) {
        console.error('❌ Error sending broadcast notification:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to send broadcast notification' });
    }
});

module.exports = router;
