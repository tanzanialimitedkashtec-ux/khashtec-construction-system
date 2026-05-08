const db = require('./config/database');

async function migrateProjectsData() {
    try {
        console.log('🔄 Starting projects data migration...');

        // Connect to database
        await db.connect();

        if (!db.isConnected) {
            console.error('❌ Could not connect to database');
            return;
        }

        // Check if we need to alter the table to add new columns
        console.log('🔧 Checking if table needs to be altered...');
        
        const columns = await db.execute('DESCRIBE projects');
        const existingColumns = columns.map(col => col.Field);
        
        const columnsToAdd = [
            { name: 'contract_value', sql: 'ALTER TABLE projects ADD COLUMN contract_value DECIMAL(15,2) NULL AFTER status' },
            { name: 'priority_level', sql: 'ALTER TABLE projects ADD COLUMN priority_level ENUM(\'Low\', \'Medium\', \'High\', \'Critical\') DEFAULT \'Medium\' AFTER contract_value' },
            { name: 'project_manager', sql: 'ALTER TABLE projects ADD COLUMN project_manager VARCHAR(255) NULL AFTER priority_level' },
            { name: 'client_name', sql: 'ALTER TABLE projects ADD COLUMN client_name VARCHAR(255) NULL AFTER project_manager' },
            { name: 'project_code', sql: 'ALTER TABLE projects ADD COLUMN project_code VARCHAR(50) UNIQUE NULL AFTER client_name' },
            { name: 'project_type', sql: 'ALTER TABLE projects ADD COLUMN project_type VARCHAR(100) NULL AFTER project_code' },
            { name: 'created_at', sql: 'ALTER TABLE projects ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER project_type' },
            { name: 'updated_at', sql: 'ALTER TABLE projects ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at' }
        ];

        for (const col of columnsToAdd) {
            if (!existingColumns.includes(col.name)) {
                try {
                    await db.execute(col.sql);
                    console.log(`✅ Added column: ${col.name}`);
                } catch (error) {
                    console.log(`⚠️ Failed to add column ${col.name}:`, error.message);
                }
            } else {
                console.log(`⚠️ Column ${col.name} already exists`);
            }
        }

        // Add indexes if they don't exist
        const indexesToAdd = [
            'ALTER TABLE projects ADD INDEX idx_status (status)',
            'ALTER TABLE projects ADD INDEX idx_priority (priority_level)',
            'ALTER TABLE projects ADD INDEX idx_project_manager (project_manager)',
            'ALTER TABLE projects ADD INDEX idx_created_at (created_at)'
        ];

        for (const indexSql of indexesToAdd) {
            try {
                await db.execute(indexSql);
                console.log('✅ Added index');
            } catch (error) {
                console.log('⚠️ Index may already exist or failed:', error.message);
            }
        }

        // Check if there's data in old fields that needs to be migrated
        console.log('🔄 Checking for data in old fields to migrate...');
        
        const oldData = await db.execute(`
            SELECT id, budget, manager_id, client_id
            FROM projects
            WHERE budget IS NOT NULL OR manager_id IS NOT NULL OR client_id IS NOT NULL
        `);

        if (oldData && oldData.length > 0) {
            console.log(`📋 Found ${oldData.length} projects with data in old fields, migrating...`);

            for (const project of oldData) {
                await db.execute(`
                    UPDATE projects
                    SET
                        contract_value = COALESCE(contract_value, ?),
                        project_manager = COALESCE(project_manager, CONCAT('Manager ', ?)),
                        client_name = COALESCE(client_name, CONCAT('Client ', ?))
                    WHERE id = ?
                `, [
                    project.budget,
                    project.manager_id,
                    project.client_id,
                    project.id
                ]);
            }

            console.log(`✅ Migrated data for ${oldData.length} projects`);
        } else {
            console.log('ℹ️ No data found in old fields to migrate');
        }
        const currentData = await db.execute(`
            SELECT id, name, project_code, client_name, project_type, contract_value, project_manager
            FROM projects
            LIMIT 10
        `);

        console.log('📊 Current projects data:');
        if (currentData) {
            currentData.forEach((project, i) => {
                console.log(`Project ${i+1}: ID=${project.id}, Name=${project.name}, Code=${project.project_code || 'NULL'}, Client=${project.client_name || 'NULL'}, Type=${project.project_type || 'NULL'}, Value=${project.contract_value || 'NULL'}, Manager=${project.project_manager || 'NULL'}`);
            });
        }

        console.log('✅ Migration completed successfully');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        if (db) {
            await db.close();
        }
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateProjectsData();
}

module.exports = { migrateProjectsData };