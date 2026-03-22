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

// Current hashes from server.js
const currentHashes = {
    'MD': '$2a$12$pkTstU3up/l5NQlFpHKTI.OkXHOAbbWzjel7kSuLF/gfyva/v7vti',
    'ADMIN': '$2a$12$u6PW.jhy0/RN6xCBD8IcAupzxxeogxf3sheaeQm1RUevCl.BStPmq',
    'HR': '$2a$12$AFEzay0Y3Bk8j1VTLuHVjOIf/zVCfj0S9jlJkKQuBX7wFViBPe8Mm',
    'HSE': '$2a$12$Ju7KnyHUC7aYlQdPyygjPuly4JAxNkgau61OD0DBFo8Twk4YuadC2',
    'FINANCE': '$2a$12$zxzP5s/IBL1f4niPlxi.mO54LXkZy9KSEfbXP83ceHMfscxqyXKdC',
    'PROJECT': '$2a$12$QprpmBaruPb.D9tbcPYm8Or/gOfC2fwwk47WYcCktc8sC1/N/wN8G',
    'REALESTATE': '$2a$12$zrRcx9zjrBEG.8yn0a7AyesG4QWpjRtc4DcnhLAFkVpTTi9KlEDM6',
    'ASSISTANT': '$2a$12$aYCuS6B19FTYsARmSIOwe.iuG93uq7HTsQhW/cuh8BawFb9HPn./S'
};

async function generateHashes() {
    console.log('🔐 Generating bcrypt hashes for department passwords...');
    
    for (const dept of departmentPasswords) {
        const hash = await bcrypt.hash(dept.password, 12);
        console.log(`${dept.role}: ${dept.password} -> ${hash}`);
        console.log(`INSERT INTO authentication (department_code, email, password_hash, role, department_name, manager_name, status) VALUES`);
        console.log(`('${dept.role}', '${dept.email}', '${hash}', '${dept.role}', '${dept.role}', 'Manager', 'Active');`);
    }
}

async function verifyCurrentHashes() {
    console.log('🧪 Verifying current password hashes...');
    
    for (const dept of departmentPasswords) {
        const currentHash = currentHashes[dept.role];
        const isValid = await bcrypt.compare(dept.password, currentHash);
        
        console.log(`${dept.role}: ${dept.password} -> ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        
        if (!isValid) {
            console.log(`   Expected hash: ${currentHash}`);
            console.log(`   This explains why login fails for ${dept.email}`);
        }
    }
}

// Run verification by default
console.log('🚀 KASHTEC Password Hash Verification');
console.log('=====================================\n');

// Check command line argument
const command = process.argv[2];

if (command === 'generate') {
    generateHashes().catch(console.error);
} else if (command === 'verify') {
    verifyCurrentHashes().catch(console.error);
} else {
    console.log('Usage:');
    console.log('  node generate-passwords.js generate  - Generate new hashes');
    console.log('  node generate-passwords.js verify    - Verify current hashes');
    console.log('\nRunning verification by default...\n');
    verifyCurrentHashes().catch(console.error);
}
