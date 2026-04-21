const db = require('../../database/config/database');

async function createMissingTables() {
  try {
    console.log('🔄 Creating missing tables...');
    
    // Drop and recreate attendance table with correct spelling
    console.log('🗑️ Dropping incorrect Attendence table...');
    try {
      await db.execute('DROP TABLE IF EXISTS Attendence');
      console.log('✅ Incorrect Attendence table dropped');
    } catch (error) {
      console.log('ℹ️ Attendence table did not exist or could not be dropped');
    }
    
    // Drop and recreate leave_request table with correct name
    console.log('🗑️ Dropping incorrect leave_request table...');
    try {
      await db.execute('DROP TABLE IF EXISTS leave_request');
      console.log('✅ Incorrect leave_request table dropped');
    } catch (error) {
      console.log('ℹ️ leave_request table did not exist or could not be dropped');
    }
    
    // Create attendance table
    console.log('📝 Creating attendance table...');
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
    console.log('✅ Attendance table created');
    
    // Create leave_requests table
    console.log('📝 Creating leave_requests table...');
    await db.execute(`
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
      )
    `);
    console.log('✅ Leave requests table created');
    
    // Insert sample data
    console.log('📝 Inserting sample data...');
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
    
    await db.execute(`
      INSERT IGNORE INTO leave_requests (
        employee_id, employee_name, leave_type, start_date, end_date, days_requested, 
        reason_for_leave, approval_status, approved_by
      ) VALUES
      ('emp001', 'John Doe', 'annual', '2026-04-15', '2026-04-19', 5, 'Family vacation planned for Easter holiday', 'pending', NULL),
      ('emp002', 'Jane Smith', 'sick', '2026-03-25', '2026-03-26', 2, 'Medical appointment and recovery', 'approved', 'HR Manager'),
      ('emp003', 'Mike Johnson', 'compassionate', '2026-04-01', '2026-04-02', 2, 'Family emergency - attending funeral', 'approved', 'HR Manager'),
      ('emp004', 'Sarah Wilson', 'study', '2026-05-10', '2026-05-12', 3, 'Professional development course attendance', 'pending', NULL)
    `);
    
    console.log('✅ Sample data inserted');
    
    // Verify tables
    const [tables] = await db.execute('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0]);
    console.log('📊 Tables after creation:', tableNames);
    
    const [attendanceCount] = await db.execute('SELECT COUNT(*) as count FROM attendance');
    console.log('⏰ Attendance records:', attendanceCount[0].count);
    
    const [leaveCount] = await db.execute('SELECT COUNT(*) as count FROM leave_requests');
    console.log('📝 Leave request records:', leaveCount[0].count);
    
    console.log('🎉 Missing tables created successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createMissingTables();
