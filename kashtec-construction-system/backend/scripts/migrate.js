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
        
        // Run main migration file first
        console.log('🔍 Running main migration file...');
        try {
            const migrationPath = path.join(__dirname, '../database/migrations/001_create_tables.sql');
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
            
            // Split SQL into individual statements and execute them
            const statements = migrationSQL
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            
            for (const statement of statements) {
                if (statement.trim()) {
                    await db.execute(statement);
                }
            }
            
            console.log('✅ Main migration executed successfully');
        } catch (error) {
            console.error('❌ Error executing main migration:', error);
            // Continue with worker assignments table creation even if main migration fails
        }
        
        // Create workforce_budgets table if it doesn't exist
        console.log('🔍 Creating workforce_budgets table...');
        try {
            const workforceBudgetsSQL = `
                CREATE TABLE IF NOT EXISTS workforce_budgets (
                  id VARCHAR(50) PRIMARY KEY,
                  budget_period VARCHAR(100) NOT NULL,
                  total_proposed DECIMAL(15,2) NOT NULL,
                  salaries_wages DECIMAL(15,2) NOT NULL,
                  training_development DECIMAL(15,2) NOT NULL,
                  employee_benefits DECIMAL(15,2) NOT NULL,
                  recruitment_costs DECIMAL(15,2) NOT NULL,
                  submitted_by VARCHAR(255) NOT NULL,
                  submitted_by_role VARCHAR(100),
                  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  status ENUM('Pending', 'Approved', 'Rejected', 'Modification Requested') DEFAULT 'Pending',
                  approved_by VARCHAR(255),
                  approved_date TIMESTAMP,
                  rejection_reason TEXT,
                  modification_request TEXT,
                  current_headcount INT DEFAULT 0,
                  justification TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_status (status),
                  INDEX idx_department (submitted_by),
                  INDEX idx_period (budget_period)
                );
            `;
            
            await db.execute(workforceBudgetsSQL);
            console.log('✅ Workforce budgets table created successfully');
        } catch (error) {
            console.error('❌ Error creating workforce_budgets table:', error);
        }
        
        // Verify workforce_budgets table exists
        console.log('🔍 Verifying workforce_budgets table...');
        try {
            const [budgetsCheck] = await db.execute(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = 'workforce_budgets'
            `);
            
            if (budgetsCheck[0].count > 0) {
                console.log('✅ Workforce budgets table verified successfully');
            } else {
                console.error('❌ Workforce budgets table was not created!');
            }
        } catch (error) {
            console.error('❌ Error checking workforce_budgets table:', error);
        }
        
        // Create policies table if it doesn't exist
        console.log('🔍 Creating policies table...');
        try {
            const policiesTableSQL = `
                CREATE TABLE IF NOT EXISTS policies (
                  id VARCHAR(50) PRIMARY KEY,
                  title VARCHAR(255) NOT NULL,
                  description TEXT,
                  submitted_by VARCHAR(255) NOT NULL,
                  submitted_by_role VARCHAR(100),
                  submission_date DATE DEFAULT CURRENT_DATE,
                  impact ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
                  status ENUM('Pending', 'Approved', 'Rejected', 'Revision Requested') DEFAULT 'Pending',
                  approved_by VARCHAR(255),
                  approved_date DATE,
                  rejection_reason TEXT,
                  revision_request TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_status (status),
                  INDEX idx_submitted_by (submitted_by),
                  INDEX idx_date (submission_date)
                );
            `;
            
            await db.execute(policiesTableSQL);
            console.log('✅ Policies table created successfully');
        } catch (error) {
            console.error('❌ Error creating policies table:', error);
        }
        
        // Verify policies table exists
        console.log('🔍 Verifying policies table...');
        try {
            const [policiesCheck] = await db.execute(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = 'policies'
            `);
            
            if (policiesCheck[0].count > 0) {
                console.log('✅ Policies table verified successfully');
            } else {
                console.error('❌ Policies table was not created!');
            }
        } catch (error) {
            console.error('❌ Error checking policies table:', error);
        }
        
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
        
        // Verify table was created
        console.log('🔍 Verifying worker assignments table...');
        const [tableCheck] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'worker_assignments'
        `);
        
        if (tableCheck[0].count > 0) {
            console.log('✅ Worker assignments table verified successfully');
        } else {
            console.error('❌ Worker assignments table was not created!');
            throw new Error('Table creation verification failed');
        }
        
        // Update HR work table ENUM to include Employment Action
        console.log('🔧 Updating HR work table ENUM for Employment Action...');
        try {
            await db.execute(`
                ALTER TABLE hr_work 
                MODIFY COLUMN work_type ENUM(
                    'Employee Registration', 'Worker Account Creation', 'Project Assignment', 
                    'Attendance Tracking', 'Leave Management', 'Contract Management', 
                    'Policy Management', 'Senior Staff Hiring', 'Budget Approval', 'Employment Action'
                ) DEFAULT 'Employee Registration'
            `);
            console.log('✅ HR work table ENUM updated successfully');
        } catch (error) {
            // ENUM might already exist, that's okay
            if (error.message.includes('Duplicate entry') || error.message.includes('already exists')) {
                console.log('📋 HR work table ENUM already includes Employment Action');
            } else {
                console.warn('⚠️ Could not update HR work table ENUM:', error.message);
            }
        }
        
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
        
        // Verify sample data was inserted
        console.log('🔍 Verifying sample worker assignment data...');
        const [dataCheck] = await db.execute('SELECT COUNT(*) as count FROM worker_assignments');
        
        if (dataCheck[0].count > 0) {
            console.log(`✅ Sample data verified: ${dataCheck[0].count} worker assignments found`);
        } else {
            console.error('❌ No sample data was inserted!');
            throw new Error('Sample data insertion verification failed');
        }
        
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
        
        // Insert sample workforce budget if table is empty
        console.log('📝 Checking if workforce budgets table needs sample data...');
        const [budgetCheck] = await db.execute('SELECT COUNT(*) as count FROM workforce_budgets');
        
        if (budgetCheck[0].count === 0) {
            console.log('📝 Inserting sample workforce budget data...');
            const sampleBudgetSQL = `
                INSERT IGNORE INTO workforce_budgets (id, budget_period, total_proposed, salaries_wages, training_development, employee_benefits, recruitment_costs, submitted_by, submitted_by_role, current_headcount, justification) VALUES
                ('q1-2026-workforce', 'Q1 2026', 50000000.00, 30000000.00, 8000000.00, 7000000.00, 5000000.00, 'Finance Department', 'Finance Manager', 45, 'Q1 budget covering salaries and operational costs for first quarter'),
                ('q2-2026-workforce', 'Q2 2026', 55000000.00, 32000000.00, 9000000.00, 7500000.00, 6500000.00, 'Finance Department', 'Finance Manager', 48, 'Q2 budget with increased hiring and training initiatives'),
                ('q3-2026-workforce', 'Q3 2026', 52000000.00, 31000000.00, 8500000.00, 7200000.00, 5300000.00, 'Finance Department', 'Finance Manager', 46, 'Q3 budget adjusted for seasonal workforce changes'),
                ('q4-2026-workforce', 'Q4 2026', 58000000.00, 33000000.00, 9500000.00, 7800000.00, 7700000.00, 'Finance Department', 'Finance Manager', 50, 'Q4 budget including year-end bonuses and recruitment')
            `;
            
            await db.execute(sampleBudgetSQL);
            console.log('✅ Sample workforce budget data inserted successfully');
        } else {
            console.log('📋 Workforce budgets table already has data');
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
