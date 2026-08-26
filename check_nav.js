const db = require('./backend/src/config/database');

async function checkNav() {
    try {
        const [users] = await db.execute('SELECT id, email, role, nav_access FROM authentication WHERE role = "Admin Assistant"');
        for (const user of users) {
            console.log('User:', user.email);
            console.log('Role:', user.role);
            console.log('nav_access raw:', JSON.stringify(user.nav_access));
            console.log('nav_access type:', typeof user.nav_access);
            
            if (typeof user.nav_access === 'string') {
                try {
                    const parsed = JSON.parse(user.nav_access);
                    console.log('Parsed nav_access:', JSON.stringify(parsed));
                    console.log('Has Backup System Data:', parsed.includes('Backup System Data'));
                } catch(e) {
                    console.log('Not valid JSON, raw string:', user.nav_access);
                }
            }
        }
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
checkNav();
