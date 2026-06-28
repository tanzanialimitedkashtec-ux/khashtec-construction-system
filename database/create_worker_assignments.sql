-- KASHTEC Construction Management System
-- Worker Assignments Table Migration
-- Run this script to create the worker_assignments table
-- Date: 2026-03-27

-- ========================================
-- WORKER ASSIGNMENTS TABLE CREATION
-- ========================================

-- Check if table already exists and create if it doesn't
CREATE TABLE IF NOT EXISTS worker_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  project_id VARCHAR(50) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  role_in_project VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  assignment_notes TEXT,
  status ENUM('Active', 'Completed', 'Transferred', 'On Hold', 'Terminated') DEFAULT 'Active',
  assigned_by VARCHAR(255) NOT NULL,
  assigned_by_role VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for optimal performance
  INDEX idx_employee_id (employee_id),
  INDEX idx_project_id (project_id),
  INDEX idx_status (status),
  INDEX idx_start_date (start_date),
  INDEX idx_end_date (end_date),
  INDEX idx_assigned_by (assigned_by)
);

-- ========================================
-- SAMPLE DATA INSERTION
-- ========================================

-- Insert sample worker assignment data (will be ignored if already exists)
INSERT IGNORE INTO worker_assignments (
  employee_id, 
  employee_name, 
  project_id, 
  project_name, 
  role_in_project, 
  start_date, 
  end_date, 
  assignment_notes, 
  status, 
  assigned_by, 
  assigned_by_role
) VALUES
('emp001', 'John Doe', 'proj001', 'Dar es Salaam Port Modernization', 'Site Supervisor', '2026-01-15', NULL, 'Leading the port modernization team', 'Active', 'HR Manager', 'HR Manager'),
('emp002', 'Jane Smith', 'proj002', 'Residential Buildings - Kinondoni', 'Project Manager', '2026-02-01', '2026-03-15', 'Successfully completed residential project', 'Completed', 'HR Manager', 'HR Manager'),
('emp003', 'Mike Johnson', 'proj003', 'Fukayosi Real Estate Project', 'Construction Worker', '2026-01-20', NULL, 'Skilled labor for real estate development', 'Active', 'HR Manager', 'HR Manager'),
('emp004', 'Sarah Wilson', 'proj004', 'Road Construction - Bagamoyo', 'Engineer', '2026-03-01', NULL, 'Road construction and infrastructure work', 'Active', 'HR Manager', 'HR Manager');

-- ========================================
-- VERIFICATION QUERY
-- ========================================

-- Verify table creation and data insertion
SELECT 
    'Worker Assignments Table Created Successfully' as status,
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_assignments,
    COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_assignments,
    MIN(created_at) as first_assignment_date,
    MAX(created_at) as last_assignment_date
FROM worker_assignments;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

SELECT 
    '✅ MIGRATION COMPLETED SUCCESSFULLY!' as message,
    'worker_assignments table is ready for use' as table_status,
    NOW() as migration_timestamp;
