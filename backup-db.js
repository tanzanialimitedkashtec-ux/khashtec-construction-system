// Database backup script - exports all tables from Railway MySQL to a SQL file
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
    host: 'interchange.proxy.rlwy.net',
    user: 'root',
    password: 'FpJJluFwvIzgsMTsfDZApQLznVVVIzJd',
    database: 'railway',
    port: 50274
};

async function backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFile = path.join(__dirname, `backup-${timestamp}.sql`);
    let output = '';

    const log = (msg) => { console.log(msg); };

    try {
        const db = await mysql.createConnection(DB_CONFIG);
        log('✅ Connected to Railway MySQL');

        // Header
        output += `-- KASHTEC Construction System - Database Backup\n`;
        output += `-- Generated: ${new Date().toISOString()}\n`;
        output += `-- Database: ${DB_CONFIG.database}\n`;
        output += `-- Host: ${DB_CONFIG.host}\n\n`;
        output += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

        // Get all tables
        const [tables] = await db.execute('SHOW TABLES');
        const tableKey = Object.keys(tables[0])[0];
        const tableNames = tables.map(t => t[tableKey]);
        log(`📊 Found ${tableNames.length} tables: ${tableNames.join(', ')}`);

        for (const tableName of tableNames) {
            log(`\n📋 Backing up table: ${tableName}`);

            // Get CREATE TABLE statement
            const [createResult] = await db.execute(`SHOW CREATE TABLE \`${tableName}\``);
            const createSQL = createResult[0]['Create Table'];
            output += `-- ----------------------------\n`;
            output += `-- Table: ${tableName}\n`;
            output += `-- ----------------------------\n`;
            output += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
            output += `${createSQL};\n\n`;

            // Get row count
            const [countResult] = await db.execute(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
            const rowCount = countResult[0].cnt;
            log(`   Rows: ${rowCount}`);

            if (rowCount === 0) {
                output += `-- No data in ${tableName}\n\n`;
                continue;
            }

            // Get all rows
            const [rows] = await db.execute(`SELECT * FROM \`${tableName}\``);

            // Get column names
            const columns = Object.keys(rows[0]);
            const colList = columns.map(c => `\`${c}\``).join(', ');

            // Build INSERT statements (batch 100 rows at a time)
            const batchSize = 100;
            for (let i = 0; i < rows.length; i += batchSize) {
                const batch = rows.slice(i, i + batchSize);
                const values = batch.map(row => {
                    const vals = columns.map(col => {
                        const val = row[col];
                        if (val === null || val === undefined) return 'NULL';
                        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        if (typeof val === 'number') return val;
                        if (Buffer.isBuffer(val)) return `X'${val.toString('hex')}'`;
                        // Escape string
                        const escaped = String(val)
                            .replace(/\\/g, '\\\\')
                            .replace(/'/g, "\\'")
                            .replace(/\n/g, '\\n')
                            .replace(/\r/g, '\\r')
                            .replace(/\t/g, '\\t');
                        return `'${escaped}'`;
                    });
                    return `(${vals.join(', ')})`;
                }).join(',\n');

                output += `INSERT INTO \`${tableName}\` (${colList}) VALUES\n${values};\n\n`;
            }

            log(`   ✅ ${rowCount} rows exported`);
        }

        output += `SET FOREIGN_KEY_CHECKS = 1;\n`;
        output += `\n-- Backup complete\n`;

        // Write to file
        fs.writeFileSync(backupFile, output, 'utf8');
        const sizeMB = (Buffer.byteLength(output, 'utf8') / 1024 / 1024).toFixed(2);
        log(`\n🎉 Backup saved to: ${backupFile}`);
        log(`📦 Size: ${sizeMB} MB`);

        await db.end();
        log('✅ Connection closed');

    } catch (err) {
        console.error('❌ Backup failed:', err.message);
        process.exit(1);
    }
}

backup();
