const db = require('./database/config/database');

async function createAttendanceTable() {
    try {
        console.log('🔍 Checking if attendance table exists...');
        
        // Check if table exists
        const [tables] = await db.execute("SHOW TABLES LIKE 'attendance'");
        console.log('📊 Attendance table check result:', tables);
        
        if (tables.length === 0) {
            console.log('📝 Attendance table does not exist. Creating it...');
            
            // Create attendance table
            await db.execute(`
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
                )
            `);
            
            console.log('✅ Attendance table created successfully');
            
            // Insert sample data
            await db.execute(`
                INSERT IGNORE INTO attendance (
                  employee_id, employee_name, attendance_date, check_in_time, check_out_time, 
                  attendance_status, notes, marked_by, marked_by_role
                ) VALUES
                ('emp001', 'John Doe', CURDATE(), '08:00:00', '17:00:00', 'present', 'Regular work day', 'HR Manager', 'HR Manager'),
                ('emp002', 'Jane Smith', CURDATE(), '08:30:00', '17:00:00', 'late', 'Traffic delay', 'HR Manager', 'HR Manager'),
                ('emp003', 'Mike Johnson', CURDATE(), NULL, NULL, 'sick', 'Fever and headache', 'HR Manager', 'HR Manager'),
                ('emp004', 'Sarah Wilson', CURDATE(), '08:00:00', '16:00:00', 'permission', 'Left early for personal appointment', 'HR Manager', 'HR Manager')
            `);
            
            console.log('✅ Sample attendance data inserted');
            
        } else {
            console.log('✅ Attendance table already exists');
        }
        
        // Verify table was created
        const [verify] = await db.execute('DESCRIBE attendance');
        console.log('🔍 Attendance table structure:', verify);
        
        // Show sample data
        const [sampleData] = await db.execute('SELECT * FROM attendance LIMIT 5');
        console.log('📊 Sample attendance data:', sampleData);
        
        console.log('🎉 Attendance table setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error creating attendance table:', error);
    } finally {
        process.exit(0);
    }
}

createAttendanceTable();
