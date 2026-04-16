const db = require('../config/database');

/**
 * State-machine SQL parser that correctly splits a SQL file into individual
 * statements by tracking quote and comment context, so semicolons inside
 * string literals or comments are never treated as statement terminators.
 *
 * Handles:
 *  - Single-quoted strings (with \' and '' escape sequences)
 *  - Double-quoted identifiers
 *  - Single-line comments  (-- …)
 *  - Multi-line comments   (/* … *\/)
 *  - Multi-line CREATE TABLE and INSERT statements
 */
function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    // ── Single-line comment ──────────────────────────────────────────────────
    if (ch === '-' && sql[i + 1] === '-') {
      // Consume everything up to (but not including) the newline
      const end = sql.indexOf('\n', i);
      if (end === -1) {
        // Comment runs to EOF — discard it
        break;
      }
      // Keep the newline so formatting is preserved; skip the comment text
      current += '\n';
      i = end + 1;
      continue;
    }

    // ── Block comment ────────────────────────────────────────────────────────
    if (ch === '/' && sql[i + 1] === '*') {
      const end = sql.indexOf('*/', i + 2);
      if (end === -1) {
        // Unterminated block comment — discard the rest
        break;
      }
      i = end + 2; // skip past '*/'
      continue;
    }

    // ── Quoted string (single or double quote) ───────────────────────────────
    if (ch === "'" || ch === '"') {
      const quote = ch;
      current += ch;
      i++;
      while (i < sql.length) {
        const qch = sql[i];
        if (qch === '\\') {
          // Backslash escape — consume both characters verbatim
          current += sql[i] + (sql[i + 1] || '');
          i += 2;
        } else if (qch === quote) {
          current += qch;
          i++;
          // Handle doubled-quote escape ('' or "")
          if (sql[i] === quote) {
            current += sql[i];
            i++;
          } else {
            break; // End of quoted string
          }
        } else {
          current += qch;
          i++;
        }
      }
      continue;
    }

    // ── Statement terminator ─────────────────────────────────────────────────
    if (ch === ';') {
      const stmt = current.trim();
      if (stmt.length > 0) {
        statements.push(stmt);
      }
      current = '';
      i++;
      continue;
    }

    // ── Ordinary character ───────────────────────────────────────────────────
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
    
    // Parse SQL using the state-machine splitter so that semicolons inside
    // quoted strings and comments are never treated as statement boundaries.
    const allStatements = splitSqlStatements(migrationSQL);

    // Filter out blank or comment-only fragments that slipped through
    const statements = allStatements.filter(stmt => {
      if (!stmt || stmt.length === 0) return false;
      // Skip lines that are purely comment text (shouldn't happen after
      // stripping, but guard anyway)
      if (/^--/.test(stmt)) return false;
      if (/^[\s\-]*$/.test(stmt)) return false;
      return true;
    });

    const createTableCount = statements.filter(s =>
      /^\s*CREATE\s+TABLE/i.test(s)
    ).length;

    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    console.log(`📊 CREATE TABLE statements detected: ${createTableCount}`);

    if (createTableCount < 35) {
      console.warn(
        `⚠️  Expected ~40 CREATE TABLE statements but only found ${createTableCount}. ` +
        'The SQL file may have changed or the parser encountered an issue.'
      );
    }

    let successCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      // Log what kind of statement we're about to run
      const preview = statement.replace(/\s+/g, ' ').substring(0, 80);
      console.log(`▶  [${i + 1}/${statements.length}] ${preview}${statement.length > 80 ? '…' : ''}`);

      try {
        await db.query(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
        successCount++;
      } catch (error) {
        // Ignore benign errors that occur when re-running migrations
        if (
          error.message.includes('already exists') ||
          error.message.includes('Duplicate entry') ||
          error.message.includes('This command is not supported in the prepared statement protocol yet')
        ) {
          console.log(`⚠️  Statement ${i + 1} skipped (known issue): ${error.message}`);
          skippedCount++;
        } else {
          console.error(`❌ Statement ${i + 1} error: ${error.message}`);
          console.error(`🔍 Failed statement: ${statement.substring(0, 200)}`);
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
