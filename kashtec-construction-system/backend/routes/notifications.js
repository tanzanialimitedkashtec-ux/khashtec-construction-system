const express = require('express');
const router = express.Router();

// Mock notification data (in production, use real database)
let notifications = [
    {
        id: 1,
        title: 'System Update',
        message: 'KASHTEC system has been updated to version 1.0.0',
        type: 'info',
        timestamp: '2024-01-20T10:30:00Z',
        read: false,
        userId: 1,
        category: 'system'
    },
    {
        id: 2,
        title: 'Project Milestone',
        message: 'Kigali Tower Complex foundation work completed',
        type: 'success',
        timestamp: '2024-01-19T14:15:00Z',
        read: true,
        userId: 1,
        category: 'project'
    },
    {
        id: 3,
        title: 'Safety Alert',
        message: 'Monthly safety inspection scheduled for tomorrow',
        type: 'warning',
        timestamp: '2024-01-18T09:00:00Z',
        read: false,
        userId: 2,
        category: 'safety'
    }
];

// Get all notifications
router.get('/', (req, res) => {
    const { userId, type, category, read, unread } = req.query;
    
    let filteredNotifications = notifications;
    
    if (userId) {
        filteredNotifications = filteredNotifications.filter(notif => 
            notif.userId === parseInt(userId)
        );
    }
    
    if (type) {
        filteredNotifications = filteredNotifications.filter(notif => 
            notif.type.toLowerCase() === type.toLowerCase()
        );
    }
    
    if (category) {
        filteredNotifications = filteredNotifications.filter(notif => 
            notif.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    if (read === 'true') {
        filteredNotifications = filteredNotifications.filter(notif => notif.read);
    }
    
    if (unread === 'true') {
        filteredNotifications = filteredNotifications.filter(notif => !notif.read);
    }
    
    // Sort by timestamp (newest first)
    filteredNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
        notifications: filteredNotifications,
        total: filteredNotifications.length,
        unread: filteredNotifications.filter(n => !n.read).length
    });
});

// Get notification by ID
router.get('/:id', (req, res) => {
    const notification = notifications.find(notif => notif.id === parseInt(req.params.id));
    
    if (!notification) {
        return res.status(404).json({
            error: 'Notification not found'
        });
    }
    
    res.json(notification);
});

// Create new notification
router.post('/', (req, res) => {
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
    const newNotification = {
        id: notifications.length + 1,
        title,
        message,
        type,
        userId: parseInt(userId),
        category,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.push(newNotification);
    
    res.status(201).json({
        message: 'Notification created successfully',
        notification: newNotification
    });
});

// Mark notification as read
router.put('/:id/read', (req, res) => {
    const notificationIndex = notifications.findIndex(notif => notif.id === parseInt(req.params.id));
    
    if (notificationIndex === -1) {
        return res.status(404).json({
            error: 'Notification not found'
        });
    }
    
    notifications[notificationIndex].read = true;
    
    res.json({
        message: 'Notification marked as read',
        notification: notifications[notificationIndex]
    });
});

// Mark notification as unread
router.put('/:id/unread', (req, res) => {
    const notificationIndex = notifications.findIndex(notif => notif.id === parseInt(req.params.id));
    
    if (notificationIndex === -1) {
        return res.status(404).json({
            error: 'Notification not found'
        });
    }
    
    notifications[notificationIndex].read = false;
    
    res.json({
        message: 'Notification marked as unread',
        notification: notifications[notificationIndex]
    });
});

// Mark all notifications as read for a user
router.put('/read-all', (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({
            error: 'userId is required'
        });
    }
    
    let markedCount = 0;
    notifications.forEach(notif => {
        if (notif.userId === parseInt(userId) && !notif.read) {
            notif.read = true;
            markedCount++;
        }
    });
    
    res.json({
        message: `${markedCount} notifications marked as read`,
        count: markedCount
    });
});

// Delete notification
router.delete('/:id', (req, res) => {
    const notificationIndex = notifications.findIndex(notif => notif.id === parseInt(req.params.id));
    
    if (notificationIndex === -1) {
        return res.status(404).json({
            error: 'Notification not found'
        });
    }
    
    const deletedNotification = notifications.splice(notificationIndex, 1)[0];
    
    res.json({
        message: 'Notification deleted successfully',
        notification: deletedNotification
    });
});

// Clear all notifications for a user
router.delete('/clear', (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({
            error: 'userId is required'
        });
    }
    
    const initialCount = notifications.length;
    notifications = notifications.filter(notif => notif.userId !== parseInt(userId));
    const deletedCount = initialCount - notifications.length;
    
    res.json({
        message: `${deletedCount} notifications cleared`,
        count: deletedCount
    });
});

// Get notification statistics
router.get('/stats/overview', (req, res) => {
    const { userId } = req.query;
    
    let userNotifications = notifications;
    
    if (userId) {
        userNotifications = notifications.filter(notif => 
            notif.userId === parseInt(userId)
        );
    }
    
    const total = userNotifications.length;
    const unread = userNotifications.filter(n => !n.read).length;
    const read = userNotifications.filter(n => n.read).length;
    
    // Type breakdown
    const typeStats = {};
    userNotifications.forEach(notif => {
        typeStats[notif.type] = (typeStats[notif.type] || 0) + 1;
    });
    
    // Category breakdown
    const categoryStats = {};
    userNotifications.forEach(notif => {
        categoryStats[notif.category] = (categoryStats[notif.category] || 0) + 1;
    });
    
    // Recent notifications
    const recentNotifications = userNotifications
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
    
    res.json({
        total,
        unread,
        read,
        types: typeStats,
        categories: categoryStats,
        recent: recentNotifications
    });
});

// Send broadcast notification to all users
router.post('/broadcast', (req, res) => {
    const { title, message, type = 'info', category = 'system' } = req.body;
    
    // Validate input
    if (!title || !message) {
        return res.status(400).json({
            error: 'Title and message are required'
        });
    }
    
    // Get all unique user IDs
    const userIds = [...new Set(notifications.map(n => n.userId))];
    
    // Create notification for each user
    const newNotifications = userIds.map(userId => ({
        id: notifications.length + userIds.indexOf(userId) + 1,
        title,
        message,
        type,
        userId,
        category,
        timestamp: new Date().toISOString(),
        read: false
    }));
    
    notifications.push(...newNotifications);
    
    res.status(201).json({
        message: `Broadcast notification sent to ${userIds.length} users`,
        notifications: newNotifications
    });
});

module.exports = router;
