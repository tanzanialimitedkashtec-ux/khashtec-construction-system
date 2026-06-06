const db = require('./database/config/database');

async function run() {
    const colsToAdd = [
        'cv_path VARCHAR(255)',
        'cv_data LONGBLOB',
        'cv_mime VARCHAR(100)',
        'agreement_path VARCHAR(255)',
        'agreement_data LONGBLOB',
        'agreement_mime VARCHAR(100)'
    ];

    for (const col of colsToAdd) {
        try {
            await db.execute(`ALTER TABLE employee_details ADD COLUMN ${col}`);
            console.log(`✅ Added column ${col.split(' ')[0]} to employee_details`);
        } catch (e) {
            console.log(`⚠️ Could not add column ${col.split(' ')[0]}: ${e.message}`);
        }
    }
    process.exit(0);
}

run();
