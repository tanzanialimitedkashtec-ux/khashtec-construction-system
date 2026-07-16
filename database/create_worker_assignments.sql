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
