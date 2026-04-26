const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');
const bcrypt = require('bcryptjs');

// Get user account statistics
router.get('/stats', async (req, res) => {
    try {
        console.log('📊 Fetching user account statistics...');
        
        // Get active and suspended users from authentication table
        const [activeUsers, suspendedUsers] = await Promise.all([
            db.execute('SELECT COUNT(*) as count FROM authentication WHERE status = ? AND role != ?', ['Active', 'Managing Director']),
            db.execute('SELECT COUNT(*) as count FROM authentication WHERE status = ? AND role != ?', ['Suspended', 'Managing Director'])
        ]);
        
        console.log('📊 User stats:', {
            active: activeUsers[0].count,
            suspended: suspendedUsers[0].count
        });
        
        res.json({
            success: true,
            data: {
                totalActiveUsers: activeUsers[0].count,
                suspendedAccounts: suspendedUsers[0].count
            }
        });
    } catch (error) {
        console.error('❌ Error fetching user stats:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get all user accounts (except MD)
router.get('/users', async (req, res) => {
    try {
        console.log('👥 Fetching all user accounts...');
        
        const users = await db.execute(`
            SELECT id, email, role, department_name, manager_name, status, last_login, created_at
            FROM authentication 
            WHERE role != ?
            ORDER BY created_at DESC
        `, ['Managing Director']);
        
        console.log(`📊 Found ${users.length} user accounts`);
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Suspend user account
router.put('/suspend/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        
        console.log('🔒 Attempting to suspend user:', userId);
        
        // Check if user exists and is not MD
        const user = await db.execute(
            'SELECT id, email, role FROM authentication WHERE id = ? AND role != ?',
            [userId, 'Managing Director']
        );
        
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found or cannot be suspended'
            });
        }
        
        // Update user status to suspended
        await db.execute(
            'UPDATE authentication SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['Suspended', userId]
        );
        
        console.log('✅ User suspended successfully:', user[0].email);
        
        res.json({
            success: true,
            message: 'User suspended successfully',
            data: {
                userId: userId,
                email: user[0].email
            }
        });
    } catch (error) {
        console.error('❌ Error suspending user:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Reactivate user account
router.put('/reactivate/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log('🔄 Attempting to reactivate user:', userId);
        
        // Check if user exists
        const user = await db.execute(
            'SELECT id, email, role FROM authentication WHERE id = ?',
            [userId]
        );
        
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Update user status to active
        await db.execute(
            'UPDATE authentication SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['Active', userId]
        );
        
        console.log('✅ User reactivated successfully:', user[0].email);
        
        res.json({
            success: true,
            message: 'User reactivated successfully',
            data: {
                userId: userId,
                email: user[0].email
            }
        });
    } catch (error) {
        console.error('❌ Error reactivating user:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get user by ID
router.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await db.execute(`
            SELECT id, email, role, department_name, manager_name, status, last_login, created_at
            FROM authentication 
            WHERE id = ?
        `, [userId]);
        
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: user[0]
        });
    } catch (error) {
        console.error('❌ Error fetching user:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
