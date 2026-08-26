const db = require('./backend/src/config/database');

async function fixAssistantNav() {
    try {
        // Complete list of Admin Assistant menu items
        const fullNavAccess = [
            "Upload Documents",
            "Edit Documents",
            "Send Notifications",
            "Record Meeting Minutes",
            "View Employee List",
            "Office Portal",
            "Backup System Data"
        ];
        
        const [users] = await db.execute('SELECT id, email, role, nav_access FROM authentication WHERE role = "Admin Assistant"');
        console.log(`Found ${users.length} Admin Assistant users.`);
        
        for (const user of users) {
            console.log(`\nUser: ${user.email}`);
            console.log('Current nav_access:', user.nav_access);
            
            const newNav = JSON.stringify(fullNavAccess);
            await db.execute('UPDATE authentication SET nav_access = ? WHERE id = ?', [newNav, user.id]);
            console.log('Updated nav_access to:', newNav);
        }
        
        console.log('\nDone!');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
fixAssistantNav();
