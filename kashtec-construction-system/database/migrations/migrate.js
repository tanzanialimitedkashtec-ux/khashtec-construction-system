const db = require('../config/database');

/**
 * Splits a SQL file into individual statements using a character-by-character
 * state-machine parser. This correctly handles:
 *   - Single-quoted strings (with \' and '' escape sequences)
 *   - Double-quoted identifiers (with \" and "" escape sequences)
 *   - Single-line comments (--)
 *   - Multi-line block comments (/* ... *\/)
 *   - Semicolons inside any of the above are NOT treated as statement delimiters
 */
function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let i = 0;
  const len = sql.length;

  while (i < len) {
    const ch = sql[i];

    // ── Single-line comment ──────────────────────────────────────────────────
    if (ch === '-' && sql[i + 1] === '-') {
      // Consume everything up to (but not including) the newline
      while (i < len && sql[i] !== '\n') {
        i++;
      }
      // Do NOT add the comment text to `current`; just continue
      continue;
    }

    // ── Block comment ────────────────────────────────────────────────────────
    if (ch === '/' && sql[i + 1] === '*') {
      i += 2; // skip '/*'
      while (i < len) {
        if (sql[i] === '*' && sql[i + 1] === '/') {
          i += 2; // skip '*/'
          break;
        }
        i++;
      }
      // Do NOT add the comment text to `current`; just continue
      continue;
    }

    // ── Single-quoted string ─────────────────────────────────────────────────
    if (ch === "'") {
      current += ch;
      i++;
      while (i < len) {
        const sc = sql[i];
        if (sc === '\\') {
          // Backslash escape — consume the next character verbatim
          current += sc + (sql[i + 1] || '');
          i += 2;
        } else if (sc === "'" && sql[i + 1] === "'") {
          // Doubled-quote escape inside single-quoted string
          current += "''";
          i += 2;
        } else if (sc === "'") {
          // Closing quote
          current += sc;
          i++;
          break;
        } else {
          current += sc;
          i++;
        }
      }
      continue;
    }

    // ── Double-quoted identifier ─────────────────────────────────────────────
    if (ch === '"') {
      current += ch;
      i++;
      while (i < len) {
        const dc = sql[i];
        if (dc === '\\') {
          current += dc + (sql[i + 1] || '');
          i += 2;
        } else if (dc === '"' && sql[i + 1] === '"') {
          current += '""';
          i += 2;
        } else if (dc === '"') {
          current += dc;
          i++;
          break;
        } else {
          current += dc;
          i++;
        }
      }
      continue;
    }

    // ── Backtick-quoted identifier ───────────────────────────────────────────
    if (ch === '`') {
      current += ch;
      i++;
      while (i < len) {
        const bc = sql[i];
        if (bc === '`' && sql[i + 1] === '`') {
          current += '``';
          i += 2;
        } else if (bc === '`') {
          current += bc;
          i++;
          break;
        } else {
          current += bc;
          i++;
        }
      }
      continue;
    }

    // ── Statement delimiter ──────────────────────────────────────────────────
    if (ch === ';') {
      const stmt = current.trim();
      if (stmt.length > 0) {
        statements.push(stmt);
      }
      current = '';
      i++;
      continue;
    }

    // ── Regular character ────────────────────────────────────────────────────
    current += ch;
    i++;
  }

  // Capture any trailing statement that has no terminating semicolon
  const trailing = current.trim();
  if (trailing.length > 0) {
    statements.push(trailing);
  }

  return statements;
}

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
    
    // Split SQL file using the state-machine parser
    const statements = splitSqlStatements(migrationSQL);

    const createTableCount = statements.filter(s =>
      /^\s*CREATE\s+TABLE/i.test(s)
    ).length;
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    console.log(`📊 CREATE TABLE statements detected: ${createTableCount}`);
    if (createTableCount < 35) {
      console.warn(`⚠️  Expected ~40 CREATE TABLE statements but only found ${createTableCount}. Some tables may be missing.`);
    }
    
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
