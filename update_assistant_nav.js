const db = require('./backend/src/config/database');

async function updateAssistantNav() {
    try {
        const [users] = await db.execute('SELECT id, email, nav_access FROM authentication WHERE role = "Admin Assistant"');
        console.log(`Found ${users.length} Admin Assistant users.`);
        
        for (const user of users) {
            let accessArr = [];
            try {
                if (typeof user.nav_access === 'string' && user.nav_access.startsWith('[')) {
                    accessArr = JSON.parse(user.nav_access);
                } else if (typeof user.nav_access === 'string') {
                    if (user.nav_access === 'All' || user.nav_access.includes('Backup System Data')) {
                        console.log(`User ${user.email} already has access.`);
                        continue;
                    }
                }
            } catch(e) {}

            if (Array.isArray(accessArr) && !accessArr.includes('Backup System Data')) {
                accessArr.push('Backup System Data');
                const newNav = JSON.stringify(accessArr);
                await db.execute('UPDATE authentication SET nav_access = ? WHERE id = ?', [newNav, user.id]);
                console.log(`Updated user ${user.email} (ID: ${user.id}) nav_access`);
            } else if (Array.isArray(accessArr) && accessArr.includes('Backup System Data')) {
                console.log(`User ${user.email} already has Backup System Data in array.`);
            }
        }
        console.log('Update complete.');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
updateAssistantNav();
