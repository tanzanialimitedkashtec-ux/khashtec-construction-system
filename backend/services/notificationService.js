const db = require('../../database/config/database');

class NotificationService {
    constructor() {
        this.notificationQueue = [];
        this.isProcessing = false;
    }

    /**
     * Create a notification for department changes
     */
    async createNotification(options) {
        const {
            title,
            message,
            type = 'info',
            category = 'system',
            priority = 'medium',
            recipientType = 'all',
            recipients = 'All Staff',
            sentBy = 'System',
            actionUrl = null,
            department = null
        } = options;

        try {
            // Ensure notifications table exists
            await this.ensureNotificationsTable();

            // Insert notification
            const result = await db.execute(`
                INSERT INTO notifications (
                    title, message, type, category, priority, 
                    recipient_type, recipients, sent_by, 
                    action_url, department, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `, [
                title,
                message,
                type.charAt(0).toUpperCase() + type.slice(1),
                category,
                priority.charAt(0).toUpperCase() + priority.slice(1),
                recipientType,
                recipients,
                sentBy,
                actionUrl,
                department
            ]);

            console.log(`✅ Notification created: ${title} (ID: ${result.insertId})`);
            return result.insertId;
        } catch (error) {
            console.error('❌ Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Monitor department changes and create notifications
     */
    async monitorDepartmentChanges() {
        console.log('🔍 Starting department change monitoring...');
        
        // Monitor senior hiring requests
        await this.monitorSeniorHiring();
        
        // Monitor workforce budgets
        await this.monitorWorkforceBudgets();
        
        // Monitor attendance changes
        await this.monitorAttendanceChanges();
        
        // Monitor safety incidents
        await this.monitorSafetyIncidents();
        
        // Monitor project updates
        await this.monitorProjectUpdates();
        
        // Monitor document uploads
        await this.monitorDocumentUploads();
        
        // Monitor leave requests
        await this.monitorLeaveRequests();
        
        console.log('✅ Department monitoring completed');
    }

    /**
     * Monitor senior hiring requests
     */
    async monitorSeniorHiring() {
        try {
            // Check for new senior hiring requests pending approval
            const [pendingRequests] = await db.execute(`
                SELECT * FROM senior_hiring_approval 
                WHERE status = 'pending' 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            for (const request of pendingRequests) {
                await this.createNotification({
                    title: 'New Senior Staff Hiring Request',
                    message: `A new senior hiring request for ${request.position} requires your approval. Submitted by ${request.submitted_by}.`,
                    type: 'info',
                    category: 'hr',
                    priority: 'high',
                    recipientType: 'role',
                    recipients: 'MD,ADMIN',
                    sentBy: 'HR System',
                    actionUrl: `/senior-hiring/${request.id}`,
                    department: 'HR'
                });
            }

            // Check for approved requests
            const [approvedRequests] = await db.execute(`
                SELECT * FROM senior_hiring_approval 
                WHERE status = 'approved' 
                AND approved_date >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            for (const request of approvedRequests) {
                await this.createNotification({
                    title: 'Senior Hiring Request Approved',
                    message: `Your senior hiring request for ${request.position} has been approved by ${request.approved_by}.`,
                    type: 'success',
                    category: 'hr',
                    priority: 'medium',
                    recipientType: 'role',
                    recipients: 'HR',
                    sentBy: 'MD Office',
                    actionUrl: `/senior-hiring/${request.id}`,
                    department: 'HR'
                });
            }

        } catch (error) {
            console.error('❌ Error monitoring senior hiring:', error);
        }
    }

    /**
     * Monitor workforce budgets
     */
    async monitorWorkforceBudgets() {
        try {
            // Check for new budget requests
            const [newBudgets] = await db.execute(`
                SELECT * FROM workforce_budget_approvals 
                WHERE status = 'pending' 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            for (const budget of newBudgets) {
                await this.createNotification({
                    title: 'New Workforce Budget Request',
                    message: `A workforce budget request of ${budget.total_proposed} requires your approval for department ${budget.department}.`,
                    type: 'info',
                    category: 'finance',
                    priority: 'high',
                    recipientType: 'role',
                    recipients: 'MD,FINANCE',
                    sentBy: 'Finance System',
                    actionUrl: `/workforce-budget/${budget.id}`,
                    department: 'Finance'
                });
            }

        } catch (error) {
            console.error('❌ Error monitoring workforce budgets:', error);
        }
    }

    /**
     * Monitor attendance changes
     */
    async monitorAttendanceChanges() {
        try {
            // Check for attendance anomalies
            const [attendanceAnomalies] = await db.execute(`
                SELECT * FROM attendance 
                WHERE status = 'absent' 
                AND date >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            for (const attendance of attendanceAnomalies) {
                await this.createNotification({
                    title: 'Attendance Alert',
                    message: `Employee ${attendance.employee_name} marked as absent today. Please follow up.`,
                    type: 'warning',
                    category: 'hr',
                    priority: 'medium',
                    recipientType: 'role',
                    recipients: 'HR,ADMIN',
                    sentBy: 'Attendance System',
                    actionUrl: `/attendance/${attendance.id}`,
                    department: 'HR'
                });
            }

        } catch (error) {
            console.error('❌ Error monitoring attendance:', error);
        }
    }

    /**
     * Monitor safety incidents
     */
    async monitorSafetyIncidents() {
        try {
            // Check for new safety incidents
            const [newIncidents] = await db.execute(`
                SELECT * FROM hse_work 
                WHERE work_type LIKE '%Safety Violation%' 
                AND submitted_date >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            for (const incident of newIncidents) {
                await this.createNotification({
                    title: 'New Safety Incident Reported',
                    message: `A safety incident has been reported: ${incident.work_title}. Immediate attention required.`,
                    type: 'error',
                    category: 'safety',
                    priority: 'urgent',
                    recipientType: 'role',
                    recipients: 'HSE,MD,PROJECT',
                    sentBy: 'HSE System',
                    actionUrl: `/safety/${incident.id}`,
                    department: 'HSE'
                });
            }

        } catch (error) {
            console.error('❌ Error monitoring safety incidents:', error);
        }
    }

    /**
     * Monitor project updates
     */
    async monitorProjectUpdates() {
        try {
            // Check for new site reports
            const [newReports] = await db.execute(`
                SELECT * FROM work 
                WHERE work_type = 'Site Report' 
                AND submitted_date >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            for (const report of newReports) {
                await this.createNotification({
                    title: 'New Site Report Submitted',
                    message: `Daily site report submitted for ${report.work_title}. Progress: ${report.work_description}`,
                    type: 'info',
                    category: 'project',
                    priority: 'medium',
                    recipientType: 'role',
                    recipients: 'PROJECT,MD',
                    sentBy: 'Project System',
                    actionUrl: `/project/${report.id}`,
                    department: 'Project'
                });
            }

        } catch (error) {
            console.error('❌ Error monitoring project updates:', error);
        }
    }

    /**
     * Monitor document uploads
     */
    async monitorDocumentUploads() {
        try {
            // Check for new document uploads
            const [newDocuments] = await db.execute(`
                SELECT * FROM admin_work 
                WHERE work_type LIKE '%Document%' 
                AND submitted_date >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            for (const doc of newDocuments) {
                await this.createNotification({
                    title: 'New Document Uploaded',
                    message: `New document "${doc.work_title}" has been uploaded by ${doc.submitted_by}.`,
                    type: 'info',
                    category: 'admin',
                    priority: 'low',
                    recipientType: 'role',
                    recipients: 'ADMIN,MD',
                    sentBy: 'Document System',
                    actionUrl: `/documents/${doc.id}`,
                    department: 'Admin'
                });
            }

        } catch (error) {
            console.error('❌ Error monitoring document uploads:', error);
        }
    }

    /**
     * Monitor leave requests
     */
    async monitorLeaveRequests() {
        try {
            // Check for new leave requests
            const [newLeaves] = await db.execute(`
                SELECT * FROM leave_requests 
                WHERE status = 'pending' 
                AND request_date >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            for (const leave of newLeaves) {
                await this.createNotification({
                    title: 'New Leave Request',
                    message: `Leave request from ${leave.employee_name} for ${leave.leave_type} requires approval.`,
                    type: 'info',
                    category: 'hr',
                    priority: 'medium',
                    recipientType: 'role',
                    recipients: 'HR,ADMIN',
                    sentBy: 'Leave System',
                    actionUrl: `/leave/${leave.id}`,
                    department: 'HR'
                });
            }

        } catch (error) {
            console.error('❌ Error monitoring leave requests:', error);
        }
    }

    /**
     * Ensure notifications table exists with proper structure
     */
    async ensureNotificationsTable() {
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    type ENUM('Info', 'Success', 'Warning', 'Error') DEFAULT 'Info',
                    category ENUM('system', 'project', 'hr', 'finance', 'operations', 'safety', 'admin') DEFAULT 'system',
                    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
                    recipient_type VARCHAR(50) DEFAULT 'all',
                    recipients VARCHAR(255) DEFAULT 'All Staff',
                    sent_by VARCHAR(255) DEFAULT 'System',
                    action_url VARCHAR(500) NULL,
                    department VARCHAR(100) NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_type (type),
                    INDEX idx_category (category),
                    INDEX idx_priority (priority),
                    INDEX idx_recipient_type (recipient_type),
                    INDEX idx_department (department),
                    INDEX idx_is_read (is_read),
                    INDEX idx_created_at (created_at)
                )
            `);
        } catch (error) {
            console.error('❌ Error ensuring notifications table:', error);
        }
    }

    /**
     * Get notifications for specific user/role
     */
    async getNotifications(options = {}) {
        const { 
            userId, 
            userRole, 
            type, 
            category, 
            unread = false,
            limit = 50 
        } = options;

        try {
            let query = 'SELECT * FROM notifications WHERE 1=1';
            const params = [];

            // Filter by recipient type
            if (userRole) {
                query += ' AND (recipient_type = ? OR recipient_type = ? OR recipients LIKE ?)';
                params.push('all', 'role', `%${userRole}%`);
            }

            if (type) {
                query += ' AND type = ?';
                params.push(type);
            }

            if (category) {
                query += ' AND category = ?';
                params.push(category);
            }

            if (unread) {
                query += ' AND is_read = 0';
            }

            query += ' ORDER BY created_at DESC LIMIT ?';
            params.push(limit);

            const [notifications] = await db.execute(query, params);
            return notifications;
        } catch (error) {
            console.error('❌ Error getting notifications:', error);
            return [];
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        try {
            await db.execute(
                'UPDATE notifications SET is_read = 1 WHERE id = ?',
                [notificationId]
            );
            return true;
        } catch (error) {
            console.error('❌ Error marking notification as read:', error);
            return false;
        }
    }

    /**
     * Get notification counts
     */
    async getNotificationCounts(userRole) {
        try {
            const [counts] = await db.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(is_read = 0) as unread,
                    SUM(is_read = 1) as read
                FROM notifications 
                WHERE (recipient_type = 'all' OR recipient_type = 'role' OR recipients LIKE ?)
            `, [`%${userRole}%`]);

            return counts[0];
        } catch (error) {
            console.error('❌ Error getting notification counts:', error);
            return { total: 0, unread: 0, read: 0 };
        }
    }
}

module.exports = new NotificationService();
