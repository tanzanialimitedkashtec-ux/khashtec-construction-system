const db = require('../database/config/database');

async function fixDb() {
    try {
        await db.execute("ALTER TABLE documents ADD COLUMN department VARCHAR(100) DEFAULT 'admin' AFTER category");
        console.log("Column 'department' added to documents table.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column 'department' already exists.");
        } else {
            console.error("Error:", e.message);
        }
    }
    process.exit(0);
}

fixDb();
