require('dotenv').config({ path: './backend/.env' });
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

        // Let's insert the missing assistant if needed
        const [assistantAuth] = await connection.execute('SELECT id, email FROM authentication WHERE email = ?', ['assistant@kashtec.com']);
        if (assistantAuth.length > 0) {
            const authId = assistantAuth[0].id;
            const [userCheck] = await connection.execute('SELECT id FROM users WHERE id = ?', [authId]);
            if (userCheck.length === 0) {
                console.log(`Inserting user with ID ${authId} into users table`);
                await connection.execute(`
                    INSERT INTO users (id, name, email, role, department, status)
                    VALUES (?, 'Admin Assistant', 'assistant@kashtec.com', 'Admin Assistant', 'Administration', 'Active')
                `, [authId]);
                console.log('Successfully inserted into users table.');
            } else {
                console.log('User already exists in users table.');
            }
        } else {
            console.log('Admin Assistant not found in authentication table.');
        }
        
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
