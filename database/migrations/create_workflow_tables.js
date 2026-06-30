const db = require('../config/database');

async function createWorkflowTables() {
    console.log('🔄 Creating Workflow Engine tables...');

    const createInstancesTable = `
        CREATE TABLE IF NOT EXISTS workflow_instances (
            id VARCHAR(100) PRIMARY KEY,
            workflow_name VARCHAR(100) NOT NULL,
            current_state VARCHAR(100) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
            payload_data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `;

    const createHistoryTable = `
        CREATE TABLE IF NOT EXISTS workflow_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            instance_id VARCHAR(100) NOT NULL,
            previous_state VARCHAR(100),
            new_state VARCHAR(100) NOT NULL,
            action VARCHAR(100) NOT NULL,
            actor VARCHAR(100) NOT NULL,
            comments TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (instance_id) REFERENCES workflow_instances(id) ON DELETE CASCADE
        );
    `;

    try {
        await db.execute(createInstancesTable);
        console.log('✅ workflow_instances table created or already exists.');

        await db.execute(createHistoryTable);
        console.log('✅ workflow_history table created or already exists.');

        console.log('🎉 Workflow tables migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating workflow tables:', error);
        process.exit(1);
    }
}

createWorkflowTables();
