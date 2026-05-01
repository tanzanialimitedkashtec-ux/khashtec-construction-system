-- Create suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category ENUM('process', 'policy', 'technology', 'infrastructure', 'hr', 'finance', 'safety', 'general') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL,
    description TEXT NOT NULL,
    impact TEXT,
    implementation TEXT,
    submitted_by INT NOT NULL,
    submitted_by_role VARCHAR(50) NOT NULL,
    status ENUM('Pending', 'Reviewed', 'Implemented', 'Rejected') DEFAULT 'Pending',
    reviewed_by INT,
    reviewed_date DATETIME,
    rejection_reason TEXT,
    submitted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_submitted_by (submitted_by),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_category (category),
    INDEX idx_submitted_date (submitted_date),
    
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Show table structure
DESCRIBE suggestions;
