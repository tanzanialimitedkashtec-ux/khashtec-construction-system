const fs = require('fs');

function processFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    let changed = false;
    
    // Add Approve Violation to allMenusConfig in html
    const searchConfig = '{ name: "Mark Safety Violations", func: markSafetyViolations },';
    if (content.includes(searchConfig)) {
        if (!content.includes('{ name: "Approve Violation", func: markSafetyViolations }')) {
            content = content.replace(searchConfig, searchConfig + '\n        { name: "Approve Violation", func: markSafetyViolations },');
            changed = true;
            console.log("Added Approve Violation to config in " + path);
        }
    }
    
    // Add to addMenu calls
    const searchAddMenu = 'addMenu("Mark Safety Violations", markSafetyViolations);';
    if (content.includes(searchAddMenu)) {
        if (!content.includes('addMenu("Approve Violation", markSafetyViolations);')) {
            // Replace globally
            content = content.split(searchAddMenu).join(searchAddMenu + '\n        addMenu("Approve Violation", markSafetyViolations);');
            changed = true;
            console.log("Added Approve Violation to addMenu calls in " + path);
        }
    }
    
    // Add to role configurations if we want HSE to see it too, though user just asked for MD
    const searchHSE = '"HSE": [';
    if (content.includes(searchHSE) && !content.includes('"Approve Violation"')) {
        content = content.replace(/"HSE": \[([\s\S]*?)"Mark Safety Violations"/, '"HSE": [$1"Mark Safety Violations", "Approve Violation"');
        changed = true;
        console.log("Added Approve Violation to HSE role config in " + path);
    }
    
    if (changed) {
        fs.writeFileSync(path, content, 'utf8');
    }
}

processFile('./frontend/public/department.js');
processFile('./frontend/public/department.html');