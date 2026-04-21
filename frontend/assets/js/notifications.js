// ===== NOTIFICATION SYSTEM =====
class NotificationManager {
    static container = null;

    static init() {
        this.container = document.getElementById('notificationContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notificationContainer';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            `;
            document.body.appendChild(this.container);
        }
    }

    static show(message, type = 'info', title = 'Notification') {
        if (!this.container) {
            this.init();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            position: relative;
            animation: slideIn 0.3s ease;
            cursor: pointer;
        `;

        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <strong>${title}</strong>
                    <div style="margin-top: 0.25rem; font-size: 0.9rem;">${message.replace(/\\n/g, '<br>')}</div>
                </div>
                <span style="font-size: 1.2rem; cursor: pointer; margin-left: 1rem;" onclick="this.parentElement.parentElement.remove()">×</span>
            </div>
        `;

        this.container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    static getBackgroundColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }
}

// Initialize notification system
document.addEventListener('DOMContentLoaded', () => {
    NotificationManager.init();
});
