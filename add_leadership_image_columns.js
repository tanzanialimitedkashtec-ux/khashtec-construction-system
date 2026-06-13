const db = require('./database/config/database');

async function run() {
    const colsToAdd = [
        'profile_image VARCHAR(255)',
        'profile_image_data LONGBLOB',
        'profile_image_mime VARCHAR(100)'
    ];

    for (const col of colsToAdd) {
        try {
            await db.execute(`ALTER TABLE leadership_management ADD COLUMN ${col}`);
            console.log(`✅ Added column ${col.split(' ')[0]} to leadership_management`);
        } catch (e) {
            console.log(`⚠️ Could not add column ${col.split(' ')[0]}: ${e.message}`);
        }
    }
    process.exit(0);
}

run();
