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
        
        // Read the migration SQL file
        const migrationPath = path.join(__dirname, '../database/migrations/001_create_tables.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Extract just the worker assignments part
        const workerAssignmentsSQL = extractWorkerAssignmentsSQL(migrationSQL);
        
        if (workerAssignmentsSQL) {
            console.log('🔍 Executing worker assignments table creation...');
            
            // Execute the migration
            await db.execute(workerAssignmentsSQL);
            console.log('✅ Worker assignments table created successfully');
            
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
            
        } else {
            console.log('⚠️ Worker assignments SQL not found in migration file');
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await db.end();
        console.log('🔌 Database connection closed');
    }
}

function extractWorkerAssignmentsSQL(fullSQL) {
    // Find the worker assignments table creation section
    const lines = fullSQL.split('\n');
    let inWorkerAssignments = false;
    let workerAssignmentsSQL = '';
    
    for (const line of lines) {
        if (line.includes('-- Worker Assignments table')) {
            inWorkerAssignments = true;
            workerAssignmentsSQL += line + '\n';
            continue;
        }
        
        if (inWorkerAssignments) {
            workerAssignmentsSQL += line + '\n';
            
            // Stop at the next table creation or major section
            if (line.includes('-- Insert') && !line.includes('worker_assignments')) {
                break;
            }
        }
    }
    
    return workerAssignmentsSQL.trim();
}

// Run the migration
if (require.main === module) {
    runMigration();
}

module.exports = { runMigration };
