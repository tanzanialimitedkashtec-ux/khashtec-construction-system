-- Office Portal Users Table
CREATE TABLE IF NOT EXISTS office_portal_users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    employee_id VARCHAR(50),
    position VARCHAR(100),
    service_type VARCHAR(100),
    custom_service VARCHAR(255),
    location VARCHAR(255),
    registration_date DATE,
    status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    profile_image VARCHAR(500),
    access_level VARCHAR(100) DEFAULT 'Basic Access',
    permissions JSON,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    assigned_by VARCHAR(100) DEFAULT 'System',
    assignment_type VARCHAR(100) DEFAULT 'Manual',
    INDEX idx_email (email),
    INDEX idx_employee_id (employee_id),
    INDEX idx_department (department),
    INDEX idx_status (status)
);

-- Office Portal Notifications Table
CREATE TABLE IF NOT EXISTS office_portal_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    channels JSON, -- ['email', 'portal', 'sms']
    status ENUM('pending', 'sent', 'delivered', 'read') DEFAULT 'pending',
    scheduled_at DATETIME,
    sent_at DATETIME,
    read_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES office_portal_users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at)
);

-- Office Portal Access Logs Table
CREATE TABLE IF NOT EXISTS office_portal_access_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES office_portal_users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Office Portal Settings Table
CREATE TABLE IF NOT EXISTS office_portal_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);

-- Insert default settings
INSERT INTO office_portal_settings (setting_key, setting_value, description) VALUES
('auto_assign_employees', 'true', 'Automatically assign new employees to office portal'),
('welcome_notification', 'true', 'Send welcome notification to new portal users'),
('default_access_level', 'Basic Access', 'Default access level for new users'),
('portal_name', 'KASHTEC Office Portal', 'Name of the office portal'),
('admin_email', 'admin@kashtec.com', 'Administrator email for notifications');
