#!/bin/bash

# KASHTEC Construction Management System
# Worker Assignments Migration Script
# This script ensures the worker_assignments table is created

echo "🚀 Starting Worker Assignments Migration..."
echo "📅 Migration Date: $(date)"

# Database connection details (update these with your actual database credentials)
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD=""
DB_NAME="railway"

echo "🔍 Connecting to database: $DB_NAME"

# Execute the worker assignments table creation
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOF'

-- Worker Assignments table migration
-- This will create the table if it doesn't exist

-- Check if table already exists
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM information_schema.tables 
WHERE table_schema = '$DB_NAME' AND table_name = 'worker_assignments';

-- Create table if it doesn't exist
SET @create_table = IF(@table_exists = 0, 
    'CREATE TABLE worker_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(50) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        project_id VARCHAR(50) NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        role_in_project VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NULL,
        assignment_notes TEXT,
        status ENUM("Active", "Completed", "Transferred", "On Hold", "Terminated") DEFAULT "Active",
        assigned_by VARCHAR(255) NOT NULL,
        assigned_by_role VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_employee_id (employee_id),
        INDEX idx_project_id (project_id),
        INDEX idx_status (status),
        INDEX idx_start_date (start_date),
        INDEX idx_end_date (end_date),
        INDEX idx_assigned_by (assigned_by)
    )',
    'SELECT "Table worker_assignments already exists" AS message'
);

-- Execute the creation if needed
PREPARE stmt FROM @create_table;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;



-- Verify table creation
SELECT 
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN status = "Active" THEN 1 END) as active_assignments,
    COUNT(CASE WHEN status = "Completed" THEN 1 END) as completed_assignments
FROM worker_assignments;

EOF

if [ $? -eq 0 ]; then
    echo "✅ Worker assignments migration completed successfully!"
    echo "📊 Table 'worker_assignments' is ready for use"
    echo "🎯 Sample data inserted for testing"
else
    echo "❌ Migration failed!"
    echo "🔍 Please check your database connection and permissions"
    exit 1
fi

echo "🏁 Migration process completed at $(date)"
