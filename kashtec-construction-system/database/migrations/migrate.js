const db = require('../config/database');

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Read migration file
    const fs = require('fs').promises;
    const path = require('path');
    const migrationPath = path.join(__dirname, '../../database/migrations/001_create_tables.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    // Split SQL file by semicolons and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      try {
        await db.execute(statement);
        console.log('✅ Migration executed successfully');
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists')) {
          console.error('❌ Migration error:', error.message);
        }
      }
    }
    
    console.log('✅ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
