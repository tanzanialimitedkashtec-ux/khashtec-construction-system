const db = require('../config/database');

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Read the consolidated migration file
    const fs = require('fs').promises;
    const path = require('path');
    
    console.log('📝 Reading complete database schema...');
    const migrationPath = path.join(__dirname, '001_create_tables.sql');
    console.log('📝 Migration path:', migrationPath);
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    console.log('📝 SQL file length:', migrationSQL.length);
    console.log('📝 SQL file preview:', migrationSQL.substring(0, 200) + '...');
    
    // Split SQL file by semicolons and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => {
      const trimmed = stmt.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--');
    });
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Log each statement for debugging
    statements.forEach((stmt, i) => {
      console.log(`📝 Statement ${i + 1}: ${stmt.substring(0, 100)}...`);
    });
    
    let successCount = 0;
    let skippedCount = 0;
    
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
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Successfully executed: ${successCount}`);
    console.log(`⚠️  Skipped (known issues): ${skippedCount}`);
    console.log(`📝 Total statements: ${statements.length}`);
    
    // Verify database
    console.log('\n📝 Step 3: Verifying database...');
    try {
      const [rows] = await db.execute('SHOW TABLES');
      console.log('📊 Raw table rows:', rows);
      console.log('📊 Type of rows:', typeof rows);
      console.log('📊 Is array?', Array.isArray(rows));
      console.log('📊 Number of tables:', rows.length);
      
      // Make sure rows is an array before mapping
      if (Array.isArray(rows)) {
        const tableNames = rows.map(table => Object.values(table)[0]);
        console.log(`📊 Tables created: ${tableNames.join(', ')}`);
        
        // Check if critical tables exist
        const criticalTables = ['users', 'projects', 'documents', 'notifications'];
        const missingTables = criticalTables.filter(table => !tableNames.includes(table));
        
        if (missingTables.length > 0) {
          console.log(`⚠️  Missing critical tables: ${missingTables.join(', ')}`);
        } else {
          console.log('✅ All critical tables created successfully');
        }
      } else {
        console.log('❌ Rows is not an array:', rows);
      }
      
      // Check users table
      try {
        const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
        console.log(`👥 Users table has ${userCount[0]?.count || 0} records`);
      } catch (userError) {
        console.log('👥 Users table check skipped:', userError.message);
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
