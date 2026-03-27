const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railway',
    charset: 'utf8mb4'
};

// Create database connection
const db = mysql.createConnection(dbConfig);

async function runMigration() {
    try {
        console.log('🚀 Starting Worker Assignments Migration...');
        console.log('📅 Migration Date:', new Date().toISOString());
        
        // Connect to database
        await db.connect();
        console.log('✅ Database connected successfully');
        
        // Direct worker assignments table creation SQL
        const workerAssignmentsSQL = `
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
                
                INDEX idx_employee_id (employee_id),
                INDEX idx_project_id (project_id),
                INDEX idx_status (status),
                INDEX idx_start_date (start_date),
                INDEX idx_end_date (end_date),
                INDEX idx_assigned_by (assigned_by)
            );
        `;
        
        console.log('🔍 Executing worker assignments table creation...');
        
        // Execute the migration
        await db.execute(workerAssignmentsSQL);
        console.log('✅ Worker assignments table created successfully');
        
        // Insert sample data
        console.log('📝 Inserting sample worker assignment data...');
        const sampleDataSQL = `
            INSERT IGNORE INTO worker_assignments (
                employee_id, employee_name, project_id, project_name, role_in_project,
                start_date, end_date, assignment_notes, status, assigned_by, assigned_by_role
            ) VALUES
            ('emp001', 'John Doe', 'proj001', 'Dar es Salaam Port Modernization', 'Site Supervisor', '2026-01-15', NULL, 'Leading the port modernization team', 'Active', 'HR Manager', 'HR Manager'),
            ('emp002', 'Jane Smith', 'proj002', 'Residential Buildings - Kinondoni', 'Project Manager', '2026-02-01', '2026-03-15', 'Successfully completed residential project', 'Completed', 'HR Manager', 'HR Manager'),
            ('emp003', 'Mike Johnson', 'proj003', 'Fukayosi Real Estate Project', 'Construction Worker', '2026-01-20', NULL, 'Skilled labor for real estate development', 'Active', 'HR Manager', 'HR Manager'),
            ('emp004', 'Sarah Wilson', 'proj004', 'Road Construction - Bagamoyo', 'Engineer', '2026-03-01', NULL, 'Road construction and infrastructure work', 'Active', 'HR Manager', 'HR Manager')
        `;
        
        await db.execute(sampleDataSQL);
        console.log('✅ Sample data inserted successfully');
        
        // Insert sample policy if policies table is empty
        console.log('📝 Checking if policies table needs sample data...');
        const [policyCheck] = await db.execute('SELECT COUNT(*) as count FROM policies');
        
        if (policyCheck[0].count === 0) {
            console.log('📝 Inserting sample policy data...');
            const samplePolicySQL = `
                INSERT IGNORE INTO policies (id, title, description, submitted_by, submitted_by_role, impact, status) VALUES
                ('digital-recruitment', 'Digital Recruitment Platform Policy', 'Implementation of online job portal and digital application system', 'HR Department', 'HR Manager', 'High', 'Pending'),
                ('safety-manual', 'Construction Safety Manual 2026', 'Updated safety procedures and guidelines for all construction sites', 'HSE Department', 'HSE Manager', 'Critical', 'Pending'),
                ('remote-work', 'Remote Work Policy', 'Guidelines for remote work and flexible scheduling options', 'HR Department', 'HR Manager', 'Medium', 'Pending')
            `;
            
            await db.execute(samplePolicySQL);
            console.log('✅ Sample policy data inserted successfully');
        } else {
            console.log('📋 Policies table already has data');
        }
        
        // Verify table creation
        const [verification] = await db.execute(`
            SELECT 
                COUNT(*) as total_assignments,
                COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_assignments
            FROM worker_assignments
        `);
        
        console.log('📊 Verification Results:');
        console.log(`   Total assignments: ${verification[0].total_assignments}`);
        console.log(`   Active assignments: ${verification[0].active_assignments}`);
        console.log('🎉 Worker assignments migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await db.end();
        console.log('🔌 Database connection closed');
    }
}

// Run the migration
if (require.main === module) {
    runMigration();
}

module.exports = { runMigration };
