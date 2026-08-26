require('dotenv').config();
const db = require('./database/config/database');

async function fix() {
    await db.connect();
    try {
        const [roles] = await db.pool.execute("SHOW COLUMNS FROM users LIKE 'role'");
        console.log("Allowed roles in users:", roles[0].Type);
        
        // Let's also drop the foreign key since that's much safer than trying to keep two tables synchronized with different ENUMs!
        console.log("Dropping foreign key constraint documents_ibfk_2...");
        try {
            await db.pool.execute("ALTER TABLE documents DROP FOREIGN KEY documents_ibfk_2");
            console.log("Successfully dropped foreign key constraint.");
        } catch(e) {
            console.error("Error dropping constraint:", e.message);
        }
    } catch(e) {
        console.error("Error:", e);
    }
    process.exit(0);
}
fix();
