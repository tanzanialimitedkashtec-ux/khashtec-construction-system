const fs = require('fs');
const path = require('path');

const filesToProcess = [
    'c:\\Users\\USER\\Downloads\\consultion system\\frontend\\public\\department.html',
    'c:\\Users\\USER\\Downloads\\consultion system\\frontend\\public\\department.js'
];

filesToProcess.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Remove employee mock fallback
    // The exact text has empty lines, so we use regex to match it.
    const employeeRegex = /\/\/\s*Fallback to mock data if API fails[\s\S]*?console\.log\('✅ Employee dropdown populated with mock data'\);/gi;
    content = content.replace(employeeRegex, `// Display empty state on error
        employeeSelect.innerHTML = '<option value="">Select Employee</option>';`);

    // Another employee mock with funny character
    const employeeRegex2 = /\/\/\s*Fallback to mock data if API fails[\s\S]*?console\.log\('[^']*Employee dropdown populated with mock data'\);/gi;
    content = content.replace(employeeRegex2, `// Display empty state on error
        employeeSelect.innerHTML = '<option value="">Select Employee</option>';`);

    // Remove project mock fallback
    const projectRegex = /\/\/\s*Fallback to mock projects[\s\S]*?const projectSelect = document\.getElementById\('progressProject'\);[\s\S]*?if \(projectSelect\) \{[\s\S]*?projectSelect\.innerHTML = `[\s\S]*?<option value="">Select Project to Update<\/option>[\s\S]*?\$\{mockProjects\.map.*?\}[\s\S]*?`;[\s\S]*?\}/gi;
    content = content.replace(projectRegex, `// Show empty state on error
        const projectSelect = document.getElementById('progressProject');
        if (projectSelect) {
            projectSelect.innerHTML = '<option value="">Select Project to Update</option>';
        }`);

    // Remove contracts mock fallback
    const contractsRegex = /console\.log\('🔄 Using mock contracts data as fallback'\);[\s\S]*?console\.log\(`✅ Loaded \$\{contracts\.length\} mock contracts as fallback`\);/gi;
    content = content.replace(contractsRegex, `contracts = [];`);

    const contractsRegex2 = /console\.log\('[^']*Using mock contracts data as fallback'\);[\s\S]*?console\.log\(`[^']*Loaded \$\{contracts\.length\} mock contracts as fallback`\);/gi;
    content = content.replace(contractsRegex2, `contracts = [];`);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${filePath}`);
});
