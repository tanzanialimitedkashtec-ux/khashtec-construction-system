-- Create transport_costs table
CREATE TABLE IF NOT EXISTS transport_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cost_type ENUM('maintenance', 'extra') NOT NULL,
    category ENUM('service_maintenance', 'repair', 'fuel', 'toll_fees', 'tyre_replacement', 'insurance', 'other') NOT NULL,
    description TEXT NOT NULL,
    vehicle_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TZS',
    date_incurred DATE NOT NULL,
    provider VARCHAR(255),
    invoice_number VARCHAR(100),
    payment_status ENUM('pending', 'approved', 'paid', 'rejected') DEFAULT 'pending',
    approved_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_cost_type (cost_type),
    INDEX idx_category (category),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_date_incurred (date_incurred),
    INDEX idx_payment_status (payment_status)
);
