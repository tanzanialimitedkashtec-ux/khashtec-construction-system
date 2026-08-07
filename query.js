require('dotenv').config({ path: './.env' });
const mysql = require('mysql2/promise');

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        const fullNavAccess = [
            "Schedule Meetings",
            "Upload Documents",
            "Edit Documents",
            "Document Management",
            "Send Notifications",
            "Record Meeting Minutes",
            "View Employee List",
            "Office Portal",
            "Backup System Data"
        ];

        await connection.execute(
            'UPDATE authentication SET nav_access = ? WHERE email = ?',
            [JSON.stringify(fullNavAccess), 'assistant@kashtec.com']
        );
        console.log("Updated Admin Assistant nav_access in DB!");

        await connection.end();
    } catch(err) {
        console.error(err);
    }
}
run();
