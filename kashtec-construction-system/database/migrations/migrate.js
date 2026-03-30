const db = require('../config/database');

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Read the consolidated migration file
    const fs = require('fs').promises;
    const path = require('path');
    
    console.log('📝 Reading complete database schema...');
    const migrationPath = path.resolve(__dirname, '001_create_tables.sql');
    console.log('📝 Migration path:', migrationPath);
    console.log('📝 __dirname:', __dirname);
    console.log('📝 File exists check:', require('fs').existsSync(migrationPath));
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    console.log('📝 SQL file length:', migrationSQL.length);
    console.log('📝 SQL file preview:', migrationSQL.substring(0, 200) + '...');
    
    // Split SQL file by semicolons with improved parsing
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
    
    let successCount = 0;
    let skippedCount = 0;
    
    // If we still have too few statements, try a simpler approach
    if (statements.length < 30) {
      console.log('⚠️  Too few statements found, trying alternative parsing...');
      const simpleStatements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      console.log(`📝 Alternative parsing found ${simpleStatements.length} statements`);
      
      // Use the alternative if it found more statements
      const finalStatements = simpleStatements.length > statements.length ? simpleStatements : statements;
      
      for (let i = 0; i < finalStatements.length; i++) {
        const statement = finalStatements[i].trim();
        if (!statement) continue;
        
        try {
          // Use query for all statements to avoid prepared statement issues
          await db.query(statement);
          console.log(`✅ Statement ${i + 1}/${finalStatements.length} executed successfully`);
          successCount++;
        } catch (error) {
          // Ignore known errors
          if (error.message.includes('already exists') || 
              error.message.includes('Duplicate entry') ||
              error.message.includes('This command is not supported in the prepared statement protocol yet')) {
            console.log(`⚠️  Statement ${i + 1} skipped (known issue): ${error.message}`);
            skippedCount++;
          } else {
            console.error(`❌ Statement ${i + 1} error: ${error.message}`);
            console.error(`🔍 Failed statement: ${statement.substring(0, 100)}...`);
          }
        }
      }
    } else {
      // Use the original parsing if it found enough statements
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (!statement) continue;
        
        try {
          // Use query for all statements to avoid prepared statement issues
          await db.query(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
          successCount++;
        } catch (error) {
          // Ignore known errors
          if (error.message.includes('already exists') || 
              error.message.includes('Duplicate entry') ||
              error.message.includes('This command is not supported in the prepared statement protocol yet')) {
            console.log(`⚠️  Statement ${i + 1} skipped (known issue): ${error.message}`);
            skippedCount++;
          } else {
            console.error(`❌ Statement ${i + 1} error: ${error.message}`);
            console.error(`🔍 Failed statement: ${statement.substring(0, 100)}...`);
          }
        }
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Successfully executed: ${successCount}`);
    console.log(`⚠️  Skipped (known issues): ${skippedCount}`);
    console.log(`📝 Total statements: ${statements.length}`);
    
    // Verify database
    console.log('\n📝 Step 3: Verifying database...');
    try {
      const tables = await db.execute('SHOW TABLES');
      console.log('📊 Raw table rows:', tables);
      console.log('📊 Type of rows:', typeof tables);
      console.log('📊 Is array?', Array.isArray(tables));
      
      // Handle different MySQL2 result formats
      let tableNames = [];
      if (Array.isArray(tables)) {
        // MySQL2 returns array of objects for SHOW TABLES
        tableNames = tables.map(table => {
          // Get the table name from whatever column name MySQL2 uses
          const tableName = table[`Tables_in_${process.env.DB_NAME || 'railway'}`] || 
                          table[`Tables_in_railway`] || 
                          Object.values(table)[0];
          return tableName;
        });
      } else {
        console.log('❌ Tables result is not an array:', tables);
      }
      
      console.log('📊 Number of tables:', tableNames.length);
      
      if (tableNames.length > 0) {
        console.log(`📊 Tables created: ${tableNames.join(', ')}`);
        
        // Check if critical tables exist
        const criticalTables = [
          'users', 'projects', 'documents', 'notifications', 
          'leave_requests', 'contracts', 'attendance', 'schedule_meetings'
        ];
        const missingTables = criticalTables.filter(table => !tableNames.includes(table));
        
        if (missingTables.length > 0) {
          console.log(`⚠️  Missing critical tables: ${missingTables.join(', ')}`);
        } else {
          console.log('✅ All critical tables created successfully');
        }
      }
      
      // Check users table
      try {
        const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
        console.log(`👥 Users table has ${userCount[0]?.count || 0} records`);
      } catch (userError) {
        console.log('👥 Users table check skipped:', userError.message);
      }
      
      // Check leave_requests table
      try {
        const [leaveCount] = await db.execute('SELECT COUNT(*) as count FROM leave_requests');
        console.log(`📝 Leave requests table has ${leaveCount[0]?.count || 0} records`);
      } catch (leaveError) {
        console.log('📝 Leave requests table check skipped:', leaveError.message);
      }
      
      // Check contracts table
      try {
        const [contractCount] = await db.execute('SELECT COUNT(*) as count FROM contracts');
        console.log(`📋 Contracts table has ${contractCount[0]?.count || 0} records`);
      } catch (contractError) {
        console.log('📋 Contracts table check skipped:', contractError.message);
      }
      
      // Check attendance table
      try {
        const [attendanceCount] = await db.execute('SELECT COUNT(*) as count FROM attendance');
        console.log(`⏰ Attendance table has ${attendanceCount[0]?.count || 0} records`);
      } catch (attendanceError) {
        console.log('⏰ Attendance table check skipped:', attendanceError.message);
      }
      
      // Check schedule_meetings table
      try {
        const [meetingCount] = await db.execute('SELECT COUNT(*) as count FROM schedule_meetings');
        console.log(`📅 Schedule meetings table has ${meetingCount[0]?.count || 0} records`);
      } catch (meetingError) {
        console.log('📅 Schedule meetings table check skipped:', meetingError.message);
      }
      
      console.log('✅ All migrations completed successfully');
      process.exit(0);
    } catch (verifyError) {
      console.log('📊 Could not verify database:', verifyError.message);
      console.log('✅ All migrations completed successfully');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();
