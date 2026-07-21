const fs = require('fs');
const mysql = require('mysql2/promise');

const backupFile = 'backup-2026-07-19T10-56-16.sql';

const DB_CONFIG = {
    host: 'interchange.proxy.rlwy.net',
    user: 'root',
    password: 'FpJJluFwvIzgsMTsfDZApQLznVVVIzJd',
    database: 'railway',
    port: 50274,
    multipleStatements: true
};

async function restoreNotifications() {
    try {
        console.log(`📖 Reading ${backupFile}...`);
        const sqlContent = fs.readFileSync(backupFile, 'utf8');

        // Extract notifications block
        const regex = /-- Table: notifications[\s\S]*?DROP TABLE IF EXISTS `notifications`;[\s\S]*?(CREATE TABLE `notifications`[\s\S]*?;)[\s\S]*?(INSERT INTO `notifications`[\s\S]*?;)/i;
        const match = sqlContent.match(regex);

        if (!match) {
            console.error('❌ Could not find notifications backup data in the SQL file.');
            process.exit(1);
        }

        const createTableSql = match[1];
        const insertDataSql = match[2];

        console.log('✅ Found notifications data (Create Table and Insert).');
        console.log(`Preview: ${insertDataSql.substring(0, 100)}...`);

        console.log('🔌 Connecting to database...');
        const db = await mysql.createConnection(DB_CONFIG);

        console.log('🗑️ Dropping existing notifications table (if any)...');
        await db.query('DROP TABLE IF EXISTS `notifications`');

        console.log('🏗️ Creating notifications table...');
        await db.query(createTableSql);

        console.log('📥 Inserting notification records...');
        await db.query(insertDataSql);

        console.log('🎉 Successfully restored notifications table!');
        await db.end();

    } catch (err) {
        console.error('❌ Error during restore:', err);
    }
}

restoreNotifications();
