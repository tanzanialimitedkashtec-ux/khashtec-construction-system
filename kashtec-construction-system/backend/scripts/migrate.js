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
                .split(/;\s*(?=(?:[^']*'[^']*')*[^']*$)/) // Split on semicolons not within quotes
                .map(stmt => stmt.trim())
                .filter(stmt => {
                    // Filter out empty statements and pure comments
                    if (!stmt || stmt.length === 0) return false;
                    if (stmt.startsWith('--')) return false;
                    if (stmt.match(/^[\s-]*$/)) return false; // Only whitespace or dashes
                    return true;
                });
            
            console.log(`📝 Found ${statements.length} SQL statements to execute`);
            
            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                if (statement.trim()) {
                    console.log(`📝 Statement ${i + 1}: \n${statement.substring(0, 100)}...`);
                    try {
                        await db.execute(statement);
                        console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
                    } catch (stmtError) {
                        console.error(`❌ Error in statement ${i + 1}:`, stmtError.message);
                        console.error(`📝 Failed statement: ${statement.substring(0, 200)}...`);
                        throw stmtError;
                    }
                }
            }
            
            console.log('✅ Main migration executed successfully');
        } catch (error) {
            console.error('❌ Error executing main migration:', error);
            // Continue with worker assignments table creation even if main migration fails
        }
        
        // Create leave_requests table if it doesn't exist
        console.log('🔍 Creating leave_requests table...');
        try {
            const leaveRequestsSQL = `
                CREATE TABLE IF NOT EXISTS leave_requests (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  employee_id VARCHAR(50) NOT NULL,
                  employee_name VARCHAR(255) NOT NULL,
                  leave_type ENUM('annual', 'sick', 'maternity', 'paternity', 'compassionate', 'study', 'unpaid') NOT NULL,
                  start_date DATE NOT NULL,
                  end_date DATE NOT NULL,
                  days_requested INT NOT NULL,
                  reason_for_leave TEXT NOT NULL,
                  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                  approved_by VARCHAR(255),
                  approved_date TIMESTAMP NULL,
                  rejection_reason TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  
                  INDEX idx_employee_id (employee_id),
                  INDEX idx_leave_type (leave_type),
                  INDEX idx_start_date (start_date),
                  INDEX idx_end_date (end_date),
                  INDEX idx_approval_status (approval_status),
                  INDEX idx_created_at (created_at)
                );
            `;
            
            await db.execute(leaveRequestsSQL);
            console.log('✅ Leave requests table created successfully');
        } catch (error) {
            console.error('❌ Error creating leave_requests table:', error);
        }

        // Create contracts table if it doesn't exist
        console.log('🔍 Creating contracts table...');
        try {
            const contractsSQL = `
                CREATE TABLE IF NOT EXISTS contracts (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  employee_id VARCHAR(50) NOT NULL,
                  employee_name VARCHAR(255) NOT NULL,
                  contract_type ENUM('permanent', 'temporary', 'contract', 'probation', 'internship') NOT NULL,
                  start_date DATE NOT NULL,
                  end_date DATE NULL,
                  salary DECIMAL(12,2) NOT NULL,
                  contract_status ENUM('active', 'expired', 'terminated', 'renewed') DEFAULT 'active',
                  contract_terms TEXT,
                  contract_document VARCHAR(255),
                  created_by VARCHAR(255),
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  
                  INDEX idx_employee_id (employee_id),
                  INDEX idx_contract_type (contract_type),
                  INDEX idx_start_date (start_date),
                  INDEX idx_end_date (end_date),
                  INDEX idx_contract_status (contract_status),
                  INDEX idx_created_at (created_at)
                );
            `;
            
            await db.execute(contractsSQL);
            console.log('✅ Contracts table created successfully');
        } catch (error) {
            console.error('❌ Error creating contracts table:', error);
        }

        // Create attendance table if it doesn't exist
        console.log('🔍 Creating attendance table...');
        try {
            const attendanceSQL = `
                CREATE TABLE IF NOT EXISTS attendance (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  employee_id VARCHAR(50) NOT NULL,
                  employee_name VARCHAR(255) NOT NULL,
                  attendance_date DATE NOT NULL,
                  check_in_time TIME NULL,
                  check_out_time TIME NULL,
                  attendance_status ENUM('present', 'absent', 'late', 'sick', 'annual', 'permission') NOT NULL,
                  notes TEXT NULL,
                  marked_by VARCHAR(255) NOT NULL,
                  marked_by_role VARCHAR(100) DEFAULT 'HR Manager',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  
                  INDEX idx_employee_id (employee_id),
                  INDEX idx_attendance_date (attendance_date),
                  INDEX idx_attendance_status (attendance_status),
                  INDEX idx_marked_by (marked_by),
                  
                  UNIQUE KEY unique_employee_date (employee_id, attendance_date)
                );
            `;
            
            await db.execute(attendanceSQL);
            console.log('✅ Attendance table created successfully');
        } catch (error) {
            console.error('❌ Error creating attendance table:', error);
        }

        // Create schedule_meetings table if it doesn't exist
        console.log('🔍 Creating schedule_meetings table...');
        try {
            const scheduleMeetingsSQL = `
                CREATE TABLE IF NOT EXISTS schedule_meetings (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  meeting_title VARCHAR(255) NOT NULL,
                  meeting_type ENUM('board', 'management', 'department', 'project', 'client', 'training', 'general') NOT NULL,
                  meeting_date DATE NOT NULL,
                  start_time TIME NOT NULL,
                  end_time TIME NOT NULL,
                  location VARCHAR(255),
                  organizing_department ENUM('management', 'hr', 'finance', 'projects', 'operations', 'realestate') NOT NULL,
                  expected_attendees INT DEFAULT 1,
                  meeting_description TEXT,
                  projector_required BOOLEAN DEFAULT FALSE,
                  whiteboard_required BOOLEAN DEFAULT FALSE,
                  refreshments_required BOOLEAN DEFAULT FALSE,
                  parking_required BOOLEAN DEFAULT FALSE,
                  status ENUM('Scheduled', 'Confirmed', 'Cancelled', 'Completed', 'Postponed') DEFAULT 'Scheduled',
                  created_by INT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  
                  INDEX idx_meeting_date (meeting_date),
                  INDEX idx_meeting_type (meeting_type),
                  INDEX idx_department (organizing_department),
                  INDEX idx_status (status),
                  INDEX idx_created_by (created_by)
                );
            `;
            
            await db.execute(scheduleMeetingsSQL);
            console.log('✅ Schedule meetings table created successfully');
        } catch (error) {
            console.error('❌ Error creating schedule_meetings table:', error);
        }

        // Create meeting_minutes table if it doesn't exist
        console.log('🔍 Creating meeting_minutes table...');
        try {
            const meetingMinutesSQL = `
                CREATE TABLE IF NOT EXISTS meeting_minutes (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  meeting_title VARCHAR(255) NOT NULL,
                  meeting_type ENUM('board', 'management', 'department', 'project', 'client', 'training', 'general') NOT NULL,
                  meeting_date DATE NOT NULL,
                  meeting_time TIME NOT NULL,
                  attendees TEXT,
                  minutes_content TEXT NOT NULL,
                  action_items TEXT,
                  recorded_by VARCHAR(255) NOT NULL,
                  recording_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  status ENUM('draft', 'final', 'archived') DEFAULT 'draft',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_meeting_date (meeting_date),
                  INDEX idx_meeting_type (meeting_type),
                  INDEX idx_status (status),
                  INDEX idx_recorded_by (recorded_by)
                );
            `;
            
            await db.execute(meetingMinutesSQL);
            console.log('✅ Meeting minutes table created successfully');
        } catch (error) {
            console.error('❌ Error creating meeting_minutes table:', error);
        }
        
        // Verify meeting_minutes table exists
        console.log('🔍 Verifying meeting_minutes table...');
        try {
            const [minutesCheck] = await db.execute(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = 'meeting_minutes'
            `);
            
            if (minutesCheck[0].count > 0) {
                console.log('✅ Meeting minutes table verified successfully');
            } else {
                console.error('❌ Meeting minutes table was not created!');
            }
        } catch (error) {
            console.error('❌ Error checking meeting_minutes table:', error);
        }
        
        // Update admin_work table ENUM to include Document Upload
        console.log('🔧 Updating admin_work table ENUM for Document Upload...');
        try {
            await db.execute(`
                ALTER TABLE admin_work 
                MODIFY COLUMN work_type ENUM(
                    'Administrative Operations', 'Compliance Management', 'Staff Oversight', 
                    'Policy Implementation', 'Document Management', 'Document Upload', 
                    'User Account Management', 'System Administration', 'Department Coordination'
                ) DEFAULT 'Administrative Operations'
            `);
            console.log('✅ Admin work table ENUM updated successfully');
        } catch (error) {
            // ENUM might already exist, that's okay
            if (error.message.includes('Duplicate entry') || error.message.includes('already exists')) {
                console.log('📋 Admin work table ENUM already includes Document Upload');
            } else {
                console.warn('⚠️ Could not update admin work table ENUM:', error.message);
            }
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
        
        // Insert sample leave requests if table is empty
        console.log('📝 Checking if leave_requests table needs sample data...');
        const [leaveCheck] = await db.execute('SELECT COUNT(*) as count FROM leave_requests');
        
        if (leaveCheck[0].count === 0) {
            console.log('📝 Inserting sample leave request data...');
            const sampleLeaveSQL = `
                INSERT IGNORE INTO leave_requests (
                    employee_id, employee_name, leave_type, start_date, end_date, days_requested, 
                    reason_for_leave, approval_status, approved_by
                ) VALUES
                ('emp001', 'John Doe', 'annual', '2026-04-15', '2026-04-19', 5, 'Family vacation planned for Easter holiday', 'pending', NULL),
                ('emp002', 'Jane Smith', 'sick', '2026-03-25', '2026-03-26', 2, 'Medical appointment and recovery', 'approved', 'HR Manager'),
                ('emp003', 'Mike Johnson', 'compassionate', '2026-04-01', '2026-04-02', 2, 'Family emergency - attending funeral', 'approved', 'HR Manager'),
                ('emp004', 'Sarah Wilson', 'study', '2026-05-10', '2026-05-12', 3, 'Professional development course attendance', 'pending', NULL)
            `;
            
            await db.execute(sampleLeaveSQL);
            console.log('✅ Sample leave request data inserted successfully');
        } else {
            console.log('📋 Leave requests table already has data');
        }

        // Insert sample contracts if table is empty
        console.log('📝 Checking if contracts table needs sample data...');
        const [contractCheck] = await db.execute('SELECT COUNT(*) as count FROM contracts');
        
        if (contractCheck[0].count === 0) {
            console.log('📝 Inserting sample contract data...');
            const sampleContractSQL = `
                INSERT IGNORE INTO contracts (
                    employee_id, employee_name, contract_type, start_date, end_date, salary, 
                    contract_status, contract_terms, created_by
                ) VALUES
                ('emp001', 'John Doe', 'permanent', '2025-01-15', NULL, 2500000.00, 'active', 'Full-time permanent employment with standard benefits including health insurance, annual leave, and pension contributions', 'HR Manager'),
                ('emp002', 'Jane Smith', 'contract', '2025-03-01', '2025-12-31', 2200000.00, 'active', 'Fixed-term contract for project duration with possibility of extension based on performance', 'HR Manager'),
                ('emp003', 'Mike Johnson', 'probation', '2025-02-01', '2025-05-01', 1800000.00, 'renewed', 'Probation period successfully completed and converted to permanent contract', 'HR Manager'),
                ('emp004', 'Sarah Wilson', 'temporary', '2025-04-01', '2025-06-30', 2000000.00, 'active', 'Temporary contract for special project with competitive hourly rate and overtime benefits', 'HR Manager')
            `;
            
            await db.execute(sampleContractSQL);
            console.log('✅ Sample contract data inserted successfully');
        } else {
            console.log('📋 Contracts table already has data');
        }

        // Insert sample attendance if table is empty
        console.log('📝 Checking if attendance table needs sample data...');
        const [attendanceCheck] = await db.execute('SELECT COUNT(*) as count FROM attendance');
        
        if (attendanceCheck[0].count === 0) {
            console.log('📝 Inserting sample attendance data...');
            const sampleAttendanceSQL = `
                INSERT IGNORE INTO attendance (
                    employee_id, employee_name, attendance_date, check_in_time, check_out_time, 
                    attendance_status, notes, marked_by, marked_by_role
                ) VALUES
                ('emp001', 'John Doe', CURDATE(), '08:00:00', '17:00:00', 'present', 'Regular work day', 'HR Manager', 'HR Manager'),
                ('emp002', 'Jane Smith', CURDATE(), '08:30:00', '17:00:00', 'late', 'Traffic delay', 'HR Manager', 'HR Manager'),
                ('emp003', 'Mike Johnson', CURDATE(), NULL, NULL, 'sick', 'Fever and headache', 'HR Manager', 'HR Manager'),
                ('emp004', 'Sarah Wilson', CURDATE(), '08:00:00', '16:00:00', 'permission', 'Left early for personal appointment', 'HR Manager', 'HR Manager')
            `;
            
            await db.execute(sampleAttendanceSQL);
            console.log('✅ Sample attendance data inserted successfully');
        } else {
            console.log('📋 Attendance table already has data');
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
