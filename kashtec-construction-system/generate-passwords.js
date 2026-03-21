const bcrypt = require('bcryptjs');

// Department passwords and their hashes
const departmentPasswords = [
    { email: 'md@kashtec.com', password: 'admin', role: 'MD' },
    { email: 'admin@kashtec.com', password: 'admin', role: 'ADMIN' },
    { email: 'hr@manager0501', password: 'hr0501', role: 'HR' },
    { email: 'hse@manager0501', password: 'hse0501', role: 'HSE' },
    { email: 'finance@manager0501', password: 'finance0501', role: 'FINANCE' },
    { email: 'pm@manager0501', password: 'pm0501', role: 'PROJECT' },
    { email: 'realestate@manager0501', password: 'realestate0501', role: 'REALESTATE' },
    { email: 'assistant@kashtec.com', password: 'admin', role: 'ASSISTANT' }
];

async function generateHashes() {
    console.log('🔐 Generating bcrypt hashes for department passwords...');
    
    for (const dept of departmentPasswords) {
        const hash = await bcrypt.hash(dept.password, 12);
        console.log(`${dept.role}: ${dept.password} -> ${hash}`);
        console.log(`INSERT INTO authentication (department_code, email, password_hash, role, department_name, manager_name, status) VALUES`);
        console.log(`('${dept.role}', '${dept.email}', '${hash}', '${dept.role}', '${dept.role}', 'Manager', 'Active');`);
    }
}

generateHashes().catch(console.error);
