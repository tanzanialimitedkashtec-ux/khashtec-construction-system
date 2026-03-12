const db = require('../config/database');

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Read migration files
    const fs = require('fs').promises;
    const path = require('path');
    
    // Step 1: Create tables
    console.log('📝 Step 1: Creating database tables...');
    const tableMigrationPath = path.join(__dirname, '../../database/migrations/001_create_tables.sql');
    const tableSQL = await fs.readFile(tableMigrationPath, 'utf8');
    
    const tableStatements = tableSQL.split(';').filter(stmt => stmt.trim().length > 0);
    console.log(`📝 Found ${tableStatements.length} table creation statements`);
    
    for (let i = 0; i < tableStatements.length; i++) {
      const statement = tableStatements[i].trim();
      if (!statement) continue;
      
      try {
        if (statement.includes('CREATE TABLE') || statement.includes('ALTER TABLE')) {
          await db.query(statement);
        } else {
          await db.execute(statement, []);
        }
        console.log(`✅ Table ${i + 1}/${tableStatements.length} created successfully`);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`⚠️  Table ${i + 1} skipped (already exists):`, error.message);
        } else {
          console.error(`❌ Table ${i + 1} error:`, error.message);
          console.error(`🔍 Failed statement:`, statement);
        }
      }
    }
    
    // Step 2: Insert seed data
    console.log('📝 Step 2: Inserting seed data...');
    try {
      const seedMigrationPath = path.join(__dirname, '../../database/migrations/004_seed_data.sql');
      const seedSQL = await fs.readFile(seedMigrationPath, 'utf8');
      
      const seedStatements = seedSQL.split(';').filter(stmt => stmt.trim().length > 0);
      console.log(`📝 Found ${seedStatements.length} seed data statements`);
      
      for (let i = 0; i < seedStatements.length; i++) {
        const statement = seedStatements[i].trim();
        if (!statement) continue;
        
        try {
          await db.execute(statement, []);
          console.log(`✅ Seed data ${i + 1}/${seedStatements.length} inserted successfully`);
        } catch (error) {
          if (!error.message.includes('Duplicate entry')) {
            console.log(`⚠️  Seed data ${i + 1} skipped (already exists):`, error.message);
          } else {
            console.error(`❌ Seed data ${i + 1} error:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Seed data error:', error.message);
    }
    
    // Step 3: Verify database
    console.log('📝 Step 3: Verifying database...');
    try {
      const [rows] = await db.execute('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?', [process.env.DB_NAME || 'railway']);
      console.log(`📊 Database now has ${rows[0].count} tables`);
      
      // Test a simple query
      const [testUsers] = await db.execute('SELECT COUNT(*) as user_count FROM users');
      console.log(`👥 Users table has ${testUsers[0].user_count} records`);
      
    } catch (error) {
      console.log('📊 Could not verify database:', error.message);
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
